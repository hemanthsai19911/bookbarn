package com.example.book.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody java.util.Map<String, Object> payload) {
        try {
            // Simulate processing delay
            Thread.sleep(1500);

            // Basic mock validation
            String cardNumber = (String) payload.get("cardNumber");
            if (cardNumber != null && cardNumber.length() < 13) {
                return ResponseEntity.badRequest().body("Invalid card number");
            }

            // Return mock success response
            java.util.Map<String, String> response = new java.util.HashMap<>();
            response.put("status", "success");
            response.put("transactionId", "TXN_" + System.currentTimeMillis());
            response.put("message", "Payment processed successfully");

            return ResponseEntity.ok(response);
        } catch (InterruptedException e) {
            return ResponseEntity.status(500).body("Processing interrupted");
        }
    }
}
