import React, { useEffect, useState } from "react";
import api from "../services/api";
import BookCard from "../components/BookCard";
import TrendingRow from "../components/TrendingRow";
import { BookOpen, BookMarked, Briefcase, Lightbulb, Baby, Palette, GraduationCap, Library, Search, Sparkles, TrendingUp, Clock, Tag, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const categories = [
    { label: "all", icon: Library },
    { label: "Fiction", icon: BookOpen },
    { label: "Non-fiction", icon: BookMarked },
    { label: "Business", icon: Briefcase },
    { label: "Self Help", icon: Lightbulb },
    { label: "Kids", icon: Baby },
    { label: "Comics", icon: Palette },
    { label: "Education", icon: GraduationCap }
  ];

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/books");
        const list = res.data || [];
        setBooks(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Categorize books
  const bestsellers = books.filter(b => b.isBestseller).slice(0, 8);
  const newArrivals = books.slice().reverse().slice(0, 8); // Latest books
  const onSale = books.filter(b => b.price < 500).slice(0, 8); // Books under 500
  const featured = books.filter(b => b.stock > 50).slice(0, 8); // High stock = popular

  const filtered = books.filter((b) => {
    const matchesQ =
      !query ||
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      (b.author || "").toLowerCase().includes(query.toLowerCase());
    const matchesCat = category === "all" || (b.category || "").toLowerCase() === category.toLowerCase();
    return matchesQ && matchesCat;
  });

  async function addToCart(bookId) {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const delivery = JSON.parse(localStorage.getItem("deliveryAgent") || "null");

    if (delivery) {
      alert("Delivery agents cannot place orders.");
      return;
    }

    if (!user) {
      window.location = "/login";
      return;
    }
    try {
      await api.post("/cart", { userId: user.id, bookId, quantity: 1 });

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

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-20">

      {/* HERO SECTION */}
      <section className="relative h-[80vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero.png"
            alt="Bookstore"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8 animate-fade-in">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium tracking-widest uppercase mb-4 shadow-lg">
              Welcome to BookBarn
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white font-serif leading-tight drop-shadow-lg">
              Find Your Next <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-200">Great Adventure</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 font-light mt-6 max-w-2xl mx-auto drop-shadow-md">
              Explore our curated collection of bestsellers, classics, and hidden gems.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative max-w-2xl mx-auto group"
          >
            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full transform group-hover:bg-amber-400/30 transition-colors duration-500"></div>
            <div className="relative flex items-center bg-white/90 backdrop-blur-xl rounded-full shadow-2xl p-2 border border-white/50">
              <Search className="text-gray-400 ml-4" size={24} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, author, or genre..."
                className="w-full bg-transparent border-none focus:ring-0 text-lg text-gray-800 placeholder:text-gray-400 px-4 py-3"
              />
              <button className="bg-amber-700 text-white px-8 py-3 rounded-full font-bold hover:bg-amber-800 transition-colors shadow-lg">
                Search
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">

        {/* Categories Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/60 mb-12"
        >
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = category === cat.label;
              return (
                <button
                  key={cat.label}
                  onClick={() => setCategory(cat.label)}
                  className={`
                        flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border
                        ${isActive
                      ? "bg-amber-700 text-white border-amber-700 shadow-amber-700/30 shadow-lg transform scale-105"
                      : "bg-white text-gray-600 border-gray-200 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"}
                        `}
                >
                  <Icon size={16} />
                  {cat.label === 'all' ? 'All Books' : cat.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-amber-600"></div>
          </div>
        ) : (
          <div className="space-y-16 animate-fade-in">

            {/* Show curated sections only when no search/filter */}
            {!query && category === 'all' && (
              <>
                {/* Special Offers Banner */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <Tag size={24} />
                      <span className="text-sm font-bold uppercase tracking-wider">Limited Time Offer</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black mb-4">Up to 40% Off</h2>
                    <p className="text-xl text-amber-50 mb-6">On selected bestsellers and new arrivals. Don't miss out!</p>
                    <button className="bg-white text-amber-700 px-8 py-3 rounded-full font-bold hover:bg-amber-50 transition-all shadow-lg">
                      Shop Deals
                    </button>
                  </div>
                </motion.div>

                {/* Bestsellers */}
                {bestsellers.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Star className="text-amber-600" size={24} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 font-serif">Bestsellers</h2>
                        <p className="text-gray-500">Most loved by our readers</p>
                      </div>
                    </div>
                    <TrendingRow items={bestsellers} onAdd={addToCart} />
                  </section>
                )}

                {/* New Arrivals */}
                {newArrivals.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Sparkles className="text-emerald-600" size={24} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 font-serif">New Arrivals</h2>
                        <p className="text-gray-500">Fresh off the press</p>
                      </div>
                    </div>
                    <TrendingRow items={newArrivals} onAdd={addToCart} />
                  </section>
                )}

                {/* Special Deals */}
                {onSale.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-rose-100 rounded-lg">
                        <Zap className="text-rose-600" size={24} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 font-serif">Special Deals</h2>
                        <p className="text-gray-500">Books under ₹500</p>
                      </div>
                    </div>
                    <TrendingRow items={onSale} onAdd={addToCart} />
                  </section>
                )}

                {/* Trending Now */}
                {featured.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <TrendingUp className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 font-serif">Trending Now</h2>
                        <p className="text-gray-500">Popular picks this week</p>
                      </div>
                    </div>
                    <TrendingRow items={featured} onAdd={addToCart} />
                  </section>
                )}
              </>
            )}

            {/* Main Grid - Always show */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900 font-serif">
                  {query ? `Search Results for "${query}"` : (category !== 'all' ? `${category} Books` : "All Books")}
                </h2>
                <span className="text-gray-500 font-medium">{filtered.length} books</span>
              </div>

              {filtered.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filtered.map((b) => (
                    <div key={b.id} className="h-full">
                      <BookCard book={b} onAdd={addToCart} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                  <div className="inline-flex p-4 rounded-full bg-gray-100 text-gray-400 mb-4">
                    <Search size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">No books found</h3>
                  <p className="text-gray-500 mt-2">Try adjusting your search or category filter.</p>
                  <button onClick={() => { setQuery(""); setCategory("all"); }} className="mt-6 text-amber-700 font-semibold hover:underline">
                    Clear all filters
                  </button>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}


