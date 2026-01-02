import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";

export default function DeliveryLogin() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const nav = useNavigate();

  // ================= VALIDATION =================
  function validate() {
    let err = {};

    if (!form.email.trim()) err.email = "Email is required";
    if (!form.password.trim()) err.password = "Password is required";

    setErrors(err);
    return Object.keys(err).length === 0;
  }

  // ================= SUBMIT =================
  async function submit(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await api.post("/delivery/login", form);

      // Expected response:
      // {
      //   token: "xxxxxx",
      //   agent: { id, name, email, phone, area }
      // }

      // IMPORTANT: Clear all other tokens first to prevent conflicts
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("vendorToken");
      localStorage.removeItem("vendorName");

      localStorage.setItem("deliveryToken", res.data.accessToken);
      localStorage.setItem("deliveryAgent", JSON.stringify(res.data.agent));
      console.log("AGENT LOGIN RESPONSE:", res.data);
      alert("Login successful");
      nav("/delivery/dashboard");

    } catch (err) {
      alert(err.response?.data || "Invalid login credentials");
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Delivery Agent Login</h2>

      <form onSubmit={submit} className="space-y-3">

        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          className="w-full p-2 border rounded"
        />
        {errors.email && (
          <p className="text-red-600 text-sm">{errors.email}</p>
        )}

        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Password"
          className="w-full p-2 border rounded"
        />
        {errors.password && (
          <p className="text-red-600 text-sm">{errors.password}</p>
        )}

        <button className="w-full py-2 bg-green-600 text-white rounded">
          Login
        </button>
      </form>

      <p className="mt-3 text-center text-sm text-gray-600">
        New delivery agent?{" "}
        <a href="/delivery/register" className="text-blue-600">
          Register here
        </a>
      </p>
    </div>

  );
}

