package com.example.book.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.book.dto.OrderRequest;
import com.example.book.model.Order;
import com.example.book.service.OrderService;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService svc;

    public OrderController(OrderService svc) {
        this.svc = svc;
    }

    @GetMapping
    public List<Order> all() {
        return svc.findAll();
    }

    @DeleteMapping("/{orderId}")
    public String deleteOrder(@PathVariable Long orderId) {
        svc.deleteOrder(orderId);
        return "Order" + orderId + " deleted successfully";
    }

    @PostMapping("/place")
    public org.springframework.http.ResponseEntity<?> placeOrder(@RequestBody OrderRequest req) {
        try {
            return org.springframework.http.ResponseEntity.ok(svc.placeOrder(
                    req.getUserId(),
                    req.getAddress(),
                    req.getPhone(),
                    req.getPaymentMethod()));
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public List<Order> userOrders(@PathVariable Long userId) {
        return svc.findByUserId(userId);
    }

    @GetMapping("/{orderId}")
    public Order getOrder(@PathVariable Long orderId) {
        return svc.getOrder(orderId);
    }

    @GetMapping("/vendor/{vendorId}")
    public List<Order> getVendorOrders(@PathVariable Long vendorId) {
        return svc.findByVendorId(vendorId);
    }

    @GetMapping("/delivery/available")
    public List<Order> getAvailableDeliveryOrders() {
        return svc.findAvailableDeliveryOrders();
    }

    @GetMapping("/delivery/agent/{agentId}")
    public List<Order> getAgentOrders(@PathVariable Long agentId) {
        return svc.findByAgentId(agentId);
    }

    @PostMapping("/assign-agent")
    public Order assignAgent(@RequestParam Long orderId, @RequestParam Long agentId) {
        return svc.assignDeliveryAgent(orderId, agentId);
    }

    @PostMapping("/update-status")
    public String update(@RequestParam Long id, @RequestParam String status) {
        svc.updateStatus(id, status); // ✔️ FIXED
        return "Updated";
    }

    @PostMapping("/{id}/confirm")
    public org.springframework.http.ResponseEntity<?> confirmOrder(@PathVariable Long id) {
        try {
            return org.springframework.http.ResponseEntity.ok(svc.adminConfirmOrder(id));
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
