import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import { CheckCircle, Package, ArrowRight, Printer } from "lucide-react";
import { motion } from "framer-motion";
import canvasConfetti from 'https://cdn.skypack.dev/canvas-confetti';

export default function PaymentSuccess() {
  const order = JSON.parse(localStorage.getItem("order_final"));

  useEffect(() => {
    if (order) {
      canvasConfetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6']
      });
    }
  }, []);

  if (!order) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="bg-gray-100 p-6 rounded-full mb-6">
            <Package size={48} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">No recent order found</h2>
          <p className="text-gray-500 mt-2">Please go back and complete your purchase.</p>
          <Link to="/" className="mt-8 btn-secondary">Go Home</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex justify-center items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative"
        >
          <div className="bg-green-600 p-10 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-green-500 to-green-700"></div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="relative z-10 w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <CheckCircle size={48} className="text-green-600" />
            </motion.div>
            <div className="relative z-10">
              <h1 className="text-3xl font-serif font-bold">Thank You!</h1>
              <p className="text-green-100 mt-2 text-lg">Your order has been confirmed.</p>
            </div>
          </div>

          <div className="p-8">

            <div className="space-y-4 mb-8">
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500">Amount Paid</span>
                <span className="font-bold text-xl text-gray-900">₹{order.total}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Transaction ID</span>
                <span className="font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">{order.payment?.paymentId}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Order ID</span>
                <span className="font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">{order.payment?.orderId}</span>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mb-8">
              <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <Package size={18} /> Delivery Details
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {order.address}<br />
                <span className="text-gray-500 mt-1 inline-block">Phone: {order.phone}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Link to="/orders" className="btn-secondary flex items-center justify-center gap-2 py-3 text-sm">
                View Orders
              </Link>
              <Link to="/" className="btn-primary flex items-center justify-center gap-2 py-3 text-sm">
                Continue Shopping <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}


