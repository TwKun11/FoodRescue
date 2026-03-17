package com.foodrescue.foodrescue_be.scheduler;

import com.foodrescue.foodrescue_be.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PendingPaymentExpirationScheduler {

    private final OrderService orderService;

    @Scheduled(
            fixedDelayString = "${app.orders.pending-payment-scan-delay-ms:60000}",
            initialDelayString = "${app.orders.pending-payment-initial-delay-ms:30000}"
    )
    public void syncPendingPayments() {
        int updatedCount = orderService.reconcilePendingPayments();
        if (updatedCount > 0) {
            log.info("Synced {} pending payment(s) from PayOS/DB state", updatedCount);
        }
    }
}
