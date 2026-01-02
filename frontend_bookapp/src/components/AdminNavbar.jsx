import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

export default function AdminNavbar() {
  const nav = useNavigate();

  function handleLogout() {
    logout();
    nav("/login");
  }

  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-blue-700">Admin Panel</h1>

      <div className="flex space-x-6 text-lg">
        <Link to="/admin/books" className="hover:text-blue-600">Books</Link>
        <Link to="/admin/users" className="hover:text-blue-600">Users</Link>
        <Link to="/admin/orders" className="hover:text-blue-600">Orders</Link>
        <Link to="/admin/vendors" className="hover:text-blue-600">Vendors</Link>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

