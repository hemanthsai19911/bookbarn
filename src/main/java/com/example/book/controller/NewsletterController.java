package com.example.book.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.book.model.Subscriber;
import com.example.book.repository.SubscriberRepository;
import com.example.book.service.EmailService;

@RestController
@RequestMapping("/newsletter")
public class NewsletterController {

    private final SubscriberRepository repo;
    private final EmailService emailService;

    public NewsletterController(SubscriberRepository repo, EmailService emailService) {
        this.repo = repo;
        this.emailService = emailService;
    }

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || !email.contains("@")) {
            return ResponseEntity.badRequest().body("Invalid email address");
        }

        if (repo.existsByEmail(email)) {
            return ResponseEntity.badRequest().body("Email already subscribed");
        }

        Subscriber sub = new Subscriber(email);
        repo.save(sub);

        emailService.sendWelcomeEmail(email);

        return ResponseEntity.ok("Subscribed successfully!");
    }
}
