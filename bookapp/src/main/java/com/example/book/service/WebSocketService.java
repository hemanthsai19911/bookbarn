package com.example.book.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class WebSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Send notification to a specific vendor
     */
    public void sendToVendor(Long vendorId, String type, Object payload) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", type);
        message.put("payload", payload);
        message.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSend("/topic/vendor/" + vendorId, message);
    }

    /**
     * Send notification to a specific delivery agent
     */
    public void sendToDeliveryAgent(Long agentId, String type, Object payload) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", type);
        message.put("payload", payload);
        message.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSend("/topic/delivery/" + agentId, message);
    }

    /**
     * Send notification to a specific user
     */
    public void sendToUser(Long userId, String type, Object payload) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", type);
        message.put("payload", payload);
        message.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSend("/topic/user/" + userId, message);
    }

    /**
     * Broadcast to all admins
     */
    public void broadcastToAdmins(String type, Object payload) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", type);
        message.put("payload", payload);
        message.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSend("/topic/admin", message);
    }

    /**
     * Send new order notification to vendor
     */
    public void notifyVendorNewOrder(Long vendorId, Object order) {
        sendToVendor(vendorId, "NEW_ORDER", order);
    }

    /**
     * Send order status update to vendor
     */
    public void notifyVendorOrderUpdate(Long vendorId, Object order) {
        sendToVendor(vendorId, "ORDER_UPDATE", order);
    }

    /**
     * Send inventory update to vendor
     */
    public void notifyVendorInventoryUpdate(Long vendorId, Object book) {
        sendToVendor(vendorId, "INVENTORY_UPDATE", book);
    }

    /**
     * Send notification to vendor
     */
    public void notifyVendor(Long vendorId, String message) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("message", message);
        notification.put("timestamp", System.currentTimeMillis());
        sendToVendor(vendorId, "NOTIFICATION", notification);
    }

    /**
     * Send order assignment to delivery agent
     */
    public void notifyDeliveryAgentNewAssignment(Long agentId, Object order) {
        sendToDeliveryAgent(agentId, "NEW_ASSIGNMENT", order);
    }

    /**
     * Send order update to user
     */
    public void notifyUserOrderUpdate(Long userId, Object order) {
        sendToUser(userId, "ORDER_UPDATE", order);
    }
}
