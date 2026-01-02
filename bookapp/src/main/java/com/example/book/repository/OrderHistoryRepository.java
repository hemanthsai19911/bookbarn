package com.example.book.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.book.model.OrderHistory;

public interface OrderHistoryRepository extends JpaRepository<OrderHistory,Long > {
	List<OrderHistory> findByOrderId(Long orderId);


}
