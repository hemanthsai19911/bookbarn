import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import { Search, Trash2, Check, ExternalLink, ChevronDown, Package, Truck, User, ShoppingBag, Filter } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    try {
      const res = await api.get("/orders");
      setOrders(res.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  async function updateStatus(id, newStatus) {
    if (!window.confirm(`Update order #${id} status to ${newStatus}?`)) return;
    try {
      if (newStatus === "CONFIRMED") {
        await api.post(`/orders/${id}/confirm`); // Updated Endpoint to POST /orders/...
      }
      loadOrders();
    } catch (e) { console.error(e); alert("Failed to update status"); }
  }

  async function deleteOrder(id) {
    if (!confirm("Delete order?")) return;
    try { await api.delete(`/orders/${id}`); loadOrders(); } catch (e) { alert("Delete failed"); }
  }

  const filtered = filter === "ALL" ? orders : orders.filter(o => o.status === filter);

  const STATUS_COLORS = {
    NEW: "bg-red-100 text-red-800 border-red-200 animate-pulse",
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CONFIRMED: "bg-indigo-100 text-indigo-800 border-indigo-200",
    READY_FOR_DELIVERY: "bg-blue-100 text-blue-800 border-blue-200",
    SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
    DELIVERED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#F8F9FA] pb-20 font-sans text-gray-900">

        {/* Dark Hero Header */}
        <div className="bg-gray-900 text-white pt-10 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800"></div>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl font-serif font-bold mb-2 flex items-center gap-3"
              >
                <ShoppingBag className="text-amber-500" /> Orders
              </motion.h1>
              <p className="text-gray-400 text-lg">Track, fulfill and manage customer orders efficiently.</p>
            </div>

            {/* Filter Pills in Header */}
            <div className="bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/10 flex overflow-x-auto max-w-full">
              {["ALL", "NEW", "PENDING", "CONFIRMED", "READY_FOR_DELIVERY", "SHIPPED", "DELIVERED"].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${filter === f ? "bg-amber-500 text-gray-900 shadow-lg" : "text-gray-300 hover:text-white hover:bg-white/5"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">

          {loading ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent mb-4"></div>
              <p className="text-gray-500 font-medium">Loading orders...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <Package size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">There are no orders matching your current filter.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((order, i) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={order.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col md:flex-row gap-6 items-center group"
                >
                  {/* Icon Box */}
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 flex-shrink-0 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                    <Package size={28} />
                  </div>

                  {/* Details */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Order ID</p>
                      <p className="font-bold text-gray-900 text-lg">#{order.id}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Customer</p>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                          <User size={12} />
                        </div>
                        <span className="font-semibold text-gray-700">{order.userName || order.userId}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 pl-8">{new Date((order.createdAt || "").replace(" ", "T") || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Amount</p>
                      <p className="font-bold text-gray-900 text-lg">₹{order.total}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${STATUS_COLORS[order.status] || "bg-gray-100"}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {order.status?.replaceAll("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Delivery Agent Info - Desktop */}
                  {order.assignedAgent && (
                    <div className="hidden lg:flex flex-col items-center bg-amber-50 rounded-xl p-3 border border-amber-100 min-w-[150px]">
                      <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider mb-2">Delivery Agent</p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-700">
                          <Truck size={14} />
                        </div>
                        <p className="text-xs font-bold text-gray-800">{order.assignedAgent.name}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 justify-end">
                    {order.status === 'NEW' && (
                      <button
                        onClick={() => updateStatus(order.id, 'CONFIRMED')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-500/30"
                      >
                        <Check size={16} /> Confirm Order
                      </button>
                    )}
                    <Link
                      to={`/orders/${order.id}`}
                      className="p-2.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <ExternalLink size={20} />
                    </Link>
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Order"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
