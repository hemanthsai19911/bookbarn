package com.example.book.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Book {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long B_id;

	@Column(unique = true)
	private String title;
	private String author;
	private Double price;
	private String description;
	private String category;
	private Integer stock = 0;

	private String image;

	@ManyToOne
	private Vendor vendor;

	public Book(Long b_id, String title, String author, Double price, String description, String category,
			Integer stock, String image) {
		super();
		B_id = b_id;
		this.title = title;
		this.author = author;
		this.price = price;
		this.description = description;
		this.category = category;
		this.stock = stock;
		this.image = image;
	}

	public Book(Long b_id, String title, String author, Double price, String description, String category,
			String image) {
		super();
		B_id = b_id;
		this.title = title;
		this.author = author;
		this.price = price;
		this.description = description;
		this.category = category;
		this.image = image;
	}

	public Long getB_id() {
		return B_id;
	}

	public void setB_id(Long b_id) {
		B_id = b_id;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String getImage() {
		return image;
	}

	public void setImage(String image) {
		this.image = image;
	}

	public Book() {
	}

	public Long getId() {
		return B_id;
	}

	public void setId(Long id) {
		this.B_id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getAuthor() {
		return author;
	}

	public void setAuthor(String author) {
		this.author = author;
	}

	public Double getPrice() {
		return price;
	}

	public void setPrice(Double price) {
		this.price = price;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Integer getStock() {
		return stock;
	}

	public void setStock(Integer stock) {
		this.stock = stock;
	}

	public Vendor getVendor() {
		return vendor;
	}

	public void setVendor(Vendor vendor) {
		this.vendor = vendor;
	}

}
