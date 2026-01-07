package com.example.book.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.book.model.Book;
import com.example.book.model.User;
import com.example.book.repository.BookRepository;
import com.example.book.repository.UserRepository;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, BookRepository bookRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Create Admin User if not exists
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123")); // Default admin password
                admin.setRole("ADMIN");
                admin.setEmail("admin@bookapp.com");
                admin.setPhone("1234567890");
                admin.setAddress("Admin HQ");
                userRepository.save(admin);
                System.out.println("Admin user created: username=admin, password=admin123");
            } else {
                System.out.println("Admin user already exists.");
            }

            // 2. Add Raw Book Data if none exists
            if (bookRepository.count() == 0) {
                List<Book> books = Arrays.asList(
                        new Book(null, "Clean Code", "Robert C. Martin", 450.00,
                                "A Handbook of Agile Software Craftsmanship", "Technology", 10,
                                "https://m.media-amazon.com/images/I/41jEbK-jG+L._SX258_BO1,204,203,200_.jpg"),
                        new Book(null, "The Pragmatic Programmer", "Andrew Hunt", 520.00, "Your Journey to Mastery",
                                "Technology", 15,
                                "https://m.media-amazon.com/images/I/51W1sBPO7tL._SX380_BO1,204,203,200_.jpg"),
                        new Book(null, "The Alchemist", "Paulo Coelho", 250.00, "A Fable About Following Your Dream",
                                "Fiction", 20, "https://m.media-amazon.com/images/I/51Z0nLAfLmL.jpg"),
                        new Book(null, "Atomic Habits", "James Clear", 300.00,
                                "An Easy & Proven Way to Build Good Habits", "Self-Help", 30,
                                "https://m.media-amazon.com/images/I/513Y5o-DYtL.jpg"),
                        new Book(null, "Head First Java", "Kathy Sierra", 600.00, "A Brain-Friendly Guide",
                                "Technology", 8,
                                "https://m.media-amazon.com/images/I/51Im-M9I8DL._SX258_BO1,204,203,200_.jpg"));

                bookRepository.saveAll(books);
                System.out.println("Added 5 sample books to the database.");
            } else {
                System.out.println("Books already exist in the database.");
            }
        };
    }
}
