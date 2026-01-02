package com.example.book.controller;

import com.example.book.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/otp")
public class OTPController {

    @Autowired
    private EmailService emailService;

    // Send OTP for registration
    @PostMapping("/send-registration")
    public ResponseEntity<?> sendRegistrationOTP(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        String otp = emailService.generateOTP();
        emailService.sendOTP(email, otp, "Registration");

        return ResponseEntity.ok(Map.of(
                "message", "OTP sent to your email",
                "email", email));
    }

    // Send OTP for password reset
    @PostMapping("/send-reset")
    public ResponseEntity<?> sendResetOTP(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        String otp = emailService.generateOTP();
        emailService.sendOTP(email, otp, "Password Reset");

        return ResponseEntity.ok(Map.of(
                "message", "OTP sent to your email",
                "email", email));
    }

    // Verify OTP
    @PostMapping("/verify")
    public ResponseEntity<?> verifyOTP(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and OTP are required"));
        }

        boolean isValid = emailService.verifyOTP(email, otp);

        if (isValid) {
            return ResponseEntity.ok(Map.of(
                    "message", "OTP verified successfully",
                    "verified", true));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid or expired OTP",
                    "verified", false));
        }
    }

    // Resend OTP
    @PostMapping("/resend")
    public ResponseEntity<?> resendOTP(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String purpose = request.getOrDefault("purpose", "Verification");

        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        // Clear old OTP
        emailService.clearOTP(email);

        // Generate and send new OTP
        String otp = emailService.generateOTP();
        emailService.sendOTP(email, otp, purpose);

        return ResponseEntity.ok(Map.of(
                "message", "New OTP sent to your email",
                "email", email));
    }
}
