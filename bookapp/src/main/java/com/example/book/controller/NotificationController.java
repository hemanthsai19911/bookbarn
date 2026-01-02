package com.example.book.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.book.model.Notification;
import com.example.book.repository.NotificationRepository;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationRepository repo;

    public NotificationController(NotificationRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/vendor/{vendorId}")
    public List<Notification> getVendorNotifications(@PathVariable Long vendorId) {
        return repo.findByVendorIdOrderByTimestampDesc(vendorId);
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        repo.findById(id).ifPresent(n -> {
            n.setRead(true);
            repo.save(n);
        });
    }

    @PostMapping("/vendor/{vendorId}/read-all")
    public void markAllAsRead(@PathVariable Long vendorId) {
        List<Notification> unread = repo.findByVendorIdOrderByTimestampDesc(vendorId);
        unread.forEach(n -> n.setRead(true));
        repo.saveAll(unread);
    }
}
