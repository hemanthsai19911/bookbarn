import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResetPassword() {
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [userType, setUserType] = useState('user');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        let url = '';
        if (userType === 'user') url = 'https://bookapp-production-3e11.up.railway.app/user/reset-password';
        if (userType === 'vendor') url = 'https://bookapp-production-3e11.up.railway.app/vendors/reset-password';
        if (userType === 'delivery') url = 'https://bookapp-production-3e11.up.railway.app/delivery/reset-password';

        try {
            await axios.post(url, { token, newPassword });
            setMessage('Password reset successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || err.response?.data || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
                <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/60 relative z-10"
            >
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-2 transition-colors group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
                </button>

                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                    >
                        <Lock className="text-white" size={32} />
                    </motion.div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Reset Password</h1>
                    <p className="text-gray-600 mt-2">Enter your token and new password</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        {['user', 'vendor', 'delivery'].map((type) => (
                            <motion.button
                                key={type}
                                type="button"
                                onClick={() => setUserType(type)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`flex-1 py-2.5 text-sm font-bold rounded-lg capitalize transition-all ${userType === type
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {type}
                            </motion.button>
                        ))}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Reset Token</label>
                        <input
                            type="text"
                            required
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white/50 backdrop-blur-sm hover:border-indigo-300"
                            placeholder="Paste token here"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                        <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white/50 backdrop-blur-sm hover:border-indigo-300"
                            placeholder="Min 6 characters"
                        />
                    </div>

                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-xl text-sm font-medium border border-green-200 flex items-center gap-2"
                            >
                                <Sparkles size={16} className="text-green-500" />
                                {message}
                            </motion.div>
                        )}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="p-4 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 rounded-xl text-sm font-medium border border-red-200"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-indigo-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Resetting...
                            </>
                        ) : (
                            <>
                                <Lock size={18} /> Reset Password
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}


