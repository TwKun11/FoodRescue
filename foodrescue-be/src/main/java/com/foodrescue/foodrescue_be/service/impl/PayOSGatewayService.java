package com.foodrescue.foodrescue_be.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodrescue.foodrescue_be.config.PayOSProperties;
import com.foodrescue.foodrescue_be.model.Order;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;
import vn.payos.PayOS;
import vn.payos.model.webhooks.WebhookData;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneId;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PayOSGatewayService {

    private final PayOSProperties properties;
    private volatile PayOS payOS;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public CreatePaymentLinkResult createPaymentLink(Order order, Long providerOrderCode) {
        ensureConfigured();
        try {
            CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                    .orderCode(providerOrderCode)
                    .amount(toPayOSAmount(order.getTotalAmount()))
                    .description(buildDescription(order))
                    .returnUrl(buildReturnUrl(order))
                    .cancelUrl(buildCancelUrl(order))
                    .build();

            CreatePaymentLinkResponse response = getClient().paymentRequests().create(paymentData);
            JsonNode json = objectMapper.valueToTree(response);
            return CreatePaymentLinkResult.builder()
                    .paymentLinkId(text(json, "paymentLinkId"))
                    .checkoutUrl(text(json, "checkoutUrl"))
                    .deepLink(firstText(json, "deepLink", "deeplink"))
                    .qrCode(text(json, "qrCode"))
                    .expiresAt(parseExpiresAt(json.path("expiredAt")))
                    .build();
        } catch (Exception e) {
            throw new IllegalArgumentException("Khong the tao link thanh toan PayOS: " + e.getMessage());
        }
    }

    public VerifiedWebhook verifyWebhook(String payload) {
        ensureConfigured();
        try {
            JsonNode root = objectMapper.readTree(payload);
            WebhookData webhookData = getClient().webhooks().verify(payload);
            return VerifiedWebhook.builder()
                    .code(root.path("code").asText(null))
                    .success(root.path("success").asBoolean(false))
                    .description(root.path("desc").asText(null))
                    .data(webhookData)
                    .build();
        } catch (Exception e) {
            throw new IllegalArgumentException("Webhook PayOS khong hop le: " + e.getMessage());
        }
    }

    public boolean isConfigured() {
        return properties.isConfigured();
    }

    private PayOS getClient() {
        if (payOS == null) {
            synchronized (this) {
                if (payOS == null) {
                    System.setProperty("payos.client-id", properties.getClientId());
                    System.setProperty("payos.api-key", properties.getApiKey());
                    System.setProperty("payos.checksum-key", properties.getChecksumKey());
                    payOS = PayOS.fromEnv();
                }
            }
        }
        return payOS;
    }

    private void ensureConfigured() {
        if (!properties.isConfigured()) {
            throw new IllegalArgumentException("PayOS chua duoc cau hinh tren backend");
        }
    }

    private String buildReturnUrl(Order order) {
        return UriComponentsBuilder.fromUriString(normalizeBaseUrl(properties.getFrontendBaseUrl()))
                .path("/payment/payos/return")
                .queryParam("orderId", order.getId())
                .build()
                .toUriString();
    }

    private String buildCancelUrl(Order order) {
        return UriComponentsBuilder.fromUriString(normalizeBaseUrl(properties.getFrontendBaseUrl()))
                .path("/payment/payos/cancel")
                .queryParam("orderId", order.getId())
                .build()
                .toUriString();
    }

    private String normalizeBaseUrl(String value) {
        if (value == null || value.isBlank()) {
            return "http://localhost:3000";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private String buildDescription(Order order) {
        return "FR " + order.getId();
    }

    private Long toPayOSAmount(BigDecimal value) {
        BigDecimal normalized = value.setScale(0, RoundingMode.HALF_UP);
        return normalized.longValueExact();
    }

    private String text(JsonNode node, String field) {
        JsonNode child = node.path(field);
        return child.isMissingNode() || child.isNull() ? null : child.asText();
    }

    private String firstText(JsonNode node, String... fields) {
        for (String field : fields) {
            String value = text(node, field);
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private LocalDateTime parseExpiresAt(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }
        if (node.isNumber()) {
            return LocalDateTime.ofInstant(Instant.ofEpochSecond(node.asLong()), ZoneId.systemDefault());
        }
        String text = node.asText(null);
        if (text == null || text.isBlank()) {
            return null;
        }
        try {
            long epoch = Long.parseLong(text);
            return LocalDateTime.ofInstant(Instant.ofEpochSecond(epoch), ZoneId.systemDefault());
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    @Getter
    @Builder
    public static class CreatePaymentLinkResult {
        private String paymentLinkId;
        private String checkoutUrl;
        private String deepLink;
        private String qrCode;
        private LocalDateTime expiresAt;
    }

    @Getter
    @Builder
    public static class VerifiedWebhook {
        private String code;
        private boolean success;
        private String description;
        private WebhookData data;
    }
}
