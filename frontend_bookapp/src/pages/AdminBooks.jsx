import React, { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import {
  Search, Plus, Edit2, Trash2, X, Image as ImageIcon,
  Check, ChevronDown, Package, AlertCircle, BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UpdateStockModal from "../components/UpdateStockModal";

const CATEGORIES = [
  "Fiction", "Non-fiction", "Business",
  "Self Help", "Kids", "Education", "Comics"
];

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [stockEditing, setStockEditing] = useState(null);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", author: "", price: "", description: "",
    image: "", category: "", stock: 0
  });
  const [errors, setErrors] = useState({});

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await api.get("/books");
      setBooks(res.data || []);
    } catch (e) { console.error(e); }
  }

  function handleEdit(b) {
    setEditing(b.id);
    setForm({
      title: b.title, author: b.author, price: b.price,
      description: b.description, image: b.image,
      category: b.category, stock: b.stock
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setForm({ title: "", author: "", price: "", description: "", image: "", category: "", stock: 0 });
    setEditing(null);
    setErrors({});
    setShowForm(false);
  }

  function validate() {
    const err = {};
    if (!form.title?.trim()) err.title = "Title is required";
    if (!form.author?.trim()) err.author = "Author is required";
    if (!form.price || form.price <= 0) err.price = "Valid price is required";
    if (!form.category) err.category = "Category is required";
    if (!form.image) err.image = "Image is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  async function save(e) {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (editing) {
        await api.put(`/books/${editing}`, form);
      } else {
        await api.post("/books", form);
      }
      resetForm();
      load();
    } catch (e) {
      alert("Failed to save book");
    }
  }

  async function remove(id) {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      await api.delete(`/books/${id}`);
      load();
    } catch (e) { alert("Failed to delete"); }
  }

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await api.post("/books/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setForm({ ...form, image: res.data });
    } catch (e) { alert("Upload failed"); }
  }

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    (b.vendor && b.vendor.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Layout>
      <div className="min-h-screen bg-[#F8F9FA] pb-20 font-sans text-gray-900">

        {/* Hero Header */}
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
                <BookOpen className="text-amber-500" /> Inventory
              </motion.h1>
              <p className="text-gray-400 text-lg">Manage your book catalog, stock levels and pricing.</p>
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-white/20 transition-all flex items-center gap-2"
            >
              <Plus size={20} className="text-amber-600" /> Add New Book
            </button>
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
                placeholder="Search by title, author..."
                className="w-full pl-12 pr-4 py-4 bg-transparent rounded-2xl border-none focus:ring-2 focus:ring-amber-500/50 outline-none text-gray-800 placeholder-gray-500 font-medium"
              />
            </div>
          </div>

          {/* Collapsible Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-8"
              >
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                  <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{editing ? "Edit Book Details" : "Add New Book"}</h2>
                    <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><X size={24} /></button>
                  </div>

                  <form onSubmit={save} className="grid md:grid-cols-2 gap-8">
                    {/* Left Col */}
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-1 block">Book Title</label>
                        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="Enter full title" />
                        {errors.title && <p className="text-red-500 text-xs mt-1 font-medium">{errors.title}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-1 block">Author</label>
                        <input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} className="input-field" placeholder="Author name" />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-1 block">Price (₹)</label>
                          <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input-field" placeholder="0.00" />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-1 block">Stock Base</label>
                          <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="input-field" placeholder="0" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-1 block">Category</label>
                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field appearance-none">
                          <option value="">Select Category</option>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Right Col */}
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-1 block">Description</label>
                        <textarea rows={5} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field resize-none leading-relaxed" placeholder="Write a compelling description..." />
                      </div>

                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-1 block">Cover Image</label>
                        <div className="group mt-1 border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-amber-500 hover:bg-amber-50/30 transition-all cursor-pointer relative bg-gray-50/50">
                          <input type="file" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
                          {form.image ? (
                            <div className="relative h-40 w-28 mx-auto shadow-lg rotate-1 group-hover:rotate-0 transition-transform duration-300">
                              <img src={form.image.startsWith("http") ? form.image : `https://bookapp-production-3e11.up.railway.app${form.image}`} className="h-full w-full object-cover rounded-md" alt="Preview" />
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

                    <div className="md:col-span-2 pt-6 flex gap-4 border-t border-gray-100 mt-2">
                      <button type="submit" className="flex-1 btn-primary py-4 text-lg shadow-amber-500/20">
                        {editing ? "Save Changes" : "Create Book"}
                      </button>
                      <button type="button" onClick={resetForm} className="px-8 py-4 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 hover:text-gray-900 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Books Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-20">
            {filtered.map((b, i) => (
              <motion.div
                layout
                key={b.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="relative h-56 bg-gray-100 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 z-10 transition-opacity"></div>
                  <img
                    src={b.image?.startsWith("http") ? b.image : `https://bookapp-production-3e11.up.railway.app${b.image}`}
                    alt={b.title}
                    className="h-4/5 object-cover shadow-2xl rounded-sm transform group-hover:scale-105 group-hover:-rotate-1 transition-transform duration-500 relative z-0"
                  />

                  {/* Floating Action Overlay */}
                  <div className="absolute inset-0 z-20 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button onClick={() => handleEdit(b)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 shadow-lg hover:bg-amber-500 hover:text-white transition-colors transform hover:scale-110">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => remove(b.id)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-600 shadow-lg hover:bg-red-500 hover:text-white transition-colors transform hover:scale-110">
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Category Pill */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/30">
                      {b.category}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 line-clamp-1">{b.title}</h3>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-500">{b.author}</p>
                    {b.vendor && (
                      <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                        {b.vendor.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="text-xl font-black text-gray-900">₹{b.price}</div>
                    <button
                      onClick={() => setStockEditing(b)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${b.stock < 5 ? "bg-red-100 text-red-700" : "bg-white text-gray-600 shadow-sm"}`}
                    >
                      <Package size={14} className={b.stock < 5 ? "animate-pulse" : ""} />
                      {b.stock} Left
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {stockEditing && (
            <UpdateStockModal book={stockEditing} onClose={() => setStockEditing(null)} onUpdate={load} />
          )}
        </div>
      </div>
    </Layout>
  );
}



