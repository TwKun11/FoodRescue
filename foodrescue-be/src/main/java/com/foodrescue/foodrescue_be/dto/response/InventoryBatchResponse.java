package com.foodrescue.foodrescue_be.dto.response;

import com.foodrescue.foodrescue_be.model.InventoryBatch;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class InventoryBatchResponse {
    private Long id;
    private Long variantId;
    private String variantName;
    private String batchCode;
    private String supplierName;
    private LocalDateTime receivedAt;
    private LocalDateTime manufacturedAt;
    private LocalDateTime expiredAt;
    private BigDecimal costPrice;
    private BigDecimal quantityReceived;
    private BigDecimal quantityAvailable;
    private String status;
    private String note;

    public static InventoryBatchResponse fromEntity(InventoryBatch b) {
        return InventoryBatchResponse.builder()
                .id(b.getId())
                .variantId(b.getVariant() != null ? b.getVariant().getId() : null)
                .variantName(b.getVariant() != null ? b.getVariant().getName() : null)
                .batchCode(b.getBatchCode())
                .supplierName(b.getSupplierName())
                .receivedAt(b.getReceivedAt())
                .manufacturedAt(b.getManufacturedAt())
                .expiredAt(b.getExpiredAt())
                .costPrice(b.getCostPrice())
                .quantityReceived(b.getQuantityReceived())
                .quantityAvailable(b.getQuantityAvailable())
                .status(b.getStatus() != null ? b.getStatus().name() : null)
                .note(b.getNote())
                .build();
    }
}
