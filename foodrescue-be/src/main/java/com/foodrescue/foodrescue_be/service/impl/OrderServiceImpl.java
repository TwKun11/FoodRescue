package com.foodrescue.foodrescue_be.service.impl;

import com.foodrescue.foodrescue_be.dto.request.PlaceOrderRequest;
import com.foodrescue.foodrescue_be.dto.response.OrderItemResponse;
import com.foodrescue.foodrescue_be.dto.response.OrderResponse;
import com.foodrescue.foodrescue_be.model.*;
import com.foodrescue.foodrescue_be.repository.*;
import com.foodrescue.foodrescue_be.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderSellerOrderRepository sellerOrderRepository;
    private final UserRepository userRepository;
    private final CustomerAddressRepository addressRepository;
    private final ProductVariantRepository variantRepository;
    private final SellerRepository sellerRepository;
    private final InventoryBatchRepository batchRepository;

    @Override
    @Transactional
    public OrderResponse placeOrder(Long userId, PlaceOrderRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        CustomerAddress address = null;
        if (req.getAddressId() != null) {
            address = addressRepository.findById(req.getAddressId())
                    .orElseThrow(() -> new IllegalArgumentException("Địa chỉ không tồn tại"));
            if (!address.getUser().getId().equals(userId)) {
                throw new IllegalArgumentException("Địa chỉ không thuộc về bạn");
            }
        }

        String orderCode = "ORD" + System.currentTimeMillis();

        Order order = Order.builder()
                .user(user)
                .address(address)
                .orderCode(orderCode)
                .orderStatus(Order.OrderStatus.pending)
                .paymentStatus(Order.PaymentStatus.unpaid)
                .paymentMethod(parsePaymentMethod(req.getPaymentMethod()))
                .note(req.getNote())
                .subtotal(BigDecimal.ZERO)
                .shippingFee(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .build();
        order = orderRepository.save(order);

        // Group items by seller
        Map<Long, List<PlaceOrderRequest.OrderLineRequest>> bySeller = new LinkedHashMap<>();
        for (PlaceOrderRequest.OrderLineRequest line : req.getItems()) {
            ProductVariant variant = variantRepository.findById(line.getVariantId())
                    .orElseThrow(() -> new IllegalArgumentException("Biến thể " + line.getVariantId() + " không tồn tại"));
            Long sid = variant.getProduct().getSeller().getId();
            bySeller.computeIfAbsent(sid, k -> new ArrayList<>()).add(line);
        }

        BigDecimal orderSubtotal = BigDecimal.ZERO;
        List<OrderItem> allItems = new ArrayList<>();

        int sellerIdx = 1;
        for (Map.Entry<Long, List<PlaceOrderRequest.OrderLineRequest>> entry : bySeller.entrySet()) {
            Long sid = entry.getKey();
            Seller seller = sellerRepository.findById(sid).orElseThrow();
            String sorderCode = "SORD" + System.currentTimeMillis() + sellerIdx++;

            OrderSellerOrder so = OrderSellerOrder.builder()
                    .order(order)
                    .seller(seller)
                    .sellerOrderCode(sorderCode)
                    .orderStatus(OrderSellerOrder.SellerOrderStatus.pending)
                    .subtotal(BigDecimal.ZERO)
                    .shippingFee(BigDecimal.ZERO)
                    .discountAmount(BigDecimal.ZERO)
                    .totalAmount(BigDecimal.ZERO)
                    .build();
            so = sellerOrderRepository.save(so);

            BigDecimal soSubtotal = BigDecimal.ZERO;

            for (PlaceOrderRequest.OrderLineRequest line : entry.getValue()) {
                ProductVariant variant = variantRepository.findById(line.getVariantId()).orElseThrow();

                // Validate stock (FEFO)
                BigDecimal available = batchRepository.sumAvailableByVariantId(variant.getId());
                if (available == null) available = BigDecimal.ZERO;
                if (available.compareTo(line.getQuantity()) < 0) {
                    throw new IllegalArgumentException(
                        "Sản phẩm \"" + variant.getProduct().getName() + " - " + variant.getName() +
                        "\" không đủ tồn kho (còn " + available.stripTrailingZeros().toPlainString() + ")");
                }

                // Decrement stock FEFO (earliest expiry first)
                BigDecimal toDeduct = line.getQuantity();
                List<InventoryBatch> batches = batchRepository
                        .findByVariantIdAndStatusOrderByExpiredAtAscReceivedAtAsc(
                                variant.getId(), InventoryBatch.BatchStatus.active);
                for (InventoryBatch b : batches) {
                    if (toDeduct.compareTo(BigDecimal.ZERO) <= 0) break;
                    BigDecimal take = b.getQuantityAvailable().min(toDeduct);
                    b.setQuantityAvailable(b.getQuantityAvailable().subtract(take));
                    if (b.getQuantityAvailable().compareTo(BigDecimal.ZERO) <= 0) {
                        b.setStatus(InventoryBatch.BatchStatus.depleted);
                    }
                    batchRepository.save(b);
                    toDeduct = toDeduct.subtract(take);
                }

                BigDecimal price = variant.getSalePrice() != null ? variant.getSalePrice()
                        : (variant.getListPrice() != null ? variant.getListPrice() : BigDecimal.ZERO);
                BigDecimal lineTotal = price.multiply(line.getQuantity());

                OrderItem item = OrderItem.builder()
                        .order(order)
                        .sellerOrder(so)
                        .seller(seller)
                        .product(variant.getProduct())
                        .variant(variant)
                        .productName(variant.getProduct().getName())
                        .variantName(variant.getName())
                        .variantCode(variant.getVariantCode())
                        .unit(variant.getUnit() != null ? variant.getUnit().name() : "piece")
                        .quantity(line.getQuantity())
                        .unitPrice(price)
                        .discountAmount(BigDecimal.ZERO)
                        .lineTotal(lineTotal)
                        .note(line.getNote())
                        .build();
                allItems.add(orderItemRepository.save(item));
                soSubtotal = soSubtotal.add(lineTotal);
            }

            so.setSubtotal(soSubtotal);
            so.setTotalAmount(soSubtotal);
            sellerOrderRepository.save(so);
            orderSubtotal = orderSubtotal.add(soSubtotal);
        }

        order.setSubtotal(orderSubtotal);
        order.setTotalAmount(orderSubtotal);
        orderRepository.save(order);

        List<OrderItemResponse> itemResponses = allItems.stream()
                .map(OrderItemResponse::fromEntity)
                .collect(Collectors.toList());
        return OrderResponse.fromEntity(order, itemResponses);
    }

    @Override
    public Page<OrderResponse> getCustomerOrders(Long customerId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(customerId, pageable)
                .map(o -> {
                    List<OrderItemResponse> items = orderItemRepository.findByOrderId(o.getId()).stream()
                            .map(OrderItemResponse::fromEntity).collect(Collectors.toList());
                    return OrderResponse.fromEntity(o, items);
                });
    }

    @Override
    public OrderResponse getOrderDetail(Long customerId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Đơn hàng không tồn tại"));
        if (order.getUser() == null || !order.getUser().getId().equals(customerId)) {
            throw new IllegalArgumentException("Bạn không có quyền xem đơn hàng này");
        }
        List<OrderItemResponse> items = orderItemRepository.findByOrderId(orderId).stream()
                .map(OrderItemResponse::fromEntity).collect(Collectors.toList());
        return OrderResponse.fromEntity(order, items);
    }

    @Override
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
        return page.map(so -> {
                    List<OrderItemResponse> items = orderItemRepository.findBySellerOrderId(so.getId()).stream()
                            .map(OrderItemResponse::fromEntity).collect(Collectors.toList());
                    return OrderResponse.fromSellerOrder(so, items);
                });
    }

    @Override
    @Transactional
    public OrderResponse updateSellerOrderStatus(Long sellerId, Long sellerOrderId, String status) {
        OrderSellerOrder so = sellerOrderRepository.findById(sellerOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Đơn hàng không tồn tại"));
        if (!so.getSeller().getId().equals(sellerId)) {
            throw new IllegalArgumentException("Bạn không có quyền cập nhật đơn hàng này");
        }
        OrderSellerOrder.SellerOrderStatus newStatus;
        try {
            newStatus = OrderSellerOrder.SellerOrderStatus.valueOf(status);
        } catch (Exception e) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ: " + status);
        }
        so.setOrderStatus(newStatus);
        if (newStatus == OrderSellerOrder.SellerOrderStatus.confirmed) so.setConfirmedAt(LocalDateTime.now());
        if (newStatus == OrderSellerOrder.SellerOrderStatus.completed) so.setCompletedAt(LocalDateTime.now());
        if (newStatus == OrderSellerOrder.SellerOrderStatus.cancelled) so.setCancelledAt(LocalDateTime.now());
        sellerOrderRepository.save(so);

        List<OrderItemResponse> items = orderItemRepository.findBySellerOrderId(sellerOrderId).stream()
                .map(OrderItemResponse::fromEntity).collect(Collectors.toList());
        return OrderResponse.fromSellerOrder(so, items);
    }

    private Order.PaymentMethod parsePaymentMethod(String value) {
        try {
            return Order.PaymentMethod.valueOf(value);
        } catch (Exception e) {
            return Order.PaymentMethod.cod;
        }
    }
}
