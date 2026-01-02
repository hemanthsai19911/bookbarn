import React, { useState, useEffect } from "react";
import api from "../services/api";
import axios from "axios";
import { User, Phone, MapPin, Save, ArrowLeft, Lock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import OTPInput from "../components/OTPInput";
import { motion } from "framer-motion";

export default function DeliveryProfileEdit() {
  const agent = JSON.parse(localStorage.getItem("deliveryAgent"));
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    area: "",
    password: ""
  });
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const res = await api.get(`/delivery/me/${agent.id}`);
      setForm({
        ...res.data,
        password: ""
      });
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
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
    await updateProfile();
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
        await updateProfile();
      }
    } catch (err) {
      setMessage("Invalid OTP or update failed");
      setSaving(false);
    }
  }

  async function updateProfile() {
    setSaving(true);
    setMessage("");

    try {
      await api.put(`/delivery/update/${agent.id}`, form);

      const toast = document.createElement("div");
      toast.className = "fixed top-5 right-5 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-[999] animate-fade-in flex items-center gap-2";
      toast.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"></path></svg> Profile updated successfully!`;
      document.body.appendChild(toast);
      setTimeout(() => { toast.remove(); navigate("/delivery/profile"); }, 2000);
    } catch (err) {
      setMessage("Failed to update profile");
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => navigate("/delivery/profile")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Profile
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
            <h1 className="text-xl font-bold text-gray-900">Edit Delivery Profile</h1>
            <p className="text-sm text-gray-500 mt-1">Update your delivery agent details</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {message && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
                {message}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Delivery Area</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              {/* Password Field with OTP Security */}
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  New Password (Optional)
                  <span className="text-xs font-normal text-blue-600 ml-2">ðŸ”’ Requires OTP verification</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Leave blank to keep current password"
                  />
                </div>
                {form.password && (
                  <p className="text-xs text-blue-600 mt-1 ml-1">
                    š ï¸ Changing password will require OTP verification
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || sendingOTP}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {(saving || sendingOTP) ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save size={18} /> Save Changes
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
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-blue-600" size={24} />
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
                  className="text-blue-700 font-semibold hover:underline disabled:opacity-50 text-sm"
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



