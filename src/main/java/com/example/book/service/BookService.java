package com.example.book.service;

import java.io.File;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.book.model.Book;
import com.example.book.repository.BookRepository;

@Service
public class BookService {

    private final BookRepository repo;

    public BookService(BookRepository repo) {
        this.repo = repo;
    }

    // ================= FETCH =================
    public List<Book> findAll() {
        return repo.findAll();
    }

    public Optional<Book> findById(Long id) {
        return repo.findById(id);
    }

    // ================= CREATE =================
    public Book save(Book b) {

        validateBook(b);

        // Allow same title but prevent exact duplicate (title + author)
        if (repo.existsByTitleAndAuthor(b.getTitle(), b.getAuthor())) {
            throw new RuntimeException("This book already exists (title + author)");
        }

        return repo.save(b);
    }

    // ================= UPDATE =================
    public Book updateBook(Long id, Book updated) {

        Book existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        validateBook(updated);

        // Prevent duplicate title+author (exclude this same book)
        if (repo.existsByTitleAndAuthorAndIdNot(updated.getTitle(), updated.getAuthor(), id)) {
            throw new RuntimeException("A book with this title & author already exists");
        }

        // Delete old image if updated
        if (updated.getImage() != null && !updated.getImage().equals(existing.getImage())) {
            deleteOldImage(existing.getImage());
        }

        existing.setTitle(updated.getTitle());
        existing.setAuthor(updated.getAuthor());
        existing.setPrice(updated.getPrice());
        existing.setCategory(updated.getCategory());
        existing.setDescription(updated.getDescription());
        existing.setImage(updated.getImage());
        existing.setStock(updated.getStock());

        return repo.save(existing);
    }

    private void deleteOldImage(String imagePath) {
        if (imagePath == null || imagePath.trim().isEmpty())
            return;

        try {
            String clean = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath;
            File file = new File(clean);

            if (file.exists()) {
                file.delete();
                System.out.println("Deleted old image: " + clean);
            }
        } catch (Exception e) {
            System.out.println("Failed to delete image: " + e.getMessage());
        }
    }

    // ================= DELETE =================
    public void deleteById(Long id) {
        Book book = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        deleteOldImage(book.getImage());

        repo.delete(book);

    }

    // ================= STOCK MANAGEMENT =================
    public Book updateStock(Long id, int stock) {
        if (stock < 0)
            throw new RuntimeException("Stock cannot be negative");

        Book book = repo.findById(id).orElseThrow(() -> new RuntimeException("Book not found"));
        book.setStock(stock);
        return repo.save(book);
    }

    public void deductStock(Long id, int quantity) {
        Book book = repo.findById(id).orElseThrow(() -> new RuntimeException("Book not found"));

        if (book.getStock() < quantity) {
            throw new RuntimeException("Not enough stock for book: " + book.getTitle());
        }

        book.setStock(book.getStock() - quantity);
        repo.save(book);
    }

    // ================= VALIDATION =================
    private void validateBook(Book b) {
        if (b.getTitle() == null || b.getTitle().trim().isEmpty())
            throw new RuntimeException("Title cannot be empty");

        if (b.getAuthor() == null || b.getAuthor().trim().isEmpty())
            throw new RuntimeException("Author cannot be empty");

        if (b.getPrice() == null || b.getPrice() <= 0)
            throw new RuntimeException("Price must be greater than 0");

        if (b.getCategory() == null || b.getCategory().trim().isEmpty())
            throw new RuntimeException("Category required");

        if (b.getDescription() == null || b.getDescription().length() < 10)
            throw new RuntimeException("Description must be 10+ characters");

        if (b.getImage() == null || b.getImage().trim().isEmpty())
            throw new RuntimeException("Image is required");

        if (b.getStock() == null || b.getStock() < 0)
            throw new RuntimeException("Stock cannot be negative");
    }

    public boolean existsByTitle(String title) {
        return repo.existsByTitle(title);
    }

}
