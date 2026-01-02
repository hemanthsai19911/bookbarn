import React, { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import { Search, User, Trash2, Mail, Phone, Shield, Truck, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users || []);
      setAgents(res.data.agents || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function deleteUser(id) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    await api.delete(`/user/${id}`);
    load();
  }

  async function deleteAgent(id) {
    if (!confirm("Delete Agent?")) return;
    await api.delete(`/delivery/${id}`);
    load();
  }

  const filteredUsers = users.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()) || u.role.toLowerCase().includes(search.toLowerCase()));
  const filteredAgents = agents.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));

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
                <Users className="text-amber-500" /> Users & Agents
              </motion.h1>
              <p className="text-gray-400 text-lg">Manage customer accounts and delivery personnel.</p>
            </div>

            {/* Tab Switcher in Header */}
            <div className="bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/10 flex">
              <button
                onClick={() => setActiveTab("users")}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-amber-500 text-gray-900 shadow-lg' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
              >
                <User size={18} /> Customers <span className="opacity-60 text-xs py-0.5 px-1.5 bg-black/10 rounded-md ml-1">{users.length}</span>
              </button>
              <button
                onClick={() => setActiveTab("agents")}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'agents' ? 'bg-amber-500 text-gray-900 shadow-lg' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
              >
                <Truck size={18} /> Delivery <span className="opacity-60 text-xs py-0.5 px-1.5 bg-black/10 rounded-md ml-1">{agents.length}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">

          {/* Search Bar */}
          <div className="relative mb-8 max-w-lg">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg"></div>
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-gray-400" size={20} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={activeTab === 'users' ? "Search customers by name, role..." : "Search agents by name..."}
                className="w-full pl-12 pr-4 py-4 bg-transparent rounded-2xl border-none focus:ring-2 focus:ring-amber-500/50 outline-none text-gray-800 placeholder-gray-500 font-medium"
              />
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'users' ? (
              filteredUsers.map((u, i) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  key={u.id}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${u.role === 'ADMIN' ? 'bg-gradient-to-br from-purple-600 to-indigo-600' : 'bg-gradient-to-br from-gray-800 to-gray-700'}`}>
                      {u.role === 'ADMIN' ? <Shield size={24} /> : <User size={24} />}
                    </div>
                    {u.role !== 'ADMIN' && (
                      <button onClick={() => deleteUser(u.id)} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 mb-1">{u.username}</h3>
                  <div className="flex items-center gap-2 mb-6">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                      {u.role}
                    </span>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-3 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                      <Mail size={16} className="text-gray-400" /> {u.email}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                      <Phone size={16} className="text-gray-400" /> {u.phone || "No phone"}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : activeTab === 'agents' ? (
              filteredAgents.map((a, i) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  key={a.id}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity opacity-50 group-hover:opacity-100"></div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <Truck size={24} />
                      </div>
                      <button onClick={() => deleteAgent(a.id)} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <h3 className="font-bold text-lg text-gray-900 mb-1">{a.name}</h3>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold uppercase tracking-wide">
                        {a.status}
                      </span>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Mail size={16} className="text-emerald-500/70" /> {a.email}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Phone size={16} className="text-emerald-500/70" /> {a.phone}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-700 font-bold bg-emerald-50/50 p-2.5 rounded-lg mt-2 border border-emerald-100/50">
                        <span className="text-xs uppercase text-emerald-600/70 font-bold">Area:</span> {a.area}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : null}
          </div>
        </div>
      </div>
    </Layout>
  );
}

