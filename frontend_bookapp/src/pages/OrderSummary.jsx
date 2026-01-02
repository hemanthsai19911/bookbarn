import React, { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function OrderSummary() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useNavigate();
  const { state } = useLocation();

  if (!state && !localStorage.getItem("user")) {
    // Safety for automation/lost state
    window.location.href = "/";
    return null;
  }

  const isBuyNow = state?.items && state.items.length > 0;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState({});

  useEffect(() => {
    if (isBuyNow) {
      loadBuyNow();
    } else {
      loadCartSummary();
    }
  }, []);

  function loadBuyNow() {
    if (state?.items) {
      setItems(state.items);
    }
    setLoading(false);
  }

  async function loadCartSummary() {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }
    try {
      const cartRes = await api.get(`/cart/${user.id}`);
      const cartItems = cartRes.data || [];
      setItems(cartItems);
      if (cartItems.length > 0) {
        try {
          const bRes = await api.get("/books");
          const bookMap = {};
          if (Array.isArray(bRes.data)) {
            bRes.data.forEach(b => bookMap[b.id] = b);
          }
          setBooks(bookMap);
        } catch (e) { console.error("Books load error", e); }
      }
    } catch (err) {
      console.error("Cart summary error", err);
    } finally {
      setLoading(false);
    }
  }

  function getItemDetails(item) {
    if (isBuyNow) return item;
    const book = books[item.bookId] || {};
    return { ...item, title: book.title || "Loading...", price: book.price || 0, image: book.image };
  }

  // Use passed totals from Cart if available, otherwise calculate
  const subtotal = state?.subtotal || (isBuyNow
    ? state.total
    : items.reduce((sum, item) => sum + (getItemDetails(item).price * item.quantity), 0));

  const shipping = state?.shipping !== undefined ? state.shipping : (subtotal > 500 ? 0 : 50);
  const tax = state?.tax !== undefined ? state.tax : Math.round(subtotal * 0.05);
  const total = state?.total || (subtotal + shipping + tax);

  if (loading) return <Layout><div className="flex justify-center py-20">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 animate-fade-in">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8 flex items-center gap-3">
            <CheckCircle className="text-amber-600" /> Order Summary
          </h1>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Items Review</h2>

              <div className="space-y-6">
                {items.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No items to review.</p>
                ) : items.map((item, idx) => {
                  const details = getItemDetails(item);
                  return (
                    <div key={idx} className="flex gap-4 items-center">
                      <img
                        referrerPolicy="no-referrer"
                        src={details.image?.startsWith('http') ? details.image : `https://bookapp-production-3e11.up.railway.app${details.image}`}
                        className="w-16 h-20 object-cover rounded-md shadow-sm bg-gray-100"
                        alt=""
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/150x200?text=N/A"; }}
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{details.title}</h4>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-bold text-lg text-amber-700">
                        ₹ {details.price * item.quantity}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 p-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Breakdown</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                    {shipping === 0 ? "Free" : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (5%)</span>
                  <span>₹{tax}</span>
                </div>
                <div className="h-px bg-gray-200 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-bold text-lg">Total Amount</span>
                  <span className="text-3xl font-black text-gray-900">₹{total}</span>
                </div>
              </div>

              <button
                type="button"
                id="proceed-to-payment"
                data-testid="proceed-to-payment-btn"
                onClick={() => navigate("/checkout", { state: { items, subtotal, shipping, tax, total, buyNow: isBuyNow } })}
                className="w-full btn-primary py-4 text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transform transition-all flex items-center justify-center font-bold"
              >
                Proceed to Payment
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full mt-4 text-gray-500 hover:text-gray-900 font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
