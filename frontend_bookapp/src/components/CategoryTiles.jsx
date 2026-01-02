// components/CategoryTiles.jsx
import React from "react";

export default function CategoryTiles({ categories = [], active, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {categories.map((c) => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition
            ${active === c ? "bg-amber-700 text-white" : "bg-white/60 text-gray-800"}
            shadow-sm border border-white/30`}
        >
          <div className="w-10 h-10 rounded-md bg-white/30 flex items-center justify-center">
            {/* optional icon placeholder */}
            <span className="text-sm font-medium">{c.charAt(0)}</span>
          </div>
          <div className="text-sm font-medium">{c}</div>
        </button>
      ))}
    </div>
  );
}

