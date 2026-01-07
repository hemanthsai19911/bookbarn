package com.example.book.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.book.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    List<User> findByUsername(String username);// username NOT unique

    User findByEmail(String email); // email must be unique

    User findByPhone(String phone); // phone must be unique

    User findByResetToken(String resetToken);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);
}
