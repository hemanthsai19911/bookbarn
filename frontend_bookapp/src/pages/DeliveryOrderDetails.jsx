// src/pages/DeliveryOrderDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

function friendlyDate(ts) {
  if (!ts) return "";
  try {
    return new Date(String(ts).replace(" ", "T")).toLocaleString();
  } catch {
    return ts || "";
  }
}

export default function DeliveryOrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function loadOrder() {
    setLoading(true);
    try {
      const res = await api.get(`/delivery/orders/${orderId}`);
      const ord = res.data;
      // sort history ascending by time
      if (Array.isArray(ord.history)) {
        ord.history = ord.history.slice().sort((a, b) => {
          const ta = new Date((a.timestamp || "").replace(" ", "T")).getTime();
          const tb = new Date((b.timestamp || "").replace(" ", "T")).getTime();
          return ta - tb;
        });
      }
      setOrder(ord);
    } catch (err) {
      console.error("Failed to load order:", err);
      alert("Failed to load order");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }

  // valid statuses agent can set
  const AGENT_STATUSES = ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];

  // decide which buttons to show based on current order.status
  function canMarkShipped() {
    const s = (order?.status || "").toUpperCase();
    return s === "ASSIGNED" || s === "CONFIRMED";
  }
  function canMarkOutForDelivery() {
    const s = (order?.status || "").toUpperCase();
    return s === "SHIPPED";
  }
  function canMarkDelivered() {
    const s = (order?.status || "").toUpperCase();
    return s === "OUT_FOR_DELIVERY";
  }

  async function updateStatus(newStatus) {
    if (!order) return;
    if (!AGENT_STATUSES.includes(newStatus)) {
      return alert("Not allowed status");
    }

    if (!confirm(`Mark order #${order.id} as ${newStatus.replaceAll("_", " ")}?`)) return;

    setUpdating(true);
    try {
      const res = await api.post(`/delivery/status/${order.id}/${newStatus}`);
      await loadOrder();
      alert("Status updated");
    } catch (err) {
      console.error("Status update failed:", err);
      alert(err?.response?.data?.error || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-amber-50/30 to-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Loading order details...</p>
        </motion.div>
      </div>
    );
  }

  if (!order) return null;

  const currentStatus = (order.status || "PENDING").toUpperCase();
  const timeline = Array.isArray(order.history) && order.history.length ? order.history : [
    { status: currentStatus, timestamp: new Date().toISOString() }
  ];

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 via-amber-50/20 to-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/60 hover:shadow-xl transition-shadow duration-300"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">Order #{order.id}</h2>
              <div className="text-sm text-gray-500 mt-1">Placed by <span className="font-semibold">{order.userName || order.userId}</span></div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-2xl font-bold text-green-700">₹ {order.total}</div>
              <div className="text-sm font-medium mt-1 text-gray-600">
                {order.paymentMethod === 'COD' ? (
                  <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">Collect Cash</span>
                ) : (
                  <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Prepaid</span>
                )}
              </div>
              <div className="mt-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${currentStatus === 'DELIVERED' ? 'bg-green-100 text-green-700' : currentStatus === 'SHIPPED' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {currentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Pickup & Delivery Addresses */}
          <div className="grid md:grid-cols-2 gap-4 mb-6 pb-6 border-b">
            {/* Pickup Address (Vendor Store) */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-blue-900 uppercase tracking-wide mb-1">📦 Pickup From</h3>
                  {order.items && order.items.length > 0 && order.items[0].book?.vendor ? (
                    <>
                      <p className="font-bold text-gray-900 mb-1">{order.items[0].book.vendor.name}</p>
                      <p className="text-sm text-gray-700 mb-2 leading-relaxed">{order.items[0].book.vendor.address || 'Address not available'}</p>
                      {order.items[0].book.vendor.phone && (
                        <a href={`tel:${order.items[0].book.vendor.phone}`} className="text-xs text-blue-700 hover:text-blue-900 font-semibold block mb-2">
                          📞 {order.items[0].book.vendor.phone}
                        </a>
                      )}
                      {order.items[0].book.vendor.address && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.items[0].book.vendor.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                          </svg>
                          Navigate
                        </a>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Vendor information not available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Address (Customer) */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 rounded-xl border border-emerald-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
                    <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"></path>
                    <path d="M12 3v6"></path>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-emerald-900 uppercase tracking-wide mb-1">🏠 Deliver To</h3>
                  <p className="font-bold text-gray-900 mb-1">{order.userName || 'Customer'}</p>
                  <p className="text-sm text-gray-700 mb-2 leading-relaxed">{order.address}</p>
                  <a href={`tel:${order.phone}`} className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold block mb-2">
                    📞 {order.phone}
                  </a>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                    </svg>
                    Navigate
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold">Items</h3>
            <div className="mt-3 space-y-3">
              {order.items?.map(it => (
                <div key={it.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <div>
                    <div className="font-medium">{it.book?.title || `Book #${it.bookId}`}</div>
                    <div className="text-sm text-gray-500">{it.book?.author || ""}</div>
                  </div>
                  <div className="text-sm text-gray-700">
                    {it.quantity} × ₹ {it.book?.price || 0}
                    <div className="text-xs text-gray-400">Subtotal ₹ {(it.book?.price || 0) * it.quantity}</div>
                  </div>
                </div>
              ))}

              {(!order.items || order.items.length === 0) && (
                <div className="text-sm text-gray-500">No items recorded.</div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: canMarkShipped() ? 1.05 : 1 }}
              whileTap={{ scale: canMarkShipped() ? 0.95 : 1 }}
              disabled={!canMarkShipped() || updating}
              onClick={() => updateStatus("SHIPPED")}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${canMarkShipped()
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/50"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
            >
              📦 Mark Shipped
            </motion.button>

            <motion.button
              whileHover={{ scale: canMarkOutForDelivery() ? 1.05 : 1 }}
              whileTap={{ scale: canMarkOutForDelivery() ? 0.95 : 1 }}
              disabled={!canMarkOutForDelivery() || updating}
              onClick={() => updateStatus("OUT_FOR_DELIVERY")}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${canMarkOutForDelivery()
                ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:shadow-lg hover:shadow-amber-500/50"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
            >
              🚚 Mark Out for Delivery
            </motion.button>

            <motion.button
              whileHover={{ scale: canMarkDelivered() ? 1.05 : 1 }}
              whileTap={{ scale: canMarkDelivered() ? 0.95 : 1 }}
              disabled={!canMarkDelivered() || updating}
              onClick={() => updateStatus("DELIVERED")}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${canMarkDelivered()
                ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-lg hover:shadow-green-500/50"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
            >
              ✅ Mark Delivered
            </motion.button>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/60"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white">📋</span>
            Order Timeline
          </h3>
          <ol className="relative border-l-2 border-gradient-to-b from-indigo-200 to-purple-200 ml-4">
            {timeline.map((t, idx) => {
              const isLast = idx === timeline.length - 1;
              return (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="mb-8 ml-6 last:mb-0"
                >
                  <span className="absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 ring-4 ring-white" />
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
                    <div className="font-bold text-gray-900 mb-1">{t.status}</div>
                    <div className="text-sm text-gray-600">{friendlyDate(t.timestamp)}</div>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </motion.div>
      </div>
    </div>
  );
}


