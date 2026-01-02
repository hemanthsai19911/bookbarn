import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";

export default function BookCard({ book, onAdd }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const delivery = JSON.parse(localStorage.getItem("deliveryAgent") || "null");
  const vendorToken = localStorage.getItem("vendorToken");
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isDelivery = !!delivery;
  const isVendor = !!vendorToken;
  const isOutOfStock = book.stock === 0;
  const isLowStock = book.stock > 0 && book.stock < 5;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="glass-card group relative overflow-hidden flex flex-col h-full"
    >
      <Link to={`/book/${book.id}`} className="relative block overflow-hidden aspect-[2/3]">
        <img
          referrerPolicy="no-referrer"
          src={
            !book.image || (!book.image.startsWith("http") && !book.image.startsWith("/"))
              ? "https://placehold.co/300x450?text=No+Cover"
              : book.image.startsWith("http")
                ? book.image
                : `${import.meta.env.VITE_API_BASE || "https://bookapp-production-3e11.up.railway.app"}${book.image}`
          }
          alt={book.title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? "grayscale opacity-60" : ""
            }`}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/300x450?text=No+Cover";
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {book.isBestseller && (
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-lg">
              Bestseller
            </span>
          )}
          {isLowStock && (
            <span className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-lg">
              Hurry! Only {book.stock} left
            </span>
          )}
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <span className="bg-red-600/90 text-white px-4 py-2 font-bold transform -rotate-12 border-2 border-white/20 shadow-xl text-lg backdrop-blur-md rounded-lg">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <Link to={`/book/${book.id}`}>
            <h3 className="text-gray-900 font-bold text-lg leading-tight line-clamp-2 group-hover:text-amber-700 transition-colors font-serif">
              {book.title}
            </h3>
          </Link>
          <p className="text-sm text-gray-500 mt-1 font-medium">{book.author}</p>
          {book.vendor && (
            <p className="text-xs text-amber-600 mt-1 font-medium flex items-center gap-1">
              <span>Sold by:</span> <span className="underline">{book.vendor.name}</span>
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Price</span>
            <span className="text-xl font-bold text-amber-700">₹{book.price}</span>
          </div>

          {!isAdmin && !isDelivery && !isVendor && (
            <button
              onClick={() => !isOutOfStock && onAdd && onAdd(book.id)}
              disabled={isOutOfStock}
              className={`
                p-2.5 rounded-full transition-all duration-300 shadow-sm flex items-center gap-2
                ${isOutOfStock
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-900 text-white hover:bg-amber-600 hover:shadow-amber-600/30 hover:scale-105 active:scale-95"
                }
              `}
              title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
            >
              <ShoppingCart size={18} />
              {/* <span className="sr-only">Add</span> */}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}



