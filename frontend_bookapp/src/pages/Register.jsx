import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import axios from "axios";
import { User, Lock, Mail, Phone, ShieldCheck, ArrowRight, Loader2, BookOpen, Send, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import OTPInput from "../components/OTPInput";

export default function Register() {
  const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "USER"
  });
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const nav = useNavigate();

  // ================= PASSWORD VALIDATOR =================
  const isStrongPassword = (pwd) => {
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return pattern.test(pwd);
  };

  // ================= VALIDATION =================
  function validate() {
    let err = {};

    if (!form.username.trim()) err.username = "Username is required";

    // Email - ONLY gmail.com
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!form.email) {
      err.email = "Email is required";
    } else if (!gmailRegex.test(form.email)) {
      err.email = "Only @gmail.com emails are allowed";
    }

    // Phone number validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!form.phone) {
      err.phone = "Phone number is required";
    } else if (!phoneRegex.test(form.phone)) {
      err.phone = "Phone must be 10 digits (start 6€“9)";
    }

    // Strong password validation
    if (!form.password) {
      err.password = "Password is required";
    } else if (!isStrongPassword(form.password)) {
      err.password = "Must contain 8+ chars, Uppercase, Lowercase, Number & Special char.";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  }

  // ================= SEND OTP =================
  async function sendOTP() {
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      await axios.post("https://bookapp-production-3e11.up.railway.app/otp/send-registration", {
        email: form.email
      });

      setOtpSent(true);
      setStep(2);

      const toast = document.createElement("div");
      toast.className = "fixed top-5 right-5 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-2xl z-[999] animate-fade-in flex items-center gap-2";
      toast.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"></path></svg> OTP sent to ${form.email}`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (err) {
      setErrors({ form: err.response?.data?.error || "Failed to send OTP" });
    } finally {
      setLoading(false);
    }
  }

  // ================= VERIFY OTP & REGISTER =================
  async function verifyAndRegister(otpValue) {
    setLoading(true);
    setErrors({});

    try {
      // Verify OTP
      const verifyRes = await axios.post("https://bookapp-production-3e11.up.railway.app/otp/verify", {
        email: form.email,
        otp: otpValue
      });

      if (verifyRes.data.verified) {
        // OTP verified, proceed with registration
        await api.post("/user/register", form);

        const toast = document.createElement("div");
        toast.className = "fixed top-5 right-5 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-[999] animate-fade-in flex items-center gap-2";
        toast.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"></path></svg> Registration Successful!`;
        document.body.appendChild(toast);
        setTimeout(() => { toast.remove(); nav("/login"); }, 2000);
      }
    } catch (err) {
      setErrors({ form: err.response?.data?.error || err.response?.data || "Invalid OTP or Registration failed" });
      setLoading(false);
    }
  }

  // ================= RESEND OTP =================
  async function resendOTP() {
    setLoading(true);
    try {
      await axios.post("https://bookapp-production-3e11.up.railway.app/otp/resend", {
        email: form.email,
        purpose: "Registration"
      });

      const toast = document.createElement("div");
      toast.className = "fixed top-5 right-5 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-2xl z-[999] animate-fade-in";
      toast.textContent = "New OTP sent!";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    } catch (err) {
      setErrors({ form: "Failed to resend OTP" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-amber-100/30 rounded-full blur-[100px]" />
        <div className="absolute top-[10%] -right-[10%] w-[40%] h-[40%] bg-orange-100/40 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-lg bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-8 md:p-10"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-amber-600 rounded-xl flex items-center justify-center text-white mx-auto shadow-lg shadow-amber-600/30 mb-4">
            <BookOpen size={28} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900">
            {step === 1 ? "Create Account" : "Verify Email"}
          </h2>
          <p className="text-gray-500 mt-2">
            {step === 1 ? "Join BookBarn and start your reading journey" : `Enter the OTP sent to ${form.email}`}
          </p>
        </div>

        {step === 1 ? (
          // STEP 1: Registration Form
          <form onSubmit={(e) => { e.preventDefault(); sendOTP(); }} className="space-y-4">
            {errors.form && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm text-center font-medium">
                {errors.form}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {/* Username */}
              <div className="space-y-1">
                <div className="relative group">
                  <User className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-amber-600 transition-colors" size={18} />
                  <input
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="Username"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-sm"
                  />
                </div>
                {errors.username && <p className="text-red-500 text-xs ml-1">{errors.username}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <div className="relative group">
                  <Phone className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-amber-600 transition-colors" size={18} />
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Phone (10 digits)"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-sm"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs ml-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-amber-600 transition-colors" size={18} />
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email Address (@gmail.com)"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-sm"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-amber-600 transition-colors" size={18} />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Create Password"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-sm"
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs ml-1">{errors.password}</p>}
            </div>

            {/* Role */}
            <div className="space-y-1">
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-amber-600 transition-colors" size={18} />
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-sm appearance-none cursor-pointer"
                >
                  <option value="USER">User (Customer)</option>
                  <option value="ADMIN">Admin (Seller)</option>
                </select>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <p className="font-semibold mb-1 flex items-center gap-2">
                <BookOpen size={16} /> What You'll Get:
              </p>
              <ul className="space-y-1 text-xs ml-4 list-disc">
                <li>Browse thousands of books across all genres</li>
                <li>Easy checkout and secure payment options</li>
                <li>Track your orders in real-time</li>
                <li>Save your favorite books for later</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-amber-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-600/20 hover:bg-amber-700 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Send OTP"}
              {!loading && <Send size={20} />}
            </button>
          </form>
        ) : (
          // STEP 2: OTP Verification
          <div className="space-y-6">
            {errors.form && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm text-center font-medium">
                {errors.form}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 text-center">
              <p className="font-semibold mb-1">ðŸ“§ Check your email</p>
              <p className="text-xs">We've sent a 6-digit code to <strong>{form.email}</strong></p>
              <p className="text-xs mt-1 text-blue-600">Code expires in 10 minutes</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Enter OTP</label>
              <OTPInput
                length={6}
                onComplete={verifyAndRegister}
                disabled={loading}
              />
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{" "}
                <button
                  onClick={resendOTP}
                  disabled={loading}
                  className="text-amber-700 font-semibold hover:underline disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </p>
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full text-gray-600 font-medium py-2 hover:text-gray-900 transition-colors"
            >
              † Back to form
            </button>
          </div>
        )}

        <p className="text-center text-gray-600 mt-8">
          Already have an account?
          <Link to="/login" className="text-amber-700 font-bold hover:underline ml-1">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}



