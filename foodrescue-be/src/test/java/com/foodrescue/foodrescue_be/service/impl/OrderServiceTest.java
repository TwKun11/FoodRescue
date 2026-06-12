package com.foodrescue.foodrescue_be.service.impl;

import com.foodrescue.foodrescue_be.config.OrderLifecycleProperties;
import com.foodrescue.foodrescue_be.dto.request.PlaceOrderRequest;
import com.foodrescue.foodrescue_be.dto.response.OrderResponse;
import com.foodrescue.foodrescue_be.model.*;
import com.foodrescue.foodrescue_be.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private OrderSellerOrderRepository sellerOrderRepository;
    @Mock
    private OrderPaymentRepository orderPaymentRepository;
    @Mock
    private InventoryReservationRepository inventoryReservationRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CustomerAddressRepository addressRepository;
    @Mock
    private ProductVariantRepository variantRepository;
    @Mock
    private InventoryBatchRepository batchRepository;
    @Mock
    private ProductImageRepository productImageRepository;
    @Mock
    private VoucherRepository voucherRepository;
    @Mock
    private UserVoucherRepository userVoucherRepository;
    @Mock
    private PayOSGatewayService payOSGatewayService;
    @Mock
    private OrderLifecycleProperties orderLifecycleProperties;

    @InjectMocks
    private OrderServiceImpl orderService;

    @BeforeEach
    void setUpDefaults() {
        when(orderLifecycleProperties.getPendingPaymentTimeoutMinutes()).thenReturn(15L);
        when(productImageRepository.findByProductIdInAndIsPrimaryTrue(any())).thenReturn(List.of());
        when(productImageRepository.findByProductIdInOrderByProductIdAscSortOrderAsc(any())).thenReturn(List.of());
    }

    @Test
    void placeOrder_createsCodOrderAndReservesInventory() {
        User user = user(1L);
        CustomerAddress address = address(10L, user);
        Seller seller = seller(5L);
        Product product = product(20L, seller);
        ProductVariant variant = variant(30L, product);
        InventoryBatch batch = InventoryBatch.builder()
                .id(40L)
                .variant(variant)
                .seller(seller)
                .batchCode("B-001")
                .quantityReceived(new BigDecimal("10"))
                .quantityAvailable(new BigDecimal("10"))
                .status(InventoryBatch.BatchStatus.active)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(addressRepository.findById(10L)).thenReturn(Optional.of(address));
        when(variantRepository.findById(30L)).thenReturn(Optional.of(variant));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            if (order.getId() == null) {
                order.setId(100L);
            }
            return order;
        });
        when(sellerOrderRepository.save(any(OrderSellerOrder.class))).thenAnswer(invocation -> {
            OrderSellerOrder sellerOrder = invocation.getArgument(0);
            if (sellerOrder.getId() == null) {
                sellerOrder.setId(110L);
            }
            return sellerOrder;
        });
        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(invocation -> {
            OrderItem item = invocation.getArgument(0);
            if (item.getId() == null) {
                item.setId(120L);
            }
            return item;
        });
        when(batchRepository.sumAvailableByVariantId(30L)).thenReturn(new BigDecimal("10"));
        when(batchRepository.findByVariantIdAndStatusOrderByExpiredAtAscReceivedAtAsc(30L, InventoryBatch.BatchStatus.active))
                .thenReturn(List.of(batch));
        when(batchRepository.save(any(InventoryBatch.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(inventoryReservationRepository.save(any(InventoryReservation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PlaceOrderRequest request = new PlaceOrderRequest();
        request.setAddressId(10L);
        request.setPaymentMethod("cod");
        request.setNote("Giao sang");
        request.setItems(List.of(orderLine(30L, "2")));

        OrderResponse response = orderService.placeOrder(1L, request);

        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getStatus()).isEqualTo(Order.OrderStatus.pending.name());
        assertThat(response.getPaymentStatus()).isEqualTo(Order.PaymentStatus.unpaid.name());
        assertThat(response.getTotalAmount()).isEqualByComparingTo("40000");
        assertThat(batch.getQuantityAvailable()).isEqualByComparingTo("8");
        verify(inventoryReservationRepository).save(any(InventoryReservation.class));
    }

    @Test
    void placeOrder_throwsWhenCartIsEmpty() {
        PlaceOrderRequest request = new PlaceOrderRequest();
        request.setPaymentMethod("cod");
        request.setItems(List.of());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> orderService.placeOrder(1L, request));

        assertThat(exception.getMessage()).contains("Gio hang");
    }

    @Test
    void placeOrder_throwsWhenDuplicateVariantExistsInCart() {
        PlaceOrderRequest request = new PlaceOrderRequest();
        request.setPaymentMethod("cod");
        request.setItems(List.of(orderLine(30L, "1"), orderLine(30L, "2")));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> orderService.placeOrder(1L, request));

        assertThat(exception.getMessage()).contains("trung lap");
    }

    @Test
    void placeOrder_appliesClaimedVoucherAndMarksItUsed() {
        User user = user(1L);
        CustomerAddress address = address(10L, user);
        Seller seller = seller(5L);
        Product product = product(20L, seller);
        ProductVariant variant = variant(30L, product);
        InventoryBatch batch = InventoryBatch.builder()
                .id(40L)
                .variant(variant)
                .seller(seller)
                .batchCode("B-001")
                .quantityReceived(new BigDecimal("10"))
                .quantityAvailable(new BigDecimal("10"))
                .status(InventoryBatch.BatchStatus.active)
                .build();
        Voucher voucher = voucher();
        UserVoucher userVoucher = UserVoucher.builder()
                .id(90L)
                .voucher(voucher)
                .status(UserVoucher.Status.claimed)
                .claimedAt(LocalDateTime.now().minusDays(1))
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(addressRepository.findById(10L)).thenReturn(Optional.of(address));
        when(variantRepository.findById(30L)).thenReturn(Optional.of(variant));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            if (order.getId() == null) {
                order.setId(100L);
            }
            return order;
        });
        when(sellerOrderRepository.save(any(OrderSellerOrder.class))).thenAnswer(invocation -> {
            OrderSellerOrder sellerOrder = invocation.getArgument(0);
            if (sellerOrder.getId() == null) {
                sellerOrder.setId(110L);
            }
            return sellerOrder;
        });
        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(invocation -> {
            OrderItem item = invocation.getArgument(0);
            if (item.getId() == null) {
                item.setId(120L);
            }
            return item;
        });
        when(batchRepository.sumAvailableByVariantId(30L)).thenReturn(new BigDecimal("10"));
        when(batchRepository.findByVariantIdAndStatusOrderByExpiredAtAscReceivedAtAsc(30L, InventoryBatch.BatchStatus.active))
                .thenReturn(List.of(batch));
        when(batchRepository.save(any(InventoryBatch.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(inventoryReservationRepository.save(any(InventoryReservation.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userVoucherRepository.findByUserIdAndVoucher_CodeIgnoreCaseAndStatus(1L, "SAVE10", UserVoucher.Status.claimed))
                .thenReturn(Optional.of(userVoucher));
        when(voucherRepository.save(any(Voucher.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userVoucherRepository.save(any(UserVoucher.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PlaceOrderRequest request = new PlaceOrderRequest();
        request.setAddressId(10L);
        request.setPaymentMethod("cod");
        request.setVoucherCode("SAVE10");
        request.setItems(List.of(orderLine(30L, "2")));

        OrderResponse response = orderService.placeOrder(1L, request);

        assertThat(response.getSubtotal()).isEqualByComparingTo("40000");
        assertThat(response.getDiscountAmount()).isEqualByComparingTo("10000");
        assertThat(response.getTotalAmount()).isEqualByComparingTo("30000");
        assertThat(voucher.getUsedCount()).isEqualTo(1);
        assertThat(userVoucher.getStatus()).isEqualTo(UserVoucher.Status.used);
        assertThat(userVoucher.getUsedAt()).isNotNull();
        verify(userVoucherRepository).findByUserIdAndVoucher_CodeIgnoreCaseAndStatus(1L, "SAVE10", UserVoucher.Status.claimed);
        verify(voucherRepository).save(voucher);
        verify(userVoucherRepository).save(userVoucher);
    }

    @Test
    void placeOrder_throwsWhenVoucherProvinceDoesNotMatchAddress() {
        User user = user(1L);
        CustomerAddress address = address(10L, user);
        Seller seller = seller(5L);
        Product product = product(20L, seller);
        ProductVariant variant = variant(30L, product);
        Voucher voucher = voucher().toBuilder()
                .targetProvince("Ha Noi")
                .build();
        UserVoucher userVoucher = UserVoucher.builder()
                .id(90L)
                .voucher(voucher)
                .status(UserVoucher.Status.claimed)
                .claimedAt(LocalDateTime.now().minusDays(1))
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(addressRepository.findById(10L)).thenReturn(Optional.of(address));
        when(variantRepository.findById(30L)).thenReturn(Optional.of(variant));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            if (order.getId() == null) {
                order.setId(100L);
            }
            return order;
        });
        when(sellerOrderRepository.save(any(OrderSellerOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(batchRepository.sumAvailableByVariantId(30L)).thenReturn(new BigDecimal("10"));
        when(batchRepository.findByVariantIdAndStatusOrderByExpiredAtAscReceivedAtAsc(eq(30L), eq(InventoryBatch.BatchStatus.active)))
                .thenReturn(List.of(InventoryBatch.builder()
                        .id(40L)
                        .variant(variant)
                        .seller(seller)
                        .batchCode("B-001")
                        .quantityReceived(new BigDecimal("10"))
                        .quantityAvailable(new BigDecimal("10"))
                        .status(InventoryBatch.BatchStatus.active)
                        .build()));
        when(batchRepository.save(any(InventoryBatch.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(inventoryReservationRepository.save(any(InventoryReservation.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userVoucherRepository.findByUserIdAndVoucher_CodeIgnoreCaseAndStatus(1L, "SAVE10", UserVoucher.Status.claimed))
                .thenReturn(Optional.of(userVoucher));

        PlaceOrderRequest request = new PlaceOrderRequest();
        request.setAddressId(10L);
        request.setPaymentMethod("cod");
        request.setVoucherCode("SAVE10");
        request.setItems(List.of(orderLine(30L, "2")));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> orderService.placeOrder(1L, request));

        assertThat(exception.getMessage()).contains("khu vuc");
    }

    @Test
    void updateSellerOrderStatus_allowsPendingToCompletedAndConsumesReservations() {
        User customer = user(1L);
        Seller seller = seller(5L);
        Order order = Order.builder()
                .id(100L)
                .user(customer)
                .paymentMethod(Order.PaymentMethod.cod)
                .paymentStatus(Order.PaymentStatus.unpaid)
                .orderStatus(Order.OrderStatus.pending)
                .build();
        OrderSellerOrder sellerOrder = OrderSellerOrder.builder()
                .id(110L)
                .order(order)
                .seller(seller)
                .orderStatus(OrderSellerOrder.SellerOrderStatus.pending)
                .subtotal(new BigDecimal("40000"))
                .totalAmount(new BigDecimal("40000"))
                .build();
        InventoryBatch batch = InventoryBatch.builder()
                .id(40L)
                .quantityAvailable(new BigDecimal("8"))
                .status(InventoryBatch.BatchStatus.active)
                .build();
        InventoryReservation reservation = InventoryReservation.builder()
                .id(50L)
                .batch(batch)
                .quantity(new BigDecimal("2"))
                .status(InventoryReservation.ReservationStatus.reserved)
                .build();
        Product product = product(20L, seller);
        ProductVariant variant = variant(30L, product);
        OrderItem item = OrderItem.builder()
                .id(120L)
                .sellerOrder(sellerOrder)
                .order(order)
                .seller(seller)
                .product(product)
                .variant(variant)
                .productName(product.getName())
                .variantName(variant.getName())
                .variantCode(variant.getVariantCode())
                .unit("pack")
                .quantity(new BigDecimal("2"))
                .unitPrice(new BigDecimal("20000"))
                .lineTotal(new BigDecimal("40000"))
                .build();

        when(sellerOrderRepository.findById(110L)).thenReturn(Optional.of(sellerOrder));
        when(sellerOrderRepository.save(any(OrderSellerOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(sellerOrderRepository.findByOrderIdOrderByIdAsc(100L)).thenReturn(List.of(sellerOrder));
        when(orderItemRepository.findBySellerOrderId(110L)).thenReturn(List.of(item));
        when(inventoryReservationRepository.findBySellerOrderIdAndStatus(110L, InventoryReservation.ReservationStatus.reserved))
                .thenReturn(List.of(reservation));
        when(inventoryReservationRepository.save(any(InventoryReservation.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(orderPaymentRepository.findByOrderId(100L)).thenReturn(Optional.empty());

        OrderResponse response = orderService.updateSellerOrderStatus(5L, 110L, "completed");

        assertThat(response.getStatus()).isEqualTo(OrderSellerOrder.SellerOrderStatus.completed.name());
        assertThat(order.getOrderStatus()).isEqualTo(Order.OrderStatus.completed);
        assertThat(reservation.getStatus()).isEqualTo(InventoryReservation.ReservationStatus.consumed);
        verify(inventoryReservationRepository).save(reservation);
    }

    private PlaceOrderRequest.OrderLineRequest orderLine(Long variantId, String quantity) {
        PlaceOrderRequest.OrderLineRequest line = new PlaceOrderRequest.OrderLineRequest();
        line.setVariantId(variantId);
        line.setQuantity(new BigDecimal(quantity));
        line.setNote("Keep fresh");
        return line;
    }

    private User user(Long id) {
        return User.builder()
                .id(id)
                .email("customer@example.com")
                .fullName("Customer")
                .phone("0901234567")
                .build();
    }

    private CustomerAddress address(Long id, User user) {
        return CustomerAddress.builder()
                .id(id)
                .user(user)
                .receiverName("Customer")
                .receiverPhone("0901234567")
                .province("Ho Chi Minh")
                .district("Thu Duc")
                .ward("Linh Trung")
                .addressLine("12 Street")
                .isDefault(true)
                .build();
    }

    private Seller seller(Long id) {
        return Seller.builder()
                .id(id)
                .shopName("Seller")
                .shopSlug("seller")
                .build();
    }

    private Product product(Long id, Seller seller) {
        return Product.builder()
                .id(id)
                .seller(seller)
                .name("Rau cai xanh")
                .build();
    }

    private ProductVariant variant(Long id, Product product) {
        return ProductVariant.builder()
                .id(id)
                .product(product)
                .variantCode("VAR-01")
                .name("Goi 500g")
                .unit(ProductVariant.VariantUnit.pack)
                .minOrderQty(BigDecimal.ONE)
                .stepQty(BigDecimal.ONE)
                .listPrice(new BigDecimal("30000"))
                .salePrice(new BigDecimal("20000"))
                .build();
    }

    private Voucher voucher() {
        return Voucher.builder()
                .id(80L)
                .code("SAVE10")
                .name("Giam 10K")
                .status(Voucher.Status.active)
                .discountType(Voucher.DiscountType.fixed_amount)
                .discountValue(new BigDecimal("10000"))
                .minOrderValue(new BigDecimal("30000"))
                .usedCount(0)
                .activeFrom(LocalDateTime.now().minusDays(1))
                .activeUntil(LocalDateTime.now().plusDays(1))
                .build();
    }
}
