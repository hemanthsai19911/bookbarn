import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import OTPInput from '../components/OTPInput';

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [userType, setUserType] = useState('user'); // user, vendor, delivery
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            await axios.post('https://bookapp-production-3e11.up.railway.app/otp/send-reset', { email });
            setMessage('OTP sent to your email!');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (otpValue) => {
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('https://bookapp-production-3e11.up.railway.app/otp/verify', {
                email,
                otp: otpValue
            });

            if (res.data.verified) {
                setMessage('OTP verified! Set your new password.');
                setStep(3);
            }
        } catch (err) {
            setError('Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        setError('');

        let url = '';
        if (userType === 'user') url = 'https://bookapp-production-3e11.up.railway.app/user/reset-password';
        if (userType === 'vendor') url = 'https://bookapp-production-3e11.up.railway.app/vendors/reset-password';
        if (userType === 'delivery') url = 'https://bookapp-production-3e11.up.railway.app/delivery/reset-password';

        try {
            // Note: Backend reset-password endpoints need to be updated to accept email+password instead of token
            await axios.post(url, { email, newPassword });

            const toast = document.createElement("div");
            toast.className = "fixed top-5 right-5 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-[999] animate-fade-in flex items-center gap-2";
            toast.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"></path></svg> Password reset successful!`;
            document.body.appendChild(toast);
            setTimeout(() => { toast.remove(); nav('/login'); }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const resendOTP = async () => {
        setLoading(true);
        try {
            await axios.post('https://bookapp-production-3e11.up.railway.app/otp/resend', {
                email,
                purpose: 'Password Reset'
            });
            setMessage('New OTP sent!');
            setError('');
        } catch (err) {
            setError('Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-200/20 rounded-full blur-[100px]" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-indigo-200/20 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-8"
            >
                <button onClick={() => nav(-1)} className="text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-2">
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {step === 1 && "Forgot Password"}
                        {step === 2 && "Verify OTP"}
                        {step === 3 && "Set New Password"}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {step === 1 && "Enter your email to receive OTP"}
                        {step === 2 && `OTP sent to ${email}`}
                        {step === 3 && "Create a strong password"}
                    </p>
                </div>

                {step === 1 && (
                    <form onSubmit={handleSendOTP} className="space-y-6">
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            {['user', 'vendor', 'delivery'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setUserType(type)}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md capitalize transition-all ${userType === type ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        {message && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">{message}</div>}
                        {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> Send OTP</>}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 text-center">
                            <p className="font-semibold mb-1">ðŸ“§ Check your email</p>
                            <p className="text-xs">Enter the 6-digit code sent to <strong>{email}</strong></p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Enter OTP</label>
                            <OTPInput length={6} onComplete={handleVerifyOTP} disabled={loading} />
                        </div>

                        {message && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm text-center">{message}</div>}
                        {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">{error}</div>}

                        <div className="text-center">
                            <button
                                onClick={resendOTP}
                                disabled={loading}
                                className="text-blue-700 font-semibold hover:underline disabled:opacity-50"
                            >
                                Resend OTP
                            </button>
                        </div>

                        <button onClick={() => setStep(1)} className="w-full text-gray-600 py-2 hover:text-gray-900">
                            † Change email
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="Min 8 characters"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="Re-enter password"
                            />
                        </div>

                        {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Reset Password'}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
}



