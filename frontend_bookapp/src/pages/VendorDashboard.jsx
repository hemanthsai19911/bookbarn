import React, { useEffect, useState } from "react";
import api from "../services/api";
import wsClient from "../services/websocket";
import { useNavigate } from "react-router-dom";
import { BookOpen, LogOut, Package, Plus, Search, DollarSign, Image as ImageIcon, X, TrendingUp, Edit2, Trash2, ShoppingBag, CheckCircle, RefreshCw, Bell, Eye, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VendorDashboard() {
    const [books, setBooks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBookId, setCurrentBookId] = useState(null);
    const [formData, setFormData] = useState({
        title: "", author: "", price: "", description: "", category: "", stock: 0, image: ""
    });
    const [message, setMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const token = localStorage.getItem("vendorToken");

    const [notifications, setNotifications] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState("inventory"); // inventory | orders
    const [vendorId, setVendorId] = useState(null);
    const [wsConnected, setWsConnected] = useState(false);
    const [currentTime, setCurrentTime] = useState(Date.now());

    // Update timer every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
        return () => clearInterval(timer);
    }, []);

    const getTimeAgo = (date) => {
        if (!date) return '';
        const d = new Date(String(date).replace(' ', 'T'));
        const seconds = Math.floor((currentTime - d) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return d.toLocaleDateString();
    };

    // Initialize WebSocket connection
    const pollingRef = React.useRef(null);

    // Initialize WebSocket connection
    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const startPolling = () => {
            if (pollingRef.current) return;
            console.log('📡 Starting polling mode (30s interval)');

            // Poll every 30 seconds
            pollingRef.current = setInterval(() => {
                fetchOrders();
                fetchNotifications();
                fetchMyBooks(true); // Silent update
            }, 30000);
        };

        const stopPolling = () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
                console.log('🛑 Stopped polling mode');
            }
        };

        // Get vendor profile to get vendor ID
        const initializeVendor = async () => {
            try {
                const profileRes = await api.get("/vendor/profile");
                const vId = profileRes.data.id;
                setVendorId(vId);

                // Initial fetch
                fetchOrders();
                fetchNotifications();
                fetchMyBooks();

                // Connect to WebSocket
                wsClient.connect(
                    () => {
                        console.log('WebSocket connected for vendor:', vId);
                        setWsConnected(true);
                        stopPolling(); // Stop polling if connected

                        // Subscribe to vendor-specific topics
                        wsClient.subscribe(`/topic/vendor/${vId}`, handleWebSocketMessage);
                    },
                    (error) => {
                        console.error('WebSocket connection error:', error);
                        setWsConnected(false);
                        startPolling(); // Fallback to polling
                    }
                );
            } catch (err) {
                console.error("Failed to initialize vendor", err);
                startPolling(); // Fallback on error
            }
        };

        initializeVendor();

        // Cleanup on unmount
        return () => {
            wsClient.disconnect();
            stopPolling();
        };
    }, [token, navigate]);

    // Handle incoming WebSocket messages
    const handleWebSocketMessage = (data) => {
        console.log('📨 Received WebSocket message:', data);

        switch (data.type) {
            case 'NEW_ORDER':
                // Add new order to the list
                setOrders(prev => [data.payload, ...prev]);
                // Show notification
                setMessage(`🎉 New order received! Order #${data.payload.id}`);
                setTimeout(() => setMessage(""), 5000);
                // Play notification sound (optional)
                playNotificationSound();
                break;

            case 'ORDER_UPDATE':
                // Update existing order
                setOrders(prev => prev.map(o =>
                    o.id === data.payload.id ? data.payload : o
                ));
                break;

            case 'INVENTORY_UPDATE':
                // Update books list
                fetchMyBooks();
                break;

            case 'NOTIFICATION':
                // Add notification
                const newNotification = {
                    id: Date.now(),
                    message: data.payload.message,
                    timestamp: new Date(data.payload.timestamp),
                    isRead: false
                };
                setNotifications(prev => [newNotification, ...prev]);
                break;

            default:
                console.log('Unknown message type:', data.type);
        }
    };

    // Optional: Play notification sound
    const playNotificationSound = () => {
        try {
            const audio = new Audio('/notification.mp3'); // Add a notification sound file
            audio.play().catch(e => console.log('Could not play sound:', e));
        } catch (e) {
            console.log('Notification sound not available');
        }
    };



    const fetchNotifications = async () => {
        try {
            let vId = vendorId;
            if (!vId) {
                const profileRes = await api.get("/vendor/profile");
                vId = profileRes.data.id;
                setVendorId(vId);
            }

            const res = await api.get(`/notifications/vendor/${vId}`);
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    }

    const markNotificationRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    const fetchOrders = async () => {
        try {
            let vId = vendorId;
            if (!vId) {
                const profileRes = await api.get("/vendor/profile");
                vId = profileRes.data.id;
                setVendorId(vId);
            }

            const res = await api.get(`/orders/vendor/${vId}`);
            setOrders(res.data);
        } catch (err) {
            console.error("Failed to fetch orders", err);
        }
    }

    const handleAcceptOrder = async (orderId) => {
        try {
            await api.post(`/orders/update-status?id=${orderId}&status=READY_FOR_DELIVERY`);
            // Update local state immediately
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'READY_FOR_DELIVERY' } : o));
            setMessage("Order accepted and marked ready for delivery!");
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setMessage("Failed to update status.");
        }
    };

    const fetchMyBooks = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await api.get("/vendor/my-books");
            setBooks(res.data);
        } catch (err) {
            console.error("Failed to fetch books", err);
        } finally {
            if (!silent) setLoading(false);
        }
    }

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fd = new FormData();
        fd.append("file", file);
        try {
            const res = await api.post("/books/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
            setFormData({ ...formData, image: res.data });
        } catch (err) {
            console.error("Upload failed", err);
            setMessage("Upload failed: " + (err.response?.data || err.message));
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const openAddModal = () => {
        setIsEditing(false);
        setFormData({ title: "", author: "", price: "", description: "", category: "", stock: 0, image: "" });
        setShowModal(true);
    };

    const openEditModal = (book) => {
        setIsEditing(true);
        setCurrentBookId(book.id);
        setFormData({
            title: book.title,
            author: book.author,
            price: book.price,
            description: book.description,
            category: book.category,
            stock: book.stock,
            image: book.image || ""
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/vendor/books/${currentBookId}`, formData);
                setMessage("Book updated successfully!");
            } else {
                await api.post("/vendor/books", formData);
                setMessage("Book added successfully!");
            }

            setShowModal(false);
            fetchMyBooks();
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setMessage("Failed to save book: " + (err.response?.data || err.message));
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this book?")) return;
        try {
            await api.delete(`/vendor/books/${id}`);
            setMessage("Book deleted successfully!");
            fetchMyBooks();
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setMessage("Failed to delete book: " + (err.response?.data || err.message));
        }
    };

    const filteredBooks = books.filter(b =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalStock = books.reduce((sum, b) => sum + (b.stock || 0), 0);
    const portfolioValue = books.reduce((sum, b) => sum + (b.price * b.stock || 0), 0);

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans pb-20">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* WebSocket Connection Status */}
                <div className="mb-6 flex justify-end">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${wsConnected
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`}></div>
                        {wsConnected ? '🟢 Live Updates Active' : '� Polling Mode (30s)'}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                    >
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <BookOpen size={24} />
                            </div>
                            <span className="text-xs font-bold bg-gray-50 text-gray-500 px-2 py-1 rounded-full uppercase">Total</span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-bold mt-4">Active Books</h3>
                        <p className="text-3xl font-bold text-gray-900">{books.length}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                    >
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                <Package size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-500 text-sm font-bold mt-4">Total Inventory</h3>
                        <p className="text-3xl font-bold text-gray-900">{totalStock}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                    >
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                                <TrendingUp size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-500 text-sm font-bold mt-4">Portfolio Value</h3>
                        <p className="text-3xl font-bold text-gray-900">₹{portfolioValue.toLocaleString()}</p>
                    </motion.div>
                </div>

                {/* Notifications Section */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            Recent Notifications
                        </h3>
                        <button
                            onClick={fetchNotifications}
                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-all"
                            title="Refresh Notifications"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>
                        </button>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {notifications.filter(n => !(n.isRead || n.read)).length === 0 ? (
                            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                                <Bell size={40} className="text-gray-200 mb-3" />
                                <p className="font-medium">No new alerts</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                                {notifications.filter(n => !(n.isRead || n.read)).map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => markNotificationRead(n.id)}
                                        className="p-4 hover:bg-gray-50 flex items-start gap-4 transition-colors cursor-pointer relative bg-blue-50/20"
                                    >
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm leading-relaxed text-gray-900 font-bold">
                                                {n.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-wider">
                                                {new Date(n.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-8 border-b border-gray-200 mb-8">
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`pb-4 px-2 font-bold text-sm transition-all relative ${activeTab === 'inventory' ? 'text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Inventory
                        {activeTab === 'inventory' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`pb-4 px-2 font-bold text-sm transition-all relative ${activeTab === 'orders' ? 'text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Orders {orders.filter(o => o.status === 'PENDING').length > 0 && (
                            <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] animate-pulse">
                                {orders.filter(o => o.status === 'PENDING').length}
                            </span>
                        )}
                        {activeTab === 'orders' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600" />}
                    </button>
                </div>

                {activeTab === 'inventory' ? (
                    <>
                        {/* Actions & Search */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search your inventory..."
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={openAddModal}
                                className="btn-primary flex items-center gap-2 px-6 py-3 shadow-lg shadow-amber-500/20"
                            >
                                <Plus size={20} /> Add New Book
                            </button>
                        </div>

                        <AnimatePresence>
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 border border-emerald-100 font-bold"
                                >
                                    <CheckCircle size={18} /> {message}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Books Grid */}
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {filteredBooks.map((b, i) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                                        key={b.id}
                                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group relative"
                                    >
                                        <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditModal(b)}
                                                className="p-2 bg-white/90 backdrop-blur rounded-lg text-gray-600 hover:text-amber-600 shadow-sm"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(b.id)}
                                                className="p-2 bg-white/90 backdrop-blur rounded-lg text-gray-600 hover:text-red-600 shadow-sm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="h-48 bg-gray-100 relative overflow-hidden">
                                            {b.image ? (
                                                <img
                                                    src={
                                                        !b.image || (!b.image.startsWith('http') && !b.image.startsWith('/'))
                                                            ? "https://placehold.co/300x450?text=No+Cover"
                                                            : b.image.startsWith('http')
                                                                ? b.image
                                                                : `${import.meta.env.VITE_API_BASE || "https://bookapp-production-3e11.up.railway.app"}${b.image}`
                                                    }
                                                    alt={b.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x450?text=No+Cover"; }}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400">
                                                    <ImageIcon size={32} />
                                                </div>
                                            )}
                                            <div className="absolute top-3 left-3">
                                                <span className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                                                    {b.category || "Uncategorized"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">{b.title}</h4>
                                            <p className="text-sm text-gray-500 mb-4">{b.author}</p>

                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                                <span className="font-bold text-lg text-gray-900">₹{b.price}</span>
                                                <div className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-lg ${b.stock < 5 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
                                                    <Package size={14} /> {b.stock} Left
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="space-y-4">
                        {orders.length === 0 ? (
                            <div className="bg-white rounded-2xl p-20 text-center border border-dashed border-gray-200">
                                <ShoppingBag className="mx-auto text-gray-300 mb-4" size={48} />
                                <h3 className="text-lg font-bold text-gray-900">No Orders Found</h3>
                                <p className="text-gray-500">When customers buy your books, they will appear here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {orders.map(o => (
                                    <div key={o.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-amber-200 transition-all">
                                        <div className="flex flex-col md:flex-row justify-between gap-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-bold text-gray-900">Order #{o.id}</span>
                                                    <span className="text-sm font-medium text-gray-400 flex items-center gap-1">
                                                        •  <Clock size={14} /> {getTimeAgo(o.createdAt || o.timestamp || (o.history && o.history[0]?.timestamp))}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${o.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                        o.status === 'READY_FOR_DELIVERY' ? 'bg-blue-100 text-blue-700' :
                                                            o.status === 'SHIPPED' ? 'bg-purple-100 text-purple-700' :
                                                                'bg-green-100 text-green-700'
                                                        }`}>
                                                        {o.status.replace(/_/g, " ")}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 font-medium">Customer: {o.address} • {o.phone}</p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {o.items.map((item, idx) => (
                                                        <span key={idx} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-100">
                                                            {item.book?.title} (x{item.quantity})
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex flex-col justify-center items-end gap-3">
                                                <p className="text-xl font-bold text-gray-900">₹{o.total}</p>

                                                {/* View Details Button */}
                                                <button
                                                    onClick={() => navigate(`/vendor/orders/${o.id}`)}
                                                    className="w-full md:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Eye size={16} /> View Details
                                                </button>

                                                {o.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleAcceptOrder(o.id)}
                                                        className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <CheckCircle size={16} /> Accept & Pack
                                                    </button>
                                                )}
                                                {o.status === 'READY_FOR_DELIVERY' && (
                                                    <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-xl text-sm font-bold border border-blue-100">
                                                        <RefreshCw size={16} className="animate-spin-slow" /> Awaiting Pickup
                                                    </div>
                                                )}
                                                {o.assignedAgent && (
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-gray-400 uppercase font-black">Delivery Hero</p>
                                                        <p className="text-sm font-bold text-gray-800">{o.assignedAgent.name}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Add/Edit Book Modal */}
                <AnimatePresence>
                    {showModal && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                                className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900">{isEditing ? "Edit Book" : "Add New Book"}</h3>
                                    <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
                                </div>

                                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2 md:col-span-1 space-y-4">
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 mb-1 block">Title</label>
                                            <input name="title" value={formData.title} className="input-field" onChange={handleInputChange} required placeholder="Book Title" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 mb-1 block">Author</label>
                                            <input name="author" value={formData.author} className="input-field" onChange={handleInputChange} required placeholder="Author Name" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 mb-1 block">Category</label>
                                            <select name="category" value={formData.category} className="input-field appearance-none" onChange={handleInputChange} required>
                                                <option value="">Select Category</option>
                                                <option value="Fiction">Fiction</option>
                                                <option value="Non-fiction">Non-fiction</option>
                                                <option value="Education">Education</option>
                                                <option value="Business">Business</option>
                                                <option value="Technology">Technology</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-span-2 md:col-span-1 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-bold text-gray-700 mb-1 block">Price (₹)</label>
                                                <input name="price" type="number" value={formData.price} className="input-field" onChange={handleInputChange} required placeholder="0.00" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-bold text-gray-700 mb-1 block">Stock</label>
                                                <input name="stock" type="number" value={formData.stock} className="input-field" onChange={handleInputChange} required placeholder="0" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 mb-1 block">Cover Image</label>
                                            <div className="group mt-1 border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-amber-500 hover:bg-amber-50/30 transition-all cursor-pointer relative bg-gray-50/50">
                                                <input type="file" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
                                                {formData.image ? (
                                                    <div className="relative h-40 w-28 mx-auto shadow-lg rotate-1 group-hover:rotate-0 transition-transform duration-300">
                                                        <img src={formData.image.startsWith("http") ? formData.image : `${import.meta.env.VITE_API_BASE || "https://bookapp-production-3e11.up.railway.app"}${formData.image}`} className="h-full w-full object-cover rounded-md" alt="Preview" />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                                            <p className="text-white text-xs font-bold">Change</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="py-6">
                                                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                                                            <ImageIcon size={24} />
                                                        </div>
                                                        <p className="text-sm text-gray-600 font-medium">Click to upload cover</p>
                                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="text-sm font-bold text-gray-700 mb-1 block">Description</label>
                                        <textarea name="description" value={formData.description} rows="3" className="input-field resize-none" onChange={handleInputChange} required placeholder="Brief summary of the book..." />
                                    </div>

                                    <div className="col-span-2 flex gap-3 pt-4 border-t border-gray-100">
                                        <button className="flex-1 btn-primary py-3">{isEditing ? "Update Book" : "Publish Book"}</button>
                                        <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl border border-gray-200 font-bold hover:bg-gray-50 transition-colors">Cancel</button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}



