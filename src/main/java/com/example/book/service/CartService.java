package com.example.book.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.book.model.Book;
import com.example.book.model.CartItem;
import com.example.book.model.Order;
import com.example.book.repository.BookRepository;
import com.example.book.repository.CartRepository;
import com.example.book.repository.OrderRepository;

@Service
public class CartService {

	private final CartRepository cartRepo;
	private final OrderRepository orderRepo;
	private final BookRepository bookRepo;

	public CartService(CartRepository cartRepo, OrderRepository orderRepo, BookRepository bookRepo) {
		this.cartRepo = cartRepo;
		this.orderRepo = orderRepo;
		this.bookRepo = bookRepo;
	}

	// ADD TO CART (Correct behavior)
	public CartItem add(CartItem item) {

		// Only check active cart items
		Optional<CartItem> existing = cartRepo.findByUserIdAndBookIdAndOrderIsNull(item.getUserId(), item.getBookId());

		// If already exists in CART → increase quantity
		if (existing.isPresent()) {
			CartItem ex = existing.get();
			ex.setQuantity(ex.getQuantity() + item.getQuantity());
			return cartRepo.save(ex);
		}

		// Otherwise insert as new cart item (order=null)
		return cartRepo.save(item);
	}

	// UPDATE QUANTITY
	public CartItem updateQuantity(CartItem item) {
		CartItem existing = cartRepo.findById(item.getId())
				.orElseThrow(() -> new RuntimeException("Cart item not found"));

		existing.setQuantity(item.getQuantity());
		return cartRepo.save(existing);
	}

	// ITEMS OF AN ORDER
	public List<CartItem> getItemsByOrder(Long orderId) {
		return cartRepo.findByOrderId(orderId);
	}

	// GET USER CART → only items with no order (correct behavior)
	public List<CartItem> getUserCart(Long userId) {
		return cartRepo.findByUserIdAndOrderIsNull(userId);
	}

	public Optional<CartItem> findById(Long id) {
		return cartRepo.findById(id);
	}

	public List<CartItem> findAll() {
		return cartRepo.findAll();
	}

	// Recalculate order total
	private void updateOrderTotal(Order order) {
		List<CartItem> items = cartRepo.findByOrderId(order.getId());

		double total = 0;
		for (CartItem ci : items) {
			Book book = bookRepo.findById(ci.getBookId()).orElseThrow();
			total += book.getPrice() * ci.getQuantity();
		}

		order.setTotal(total);
		orderRepo.save(order);
	}

	// DELETE ITEM FROM CART
	public Order deleteItem(Long itemId) {

		CartItem item = cartRepo.findById(itemId)
				.orElseThrow(() -> new RuntimeException("Cart item not found: " + itemId));

		Order order = item.getOrder(); // may be null—safe

		cartRepo.delete(item);

		// If the item was part of an order, update order total
		if (order != null) {
			updateOrderTotal(order);
			return orderRepo.findById(order.getId()).orElseThrow();
		}

		return null; // deleting regular cart item
	}
}
