package com.foodrescue.foodrescue_be.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    public enum VariantUnit { g, kg, piece, pack, bag, bundle, loaf, box, tray, bottle }
    public enum WeightUnit { g, kg }
    public enum VariantStatus { draft, active, inactive, out_of_stock }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "variant_code", nullable = false, unique = true, length = 100)
    private String variantCode;

    @Column(nullable = false)
    private String name;

    @Column(length = 100, unique = true)
    private String barcode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VariantUnit unit;

    @Column(name = "net_weight_value", precision = 12, scale = 3)
    private BigDecimal netWeightValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "net_weight_unit")
    private WeightUnit netWeightUnit;

    @Column(name = "min_order_qty", nullable = false, precision = 12, scale = 3)
    private BigDecimal minOrderQty = BigDecimal.ONE;

    @Column(name = "max_order_qty", precision = 12, scale = 3)
    private BigDecimal maxOrderQty;

    @Column(name = "step_qty", nullable = false, precision = 12, scale = 3)
    private BigDecimal stepQty = BigDecimal.ONE;

    @Column(name = "list_price", precision = 12, scale = 2)
    private BigDecimal listPrice;

    @Column(name = "sale_price", precision = 12, scale = 2)
    private BigDecimal salePrice;

    @Column(name = "cost_price", precision = 12, scale = 2)
    private BigDecimal costPrice;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    @Column(name = "requires_batch", nullable = false)
    private Boolean requiresBatch = true;

    @Column(name = "track_inventory", nullable = false)
    private Boolean trackInventory = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VariantStatus status = VariantStatus.draft;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
