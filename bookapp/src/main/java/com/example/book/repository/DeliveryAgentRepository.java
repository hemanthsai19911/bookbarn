package com.example.book.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.book.model.DeliveryAgent;

public interface DeliveryAgentRepository extends JpaRepository<DeliveryAgent, Long> {

    DeliveryAgent findByEmail(String email);

    DeliveryAgent findByPhone(String phone);

    DeliveryAgent findByResetToken(String resetToken);

}
