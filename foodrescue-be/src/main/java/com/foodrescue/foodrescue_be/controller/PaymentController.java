package com.foodrescue.foodrescue_be.controller;

import com.foodrescue.foodrescue_be.dto.response.ResponseData;
import com.foodrescue.foodrescue_be.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final OrderService orderService;

    @PostMapping("/payos/webhook")
    public ResponseData<String> handlePayOSWebhook(@RequestBody String payload) {
        orderService.handlePayOSWebhook(payload);
        return ResponseData.ok("Webhook received", "ok");
    }
}
