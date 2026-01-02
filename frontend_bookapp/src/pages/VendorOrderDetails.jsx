import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    ArrowLeft, Package, MapPin, Phone, CreditCard, Calendar,
    Clock, User, Truck, CheckCircle, AlertCircle, Eye, Download
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function VendorOrderDetails() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/orders/${orderId}`);
            setOrder(res.data);
        } catch (err) {
            console.error('Failed to fetch order details:', err);
            setError('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptOrder = async () => {
        try {
            await api.post(`/orders/update-status?id=${orderId}&status=READY_FOR_DELIVERY`);
            setMessage('Order accepted and marked ready for delivery!');
            fetchOrderDetails(); // Refresh order details
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Failed to update order status');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'PENDING': 'bg-amber-100 text-amber-700 border-amber-200',
            'READY_FOR_DELIVERY': 'bg-blue-100 text-blue-700 border-blue-200',
            'SHIPPED': 'bg-purple-100 text-purple-700 border-purple-200',
            'DELIVERED': 'bg-green-100 text-green-700 border-green-200',
            'CANCELLED': 'bg-red-100 text-red-700 border-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING': return <AlertCircle size={20} />;
            case 'READY_FOR_DELIVERY': return <Package size={20} />;
            case 'SHIPPED': return <Truck size={20} />;
            case 'DELIVERED': return <CheckCircle size={20} />;
            default: return <Package size={20} />;
        }
    };

    const formatTime = (ts) => {
        if (!ts) return 'N/A';
        try {
            // Handle "yyyy-MM-dd HH:mm:ss" by replacing space with T
            const dateStr = String(ts).replace(' ', 'T');
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return 'Invalid Date';

            return date.toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short'
            });
        } catch (e) {
            return 'Invalid Date';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                    <p className="text-gray-600 mb-4">{error || 'Unable to load order details'}</p>
                    <button
                        onClick={() => navigate('/vendor/dashboard')}
                        className="btn-primary"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/vendor/dashboard')}
                        className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors mb-4"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back to Dashboard</span>
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
                            <p className="text-gray-600 mt-1">
                                Placed on {formatTime(order.history?.[0]?.timestamp || order.createdAt || Date.now())}
                            </p>
                        </div>

                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status.replace(/_/g, ' ')}
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-50 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 border border-green-200"
                    >
                        <CheckCircle size={20} />
                        {message}
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Order Items */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Package size={20} className="text-amber-600" />
                                    Order Items
                                </h2>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <div className="w-16 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                {item.book?.image ? (
                                                    <img
                                                        src={item.book.image.startsWith('http') ? item.book.image : `${import.meta.env.VITE_API_BASE || 'https://bookapp-production-3e11.up.railway.app'}${item.book.image}`}
                                                        alt={item.book?.title}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.src = 'https://placehold.co/100x150?text=Book'; }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <Package size={24} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900">{item.book?.title || 'Unknown Book'}</h3>
                                                <p className="text-sm text-gray-600">{item.book?.author || 'Unknown Author'}</p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                                                    <span className="text-sm font-bold text-gray-900">₹{item.book?.price || 0}</span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900">
                                                    ₹{(item.book?.price || 0) * item.quantity}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Total */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-gray-900">Order Total</span>
                                        <span className="text-2xl font-bold text-amber-600">₹{order.total}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order History */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Clock size={20} className="text-blue-600" />
                                    Order Timeline
                                </h2>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4">
                                    {order.history?.map((h, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'
                                                    }`}>
                                                    {getStatusIcon(h.status)}
                                                </div>
                                                {idx < order.history.length - 1 && (
                                                    <div className="w-0.5 h-12 bg-gray-200 my-1"></div>
                                                )}
                                            </div>

                                            <div className="flex-1 pb-4">
                                                <p className="font-bold text-gray-900">{h.status.replace(/_/g, ' ')}</p>
                                                <p className="text-sm text-gray-600">
                                                    {formatTime(h.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">

                        {/* Customer Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <User size={20} className="text-green-600" />
                                    Customer Details
                                </h2>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPin size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Delivery Address</p>
                                        <p className="text-sm text-gray-900 font-medium">{order.address}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Phone size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Contact Number</p>
                                        <p className="text-sm text-gray-900 font-medium">{order.phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <CreditCard size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Payment Method</p>
                                        <p className="text-sm text-gray-900 font-medium">{order.paymentMethod || 'CARD'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Information */}
                        {order.assignedAgent && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Truck size={20} className="text-purple-600" />
                                        Delivery Agent
                                    </h2>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                            {order.assignedAgent.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{order.assignedAgent.name}</p>
                                            <p className="text-sm text-gray-600">{order.assignedAgent.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        {order.status === 'PENDING' && (
                            <button
                                onClick={handleAcceptOrder}
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white px-6 py-4 rounded-xl font-bold shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={20} />
                                Accept & Mark Ready
                            </button>
                        )}

                        {order.status === 'READY_FOR_DELIVERY' && (
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
                                <Package size={32} className="mx-auto text-blue-600 mb-2" />
                                <p className="font-bold text-blue-900">Ready for Pickup</p>
                                <p className="text-sm text-blue-700 mt-1">Waiting for delivery agent</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
