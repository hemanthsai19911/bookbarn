package com.example.book.service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.book.dto.DeliveryLoginRequest;
import com.example.book.model.DeliveryAgent;
import com.example.book.model.Order;
import com.example.book.model.OrderHistory;
import com.example.book.repository.DeliveryAgentRepository;
import com.example.book.repository.OrderRepository;

@Service
public class DeliveryAgentService {

    private final DeliveryAgentRepository agentRepo;
    private final OrderRepository orderRepo;
    private final PasswordEncoder encoder;

    public DeliveryAgentService(
            DeliveryAgentRepository agentRepo,
            OrderRepository orderRepo,
            PasswordEncoder encoder) {
        this.agentRepo = agentRepo;
        this.orderRepo = orderRepo;
        this.encoder = encoder;
    }

    // ---------------- REGISTER ----------------
    public DeliveryAgent register(DeliveryAgent agent) {
        agent.setPassword(encoder.encode(agent.getPassword()));
        agent.setStatus("ACTIVE");
        return agentRepo.save(agent);
    }

    // ---------------- LOGIN ----------------
    public Map<String, Object> login(DeliveryLoginRequest req) {

        DeliveryAgent agent = agentRepo.findByEmail(req.getEmail());
        if (agent == null)
            throw new RuntimeException("Invalid email");

        if (!encoder.matches(req.getPassword(), agent.getPassword()))
            throw new RuntimeException("Invalid password");

        String token = JwtService.generateToken(agent.getId(), agent.getName(), "DELIVERY_AGENT");

        Map<String, Object> resp = new HashMap<>();
        resp.put("agent", agent);
        resp.put("accessToken", token);

        return resp;
    }

    // ---------------- GET ASSIGNED ORDERS ----------------
    public List<Order> getAssignedOrders(Long agentId) {
        return orderRepo.findByAssignedAgentId(agentId);
    }

    // ---------------- GET AVAILABLE ORDERS ----------------
    public List<Order> getAvailableOrders() {
        return orderRepo.findByStatusAndAssignedAgentIsNull("CONFIRMED");
    }

    // ---------------- TAKE ORDER ----------------
    public Order assignOrder(Long agentId, Long orderId) {

        DeliveryAgent agent = agentRepo.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"CONFIRMED".equals(order.getStatus())) {
            throw new RuntimeException("Only CONFIRMED orders can be taken");
        }

        if (order.getAssignedAgent() != null)
            throw new RuntimeException("Order already taken");

        order.setAssignedAgent(agent);
        order.setStatus("SHIPPED");

        OrderHistory h = new OrderHistory();
        h.setStatus("SHIPPED");
        h.setTimestamp(Instant.now());
        h.setOrder(order);

        order.getHistory().add(h);

        return orderRepo.save(order);
    }

    public List<DeliveryAgent> findAll() {
        return agentRepo.findAll();
    }

    public void delete(Long id) {
        agentRepo.deleteById(id);
    }

    public DeliveryAgent getById(Long id) {
        return agentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Agent not found"));
    }

    public DeliveryAgent updateProfile(Long id, DeliveryAgent updated) {
        DeliveryAgent agent = agentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        agent.setName(updated.getName());
        agent.setPhone(updated.getPhone());
        agent.setArea(updated.getArea());
        agent.setEmail(updated.getEmail());
        // password update only if you want
        // if(updated.getPassword() != null)
        // agent.setPassword(passwordEncoder.encode(updated.getPassword()));

        return agentRepo.save(agent);
    }

    // ---------------- UPDATE STATUS: SHIPPED / DELIVERED ----------------
    public Order updateStatus(Long orderId, String status) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(status);

        OrderHistory h = new OrderHistory();
        h.setStatus(status);
        h.setTimestamp(Instant.now());
        h.setOrder(order);

        order.getHistory().add(h);
        return orderRepo.save(order);
    }
}
