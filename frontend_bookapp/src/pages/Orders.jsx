import React, { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import { Package, ChevronRight, Clock, Box } from "lucide-react";
import { motion } from "framer-motion";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const res = await api.get(`/orders/user/${user.id}`);
        if (Array.isArray(res.data)) {
          // Sort by newest first
          setOrders(res.data.sort((a, b) => b.id - a.id));
        } else {
          setOrders([]);
        }
      } catch (err) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function getStatusColor(status) {
    switch ((status || "").toUpperCase()) {
      case "DELIVERED": return "bg-green-100 text-green-700 border-green-200";
      case "CANCELLED": return "bg-red-50 text-red-600 border-red-100";
      case "SHIPPED": return "bg-purple-100 text-purple-700 border-purple-200";
      case "READY_FOR_DELIVERY": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-amber-50 text-amber-700 border-amber-100";
    }
  }

  if (!user) return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-bold mb-4">Please Log In</h2>
        <Link to="/login" className="btn-primary">Login</Link>
      </div>
    </Layout>
  );

  if (loading) return (
    <Layout>
      <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-600 border-t-transparent"></div></div>
    </Layout>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Package className="text-amber-600" /> My Orders
          </h1>

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                <Box size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No orders yet</h3>
              <p className="text-gray-500 mt-2 mb-8">Looks like you haven't placed any orders yet.</p>
              <Link to="/" className="btn-primary">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
                >
                  <div className="p-6">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-gray-900">Order #{order.id}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                            {order.status || "PENDING"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <Clock size={14} /> {new Date((order.createdAt || "").replace(" ", "T") || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">₹{order.total}</p>
                        <p className="text-xs text-gray-400">Total Amount</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {/* Ideally listing a few item names here would be nice if available in the summary list */}
                        View details to see items tracking information.
                      </div>
                      <Link
                        to={`/orders/${order.id}`}
                        className="inline-flex items-center gap-2 text-amber-700 font-bold hover:text-amber-800 transition-colors"
                      >
                        View Details <ChevronRight size={16} />
                      </Link>
                    </div>
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


