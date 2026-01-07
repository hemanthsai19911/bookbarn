package com.example.book.controller;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.book.model.Book;
import com.example.book.service.BookService;

@RestController
@RequestMapping("/books")
public class BookController {

    private final BookService svc;
    private final com.example.book.service.VendorService vendorService;

    public BookController(BookService svc, com.example.book.service.VendorService vendorService) {
        this.svc = svc;
        this.vendorService = vendorService;
    }

    @GetMapping
    public List<Book> all() {
        return svc.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> get(@PathVariable Long id) {
        return svc.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Book book, jakarta.servlet.http.HttpServletRequest request) {
        try {
            String role = (String) request.getAttribute("role");
            String username = (String) request.getAttribute("username"); // This is email

            if ("VENDOR".equals(role) && username != null) {
                // If vendor, we MUST link this book to them
                com.example.book.model.Vendor vendor = vendorService.getVendorByEmail(username);
                if (vendor == null) {
                    return ResponseEntity.status(403).body("Vendor account not found");
                }
                book.setVendor(vendor);
            }

            Book saved = svc.save(book);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Book book,
            jakarta.servlet.http.HttpServletRequest request) {
        try {
            // Check ownership
            if (!canEdit(id, request)) {
                return ResponseEntity.status(403).body("You do not have permission to edit this book");
            }

            Book updated = svc.updateBook(id, book);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/stock")
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestBody Map<String, Integer> payload,
            jakarta.servlet.http.HttpServletRequest request) {
        try {
            // Check ownership
            if (!canEdit(id, request)) {
                return ResponseEntity.status(403).body("You do not have permission to edit this book");
            }

            int stock = payload.get("stock");
            return ResponseEntity.ok(svc.updateStock(id, stock));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> createBulk(@RequestBody List<Book> books) {

        List<Book> inserted = new java.util.ArrayList<>();
        List<String> skipped = new java.util.ArrayList<>();

        for (Book b : books) {
            try {
                // Skip duplicates
                if (svc.existsByTitle(b.getTitle())) {
                    skipped.add(b.getTitle());
                    continue;
                }

                inserted.add(svc.save(b));

            } catch (Exception ex) {
                skipped.add(b.getTitle());
            }
        }

        return ResponseEntity.ok(
                Map.of(
                        "insertedCount", inserted.size(),
                        "skippedCount", skipped.size(),
                        "insertedBooks", inserted,
                        "skippedBooks", skipped));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, jakarta.servlet.http.HttpServletRequest request) {
        if (!canEdit(id, request)) {
            return ResponseEntity.status(403).body("You do not have permission to delete this book");
        }

        if (svc.findById(id).isPresent()) {
            svc.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Helper to check permissions
    private boolean canEdit(Long bookId, jakarta.servlet.http.HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        String username = (String) request.getAttribute("username");

        // ADMIN can edit anything
        if ("ADMIN".equals(role))
            return true;

        // VENDOR can only edit their own books
        if ("VENDOR".equals(role)) {
            return svc.findById(bookId).map(book -> {
                if (book.getVendor() == null)
                    return false; // Vendor cannot edit system books
                return book.getVendor().getEmail().equals(username);
            }).orElse(false);
        }

        return false;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("No file selected");
        }

        try {
            String uploadDir = "uploads/";

            File dir = new File(uploadDir);
            if (!dir.exists())
                dir.mkdirs();

            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path path = Paths.get(uploadDir + filename);

            Files.write(path, file.getBytes());

            String fileUrl = "/uploads/" + filename;

            return ResponseEntity.ok(fileUrl);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }
}
