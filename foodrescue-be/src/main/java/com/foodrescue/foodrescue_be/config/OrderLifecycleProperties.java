package com.foodrescue.foodrescue_be.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.orders")
public class OrderLifecycleProperties {
    private long pendingPaymentTimeoutMinutes = 15;
    private long pendingPaymentScanDelayMs = 60000;
    private long pendingPaymentInitialDelayMs = 30000;
}
