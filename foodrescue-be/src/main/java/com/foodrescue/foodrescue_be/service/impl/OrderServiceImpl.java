package com.foodrescue.foodrescue_be.service.impl;

import com.foodrescue.foodrescue_be.config.OrderLifecycleProperties;
import com.foodrescue.foodrescue_be.dto.request.PlaceOrderRequest;
import com.foodrescue.foodrescue_be.dto.response.OrderItemResponse;
import com.foodrescue.foodrescue_be.dto.response.OrderPaymentResponse;
import com.foodrescue.foodrescue_be.dto.response.OrderResponse;
import com.foodrescue.foodrescue_be.model.*;
import com.foodrescue.foodrescue_be.repository.*;
import lombok.extern.slf4j.Slf4j;
import com.foodrescue.foodrescue_be.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.model.v2.paymentRequests.PaymentLinkStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final Set<Order.PaymentMethod> SUPPORTED_PAYMENT_METHODS =
            EnumSet.of(Order.PaymentMethod.cod, Order.PaymentMethod.payos);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderSellerOrderRepository sellerOrderRepository;
    private final OrderPaymentRepository orderPaymentRepository;
    private final InventoryReservationRepository inventoryReservationRepository;
    private final UserRepository userRepository;
    private final CustomerAddressRepository addressRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryBatchRepository batchRepository;
    private final PayOSGatewayService payOSGatewayService;
    private final OrderLifecycleProperties orderLifecycleProperties;

    @Override
    @Transactional
    public OrderResponse placeOrder(Long userId, PlaceOrderRequest req) {
        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new IllegalArgumentException("Gio hang khong duoc de trong");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Nguoi dung khong ton tai"));
        CustomerAddress address = resolveAddress(userId, req.getAddressId());
        Order.PaymentMethod paymentMethod = parsePaymentMethod(req.getPaymentMethod());

        Order order = Order.builder()
                .user(user)
                .address(address)
                .orderCode(generateOrderCode())
                .orderStatus(isPayOS(paymentMethod) ? Order.OrderStatus.pending_payment : Order.OrderStatus.pending)
                .paymentStatus(isPayOS(paymentMethod) ? Order.PaymentStatus.pending : Order.PaymentStatus.unpaid)
                .paymentMethod(paymentMethod)
                .note(req.getNote())
                .subtotal(BigDecimal.ZERO)
                .shippingFee(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .build();
        order = orderRepository.save(order);

        Map<Long, OrderSellerOrder> sellerOrderMap = new LinkedHashMap<>();
        Map<Long, BigDecimal> sellerSubtotalMap = new LinkedHashMap<>();
        List<OrderItem> allItems = new ArrayList<>();
        BigDecimal orderSubtotal = BigDecimal.ZERO;

        for (PlaceOrderRequest.OrderLineRequest line : req.getItems()) {
            ProductVariant variant = variantRepository.findById(line.getVariantId())
                    .orElseThrow(() -> new IllegalArgumentException("Bien the " + line.getVariantId() + " khong ton tai"));

            validateRequestedQuantity(line.getQuantity(), variant);

            Seller seller = variant.getProduct().getSeller();
            OrderSellerOrder sellerOrder = sellerOrderMap.get(seller.getId());
            if (sellerOrder == null) {
                sellerOrder = createSellerOrder(order, seller, paymentMethod);
                sellerOrderMap.put(seller.getId(), sellerOrder);
            }

            BigDecimal unitPrice = resolveUnitPrice(variant);
            BigDecimal lineTotal = unitPrice.multiply(line.getQuantity());
            sellerSubtotalMap.merge(seller.getId(), lineTotal, BigDecimal::add);
            orderSubtotal = orderSubtotal.add(lineTotal);

            OrderItem item = orderItemRepository.save(OrderItem.builder()
                    .order(order)
                    .sellerOrder(sellerOrder)
                    .seller(seller)
                    .product(variant.getProduct())
                    .variant(variant)
                    .productName(variant.getProduct().getName())
                    .variantName(variant.getName())
                    .variantCode(variant.getVariantCode())
                    .unit(variant.getUnit() != null ? variant.getUnit().name() : "piece")
                    .quantity(line.getQuantity())
                    .unitPrice(unitPrice)
                    .discountAmount(BigDecimal.ZERO)
                    .lineTotal(lineTotal)
                    .note(line.getNote())
                    .build());

            reserveInventory(item, variant, line.getQuantity());
            allItems.add(item);
        }

        for (Map.Entry<Long, OrderSellerOrder> entry : sellerOrderMap.entrySet()) {
            OrderSellerOrder sellerOrder = entry.getValue();
            BigDecimal subtotal = sellerSubtotalMap.getOrDefault(entry.getKey(), BigDecimal.ZERO);
            sellerOrder.setSubtotal(subtotal);
            sellerOrder.setTotalAmount(subtotal);
            sellerOrderRepository.save(sellerOrder);
        }

        order.setSubtotal(orderSubtotal);
        order.setTotalAmount(orderSubtotal);
        order = orderRepository.save(order);

        OrderPayment payment = null;
        if (isPayOS(paymentMethod)) {
            payment = createPayOSPayment(order);
        }

        return toCustomerResponse(order, allItems, payment);
    }

    @Override
    @Transactional
    public Page<OrderResponse> getCustomerOrders(Long customerId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(customerId, pageable)
                .map(order -> {
                    OrderPayment payment = reconcilePayOSPayment(order);
                    return toCustomerResponse(
                            order,
                            orderItemRepository.findByOrderId(order.getId()),
                            payment
                    );
                });
    }

    @Override
    @Transactional
    public OrderResponse getOrderDetail(Long customerId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Don hang khong ton tai"));
        if (order.getUser() == null || !order.getUser().getId().equals(customerId)) {
            throw new IllegalArgumentException("Ban khong co quyen xem don hang nay");
        }
        OrderPayment payment = reconcilePayOSPayment(order);
        return toCustomerResponse(
                order,
                orderItemRepository.findByOrderId(orderId),
                payment
        );
    }

    @Override
    @Transactional
    public void handlePayOSWebhook(String payload) {
        PayOSGatewayService.VerifiedWebhook webhook = payOSGatewayService.verifyWebhook(payload);
        var webhookData = webhook.getData();

        Long providerOrderCode = webhookData != null ? webhookData.getOrderCode() : null;
        if (providerOrderCode == null) {
            throw new IllegalArgumentException("Webhook PayOS khong co orderCode");
        }

        OrderPayment payment = orderPaymentRepository.findByProviderOrderCode(providerOrderCode)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay giao dich PayOS"));

        payment.setLastWebhookAt(LocalDateTime.now());
        payment.setProviderReference(webhookData != null ? webhookData.getReference() : null);

        if (isSuccessfulPaymentWebhook(webhook)) {
            markPaymentPaid(payment);
            return;
        }

        markPaymentFailed(payment, webhook.getDescription());
    }

    @Override
    @Transactional
    public int reconcilePendingPayments() {
        int updatedCount = 0;
        List<OrderPayment> pendingPayments = orderPaymentRepository.findByProviderAndStatusOrderByCreatedAtAsc(
                OrderPayment.PaymentProvider.payos,
                OrderPayment.PaymentTransactionStatus.pending
        );

        for (OrderPayment payment : pendingPayments) {
            OrderPayment.PaymentTransactionStatus beforePaymentStatus = payment.getStatus();
            Order.OrderStatus beforeOrderStatus = payment.getOrder().getOrderStatus();
            Order.PaymentStatus beforeMasterPaymentStatus = payment.getOrder().getPaymentStatus();

            OrderPayment refreshed = reconcilePayOSPayment(payment);
            if (refreshed != null && (
                    refreshed.getStatus() != beforePaymentStatus
                            || payment.getOrder().getOrderStatus() != beforeOrderStatus
                            || payment.getOrder().getPaymentStatus() != beforeMasterPaymentStatus
            )) {
                updatedCount++;
            }
        }

        return updatedCount;
    }

    @Override
    @Transactional
    public int expirePendingPayments() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime fallbackDeadline = now.minusMinutes(orderLifecycleProperties.getPendingPaymentTimeoutMinutes());
        Map<Long, OrderPayment> paymentsToExpire = new LinkedHashMap<>();

        orderPaymentRepository.findByStatusAndExpiresAtBeforeOrEqual(
                OrderPayment.PaymentTransactionStatus.pending,
                now
        ).forEach(payment -> paymentsToExpire.put(payment.getId(), payment));

        orderPaymentRepository.findByStatusAndMissingExpiresAtCreatedBeforeOrEqual(
                OrderPayment.PaymentTransactionStatus.pending,
                fallbackDeadline
        ).forEach(payment -> paymentsToExpire.put(payment.getId(), payment));

        paymentsToExpire.values().forEach(payment -> markPaymentExpired(payment, now));
        return paymentsToExpire.size();
    }

    @Override
    @Transactional
    public Page<OrderResponse> getSellerOrders(Long sellerId, String status, Pageable pageable) {
        Page<OrderSellerOrder> page;
        if (status != null && !status.isBlank()) {
            try {
                OrderSellerOrder.SellerOrderStatus enumStatus = OrderSellerOrder.SellerOrderStatus.valueOf(status);
                page = sellerOrderRepository.findBySellerIdAndOrderStatusOrderByCreatedAtDesc(sellerId, enumStatus, pageable);
            } catch (IllegalArgumentException e) {
                page = sellerOrderRepository.findBySellerIdOrderByCreatedAtDesc(sellerId, pageable);
            }
        } else {
            page = sellerOrderRepository.findBySellerIdOrderByCreatedAtDesc(sellerId, pageable);
        }

        return page.map(sellerOrder -> {
            OrderPayment payment = reconcilePayOSPayment(sellerOrder.getOrder());
            return OrderResponse.fromSellerOrder(
                    sellerOrder,
                    orderItemRepository.findBySellerOrderId(sellerOrder.getId()).stream().map(OrderItemResponse::fromEntity).toList(),
                    OrderPaymentResponse.fromEntity(payment)
            );
        });
    }

    @Override
    @Transactional
    public OrderResponse updateSellerOrderStatus(Long sellerId, Long sellerOrderId, String status) {
        OrderSellerOrder sellerOrder = sellerOrderRepository.findById(sellerOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Don hang khong ton tai"));
        if (!sellerOrder.getSeller().getId().equals(sellerId)) {
            throw new IllegalArgumentException("Ban khong co quyen cap nhat don hang nay");
        }

        OrderSellerOrder.SellerOrderStatus newStatus = parseSellerOrderStatus(status);
        validateSellerTransition(sellerOrder, newStatus);

        sellerOrder.setOrderStatus(newStatus);
        if (newStatus == OrderSellerOrder.SellerOrderStatus.confirmed) {
            sellerOrder.setConfirmedAt(LocalDateTime.now());
        }
        if (newStatus == OrderSellerOrder.SellerOrderStatus.completed) {
            sellerOrder.setCompletedAt(LocalDateTime.now());
            consumeReservationsForSellerOrder(sellerOrder.getId());
        }
        if (newStatus == OrderSellerOrder.SellerOrderStatus.cancelled) {
            sellerOrder.setCancelledAt(LocalDateTime.now());
            releaseReservationsForSellerOrder(sellerOrder.getId());
        }
        sellerOrderRepository.save(sellerOrder);

        syncMasterOrderStatus(sellerOrder.getOrder());

        return OrderResponse.fromSellerOrder(
                sellerOrder,
                orderItemRepository.findBySellerOrderId(sellerOrderId).stream().map(OrderItemResponse::fromEntity).toList(),
                findPaymentResponse(sellerOrder.getOrder().getId())
        );
    }

    private CustomerAddress resolveAddress(Long userId, Long addressId) {
        if (addressId == null) {
            return null;
        }
        CustomerAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("Dia chi khong ton tai"));
        if (!address.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Dia chi khong thuoc ve ban");
        }
        return address;
    }

    private void validateRequestedQuantity(BigDecimal quantity, ProductVariant variant) {
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("So luong dat hang khong hop le");
        }
        if (variant.getMinOrderQty() != null && quantity.compareTo(variant.getMinOrderQty()) < 0) {
            throw new IllegalArgumentException("So luong dat nho hon muc toi thieu");
        }
        if (variant.getMaxOrderQty() != null && quantity.compareTo(variant.getMaxOrderQty()) > 0) {
            throw new IllegalArgumentException("So luong dat vuot muc toi da");
        }
    }

    private OrderSellerOrder createSellerOrder(Order order, Seller seller, Order.PaymentMethod paymentMethod) {
        return sellerOrderRepository.save(OrderSellerOrder.builder()
                .order(order)
                .seller(seller)
                .sellerOrderCode(generateSellerOrderCode())
                .orderStatus(isPayOS(paymentMethod)
                        ? OrderSellerOrder.SellerOrderStatus.pending_payment
                        : OrderSellerOrder.SellerOrderStatus.pending)
                .subtotal(BigDecimal.ZERO)
                .shippingFee(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .build());
    }

    private BigDecimal resolveUnitPrice(ProductVariant variant) {
        BigDecimal price = variant.getSalePrice() != null ? variant.getSalePrice() : variant.getListPrice();
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("San pham " + variant.getName() + " chua co gia ban hop le");
        }
        return price;
    }

    private void reserveInventory(OrderItem item, ProductVariant variant, BigDecimal quantity) {
        BigDecimal available = batchRepository.sumAvailableByVariantId(variant.getId());
        if (available == null) {
            available = BigDecimal.ZERO;
        }
        if (available.compareTo(quantity) < 0) {
            throw new IllegalArgumentException(
                    "San pham \"" + variant.getProduct().getName() + " - " + variant.getName()
                            + "\" khong du ton kho (con " + available.stripTrailingZeros().toPlainString() + ")"
            );
        }

        BigDecimal toReserve = quantity;
        List<InventoryBatch> batches = batchRepository
                .findByVariantIdAndStatusOrderByExpiredAtAscReceivedAtAsc(variant.getId(), InventoryBatch.BatchStatus.active);

        for (InventoryBatch batch : batches) {
            if (toReserve.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }

            BigDecimal take = batch.getQuantityAvailable().min(toReserve);
            if (take.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            batch.setQuantityAvailable(batch.getQuantityAvailable().subtract(take));
            if (batch.getQuantityAvailable().compareTo(BigDecimal.ZERO) <= 0) {
                batch.setStatus(InventoryBatch.BatchStatus.depleted);
            }
            batchRepository.save(batch);

            inventoryReservationRepository.save(InventoryReservation.builder()
                    .batch(batch)
                    .orderItem(item)
                    .quantity(take)
                    .status(InventoryReservation.ReservationStatus.reserved)
                    .build());

            toReserve = toReserve.subtract(take);
        }

        if (toReserve.compareTo(BigDecimal.ZERO) > 0) {
            throw new IllegalArgumentException("Khong the giu ton kho cho don hang nay");
        }
    }

    private OrderPayment createPayOSPayment(Order order) {
        if (!payOSGatewayService.isConfigured()) {
            throw new IllegalArgumentException("Backend chua cau hinh PayOS");
        }

        OrderPayment payment = orderPaymentRepository.save(OrderPayment.builder()
                .order(order)
                .provider(OrderPayment.PaymentProvider.payos)
                .status(OrderPayment.PaymentTransactionStatus.pending)
                .providerOrderCode(generateProviderOrderCode())
                .amount(order.getTotalAmount())
                .currency("VND")
                .description("FR " + order.getId())
                .build());

        PayOSGatewayService.CreatePaymentLinkResult gatewayResult =
                payOSGatewayService.createPaymentLink(order, payment.getProviderOrderCode());

        LocalDateTime expiresAt = resolvePaymentExpiryAt(gatewayResult.getExpiresAt());
        payment.setProviderPaymentLinkId(gatewayResult.getPaymentLinkId());
        payment.setCheckoutUrl(gatewayResult.getCheckoutUrl());
        payment.setDeepLink(gatewayResult.getDeepLink());
        payment.setQrCode(gatewayResult.getQrCode());
        payment.setExpiresAt(expiresAt);
        return orderPaymentRepository.save(payment);
    }

    private OrderPayment reconcilePayOSPayment(Order order) {
        return findPayment(order.getId()).map(this::reconcilePayOSPayment).orElse(null);
    }

    private OrderPayment reconcilePayOSPayment(OrderPayment payment) {
        if (payment == null) {
            return null;
        }

        Order order = payment.getOrder();
        if (!isPayOS(order.getPaymentMethod())
                || payment.getStatus() != OrderPayment.PaymentTransactionStatus.pending) {
            return payment;
        }

        LocalDateTime now = LocalDateTime.now();

        if (payment.getProviderOrderCode() != null && payOSGatewayService.isConfigured()) {
            try {
                PayOSGatewayService.PaymentLinkStatusResult gatewayStatus =
                        payOSGatewayService.getPaymentLinkStatus(payment.getProviderOrderCode());

                if (gatewayStatus != null && gatewayStatus.getStatus() != null) {
                    switch (gatewayStatus.getStatus()) {
                        case PAID -> markPaymentPaid(payment);
                        case CANCELLED, EXPIRED, FAILED -> markPaymentFailed(
                                payment,
                                buildGatewayFailureReason(gatewayStatus)
                        );
                        case PENDING, PROCESSING, UNDERPAID -> {
                            // Keep pending and fall through to DB-based expiry checks below.
                        }
                    }
                }
            } catch (Exception e) {
                log.warn(
                        "Unable to reconcile PayOS payment for order {} (providerOrderCode={}): {}",
                        order.getId(),
                        payment.getProviderOrderCode(),
                        e.getMessage()
                );
            }
        }

        if (payment.getStatus() == OrderPayment.PaymentTransactionStatus.pending && shouldExpirePendingPayment(payment, now)) {
            markPaymentExpired(payment, now);
        }

        return orderPaymentRepository.findById(payment.getId()).orElse(payment);
    }

    private void markPaymentPaid(OrderPayment payment) {
        if (payment.getStatus() == OrderPayment.PaymentTransactionStatus.paid) {
            return;
        }

        Order order = payment.getOrder();
        LocalDateTime paidAt = LocalDateTime.now();

        payment.setStatus(OrderPayment.PaymentTransactionStatus.paid);
        payment.setPaidAt(paidAt);
        payment.setFailureReason(null);
        payment.setCancelledAt(null);
        orderPaymentRepository.save(payment);

        order.setPaymentStatus(Order.PaymentStatus.paid);
        order.setPaidAt(paidAt);
        if (order.getOrderStatus() == Order.OrderStatus.pending_payment) {
            order.setOrderStatus(Order.OrderStatus.pending);
        }
        orderRepository.save(order);

        List<OrderSellerOrder> sellerOrders = sellerOrderRepository.findByOrderIdOrderByIdAsc(order.getId());
        for (OrderSellerOrder sellerOrder : sellerOrders) {
            if (sellerOrder.getOrderStatus() == OrderSellerOrder.SellerOrderStatus.pending_payment) {
                sellerOrder.setOrderStatus(OrderSellerOrder.SellerOrderStatus.pending);
                sellerOrderRepository.save(sellerOrder);
            }
        }
    }

    private void markPaymentFailed(OrderPayment payment, String reason) {
        if (payment.getStatus() == OrderPayment.PaymentTransactionStatus.paid
                || payment.getStatus() == OrderPayment.PaymentTransactionStatus.cancelled
                || payment.getStatus() == OrderPayment.PaymentTransactionStatus.expired
                || payment.getStatus() == OrderPayment.PaymentTransactionStatus.failed) {
            return;
        }

        Order order = payment.getOrder();
        LocalDateTime now = LocalDateTime.now();

        OrderPayment.PaymentTransactionStatus transactionStatus = resolveFailureStatus(reason);
        payment.setStatus(transactionStatus);
        payment.setFailureReason(reason);
        payment.setCancelledAt(now);
        orderPaymentRepository.save(payment);

        order.setPaymentStatus(mapOrderPaymentStatus(transactionStatus));
        order.setOrderStatus(Order.OrderStatus.cancelled);
        order.setCancelledAt(now);
        orderRepository.save(order);

        List<OrderSellerOrder> sellerOrders = sellerOrderRepository.findByOrderIdOrderByIdAsc(order.getId());
        for (OrderSellerOrder sellerOrder : sellerOrders) {
            if (sellerOrder.getOrderStatus() != OrderSellerOrder.SellerOrderStatus.completed) {
                sellerOrder.setOrderStatus(OrderSellerOrder.SellerOrderStatus.cancelled);
                sellerOrder.setCancelledAt(now);
                sellerOrderRepository.save(sellerOrder);
            }
        }

        releaseReservationsForOrder(order.getId());
    }

    private void markPaymentExpired(OrderPayment payment, LocalDateTime now) {
        if (payment.getStatus() != OrderPayment.PaymentTransactionStatus.pending) {
            return;
        }
        if (payment.getExpiresAt() == null || payment.getExpiresAt().isAfter(now)) {
            payment.setExpiresAt(now);
        }
        markPaymentFailed(payment, "Payment expired by timeout scheduler");
    }

    private void validateSellerTransition(OrderSellerOrder sellerOrder, OrderSellerOrder.SellerOrderStatus newStatus) {
        Order order = sellerOrder.getOrder();
        if (order.getPaymentMethod() == Order.PaymentMethod.payos && order.getPaymentStatus() != Order.PaymentStatus.paid) {
            throw new IllegalArgumentException("Don PayOS chua thanh toan, chua the xu ly");
        }

        OrderSellerOrder.SellerOrderStatus currentStatus = sellerOrder.getOrderStatus();
        if (currentStatus == newStatus) {
            return;
        }
        if (currentStatus == OrderSellerOrder.SellerOrderStatus.completed
                || currentStatus == OrderSellerOrder.SellerOrderStatus.cancelled
                || currentStatus == OrderSellerOrder.SellerOrderStatus.refunded) {
            throw new IllegalArgumentException("Don hang da o trang thai cuoi");
        }
        if (newStatus == OrderSellerOrder.SellerOrderStatus.cancelled) {
            return;
        }

        Map<OrderSellerOrder.SellerOrderStatus, OrderSellerOrder.SellerOrderStatus> next = Map.of(
                OrderSellerOrder.SellerOrderStatus.pending, OrderSellerOrder.SellerOrderStatus.confirmed,
                OrderSellerOrder.SellerOrderStatus.confirmed, OrderSellerOrder.SellerOrderStatus.packing,
                OrderSellerOrder.SellerOrderStatus.packing, OrderSellerOrder.SellerOrderStatus.shipping,
                OrderSellerOrder.SellerOrderStatus.shipping, OrderSellerOrder.SellerOrderStatus.completed
        );

        OrderSellerOrder.SellerOrderStatus allowed = next.get(currentStatus);
        if (allowed == null || allowed != newStatus) {
            throw new IllegalArgumentException("Chuyen trang thai khong hop le");
        }
    }

    private void syncMasterOrderStatus(Order order) {
        List<OrderSellerOrder> sellerOrders = sellerOrderRepository.findByOrderIdOrderByIdAsc(order.getId());
        if (sellerOrders.isEmpty()) {
            return;
        }

        Set<OrderSellerOrder.SellerOrderStatus> statuses = new LinkedHashSet<>();
        for (OrderSellerOrder sellerOrder : sellerOrders) {
            statuses.add(sellerOrder.getOrderStatus());
        }

        if (statuses.size() == 1) {
            OrderSellerOrder.SellerOrderStatus status = statuses.iterator().next();
            order.setOrderStatus(mapMasterStatus(status));
            if (status == OrderSellerOrder.SellerOrderStatus.completed) {
                order.setCompletedAt(LocalDateTime.now());
            }
            if (status == OrderSellerOrder.SellerOrderStatus.cancelled) {
                order.setCancelledAt(LocalDateTime.now());
            }
            if (status == OrderSellerOrder.SellerOrderStatus.confirmed) {
                order.setConfirmedAt(LocalDateTime.now());
            }
            orderRepository.save(order);
            return;
        }

        if (statuses.contains(OrderSellerOrder.SellerOrderStatus.shipping)) {
            order.setOrderStatus(Order.OrderStatus.shipping);
        } else if (statuses.contains(OrderSellerOrder.SellerOrderStatus.packing)) {
            order.setOrderStatus(Order.OrderStatus.packing);
        } else if (statuses.contains(OrderSellerOrder.SellerOrderStatus.confirmed)) {
            order.setOrderStatus(Order.OrderStatus.confirmed);
        } else if (statuses.contains(OrderSellerOrder.SellerOrderStatus.pending)) {
            order.setOrderStatus(Order.OrderStatus.pending);
        } else if (statuses.contains(OrderSellerOrder.SellerOrderStatus.pending_payment)) {
            order.setOrderStatus(Order.OrderStatus.pending_payment);
        } else if (statuses.contains(OrderSellerOrder.SellerOrderStatus.completed)) {
            order.setOrderStatus(Order.OrderStatus.completed);
        } else if (statuses.contains(OrderSellerOrder.SellerOrderStatus.cancelled)) {
            order.setOrderStatus(Order.OrderStatus.cancelled);
        }
        orderRepository.save(order);
    }

    private void releaseReservationsForOrder(Long orderId) {
        List<InventoryReservation> reservations = inventoryReservationRepository.findByOrderIdAndStatus(
                orderId,
                InventoryReservation.ReservationStatus.reserved
        );
        updateReservations(reservations, InventoryReservation.ReservationStatus.released);
    }

    private void releaseReservationsForSellerOrder(Long sellerOrderId) {
        List<InventoryReservation> reservations = inventoryReservationRepository.findBySellerOrderIdAndStatus(
                sellerOrderId,
                InventoryReservation.ReservationStatus.reserved
        );
        updateReservations(reservations, InventoryReservation.ReservationStatus.released);
    }

    private void consumeReservationsForSellerOrder(Long sellerOrderId) {
        List<InventoryReservation> reservations = inventoryReservationRepository.findBySellerOrderIdAndStatus(
                sellerOrderId,
                InventoryReservation.ReservationStatus.reserved
        );
        updateReservations(reservations, InventoryReservation.ReservationStatus.consumed);
    }

    private void updateReservations(
            List<InventoryReservation> reservations,
            InventoryReservation.ReservationStatus targetStatus
    ) {
        LocalDateTime now = LocalDateTime.now();
        for (InventoryReservation reservation : reservations) {
            if (targetStatus == InventoryReservation.ReservationStatus.released) {
                InventoryBatch batch = reservation.getBatch();
                batch.setQuantityAvailable(batch.getQuantityAvailable().add(reservation.getQuantity()));
                if (batch.getStatus() == InventoryBatch.BatchStatus.depleted
                        && batch.getQuantityAvailable().compareTo(BigDecimal.ZERO) > 0) {
                    batch.setStatus(InventoryBatch.BatchStatus.active);
                }
                batchRepository.save(batch);
                reservation.setReleasedAt(now);
            }

            if (targetStatus == InventoryReservation.ReservationStatus.consumed) {
                reservation.setConsumedAt(now);
            }

            reservation.setStatus(targetStatus);
            inventoryReservationRepository.save(reservation);
        }
    }

    private OrderResponse toCustomerResponse(Order order, List<OrderItem> items, OrderPayment payment) {
        return OrderResponse.fromEntity(
                order,
                items.stream().map(OrderItemResponse::fromEntity).toList(),
                OrderPaymentResponse.fromEntity(payment)
        );
    }

    private Optional<OrderPayment> findPayment(Long orderId) {
        return orderPaymentRepository.findByOrderId(orderId);
    }

    private OrderPaymentResponse findPaymentResponse(Long orderId) {
        return findPayment(orderId).map(OrderPaymentResponse::fromEntity).orElse(null);
    }

    private boolean isSuccessfulPaymentWebhook(PayOSGatewayService.VerifiedWebhook webhook) {
        if (webhook.isSuccess()) {
            return true;
        }
        if ("00".equals(webhook.getCode())) {
            return true;
        }
        String code = webhook.getData() != null ? webhook.getData().getCode() : null;
        return "00".equals(code);
    }

    private Order.PaymentMethod parsePaymentMethod(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Phuong thuc thanh toan khong hop le");
        }
        try {
            Order.PaymentMethod paymentMethod = Order.PaymentMethod.valueOf(value.trim().toLowerCase());
            if (!SUPPORTED_PAYMENT_METHODS.contains(paymentMethod)) {
                throw new IllegalArgumentException(
                        "Phuong thuc thanh toan chua duoc ho tro: " + value + ". Hien chi ho tro cod va payos"
                );
            }
            return paymentMethod;
        } catch (Exception e) {
            if (e instanceof IllegalArgumentException) {
                throw (IllegalArgumentException) e;
            }
            throw new IllegalArgumentException("Phuong thuc thanh toan khong duoc ho tro: " + value);
        }
    }

    private OrderSellerOrder.SellerOrderStatus parseSellerOrderStatus(String value) {
        try {
            return OrderSellerOrder.SellerOrderStatus.valueOf(value);
        } catch (Exception e) {
            throw new IllegalArgumentException("Trang thai khong hop le: " + value);
        }
    }

    private boolean isPayOS(Order.PaymentMethod paymentMethod) {
        return paymentMethod == Order.PaymentMethod.payos;
    }

    private LocalDateTime resolvePaymentExpiryAt(LocalDateTime gatewayExpiresAt) {
        if (gatewayExpiresAt != null) {
            return gatewayExpiresAt;
        }
        return LocalDateTime.now().plusMinutes(orderLifecycleProperties.getPendingPaymentTimeoutMinutes());
    }

    private String generateOrderCode() {
        return "ORD" + System.currentTimeMillis();
    }

    private String generateSellerOrderCode() {
        return "SORD" + System.currentTimeMillis() + (int) (Math.random() * 1000);
    }

    private Long generateProviderOrderCode() {
        return System.currentTimeMillis() * 1000 + (long) (Math.random() * 1000);
    }

    private Order.OrderStatus mapMasterStatus(OrderSellerOrder.SellerOrderStatus status) {
        return switch (status) {
            case pending_payment -> Order.OrderStatus.pending_payment;
            case pending -> Order.OrderStatus.pending;
            case confirmed -> Order.OrderStatus.confirmed;
            case packing -> Order.OrderStatus.packing;
            case shipping -> Order.OrderStatus.shipping;
            case completed -> Order.OrderStatus.completed;
            case cancelled -> Order.OrderStatus.cancelled;
            case refunded -> Order.OrderStatus.refunded;
        };
    }

    private OrderPayment.PaymentTransactionStatus resolveFailureStatus(String reason) {
        String normalized = reason == null ? "" : reason.toLowerCase(Locale.ROOT);
        if (normalized.contains("expire")) {
            return OrderPayment.PaymentTransactionStatus.expired;
        }
        if (normalized.contains("cancel")) {
            return OrderPayment.PaymentTransactionStatus.cancelled;
        }
        return OrderPayment.PaymentTransactionStatus.failed;
    }

    private Order.PaymentStatus mapOrderPaymentStatus(OrderPayment.PaymentTransactionStatus status) {
        return switch (status) {
            case cancelled -> Order.PaymentStatus.cancelled;
            case expired -> Order.PaymentStatus.expired;
            case failed -> Order.PaymentStatus.failed;
            case refunded -> Order.PaymentStatus.refunded;
            case paid -> Order.PaymentStatus.paid;
            case pending -> Order.PaymentStatus.pending;
        };
    }

    private String buildGatewayFailureReason(PayOSGatewayService.PaymentLinkStatusResult gatewayStatus) {
        PaymentLinkStatus status = gatewayStatus.getStatus();
        String reason = gatewayStatus.getCancellationReason();
        if (reason != null && !reason.isBlank()) {
            return "PayOS status " + status + ": " + reason;
        }
        return "PayOS status " + status;
    }

    private boolean shouldExpirePendingPayment(OrderPayment payment, LocalDateTime now) {
        if (payment.getStatus() != OrderPayment.PaymentTransactionStatus.pending) {
            return false;
        }
        if (payment.getExpiresAt() != null) {
            return !payment.getExpiresAt().isAfter(now);
        }

        LocalDateTime fallbackDeadline = now.minusMinutes(orderLifecycleProperties.getPendingPaymentTimeoutMinutes());
        return !payment.getCreatedAt().isAfter(fallbackDeadline);
    }

}
