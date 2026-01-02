// src/pages/DeliveryDashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function DeliveryDashboard() {
  const [assigned, setAssigned] = useState([]);
  const [available, setAvailable] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const agent = JSON.parse(localStorage.getItem("deliveryAgent"));
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000); // Poll for new orders
    return () => clearInterval(interval);
  }, []);

  async function loadOrders() {
    if (!agent?.id) {
      setLoading(false);
      return;
    }

    try {
      const [aRes, avRes] = await Promise.all([
        api.get(`/orders/delivery/agent/${agent.id}`),
        api.get("/orders/delivery/available")
      ]);

      setAssigned(aRes.data || []);
      setAvailable(avRes.data || []);
    } catch (err) {
      console.error("Load orders failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function takeOrder(orderId) {
    if (!agent?.id) return alert("Agent info missing");
    try {
      await api.post(`/orders/assign-agent?orderId=${orderId}&agentId=${agent.id}`);
      await loadOrders();
    } catch (err) {
      console.error("Failed to take order:", err);
      alert(err?.response?.data || "Could not accept order");
    }
  }

  function openDetails(id) {
    navigate(`/delivery/order/${id}`);
  }

  if (loading && assigned.length === 0 && available.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Delivery Hub</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Welcome, <span className="text-gray-900">{agent?.name || "Agent"}</span>
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/delivery/history")}
              className="px-6 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-sm active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              History
            </button>
            <div className="px-6 py-3 bg-amber-50 text-amber-700 rounded-2xl flex items-center gap-2 font-bold border border-amber-100">
              {assigned.length} Active Tasks
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Deliveries Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 px-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
              My Active Deliveries
            </h2>

            {assigned.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 font-medium italic">No active deliveries assigned.</p>
                <p className="text-sm text-gray-400 mt-1">Pick an order from the available list!</p>
              </div>
            ) : assigned.map(o => (
              <div
                key={o.id}
                onClick={() => openDetails(o.id)}
                className="group bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-amber-300 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden active:scale-[0.98]"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 rounded-full -mr-16 -mt-16 group-hover:bg-amber-100 transition-colors" />
                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Order #{o.id}</span>
                    <h4 className="text-lg font-bold text-gray-900">{o.address}</h4>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${o.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
                    o.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                    {o.status}
                  </span>
                </div>

                <div className="mt-6 flex items-center justify-between text-sm relative z-10">
                  <div className="text-gray-500 font-medium">₹ {o.total} • <span className="text-gray-400 font-normal">{o.items?.length || 0} items</span></div>
                  <div className="text-amber-600 font-bold flex items-center gap-1">
                    Manage <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* New Opportunities Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 px-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              Available for Pickup
            </h2>

            {/* Filter Input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Filter by location (e.g., Downtown, 5th Ave)"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-sm"
              />
            </div>

            {available.filter(o => !filter || o.address.toLowerCase().includes(filter.toLowerCase())).length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 font-medium italic">Scanning for new orders...</p>
              </div>
            ) : available
              .filter(o => !filter || o.address.toLowerCase().includes(filter.toLowerCase()))
              .map(o => (
                <div key={o.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-emerald-300 transition-all flex justify-between items-center group shadow-sm hover:shadow-lg">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Payout: ₹{Math.floor(o.total * 0.05 + 50)}</span>
                    <h4 className="text-lg font-bold text-gray-900">Order #{o.id}</h4>
                    <p className="text-sm text-gray-500 font-medium">{o.address.split(',')[0]}...</p>
                  </div>
                  <button
                    onClick={() => takeOrder(o.id)}
                    className="px-6 py-3 bg-gray-900 hover:bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                  >
                    Accept Delivery
                  </button>
                </div>
              ))}
          </section>
        </div>
      </div>
    </div>
  );
}


