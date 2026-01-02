package com.example.book.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.book.model.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
	List<Order> findByUserId(Long userId);

	Optional<Order> findFirstByUserId(Long userId);

	Optional<Order> findById(Long id);

	List<Order> findByAssignedAgentId(Long agentId);

	List<Order> findByStatusAndAssignedAgentIsNull(String status);

	@org.springframework.data.jpa.repository.Query("SELECT SUM(o.total) FROM Order o")
	Double sumTotalRevenue();

	@org.springframework.data.jpa.repository.Query("SELECT COUNT(o) FROM Order o")
	Long countTotalOrders();

	@org.springframework.data.jpa.repository.Query("SELECT new map(o.status as status, COUNT(o) as count, SUM(o.total) as revenue) FROM Order o GROUP BY o.status")
	List<java.util.Map<String, Object>> getOrderAnalytics();

	@org.springframework.data.jpa.repository.Query("SELECT DISTINCT o FROM Order o JOIN o.items i, Book b WHERE i.bookId = b.id AND b.vendor.id = :vendorId ORDER BY o.id DESC")
	List<Order> findByVendorId(Long vendorId);

}