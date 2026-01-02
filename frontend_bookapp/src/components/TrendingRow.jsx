import React from "react";
import BookCard from "./BookCard";

export default function TrendingRow({ title, items = [], onAdd }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-3xl font-bold text-gray-900 font-serif tracking-tight">{title}</h2>
      </div>

      <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-8 px-1 snap-x snap-mandatory">
        {items.map((b) => (
          <div key={b.id} className="min-w-[220px] w-[220px] snap-center">
            <BookCard book={b} onAdd={onAdd} />
          </div>
        ))}
      </div>
    </section>
  );
}

