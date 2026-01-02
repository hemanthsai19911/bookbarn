import React, { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import { Check, X, Search, Shield, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminVendors() {
    const [vendors, setVendors] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL"); // ALL, PENDING, APPROVED, REJECTED
    const [searchTerm, setSearchTerm] = useState("");

    // Token is handled by api interceptor

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/vendors");
            setVendors(res.data);
        } catch (err) {
            console.error("Error fetching vendors", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        // Optimistic update
        const originalVendors = [...vendors];
        setVendors(vendors.map(v => v.id === id ? { ...v, status: action === 'approve' ? 'APPROVED' : 'REJECTED' } : v));

        try {
            await api.post(`/admin/vendors/${id}/${action}`);
            setMessage(`Vendor ${action}d successfully`);
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setVendors(originalVendors); // Revert
            setMessage(`Error ${action}ing vendor`);
        }
    };

    const filteredVendors = vendors.filter(v => {
        const matchesStatus = filter === "ALL" || v.status === filter;
        const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    if (loading) return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/20 to-gray-50 pb-12 font-sans text-gray-900">

                {/* Header */}
                <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 shadow-xl border-b border-amber-800/20 pt-8 pb-8 px-4 sm:px-8 relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-4xl font-serif font-bold text-white flex items-center gap-3 drop-shadow-lg">
                                <Shield className="text-white drop-shadow-md" size={36} />
                                Vendor Management
                            </h1>
                            <p className="text-amber-100 mt-2 font-medium">Review and manage vendor partnerships</p>
                        </motion.div>

                        {/* Status Filter Tabs */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="flex bg-white/20 backdrop-blur-sm p-1.5 rounded-xl border border-white/30 shadow-lg"
                        >
                            {["ALL", "PENDING", "APPROVED", "REJECTED"].map(status => (
                                <motion.button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${filter === status
                                        ? "bg-white text-amber-700 shadow-md"
                                        : "text-white/90 hover:text-white hover:bg-white/10"
                                        }`}
                                >
                                    {status.charAt(0) + status.slice(1).toLowerCase()}
                                </motion.button>
                            ))}
                        </motion.div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">

                    {/* Search & Stats */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search vendors..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="text-sm font-bold text-gray-500">
                            Showing {filteredVendors.length} vendors
                        </div>
                    </div>

                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 border border-emerald-100"
                            >
                                <Check size={18} /> {message}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Vendors Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 overflow-hidden"
                    >
                        <table className="w-full text-left">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black text-gray-600 uppercase tracking-wider">Vendor</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-600 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-600 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredVendors.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                            No vendors found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredVendors.map((v, index) => (
                                        <motion.tr
                                            key={v.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-transparent transition-all duration-300"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{v.name}</div>
                                                <div className="text-xs text-gray-400">ID: #{v.id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600">{v.email}</div>
                                                <div className="text-sm text-gray-500">{v.phone}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${v.status === "APPROVED" ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200" :
                                                    v.status === "REJECTED" ? "bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200" :
                                                        "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200"
                                                    }`}>
                                                    <span className={`w-2 h-2 rounded-full animate-pulse ${v.status === "APPROVED" ? "bg-emerald-500" :
                                                        v.status === "REJECTED" ? "bg-red-500" :
                                                            "bg-amber-500"
                                                        }`}></span>
                                                    {v.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {v.status === "PENDING" && (
                                                        <>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => handleAction(v.id, 'approve')}
                                                                className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-600 hover:from-emerald-100 hover:to-green-100 transition-all shadow-sm hover:shadow-md"
                                                                title="Approve"
                                                            >
                                                                <Check size={18} strokeWidth={2.5} />
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => handleAction(v.id, 'reject')}
                                                                className="p-2.5 rounded-xl bg-gradient-to-br from-red-50 to-pink-50 text-red-600 hover:from-red-100 hover:to-pink-100 transition-all shadow-sm hover:shadow-md"
                                                                title="Reject"
                                                            >
                                                                <X size={18} strokeWidth={2.5} />
                                                            </motion.button>
                                                        </>
                                                    )}
                                                    {v.status === "REJECTED" && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleAction(v.id, 'approve')}
                                                            className="px-3 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all flex items-center gap-1.5 text-sm font-bold shadow-sm"
                                                        >
                                                            <RefreshCw size={14} /> Re-evaluate
                                                        </motion.button>
                                                    )}
                                                    {v.status === "APPROVED" && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleAction(v.id, 'reject')}
                                                            className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                                                            title="Revoke Access"
                                                        >
                                                            <Shield size={18} />
                                                        </motion.button>
                                                    )}
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={async () => {
                                                            if (window.confirm("Are you sure you want to delete this vendor?")) {
                                                                try {
                                                                    await api.delete(`/admin/vendors/${v.id}`);
                                                                    setVendors(vendors.filter(vendor => vendor.id !== v.id));
                                                                    setMessage("Vendor deleted successfully");
                                                                    setTimeout(() => setMessage(""), 3000);
                                                                } catch (err) {
                                                                    console.error("Error deleting vendor", err);
                                                                    setMessage("Error deleting vendor");
                                                                }
                                                            }
                                                        }}
                                                        className="p-2.5 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                                                        title="Delete Vendor"
                                                    >
                                                        <X size={18} />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </motion.div>

                </div>
            </div>
        </Layout>
    );
}

