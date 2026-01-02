import React, { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import { Users, BookOpen, ShoppingBag, IndianRupee, Truck, TrendingUp, Activity, ArrowRight, Zap, Target } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, agents: 0, books: 0, orders: 0, revenue: 0 });
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [usersRes, booksRes, ordersRes, analyticsRes] = await Promise.all([
          api.get("/admin/users"),
          api.get("/books"),
          api.get("/orders"),
          api.get("/admin/analytics")
        ]);

        const orders = ordersRes.data || [];
        const analytics = analyticsRes.data || {};

        // Stats - Use backend analytics for revenue and order count
        setStats({
          users: usersRes.data.users.length,
          agents: usersRes.data.agents.length,
          vendors: usersRes.data.vendors ? usersRes.data.vendors.length : 0,
          books: booksRes.data.length,
          orders: analytics.totalOrders || 0,
          revenue: analytics.totalRevenue || 0
        });

        // Status Distribution - Use backend analytics
        const breakdown = analytics.statusBreakdown || [];
        setOrderStatusData(breakdown.map(item => ({
          name: item.status,
          value: item.count
        })));

        // 7-day sales (Still calculated from orders list as backend doesn't provide time-series yet)
        const last7 = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const dateStr = d.toISOString().slice(0, 10);

          const dayTotal = orders
            .filter((o) => (o.createdAt || "").startsWith(dateStr))
            .reduce((s, x) => s + (x.total || 0), 0);

          last7.push({ date: dateStr.slice(5), total: dayTotal });
        }
        setSalesData(last7);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const KPIs = [
    { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: IndianRupee, color: "from-amber-400 to-orange-500", lightColor: "bg-amber-100 text-amber-600" },
    { label: "Active Orders", value: stats.orders, icon: ShoppingBag, color: "from-blue-400 to-indigo-500", lightColor: "bg-blue-100 text-blue-600" },
    { label: "Books in Stock", value: stats.books, icon: BookOpen, color: "from-emerald-400 to-teal-500", lightColor: "bg-emerald-100 text-emerald-600" },
    { label: "Vendors / Users", value: `${stats.vendors || 0} / ${stats.users}`, icon: Users, color: "from-violet-400 to-purple-500", lightColor: "bg-violet-100 text-violet-600" },
  ];

  const pieColors = ["#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EF4444"];

  if (loading) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
          <p className="text-gray-500 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-[#F8F9FA] pb-12 font-sans text-gray-900">

        {/* Welcome Header with Gradient */}
        <div className="bg-gray-900 text-white pt-10 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800"></div>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl font-serif font-bold mb-2"
              >
                Admin Dashboard
              </motion.h1>
              <p className="text-gray-400 text-lg">Detailed overview of your bookstore performance.</p>
            </div>
            <Link to="/books" className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-white/20 transition-all flex items-center gap-2">
              <Zap size={18} className="text-amber-500" /> Quick Actions
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">

          {/* KPI Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {KPIs.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 hover:-translate-y-1 transition-transform"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${kpi.lightColor}`}>
                      <Icon size={24} />
                    </div>
                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full uppercase tracking-wider">Today</span>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium">{kpi.label}</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">{kpi.value}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-10">

            {/* Revenue Chart - Wide */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Revenue Analytics</h3>
                  <p className="text-sm text-gray-500">Income over the last 7 days</p>
                </div>
                <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <TrendingUp size={14} /> +12.5%
                </div>
              </div>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      prefix="₹"
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15)' }}
                      cursor={{ stroke: '#F59E0B', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area type="monotone" dataKey="total" stroke="#F59E0B" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Status Column */}
            <div className="space-y-8">

              {/* Pie Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Status</h3>
                <div className="h-[220px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-3xl font-bold text-gray-900">{stats.orders}</span>
                    <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Total</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-6">
                  {orderStatusData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }}></span>
                      {entry.name}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Access */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white relative overflow-hidden"
              >
                <div className="relative z-10">
                  <Target size={32} className="mb-4 text-white/80" />
                  <h3 className="text-xl font-bold mb-2">Management Center</h3>
                  <p className="text-indigo-100 text-sm mb-6">Control users, inventory and orders from one place.</p>

                  <div className="space-y-3">
                    <Link to="/admin/users" className="block w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold backdrop-blur-sm transition-colors flex items-center justify-between">
                      Manage Users <ArrowRight size={14} />
                    </Link>
                    <Link to="/admin/orders" className="block w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold backdrop-blur-sm transition-colors flex items-center justify-between">
                      View Orders <ArrowRight size={14} />
                    </Link>
                    <Link to="/admin/vendors" className="block w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold backdrop-blur-sm transition-colors flex items-center justify-between">
                      Manage Vendors <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}


