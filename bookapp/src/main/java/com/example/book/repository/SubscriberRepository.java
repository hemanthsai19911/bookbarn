package com.example.book.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.book.model.Subscriber;

public interface SubscriberRepository extends JpaRepository<Subscriber, Long> {
    boolean existsByEmail(String email);
}
