import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { CreditCard, Lock, ShieldCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Payment() {
  const navigate = useNavigate();
  const { state } = useLocation(); // { items, total } passed from summary/checkout
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);

  // Read temp order
  useEffect(() => {
    const temp = JSON.parse(localStorage.getItem("order_temp"));
    setOrderData(temp);

    // If missing, go back
    if (!temp) navigate("/order-summary");
  }, []);

  // Helpers for realtime formatting
  const formatCardNumber = (value) => {
    const v = value.replace(/[^0-9]/g, "").slice(0, 16);
    const parts = [];
    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.slice(i, i + 4));
    }
    return parts.join(" ");
  };

  const formatExpiry = (value) => {
    const v = value.replace(/[^0-9]/g, "").slice(0, 4);
    if (v.length >= 2) {
      return `${v.slice(0, 2)} / ${v.slice(2)}`;
    }
    return v;
  };

  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });

  async function completePayment() {
    if (!orderData) return;

    // VALIDATION
    if (paymentMethod === "CARD") {
      const cleanNumber = card.number.replace(/\s/g, "");
      if (!cleanNumber || cleanNumber.length < 13) return alert("Please enter a valid card number");
      if (!card.expiry || card.expiry.length < 5) return alert("Expiry date required (MM / YY)");
      if (!card.cvv || card.cvv.length < 3) return alert("Invalid CVV");
      if (!card.name) return alert("Cardholder name required");
    }

    setLoading(true);

    try {
      // 1. PROCESS PAYMENT (Only if CARD)
      if (paymentMethod === "CARD") {
        await api.post("/payment/process", {
          cardNumber: card.number.replace(/\s/g, ""),
          amount: state?.total || orderData?.total || 0
        });
      }

      // 2. Get Summary Items
      const cartRes = await api.get(`/cart/${orderData.userId}`);
      let items = cartRes.data || [];

      // Fetch books for price calc
      const booksRes = await api.get("/books");
      const books = booksRes.data || [];

      const total = items.reduce((sum, item) => {
        const book = books.find(b => b.id === item.bookId);
        return sum + (book?.price || 0) * item.quantity;
      }, 0);

      // 3. CREATE ORDER
      const orderRes = await api.post("/orders/place", {
        userId: orderData.userId,
        address: orderData.address,
        phone: orderData.phone,
        paymentMethod: paymentMethod // Send selected method
      });

      // Handle split orders (Array) or single order (Object)
      const orders = Array.isArray(orderRes.data) ? orderRes.data : [orderRes.data];
      const orderIdStr = orders.map(o => o.id).join(", ");

      // FAKE PAYMENT RECORD
      const paymentData = {
        paymentId: paymentMethod === 'COD' ? 'COD' : "TXN-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        orderId: `ORD-${orderIdStr}`,
        status: "success",
        method: paymentMethod
      };

      // Save summary for success page
      localStorage.setItem("order_final", JSON.stringify({
        ...orderData,
        payment: paymentData,
        total: state?.total || orderData?.total || total, // prefer passed total which has shipping etc
        items: state?.items || items
      }));

      // MANUAL CLEAR CART (if needed by backend logic)
      if (!(state?.buyNow || orderData?.buyNow)) {
        for (const item of items) {
          await api.delete(`/cart/${item.id}`).catch(e => console.warn(e));
        }
      }

      localStorage.removeItem("order_temp");
      navigate("/payment-success");

    } catch (err) {
      console.error("Payment Error", err);
      // Backend might return validation error
      alert(err?.response?.data || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="bg-gray-900 p-6 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 z-0"></div>
            <div className="relative z-10">
              <ShieldCheck size={48} className="mx-auto mb-3 text-green-400" />
              <h2 className="text-xl font-bold font-serif">Secure Payment</h2>
              <p className="text-gray-400 text-sm">Encrypted 256-bit SSL connection</p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-gray-600 font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-gray-900">₹{state?.total || orderData?.total}</span>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CARD"
                  checked={paymentMethod === "CARD"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 text-amber-600 focus:ring-amber-500"
                />
                <div className="flex items-center gap-2">
                  <CreditCard className="text-amber-600" size={20} />
                  <span className="font-semibold text-gray-700">Credit / Debit Card</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 text-green-600 focus:ring-green-500"
                />
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-bold text-lg">₹</span>
                  <span className="font-semibold text-gray-700">Cash on Delivery</span>
                </div>
              </label>
            </div>

            {/* Card Form - Only show if CARD selected */}
            {paymentMethod === "CARD" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3 overflow-hidden"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Card Number"
                    value={card.number}
                    onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                    className="w-full pl-4 pr-4 py-3 rounded-lg border bg-gray-50 focus:bg-white focus:border-amber-500 outline-none transition-all placeholder:text-gray-400 font-mono"
                  />
                  <Lock size={16} className="absolute right-4 top-4 text-gray-400" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="MM / YY"
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg border bg-gray-50 focus:bg-white outline-none text-center"
                  />
                  <input
                    type="password"
                    placeholder="CVV"
                    maxLength={4}
                    value={card.cvv}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
                      setCard({ ...card, cvv: val });
                    }}
                    className="w-full px-4 py-3 rounded-lg border bg-gray-50 focus:bg-white outline-none text-center"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Cardholder Name"
                  value={card.name}
                  onChange={(e) => setCard({ ...card, name: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 rounded-lg border bg-gray-50 focus:bg-white outline-none uppercase"
                />
              </motion.div>
            )}

            {paymentMethod === "COD" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-green-50 text-green-700 p-4 rounded-xl text-center text-sm font-medium border border-green-100"
              >
                Pay cash upon delivery. Ensure you have the exact amount ready.
              </motion.div>
            )}

            <button
              onClick={completePayment}
              disabled={loading}
              className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transform transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${paymentMethod === 'COD' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'
                }`}
            >
              {loading ? <Loader2 className="animate-spin" /> : (paymentMethod === 'COD' ? "Place Order" : "Pay Now")}
            </button>


            <p className="text-center text-xs text-gray-400">
              To simulate a successful payment, simply click "Pay Now".
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}


