package com.example.book.repository;

import com.example.book.model.Vendor;
import com.example.book.model.VendorStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {
    Optional<Vendor> findByEmail(String email);

    Optional<Vendor> findByResetToken(String resetToken);

    List<Vendor> findByStatus(VendorStatus status);
}
