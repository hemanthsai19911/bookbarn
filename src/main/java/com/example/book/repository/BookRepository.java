package com.example.book.repository;

import java.util.List;
import com.example.book.model.Book;
import com.example.book.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
	// add custom queries if needed
	boolean existsByTitle(String title);

	boolean existsByTitleAndIdNot(String title, Long id);

	boolean existsByTitleAndAuthor(String title, String author);

	boolean existsByTitleAndAuthorAndIdNot(String title, String author, Long id);

	List<Book> findByVendor(Vendor vendor);
}