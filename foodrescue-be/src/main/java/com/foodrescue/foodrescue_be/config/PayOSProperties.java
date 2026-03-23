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
        return hasText(clientId) && hasText(apiKey) && hasText(checksumKey);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
