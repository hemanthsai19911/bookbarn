package com.example.book.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.example.book.model.CartItem;

@Repository
public interface CartRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserId(Long userId);


    // optional: delete items by user + book id
    @Transactional
    void deleteByUserIdAndBookId(Long userId, Long bookId);

	List<CartItem> findByOrderId(Long orderId);

	List<CartItem> findByUserIdAndOrderIsNull(Long userId);

	Optional<CartItem> findByUserIdAndBookIdAndOrderIsNull(Long userId, Long bookId);

}
