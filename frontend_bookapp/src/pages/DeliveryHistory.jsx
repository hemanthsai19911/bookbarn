// src/pages/DeliveryHistory.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function DeliveryHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const agent = JSON.parse(localStorage.getItem("deliveryAgent"));
    const navigate = useNavigate();

    useEffect(() => {
        loadHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadHistory() {
        if (!agent?.id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await api.get(`/delivery/assigned/${agent.id}`);
            const orders = Array.isArray(res.data) ? res.data : [];
            // Filter for delivered orders
            const delivered = orders.filter((o) =>
                ["DELIVERED"].includes((o.status || "").toUpperCase())
            );
            // Sort by latest delivery first (using history if available, or id as proxy)
            delivered.sort((a, b) => b.id - a.id);
            setHistory(delivered);
        } catch (err) {
            console.error("Failed to load history:", err);
        } finally {
            setLoading(false);
        }
    }

    function openDetails(id) {
        navigate(`/delivery/order/${id}`);
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
                    <div className="animate-pulse h-6 bg-gray-200 rounded w-32 mb-4" />
                    <p className="text-gray-500">Loading history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <button
                            onClick={() => navigate("/delivery/dashboard")}
                            className="mb-2 text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                        >
                            &larr; Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-bold text-gray-800">Delivery History</h1>
                        <p className="text-gray-500 mt-1">Archive of your completed deliveries</p>
                    </div>

                </div>

                {history.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No delivered orders yet</h3>
                        <p className="text-gray-500 mt-1">Completed deliveries will appear here.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Order ID</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {history.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-gray-700">#{order.id}</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {order.history && order.history.length > 0
                                                    ? new Date(order.history[order.history.length - 1].time).toLocaleDateString()
                                                    : "N/A"}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">₹ {order.total}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => openDetails(order.id)}
                                                    className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
