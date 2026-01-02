import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, CreditCard, AlertCircle, CheckCircle } from "lucide-react";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const delivery = JSON.parse(localStorage.getItem("deliveryAgent") || "null");
  const vendorToken = localStorage.getItem("vendorToken");
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isDelivery = !!delivery;
  const isVendor = !!vendorToken;

  useEffect(() => {
    api.get(`/books/${id}`)
      .then(r => {
        const data = r.data;
        data.stock = Number(data.stock);
        setBook(data);
      })
      .catch(() => { });
  }, [id]);

  if (!book) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
    </div>
  );

  async function addToCart() {
    if (isAdmin) { alert("Admin users cannot place orders."); return; }
    if (isDelivery) { alert("Delivery agents cannot place orders."); return; }
    if (isVendor) { alert("Vendor users cannot place orders."); return; }
    if (Number(book.stock) === 0) { alert("This book is out of stock."); return; }
    if (!user) { navigate("/login"); return; }

    try {
      await api.post("/cart", { userId: user.id, bookId: book.id, quantity: 1 });

      // Notify navbar to update cart count
      window.dispatchEvent(new Event('cartUpdated'));

      const toast = document.createElement("div");
      toast.className = "fixed bottom-5 right-5 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-[999] animate-fade-in flex items-center gap-2";
      toast.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"></path></svg> Added to Cart!`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    } catch (err) {
      alert("Failed to add to cart");
    }
  }

  async function buyNow() {
    if (isAdmin) { alert("Admin users cannot place orders."); return; }
    if (isDelivery) { alert("Delivery agents cannot place orders."); return; }
    if (Number(book.stock) === 0) { alert("This book is out of stock."); return; }
    if (!user) { navigate("/login"); return; }

    try {
      // Add to cart first (ensures stock check & sync)
      await api.post("/cart", { userId: user.id, bookId: book.id, quantity: 1 });
      // Redirect
      navigate("/order-summary", {
        state: {
          buyNow: true,
          items: [{ bookId: book.id, title: book.title, price: book.price, quantity: 1, image: book.image }],
          total: Number(book.price)
        }
      });
    } catch (err) {
      alert("Failed to process Buy Now");
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-amber-700 transition mb-8 font-medium">
          <ArrowLeft size={20} /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-white/50"
        >
          <div className="grid md:grid-cols-2">

            {/* Image Section */}
            <div className="bg-gray-100 relative group overflow-hidden flex items-center justify-center p-8 md:p-12">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent"></div>
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                referrerPolicy="no-referrer"
                src={
                  !book.image || (!book.image.startsWith("http") && !book.image.startsWith("/"))
                    ? "https://placehold.co/400x600?text=No+Cover"
                    : book.image.startsWith("http")
                      ? book.image
                      : `${import.meta.env.VITE_API_BASE || "https://bookapp-production-3e11.up.railway.app"}${book.image}`
                }
                alt={book.title}
                className="relative w-3/5 shadow-2xl rounded-r-lg transform group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/400x600?text=No+Cover";
                }}
              />
            </div>

            {/* Details Section */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-100/50 text-amber-800 font-bold text-xs tracking-widest uppercase border border-amber-100">
                  {book.category || "General"}
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight font-serif">
                {book.title}
              </h1>

              <p className="text-lg text-gray-500 mb-8 font-medium flex items-center gap-2">
                By <span className="text-gray-900 underline decoration-amber-300 decoration-2 underline-offset-2">{book.author}</span>
              </p>
              {book.vendor && (
                <div className="mb-6 flex items-center gap-2 text-sm text-gray-600 bg-amber-50 px-3 py-1.5 rounded-lg w-fit border border-amber-100">
                  <span className="font-semibold text-amber-800">Vendor:</span>
                  <span>{book.vendor.name}</span>
                </div>
              )}

              <div className="flex items-end gap-4 mb-8">
                <div className="text-5xl font-black text-amber-700">₹{book.price}</div>
                {book.oldPrice && <div className="text-xl text-gray-400 line-through mb-1">₹{book.oldPrice}</div>}
              </div>

              {/* Stock Badge */}
              <div className="mb-8">
                {book.stock > 0 ? (
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border ${book.stock < 5 ? "bg-red-50 text-red-700 border-red-100" : "bg-green-50 text-green-700 border-green-100"}`}>
                    {book.stock < 5 ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                    {book.stock < 5 ? `Hurry! Only ${book.stock} left` : "In Stock"}
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 text-gray-500 text-sm font-bold border border-gray-200">
                    <AlertCircle size={16} /> Out of Stock
                  </div>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed text-lg mb-10">
                {book.description || "No description available for this book. It serves as a masterpiece in its collection."}
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                {isAdmin || isDelivery || isVendor ? (
                  <div className="w-full py-4 bg-gray-100 text-gray-400 font-bold text-center rounded-xl border border-dashed border-gray-300">
                    {isAdmin ? "Admin View Only" : isDelivery ? "Delivery Agent View Only" : "Vendor View Only"}
                  </div>
                ) : book.stock > 0 ? (
                  <>
                    <button onClick={addToCart} className="flex-1 py-4 px-6 rounded-xl font-bold text-lg shadow-lg bg-gray-900 text-white hover:bg-black hover:shadow-xl hover:-translate-y-0.5 transform transition-all flex items-center justify-center gap-2">
                      <ShoppingBag size={20} /> Add to Cart
                    </button>
                    <button onClick={buyNow} className="flex-1 py-4 px-6 rounded-xl font-bold text-lg border-2 border-amber-600 text-amber-700 hover:bg-amber-50 transition-colors flex items-center justify-center gap-2">
                      <CreditCard size={20} /> Buy Now
                    </button>
                  </>
                ) : (
                  <button disabled className="w-full py-4 bg-gray-200 text-gray-400 font-bold rounded-xl cursor-not-allowed">
                    Unavailable
                  </button>
                )}
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}



