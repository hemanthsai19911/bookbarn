import React, { useState } from "react";
import { updateProfile } from "../services/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Lock, Save, ArrowLeft } from "lucide-react";
import OTPInput from "../components/OTPInput";
import { motion } from "framer-motion";

export default function UpdateProfile() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState({
    username: user.username,
    email: user.email || "",
    phone: user.phone || "",
    address: user.address || "",
    password: ""
  });
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [message, setMessage] = useState("");
  const nav = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // If password is being changed, require OTP
    if (form.password && form.password.trim()) {
      setShowOTPModal(true);
      if (!otpSent) {
        await sendOTP();
      }
      return;
    }

    // No password change, update profile directly
    await submitUpdate();
  }

  async function sendOTP() {
    setSendingOTP(true);
    try {
      await axios.post("https://bookapp-production-3e11.up.railway.app/otp/send-reset", { email: form.email });
      setOtpSent(true);

      const toast = document.createElement("div");
      toast.className = "fixed top-5 right-5 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-2xl z-[999] animate-fade-in flex items-center gap-2";
      toast.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"></path></svg> OTP sent to ${form.email}`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (err) {
      setMessage("Failed to send OTP");
    } finally {
      setSendingOTP(false);
    }
  }

  async function verifyOTPAndUpdate(otpValue) {
    setSaving(true);
    try {
      const verifyRes = await axios.post("https://bookapp-production-3e11.up.railway.app/otp/verify", {
        email: form.email,
        otp: otpValue
      });

      if (verifyRes.data.verified) {
        await submitUpdate();
      }
    } catch (err) {
      setMessage("Invalid OTP or update failed");
      setSaving(false);
    }
  }

  async function submitUpdate() {
    setSaving(true);
    setMessage("");

    try {
      const resp = await updateProfile(user.id, form);
      localStorage.setItem("user", JSON.stringify(resp.user));
      localStorage.setItem("accessToken", resp.accessToken);

      const toast = document.createElement("div");
      toast.className = "fixed top-5 right-5 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-[999] animate-fade-in flex items-center gap-2";
      toast.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"></path></svg> Profile updated successfully!`;
      document.body.appendChild(toast);
      setTimeout(() => { toast.remove(); nav("/"); }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || "Update failed");
      setSaving(false);
    }
  }

  async function resendOTP() {
    setSendingOTP(true);
    try {
      await axios.post("https://bookapp-production-3e11.up.railway.app/otp/resend", {
        email: form.email,
        purpose: "Profile Update"
      });

      const toast = document.createElement("div");
      toast.className = "fixed top-5 right-5 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-2xl z-[999] animate-fade-in";
      toast.textContent = "New OTP sent!";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    } catch (err) {
      setMessage("Failed to resend OTP");
    } finally {
      setSendingOTP(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => nav("/")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
            <h1 className="text-xl font-bold text-gray-900">Update Profile</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your account details</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {message && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
                {message}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email (@gmail.com)"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium resize-none"
                    rows="3"
                  />
                </div>
              </div>

              {/* Password Field with OTP Security */}
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  New Password (Optional)
                  <span className="text-xs font-normal text-amber-600 ml-2">ðŸ”’ Requires OTP verification</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current password"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
                </div>
                {form.password && (
                  <p className="text-xs text-amber-600 mt-1 ml-1">
                    š ï¸ Changing password will require OTP verification
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || sendingOTP}
              className="w-full bg-amber-700 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-amber-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {(saving || sendingOTP) ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save size={18} /> Update Profile
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
          >
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-amber-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Verify Your Identity</h2>
              <p className="text-gray-500 mt-2">Enter the OTP sent to {form.email}</p>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 text-center">
                <p className="font-semibold mb-1">ðŸ“§ Check your email</p>
                <p className="text-xs">Code expires in 10 minutes</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Enter OTP</label>
                <OTPInput
                  length={6}
                  onComplete={verifyOTPAndUpdate}
                  disabled={saving}
                />
              </div>

              {message && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                  {message}
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={resendOTP}
                  disabled={sendingOTP}
                  className="text-amber-700 font-semibold hover:underline disabled:opacity-50 text-sm"
                >
                  Resend OTP
                </button>
              </div>

              <button
                onClick={() => {
                  setShowOTPModal(false);
                  setOtpSent(false);
                  setMessage("");
                }}
                className="w-full text-gray-600 font-medium py-2 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}



