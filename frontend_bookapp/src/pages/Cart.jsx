import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [books, setBooks] = useState({});
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    loadCart();
  }, []);

  async function loadCart() {
    try {
      const r = await api.get(`/cart/${user.id}`);
      const cartItems = r.data || [];
      setItems(cartItems);

      // Load book details for each item
      const map = {};
      await Promise.all(cartItems.map(async (ci) => {
        try {
          const res = await api.get(`/books/${ci.bookId}`);
          map[ci.bookId] = res.data;
        } catch (e) {
          console.error("Failed to load book", ci.bookId);
        }
      }));
      setBooks(map);
    } catch (e) {
      console.error("Cart load error", e);
    } finally {
      setLoading(false);
    }
  }

  function updateQty(item, newQty) {
    if (newQty < 1) return;
    // Optimistic update
    const oldItems = [...items];
    setItems(items.map(i => i.id === item.id ? { ...i, quantity: newQty } : i));

    api.post("/cart/update", { id: item.id, userId: item.userId, bookId: item.bookId, quantity: newQty })
      .then(r => {
        // Confirm with server data if needed, but optimistic is smoother
        window.dispatchEvent(new Event('cartUpdated'));
      })
      .catch((e) => {
        console.error("Update failed", e);
        setItems(oldItems); // Revert
        // Show toast here if we had one
      });
  }

  function deleteItem(id) {
    setItems(items.filter(i => i.id !== id)); // Optimistic
    api.delete(`/cart/${id}`)
      .then(() => {
        window.dispatchEvent(new Event('cartUpdated'));
      })
      .catch(() => loadCart()); // Revert if failed
  }

  // Calculations
  const subtotal = items.reduce((sum, item) => {
    const price = books[item.bookId]?.price || 0;
    return sum + (price * item.quantity);
  }, 0);
  const shipping = subtotal > 500 ? 0 : 50; // Free shipping over 500
  const tax = Math.round(subtotal * 0.05); // 5% tax
  const total = subtotal + shipping + tax;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <ShoppingCart size={64} className="text-gray-300 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Please Log In</h2>
      <p className="text-gray-500 mb-6">You need to be logged in to view your cart.</p>
      <Link to="/login" className="btn-primary">Login Now</Link>
    </div>
  );

  if (items.length === 0) return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 max-w-md w-full"
      >
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={40} className="text-amber-600" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added any books yet. Explore our collection to find your next read.</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          Start Shopping <ArrowRight size={18} />
        </Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Shopping Cart ({items.length})</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => {
                const book = books[item.bookId];
                if (!book) return null; // Loading or error state handling ideally
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center"
                  >
                    <div className="w-20 h-28 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={book.image?.startsWith("http") ? book.image : `${import.meta.env.VITE_API_BASE || "https://bookapp-production-3e11.up.railway.app"}${book.image}`}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/150x200?text=Book+Cover"; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-900 line-clamp-1">{book.title}</h3>
                          <p className="text-sm text-gray-500 mb-2">{book.author}</p>
                        </div>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="flex items-end justify-between mt-2">
                        <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1">
                          <button
                            onClick={() => updateQty(item, item.quantity - 1)}
                            className="p-1 hover:bg-white rounded-md transition-shadow shadow-sm disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item, item.quantity + 1)}
                            className="p-1 hover:bg-white rounded-md transition-shadow shadow-sm"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-amber-700">₹ {book.price * item.quantity}</p>
                          <p className="text-xs text-gray-400">₹ {book.price} / each</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4 font-serif">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping estimate</span>
                  <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                    {shipping === 0 ? "Free" : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (5%)</span>
                  <span>₹{tax}</span>
                </div>
                <div className="h-px bg-gray-100 my-2"></div>
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Order Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/order-summary", {
                  state: {
                    subtotal,
                    shipping,
                    tax,
                    total,
                    fromCart: true
                  }
                })}
                className="w-full btn-primary flex items-center justify-center gap-2 group"
              >
                Checkout <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                Secure checkout by BookBarn.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



