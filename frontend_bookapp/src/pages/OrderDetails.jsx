// src/pages/OrderDetails.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { ArrowLeft, Download, Printer, MapPin, Phone, User, Package, Clock, CheckCircle, Truck } from "lucide-react";

// --------------------------------------
// UTILS
// --------------------------------------
function statusColor(status) {
  switch ((status || "").toUpperCase()) {
    case "DELIVERED": return "bg-green-100 text-green-700 border-green-200";
    case "SHIPPED": return "bg-purple-100 text-purple-700 border-purple-200";
    case "OUT_FOR_DELIVERY": return "bg-orange-100 text-orange-700 border-orange-200";
    case "READY_FOR_DELIVERY": return "bg-blue-100 text-blue-700 border-blue-200";
    case "CONFIRMED": return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "CANCELLED": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

function statusIcon(status) {
  switch ((status || "").toUpperCase()) {
    case "DELIVERED": return CheckCircle;
    case "SHIPPED": return Truck;
    case "OUT_FOR_DELIVERY": return Truck;
    default: return Clock;
  }
}

function statusProgressValue(status) {
  switch ((status || "").toUpperCase()) {
    case "PENDING": return 10;
    case "CONFIRMED": return 30;
    case "READY_FOR_DELIVERY": return 50;
    case "SHIPPED": return 75;
    case "OUT_FOR_DELIVERY": return 90;
    case "DELIVERED": return 100;
    case "CANCELLED": return 100;
    default: return 5;
  }
}

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const invoiceRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/orders/${orderId}`)
      .then((res) => {
        const data = res.data || {};
        data.items = Array.isArray(data.items) ? data.items : [];
        data.history = Array.isArray(data.history) ? data.history : [];
        setOrder(data);
      })
      .catch((err) => {
        console.error("Failed", err);
        setOrder({ items: [], history: [] }); // Fallback
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  function buildTimeline(ord) {
    if (!ord || !Array.isArray(ord.history) || ord.history.length === 0) return [];
    return ord.history.sort((a, b) => {
      const ta = new Date((a.timestamp || "").replace(" ", "T")).getTime();
      const tb = new Date((b.timestamp || "").replace(" ", "T")).getTime();
      return ta - tb;
    });
  }

  async function downloadInvoicePDF() {
    if (!order) return;
    setDownloading(true);
    try {
      const el = invoiceRef.current;
      if (!el) throw new Error("Invoice area not found");

      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth - 40;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
      pdf.save(`invoice-order-${order.id}.pdf`);
    } catch (err) {
      alert("Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  }

  if (loading) return <Layout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-600 border-t-transparent"></div></div></Layout>;
  if (!order) return <Layout><div className="text-center py-20">Order not found</div></Layout>;

  const timeline = buildTimeline(order);
  const currentStatus = (order.status || "PENDING").toUpperCase();
  const progress = statusProgressValue(currentStatus);
  const StatusIcon = statusIcon(currentStatus);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          <Link to="/orders" className="inline-flex items-center gap-2 text-gray-500 hover:text-amber-700 font-medium mb-6 transition-colors">
            <ArrowLeft size={18} /> Back to Orders
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-3 gap-8"
          >
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">

              {/* Header Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-3xl font-bold font-serif text-gray-900">Order #{order.id}</h1>
                    <div className="flex items-center gap-2 text-gray-500 mt-2 text-sm">
                      <Clock size={14} /> Placed on {order.createdAt ? new Date(String(order.createdAt).replace(' ', 'T')).toLocaleString() : new Date().toLocaleString()}
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full font-bold text-sm border flex items-center gap-2 ${statusColor(currentStatus)}`}>
                    <StatusIcon size={16} />
                    {currentStatus.replaceAll("_", " ")}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative pt-4 pb-2">
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${currentStatus === 'CANCELLED' ? 'bg-red-500' : 'bg-amber-600'}`}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <span>Ordered</span>
                    <span>Shipped</span>
                    <span>Delivered</span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Items Ordered</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {order.items.map(item => (
                    <div key={item.id} className="p-6 flex gap-6 hover:bg-gray-50 transition-colors">
                      <div className="w-20 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          referrerPolicy="no-referrer"
                          src={item.book?.image?.startsWith('http') ? item.book.image : `${import.meta.env.VITE_API_BASE || "https://bookapp-production-3e11.up.railway.app"}${item.book.image}`}
                          className="w-full h-full object-cover"
                          alt=""
                          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/150x200?text=No+Preview"; }}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-1">{item.book?.title}</h4>
                        <p className="text-sm text-gray-500 mb-2">{item.book?.author}</p>
                        {item.book?.vendor && (
                          <p className="text-xs font-bold text-amber-600 bg-amber-50 inline-block px-2 py-0.5 rounded border border-amber-100 mb-4">
                            Sold by {item.book.vendor.name}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                            Qty: {item.quantity}
                          </div>
                          <div className="text-lg font-bold text-amber-700">
                            ₹{(item.book?.price || 0) * item.quantity}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="bg-gray-50 px-8 py-6 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{order.total}</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between text-xl font-bold text-gray-900">
                    <span>Order Total</span>
                    <span>₹{order.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">

              {/* Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
                <button onClick={downloadInvoicePDF} disabled={downloading} className="w-full btn-secondary flex items-center justify-center gap-2">
                  <Download size={18} /> {downloading ? 'Downloading...' : 'Download Invoice'}
                </button>
                <button onClick={() => window.print()} className="w-full btn-ghost border border-gray-200 flex items-center justify-center gap-2">
                  <Printer size={18} /> Print Order
                </button>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-gray-400" /> Delivery Address
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {order.address}
                </p>
                <div className="flex items-center gap-3 text-sm text-gray-500 border-t pt-4">
                  <Phone size={16} /> {order.phone}
                </div>
              </div>

              {/* Delivery Agent info */}
              {order.assignedAgent && (
                <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 relative z-10">
                    <Truck size={20} className="text-amber-600" /> Delivery Hero
                  </h3>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-700">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{order.assignedAgent.name}</p>
                      <p className="text-sm text-gray-500">Your delivery partner</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center relative z-10 text-sm">
                    <span className="text-gray-500">Contact Number</span>
                    <a href={`tel:${order.assignedAgent.phone}`} className="font-bold text-amber-700 hover:underline">
                      {order.assignedAgent.phone || "Not provided"}
                    </a>
                  </div>
                </div>
              )}

              {/* Timeline Feed */}
              {timeline.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-6">Tracking History</h3>
                  <ol className="relative border-l border-gray-200 ml-3">
                    {timeline.map((step, idx) => (
                      <li key={idx} className="mb-8 ml-6">
                        <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-4 ring-white ${idx === timeline.length - 1 ? 'bg-amber-600' : 'bg-gray-200'}`}>
                          <div className={`w-2 h-2 rounded-full ${idx === timeline.length - 1 ? 'bg-white' : 'bg-gray-400'}`}></div>
                        </span>
                        <h4 className="flex items-center mb-0.5 text-sm font-semibold text-gray-900">
                          {step.status}
                        </h4>
                        <time className="block mb-2 text-xs font-normal leading-none text-gray-400">
                          {step.timestamp ? new Date(String(step.timestamp).replace(' ', 'T')).toLocaleString() : ''}
                        </time>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Hidden Invoice Container for PDF Generation */}
      <div ref={invoiceRef} className="absolute top-[-10000px] left-[-10000px] w-[800px] p-10 bg-white border">
        <h1 className="text-4xl font-bold mb-6 text-amber-700">BookBarn Invoice</h1>
        <div className="mb-8 border-b pb-4">
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
          <p><strong>Customer:</strong> {order.userName}</p>
        </div>

        <table className="w-full mb-8 text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Item</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Price</th>
              <th className="p-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map(i => (
              <tr key={i.id} className="border-b">
                <td className="p-3">{i.book?.title}</td>
                <td className="p-3">{i.quantity}</td>
                <td className="p-3">₹{i.book?.price}</td>
                <td className="p-3">₹{(i.book?.price || 0) * i.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-right text-2xl font-bold">
          Total: ₹{order.total}
        </div>
      </div>
    </Layout>
  );
}



