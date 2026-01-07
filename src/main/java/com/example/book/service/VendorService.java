package com.example.book.service;

import com.example.book.dto.VendorDto;
import com.example.book.model.Vendor;
import com.example.book.model.VendorStatus;
import com.example.book.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class VendorService {

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Vendor registerVendor(VendorDto dto) {
        Optional<Vendor> existing = vendorRepository.findByEmail(dto.getEmail());
        if (existing.isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        Vendor vendor = new Vendor();
        vendor.setName(dto.getName());
        vendor.setEmail(dto.getEmail());
        vendor.setPhone(dto.getPhone());
        vendor.setAddress(dto.getAddress());
        vendor.setPassword(passwordEncoder.encode(dto.getPassword()));
        vendor.setStatus(VendorStatus.PENDING);
        vendor.setCreatedAt(LocalDateTime.now());

        return vendorRepository.save(vendor);
    }

    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    public List<Vendor> getPendingVendors() {
        return vendorRepository.findByStatus(VendorStatus.PENDING);
    }

    public Vendor approveVendor(Long id) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        vendor.setStatus(VendorStatus.APPROVED);
        vendor.setApprovedAt(LocalDateTime.now());
        return vendorRepository.save(vendor);
    }

    public Vendor rejectVendor(Long id) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        vendor.setStatus(VendorStatus.REJECTED);
        return vendorRepository.save(vendor);
    }

    public Vendor getVendorByEmail(String email) {
        return vendorRepository.findByEmail(email).orElse(null);
    }
}
