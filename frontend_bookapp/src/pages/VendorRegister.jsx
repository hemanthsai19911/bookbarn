import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Store, Lock, Mail, Phone, MapPin, ArrowRight, Loader2, Building2, Send, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import OTPInput from "../components/OTPInput";

export default function VendorRegister() {
    const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        password: ""
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const nav = useNavigate();

    // Get current location and convert to address
    async function getCurrentLocation() {
        if (!navigator.geolocation) {
            // If geolocation not supported, try IP-based location directly
            await getLocationByIP();
            return;
        }

        setLoadingLocation(true);

        // Try with high accuracy first, fallback to lower accuracy if timeout
        const tryGetLocation = (useHighAccuracy, timeout) => {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    resolve,
                    reject,
                    {
                        enableHighAccuracy: useHighAccuracy,
                        timeout: timeout,
                        maximumAge: 30000 // Accept cached position up to 30 seconds old
                    }
                );
            });
        };

        try {
            let position;
            try {
                // First attempt: High accuracy with 15 second timeout
                position = await tryGetLocation(true, 15000);
            } catch (firstError) {
                if (firstError.code === 3) { // TIMEOUT
                    // Second attempt: Lower accuracy with 20 second timeout
                    console.log("High accuracy timed out, trying lower accuracy...");
                    try {
                        position = await tryGetLocation(false, 20000);
                    } catch (secondError) {
                        // If GPS completely fails, try IP-based location
                        console.log("GPS failed, trying IP-based location...");
                        await getLocationByIP();
                        return;
                    }
                } else {
                    throw firstError;
                }
            }

            const { latitude, longitude } = position.coords;

            try {
                // Add user agent header to comply with Nominatim usage policy
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
                    {
                        headers: {
                            'User-Agent': 'BookBarn App'
                        }
                    }
                );
                const data = await response.json();

                if (data && data.display_name) {
                    const addr = data.address;
                    const formattedAddress = [
                        addr.house_number,
                        addr.road,
                        addr.suburb || addr.neighbourhood,
                        addr.city || addr.town || addr.village,
                        addr.state,
                        addr.postcode,
                        addr.country
                    ].filter(Boolean).join(", ");

                    setForm({ ...form, address: formattedAddress || data.display_name });
                    setLoadingLocation(false);
                } else {
                    throw new Error("No address data received");
                }
            } catch (error) {
                console.error("Error fetching address:", error);
                // Provide coordinates as fallback
                const fallbackAddress = `Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`;
                setForm({ ...form, address: fallbackAddress });
                alert("Could not fetch full address. Coordinates have been filled. Please complete the address manually.");
                setLoadingLocation(false);
            }
        } catch (error) {
            let errorMessage = "Unable to retrieve your location";

            switch (error.code) {
                case 1: // PERMISSION_DENIED
                    errorMessage = "Location permission denied. Trying alternative method...";
                    console.log(errorMessage);
                    // Try IP-based location as fallback
                    await getLocationByIP();
                    return;
                case 2: // POSITION_UNAVAILABLE
                    errorMessage = "GPS unavailable. Trying alternative method...";
                    console.log(errorMessage);
                    await getLocationByIP();
                    return;
                case 3: // TIMEOUT
                    // Already handled above
                    break;
            }

            setLoadingLocation(false);
        }
    }

    // Fallback: Get approximate location based on IP address
    async function getLocationByIP() {
        try {
            // Using ipapi.co - free IP geolocation API (no key needed for basic use)
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();

            if (data && data.city) {
                const ipBasedAddress = [
                    data.city,
                    data.region,
                    data.postal,
                    data.country_name
                ].filter(Boolean).join(", ");

                setForm({ ...form, address: ipBasedAddress });
                alert(`📍 Approximate location detected: ${data.city}, ${data.region}\n\nThis is based on your internet connection. Please verify and complete your exact address.`);
            } else {
                throw new Error("Could not determine location");
            }
        } catch (error) {
            console.error("IP-based location failed:", error);
            alert("Unable to detect location automatically. Please enter your address manually.");
        } finally {
            setLoadingLocation(false);
        }
    }

    // ================= PASSWORD VALIDATOR =================
    const isStrongPassword = (pwd) => {
        const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return pattern.test(pwd);
    };

    // ================= VALIDATION =================
    function validate() {
        let err = {};

        if (!form.name.trim()) err.name = "Business name is required";

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.email) {
            err.email = "Email is required";
        } else if (!emailRegex.test(form.email)) {
            err.email = "Please enter a valid email address";
        }

        // Phone number validation
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!form.phone) {
            err.phone = "Phone number is required";
        } else if (!phoneRegex.test(form.phone)) {
            err.phone = "Phone must be 10 digits (start 6€“9)";
        }

        if (!form.address.trim()) err.address = "Business address is required";

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
                await axios.post("https://bookapp-production-3e11.up.railway.app/vendors/register", form);

                const toast = document.createElement("div");
                toast.className = "fixed top-5 right-5 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-[999] animate-fade-in flex items-center gap-2";
                toast.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"></path></svg> Vendor Registration Successful! Awaiting Admin Approval.`;
                document.body.appendChild(toast);
                setTimeout(() => { toast.remove(); nav("/login"); }, 3000);
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
                <div className="absolute bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[100px]" />
                <div className="absolute top-[10%] -right-[10%] w-[40%] h-[40%] bg-teal-100/40 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="relative z-10 w-full max-w-lg bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-8 md:p-10"
            >
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-600/30 mb-4">
                        <Store size={28} />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-gray-900">
                        {step === 1 ? "Become a Vendor" : "Verify Email"}
                    </h2>
                    <p className="text-gray-500 mt-2">
                        {step === 1 ? "Start selling your books on BookBarn" : `Enter the OTP sent to ${form.email}`}
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

                        {/* Business Name */}
                        <div className="space-y-1">
                            <div className="relative group">
                                <Building2 className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Business Name"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm"
                                />
                            </div>
                            {errors.name && <p className="text-red-500 text-xs ml-1">{errors.name}</p>}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Email */}
                            <div className="space-y-1">
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        placeholder="Email Address"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm"
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email}</p>}
                            </div>

                            {/* Phone */}
                            <div className="space-y-1">
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                                    <input
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        placeholder="Phone (10 digits)"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm"
                                    />
                                </div>
                                {errors.phone && <p className="text-red-500 text-xs ml-1">{errors.phone}</p>}
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-semibold text-gray-700">Business Address</label>
                                <button
                                    type="button"
                                    onClick={getCurrentLocation}
                                    disabled={loadingLocation}
                                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loadingLocation ? (
                                        <>
                                            <Loader2 size={12} className="animate-spin" />
                                            Detecting...
                                        </>
                                    ) : (
                                        <>
                                            <Navigation size={12} />
                                            Use Location
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                                <textarea
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    placeholder="Business Address"
                                    rows="2"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm resize-none"
                                />
                            </div>
                            {errors.address && <p className="text-red-500 text-xs ml-1">{errors.address}</p>}
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="Create Password"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm"
                                />
                            </div>
                            {errors.password && <p className="text-red-500 text-xs ml-1">{errors.password}</p>}
                        </div>

                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
                            <p className="font-semibold mb-1">ðŸ“‹ Registration Process:</p>
                            <ul className="space-y-1 text-xs ml-4 list-disc">
                                <li>Email verification via OTP</li>
                                <li>Admin review and approval</li>
                                <li>Start listing your books after approval</li>
                            </ul>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Send OTP"}
                            {!loading && <Send size={20} />}
                        </button>
                    </form>
                ) : (
                    // STEP 2: OTP Verification
                    <div className="space-y-6">
                        {errors.form && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm font-medium text-center">
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
                                    className="text-emerald-700 font-semibold hover:underline disabled:opacity-50"
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
                    Already a vendor?
                    <Link to="/login" className="text-emerald-700 font-bold hover:underline ml-1">Login here</Link>
                </p>
            </motion.div>
        </div>
    );
}



