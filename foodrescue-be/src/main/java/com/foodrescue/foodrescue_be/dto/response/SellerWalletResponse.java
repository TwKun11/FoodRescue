package com.foodrescue.foodrescue_be.dto.response;

import com.foodrescue.foodrescue_be.model.SellerWalletTransaction;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class SellerWalletResponse {
    private BigDecimal availableBalance;
    private BigDecimal payoutProcessingBalance;
    private BigDecimal totalCredited;
    private BigDecimal totalPaidOut;
    private List<Transaction> transactions;

    @Getter
    @Builder
    public static class Transaction {
        private Long id;
        private String type;
        private String status;
        private BigDecimal amount;
        private BigDecimal grossAmount;
        private BigDecimal commissionAmount;
        private String currency;
        private String description;
        private String referenceCode;
        private Long orderId;
        private Long sellerOrderId;
        private LocalDateTime createdAt;

        public static Transaction fromEntity(SellerWalletTransaction transaction) {
            return Transaction.builder()
                    .id(transaction.getId())
                    .type(transaction.getType() != null ? transaction.getType().name() : null)
                    .status(transaction.getStatus() != null ? transaction.getStatus().name() : null)
                    .amount(transaction.getAmount())
                    .grossAmount(transaction.getGrossAmount())
                    .commissionAmount(transaction.getCommissionAmount())
                    .currency(transaction.getCurrency())
                    .description(transaction.getDescription())
                    .referenceCode(transaction.getReferenceCode())
                    .orderId(transaction.getOrder() != null ? transaction.getOrder().getId() : null)
                    .sellerOrderId(transaction.getSellerOrder() != null ? transaction.getSellerOrder().getId() : null)
                    .createdAt(transaction.getCreatedAt())
                    .build();
        }
    }
}
