package com.foodrescue.foodrescue_be.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.payos")
public class PayOSProperties {
    private String clientId;
    private String apiKey;
    private String checksumKey;
    private String frontendBaseUrl = "http://localhost:3000";

    public boolean isConfigured() {
        return isRealValue(clientId) && isRealValue(apiKey) && isRealValue(checksumKey);
    }

    private boolean isRealValue(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }
        String normalized = value.trim().toLowerCase();
        return !normalized.startsWith("your-")
                && !normalized.contains("your-payos")
                && !normalized.contains("placeholder")
                && !normalized.contains("change-me");
    }
}
