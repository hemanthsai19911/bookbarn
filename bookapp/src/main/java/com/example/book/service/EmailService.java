package com.example.book.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmailService {

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    @Value("${brevo.sender.name}")
    private String senderName;

    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
    private static final int OTP_EXPIRY_MINUTES = 5;

    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Store hashed OTPs temporarily (email -> OTP data)
    private final ConcurrentHashMap<String, OTPData> otpStore = new ConcurrentHashMap<>();

    /**
     * Generate a secure 6-digit OTP
     */
    public String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    /**
     * Send OTP email via Brevo API
     * 
     * @param toEmail Recipient email address
     * @param otp     The OTP to send
     * @param purpose Purpose of the OTP (e.g., "Registration", "Password Reset")
     */
    public void sendOTP(String toEmail, String otp, String purpose) {
        try {
            // Hash the OTP before storing
            String hashedOTP = passwordEncoder.encode(otp);

            // Store hashed OTP with expiry
            LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);
            otpStore.put(toEmail, new OTPData(hashedOTP, expiryTime));

            // Prepare email content
            String emailBody = buildEmailBody(otp, purpose);

            // Send email via Brevo API
            boolean emailSent = sendEmailViaBrevo(toEmail, "BookBarn - Your OTP Code", emailBody);

            if (emailSent) {
                System.out.println("✅ OTP sent successfully to: " + toEmail);
            } else {
                System.err.println("❌ Failed to send OTP email to: " + toEmail);
                // Keep the OTP in store for manual verification during development
                System.out.println("🔐 OTP (for testing): " + otp);
            }

        } catch (Exception e) {
            System.err.println("❌ Error sending OTP: " + e.getMessage());
            e.printStackTrace();

            // Still store the OTP for fallback verification
            String hashedOTP = passwordEncoder.encode(otp);
            LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);
            otpStore.put(toEmail, new OTPData(hashedOTP, expiryTime));
            System.out.println("OTP (not emailed, stored only) for " + toEmail + ": " + otp);
        }
    }

    /**
     * Send email using Brevo REST API
     */
    public boolean sendEmailViaBrevo(String toEmail, String subject, String htmlContent) {
        try {
            // Build request payload
            Map<String, Object> payload = new HashMap<>();

            // Sender
            Map<String, String> sender = new HashMap<>();
            sender.put("email", senderEmail);
            sender.put("name", senderName);
            payload.put("sender", sender);

            // Recipients
            Map<String, String> recipient = new HashMap<>();
            recipient.put("email", toEmail);
            payload.put("to", new Map[] { recipient });

            // Subject and content
            payload.put("subject", subject);
            payload.put("htmlContent", htmlContent);

            // Convert to JSON
            String jsonPayload = objectMapper.writeValueAsString(payload);

            // Build HTTP request
            RequestBody body = RequestBody.create(
                    jsonPayload,
                    MediaType.parse("application/json"));

            Request request = new Request.Builder()
                    .url(BREVO_API_URL)
                    .addHeader("accept", "application/json")
                    .addHeader("api-key", brevoApiKey)
                    .addHeader("content-type", "application/json")
                    .post(body)
                    .build();

            // Execute request
            try (Response response = httpClient.newCall(request).execute()) {
                if (response.isSuccessful()) {
                    System.out.println("✅ Brevo API Response: " + response.code());
                    return true;
                } else {
                    System.err.println("❌ Brevo API Error: " + response.code());
                    if (response.body() != null) {
                        System.err.println("Response: " + response.body().string());
                    }
                    return false;
                }
            }

        } catch (IOException e) {
            System.err.println("❌ Brevo API call failed: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Build HTML email body
     */
    private String buildEmailBody(String otp, String purpose) {
        return String.format(
                "<html>" +
                        "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>" +
                        "<div style='max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;'>" +
                        "<div style='background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;'>"
                        +
                        "<h1 style='margin: 0;'>📚 BookBarn</h1>" +
                        "</div>" +
                        "<div style='background-color: white; padding: 30px; border-radius: 0 0 8px 8px;'>" +
                        "<h2 style='color: #4F46E5;'>Your OTP Code</h2>" +
                        "<p>Hello,</p>" +
                        "<p>Your OTP for <strong>%s</strong> is:</p>" +
                        "<div style='background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4F46E5; border-radius: 8px; margin: 20px 0;'>"
                        +
                        "%s" +
                        "</div>" +
                        "<p style='color: #666;'>⏰ This code will expire in <strong>%d minutes</strong>.</p>" +
                        "<p style='color: #666;'>If you didn't request this code, please ignore this email.</p>" +
                        "<hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>" +
                        "<p style='color: #999; font-size: 12px; text-align: center;'>Best regards,<br>The BookBarn Team</p>"
                        +
                        "</div>" +
                        "</div>" +
                        "</body>" +
                        "</html>",
                purpose, otp, OTP_EXPIRY_MINUTES);
    }

    /**
     * Verify OTP
     * 
     * @param email User's email
     * @param otp   OTP to verify
     * @return true if OTP is valid, false otherwise
     */
    public boolean verifyOTP(String email, String otp) {
        OTPData data = otpStore.get(email);

        if (data == null) {
            System.err.println("❌ No OTP found for email: " + email);
            return false;
        }

        // Check if expired
        if (LocalDateTime.now().isAfter(data.getExpiryTime())) {
            otpStore.remove(email);
            System.err.println("❌ OTP expired for email: " + email);
            return false;
        }

        // Verify hashed OTP
        if (passwordEncoder.matches(otp, data.getHashedOtp())) {
            otpStore.remove(email); // Remove after successful verification
            System.out.println("✅ OTP verified successfully for: " + email);
            return true;
        }

        System.err.println("❌ Invalid OTP for email: " + email);
        return false;
    }

    /**
     * Clear OTP for an email
     */
    public void clearOTP(String email) {
        otpStore.remove(email);
        System.out.println("🗑️ OTP cleared for: " + email);
    }

    /**
     * Get remaining time for OTP expiry (for debugging)
     */
    public String getOTPExpiryInfo(String email) {
        OTPData data = otpStore.get(email);
        if (data == null) {
            return "No OTP found";
        }
        return "Expires at: " + data.getExpiryTime();
    }

    /**
     * Send Newsletter Welcome Email
     */
    public void sendWelcomeEmail(String toEmail) {
        String subject = "Welcome to BookBarn Newsletter! 📚";
        String body = buildWelcomeEmailBody();
        sendEmailViaBrevo(toEmail, subject, body);
    }

    private String buildWelcomeEmailBody() {
        return "<html>" +
                "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>" +
                "<div style='max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;'>" +
                "<div style='background-color: #d97706; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;'>"
                +
                "<h1 style='margin: 0;'>Welcome to BookBarn! 📚</h1>" +
                "</div>" +
                "<div style='background-color: white; padding: 30px; border-radius: 0 0 8px 8px;'>" +
                "<h2>Subscription Successful!</h2>" +
                "<p>Hello book lover,</p>" +
                "<p>Thank you for subscribing to the BookBarn newsletter. You have successfully joined our community of readers.</p>"
                +
                "<p>From now on, you will be the first to know about:</p>" +
                "<ul>" +
                "<li>🚀 New Book Arrivals</li>" +
                "<li>🔥 Exclusive Discounts & Offers</li>" +
                "<li>📖 Author Interviews & Events</li>" +
                "</ul>" +
                "<p>Stay tuned for our next update!</p>" +
                "<hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>" +
                "<p style='color: #999; font-size: 12px; text-align: center;'>Best regards,<br>The BookBarn Team</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    /**
     * Inner class to store hashed OTP with expiry
     */
    private static class OTPData {
        private final String hashedOtp;
        private final LocalDateTime expiryTime;

        public OTPData(String hashedOtp, LocalDateTime expiryTime) {
            this.hashedOtp = hashedOtp;
            this.expiryTime = expiryTime;
        }

        public String getHashedOtp() {
            return hashedOtp;
        }

        public LocalDateTime getExpiryTime() {
            return expiryTime;
        }
    }
}
