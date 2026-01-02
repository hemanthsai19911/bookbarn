import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/auth";
import { User, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [form, setForm] = useState({
    input: "",  // username OR email OR phone
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  // ================= VALIDATION =================
  function validate() {
    let err = {};

    if (!form.input.trim()) {
      err.input = "Please enter username, email, or phone number";
    } else {
      // Check email
      const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      const phoneRegex = /^[6-9]\d{9}$/;

      if (
        !gmailRegex.test(form.input) &&     // not a gmail
        !phoneRegex.test(form.input) &&     // not a phone number
        form.input.includes("@")            // invalid email
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
    try {
      const userData = await login(form.input, form.password);

      // Success animation or delay could be here
      if (userData.user.role === "ADMIN") {
        nav("/admin/dashboard");
      } else if (userData.user.role === "DELIVERY") {
        nav("/delivery/dashboard");
      } else {
        nav("/");
      }

    } catch (err) {
      setErrors({ form: err.response?.data || "Invalid login credentials" });
    } finally {
      setLoading(false);
    }
  }

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
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center text-white mx-auto shadow-lg shadow-amber-600/30 mb-4">
            <User size={24} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Sign in to continue your journey</p>
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
              <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-amber-600 transition-colors" size={20} />
              <input
                type="text"
                value={form.input}
                onChange={(e) => setForm({ ...form, input: e.target.value })}
                placeholder="Username / Email / Phone"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all"
              />
            </div>
            {errors.input && <p className="text-red-500 text-xs mt-1 ml-1">{errors.input}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-amber-600 transition-colors" size={20} />
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Password"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all"
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
              <input type="checkbox" className="rounded text-amber-600 focus:ring-amber-500" />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-amber-700 font-semibold hover:underline">Forgot password?</Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-700/20 hover:bg-amber-800 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-8">
          Don't have an account?
          <Link to="/register" className="text-amber-700 font-bold hover:underline ml-1">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}

