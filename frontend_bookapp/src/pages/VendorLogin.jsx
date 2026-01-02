import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function VendorLogin() {
    const [creds, setCreds] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCreds({ ...creds, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await axios.post("https://bookapp-production-3e11.up.railway.app/vendors/login", creds);
            const { token, name, role } = res.data;

            // IMPORTANT: Clear all other tokens first to prevent conflicts
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            localStorage.removeItem("deliveryToken");
            localStorage.removeItem("deliveryAgent");

            localStorage.setItem("vendorToken", token);
            localStorage.setItem("vendorName", name);
            // We can reuse user token storage if we want unified auth, but separating is safer for now 
            // or we just force it into a consistent structure.
            // For now, let's keep separate to avoid conflicts with User/Delivery.

            navigate("/vendor/dashboard");
        } catch (err) {
            setError(err.response?.data || "Login failed");
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card shadow p-4">
                        <h3 className="text-center mb-3">Vendor Login</h3>
                        {error && <div className="alert alert-danger">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    value={creds.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-control"
                                    value={creds.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <button className="btn btn-success w-100">Login</button>
                        </form>
                        <div className="mt-3 text-center">
                            <p>New Vendor? <Link to="/vendors/register">Register here</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


