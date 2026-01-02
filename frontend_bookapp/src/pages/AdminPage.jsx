import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getCurrentUser, logout } from "../services/auth";

export default function AdminPage() {
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState("");
  const [editId, setEditId] = useState(null);

  const nav = useNavigate();

  // Admin access check
  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      alert("Access denied!");
      nav("/");
    }
  }, [nav]);

  // Load Books
  async function loadBooks() {
    const res = await api.get("/books");
    setBooks(res.data);
  }

  // Load Orders
  async function loadOrders() {
    const res = await api.get("/orders/admin");
    setOrders(res.data);
  }

  useEffect(() => {
    loadBooks();
    loadOrders();
  }, []);

  // Save book
  async function saveBook(e) {
    e.preventDefault();

    if (editId) {
      await api.put(`/books/${editId}`, { title, author, price });
      setEditId(null);
    } else {
      await api.post("/books", { title, author, price });
    }

    setTitle("");
    setAuthor("");
    setPrice("");
    loadBooks();
  }

  // Delete Book
  async function removeBook(id) {
    await api.delete(`/books/${id}`);
    loadBooks();
  }

  return (
    <>
      {/* ---- Admin Page Content ---- */}

    </>
  );
}
