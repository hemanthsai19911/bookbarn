package com.example.book.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.book.model.DeliveryAgent;
import com.example.book.model.Order;

import com.example.book.repository.DeliveryAgentRepository;
import com.example.book.repository.OrderRepository;
import com.example.book.service.OrderService;
import com.example.book.service.UserService;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final UserService usvc;
    private final OrderRepository orderRepo;
    private final OrderService orderService;
    private final DeliveryAgentRepository drepo;
    private final com.example.book.repository.VendorRepository vendorRepo;

    public AdminController(OrderRepository orderRepo, OrderService orderService,
            DeliveryAgentRepository drepo, UserService usvc, com.example.book.repository.VendorRepository vendorRepo) {
        this.usvc = usvc;
        this.orderRepo = orderRepo;
        this.orderService = orderService;
        this.drepo = drepo;
        this.vendorRepo = vendorRepo;
    }

    // Book management is handled by BookController

    @GetMapping("/users")
    public Map<String, Object> getAllUsers() {
        Map<String, Object> map = new HashMap<>();
        map.put("users", usvc.findAll());
        map.put("agents", drepo.findAll());
        map.put("vendors", vendorRepo.findAll());
        return map;
    }

    @DeleteMapping("/vendors/{id}")
    public ResponseEntity<?> deleteVendor(@PathVariable Long id) {
        if (vendorRepo.existsById(id)) {
            vendorRepo.deleteById(id);
            return ResponseEntity.ok("Vendor deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }

    // view all orders
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> allOrders() {
        return ResponseEntity.ok(orderRepo.findAll());
    }

    @PutMapping("/orders/{orderId}/status")
    public Order updateStatus(@PathVariable Long orderId, @RequestBody String status) {
        return orderService.updateStatus(orderId, status);
    }

    @PostMapping("/orders/{orderId}/assign/{agentId}")
    public Order assignOrder(
            @PathVariable Long orderId,
            @PathVariable Long agentId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        DeliveryAgent agent = drepo.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        order.setAssignedAgent(agent);
        order.setStatus("CONFIRMED");

        return orderRepo.save(order);
    }

    @PutMapping("/orders/{id}/confirm")
    public ResponseEntity<?> confirmOrder(@PathVariable Long id) {
        Order updated = orderService.confirmOrder(id);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Object> data = new HashMap<>();
        Double totalRevenue = orderRepo.sumTotalRevenue();
        Long totalOrders = orderRepo.countTotalOrders();
        List<Map<String, Object>> statusBreakdown = orderRepo.getOrderAnalytics();

        data.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);
        data.put("totalOrders", totalOrders != null ? totalOrders : 0);
        data.put("statusBreakdown", statusBreakdown);

        return ResponseEntity.ok(data);
    }
}
