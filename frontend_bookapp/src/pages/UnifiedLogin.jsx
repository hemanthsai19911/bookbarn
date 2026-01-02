import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/auth";
import { User, Lock, Mail, ArrowRight, Loader2, Store, Truck } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

export default function UnifiedLogin() {
    const [userType, setUserType] = useState("user"); // user, vendor, delivery
    const [form, setForm] = useState({
        input: "",
        password: ""
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    // ================= VALIDATION =================
    function validate() {
        let err = {};

        if (!form.input.trim()) {
            err.input = userType === "user"
                ? "Please enter username, email, or phone number"
                : "Please enter your email address";
        } else if (userType !== "user") {
            // For vendor and delivery, only email is accepted
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(form.input)) {
                err.input = "Please enter a valid email address";
            }
        } else {
            // User validation (username, email, or phone)
            const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
            const phoneRegex = /^[6-9]\d{9}$/;

            if (
                !gmailRegex.test(form.input) &&
                !phoneRegex.test(form.input) &&
                form.input.includes("@")
            ) {
                err.input = "Only valid @gmail.com emails are allowed";
            }
        }

        if (!form.password.trim()) {
            err.password = "Password is required";
        }

        setErrors(err);
        return Object.keys(err).length === 0;
    }

    // ================= SUBMIT =================
    async function submit(e) {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setErrors({});

        try {
            if (userType === "user") {
                // Regular user login
                // Clear other tokens to prevent role confusion
                localStorage.removeItem("vendorToken");
                localStorage.removeItem("vendorName");
                localStorage.removeItem("deliveryToken");
                localStorage.removeItem("deliveryAgent");

                const userData = await login(form.input, form.password);
                if (userData.user.role === "ADMIN") {
                    nav("/admin/dashboard");
                } else {
                    nav("/");
                }
            } else if (userType === "vendor") {
                // Vendor login
                // Clear other tokens
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");
                localStorage.removeItem("deliveryToken");
                localStorage.removeItem("deliveryAgent");

                const res = await axios.post("https://bookapp-production-3e11.up.railway.app/vendors/login", {
                    email: form.input,
                    password: form.password
                });
                localStorage.setItem("vendorToken", res.data.token);
                localStorage.setItem("vendorName", res.data.name);
                nav("/vendor/dashboard");
            } else if (userType === "delivery") {
                // Delivery agent login
                // Clear other tokens
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");
                localStorage.removeItem("vendorToken");
                localStorage.removeItem("vendorName");

                const res = await axios.post("https://bookapp-production-3e11.up.railway.app/delivery/login", {
                    email: form.input,
                    password: form.password
                });
                localStorage.setItem("deliveryToken", res.data.accessToken);
                localStorage.setItem("deliveryAgent", JSON.stringify(res.data.agent));
                nav("/delivery/dashboard");
            }
        } catch (err) {
            console.error("Login error:", err);
            setErrors({
                form: err.response?.data?.error || err.response?.data || "Invalid login credentials"
            });
        } finally {
            setLoading(false);
        }
    }

    const userTypeConfig = {
        user: {
            icon: User,
            title: "User Login",
            subtitle: "Access your bookstore account",
            color: "amber",
            registerLink: "/register"
        },
        vendor: {
            icon: Store,
            title: "Vendor Login",
            subtitle: "Manage your book inventory",
            color: "emerald",
            registerLink: "/vendors/register"
        },
        delivery: {
            icon: Truck,
            title: "Delivery Agent Login",
            subtitle: "View and manage deliveries",
            color: "blue",
            registerLink: "/delivery/register"
        }
    };

    const config = userTypeConfig[userType];
    const IconComponent = config.icon;

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-amber-200/20 rounded-full blur-[100px]" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-orange-200/20 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 md:p-10"
            >
                {/* User Type Selector */}
                <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                    {Object.keys(userTypeConfig).map((type) => {
                        const TypeIcon = userTypeConfig[type].icon;
                        return (
                            <button
                                key={type}
                                type="button"
                                onClick={() => {
                                    setUserType(type);
                                    setErrors({});
                                    setForm({ input: "", password: "" });
                                }}
                                className={`flex-1 py-2.5 px-3 text-sm font-medium rounded-lg capitalize transition-all flex items-center justify-center gap-2 ${userType === type
                                    ? 'bg-white text-gray-900 shadow-md'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <TypeIcon size={16} />
                                {type}
                            </button>
                        );
                    })}
                </div>

                <div className="text-center mb-8">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mx-auto shadow-lg mb-4 ${userType === 'user' ? 'bg-amber-600 shadow-amber-600/30' :
                        userType === 'vendor' ? 'bg-emerald-600 shadow-emerald-600/30' :
                            'bg-blue-600 shadow-blue-600/30'
                        }`}>
                        <IconComponent size={24} />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-gray-900">{config.title}</h2>
                    <p className="text-gray-500 mt-2">{config.subtitle}</p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* Global Error */}
                    {errors.form && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600" /> {errors.form}
                        </div>
                    )}

                    {/* Input */}
                    <div>
                        <div className="relative group">
                            <Mail className={`absolute left-4 top-3.5 text-gray-400 transition-colors ${userType === 'user' ? 'group-focus-within:text-amber-600' :
                                userType === 'vendor' ? 'group-focus-within:text-emerald-600' :
                                    'group-focus-within:text-blue-600'
                                }`} size={20} />
                            <input
                                type="text"
                                value={form.input}
                                onChange={(e) => setForm({ ...form, input: e.target.value })}
                                placeholder={userType === "user" ? "Username / Email / Phone" : "Email Address"}
                                className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 outline-none transition-all ${userType === 'user' ? 'focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10' :
                                    userType === 'vendor' ? 'focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10' :
                                        'focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                                    }`}
                            />
                        </div>
                        {errors.input && <p className="text-red-500 text-xs mt-1 ml-1">{errors.input}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <div className="relative group">
                            <Lock className={`absolute left-4 top-3.5 text-gray-400 transition-colors ${userType === 'user' ? 'group-focus-within:text-amber-600' :
                                userType === 'vendor' ? 'group-focus-within:text-emerald-600' :
                                    'group-focus-within:text-blue-600'
                                }`} size={20} />
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder="Password"
                                className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 outline-none transition-all ${userType === 'user' ? 'focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10' :
                                    userType === 'vendor' ? 'focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10' :
                                        'focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                                    }`}
                            />
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                            <input type="checkbox" className={`rounded ${userType === 'user' ? 'text-amber-600 focus:ring-amber-500' :
                                userType === 'vendor' ? 'text-emerald-600 focus:ring-emerald-500' :
                                    'text-blue-600 focus:ring-blue-500'
                                }`} />
                            Remember me
                        </label>
                        <Link to="/forgot-password" className={`font-semibold hover:underline ${userType === 'user' ? 'text-amber-700' :
                            userType === 'vendor' ? 'text-emerald-700' :
                                'text-blue-700'
                            }`}>Forgot password?</Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${userType === 'user' ? 'bg-amber-700 shadow-amber-700/20 hover:bg-amber-800' :
                            userType === 'vendor' ? 'bg-emerald-700 shadow-emerald-700/20 hover:bg-emerald-800' :
                                'bg-blue-700 shadow-blue-700/20 hover:bg-blue-800'
                            }`}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
                        {!loading && <ArrowRight size={20} />}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-8">
                    Don't have an account?
                    <Link to={config.registerLink} className={`font-bold hover:underline ml-1 ${userType === 'user' ? 'text-amber-700' :
                        userType === 'vendor' ? 'text-emerald-700' :
                            'text-blue-700'
                        }`}>Sign up</Link>
                </p>
            </motion.div>
        </div>
    );
}


