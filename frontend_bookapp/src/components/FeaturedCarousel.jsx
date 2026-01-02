// components/FeaturedCarousel.jsx
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function FeaturedCarousel({ items = [] }) {
  const sc = useRef(null);

  // Auto scroll carousel
  useEffect(() => {
    if (!sc.current) return;
    const el = sc.current;

    let pos = 0;
    const width = el.scrollWidth - el.clientWidth;
    let dir = 1;

    const id = setInterval(() => {
      pos += dir * 2;
      if (pos >= width) dir = -1;
      if (pos <= 0) dir = 1;
      el.scrollTo({ left: pos, behavior: "smooth" });
    }, 2500);

    return () => clearInterval(id);
  }, [items]);

  return (
    <div className="w-full overflow-hidden rounded-2xl">
      <div
        ref={sc}
        className="flex gap-6 px-2 py-3 overflow-x-auto scrollbar-hide"
        style={{ scrollBehavior: "smooth" }}
      >
        {items.map((b) => (
          <Link
            to={`/book/${b.id}`}
            key={b.id}
            className="min-w-[320px] bg-white/55 backdrop-blur-sm rounded-xl overflow-hidden shadow-md"
          >
            <div className="h-48 overflow-hidden">
              <img
                src={
                  b.image
                    ? (b.image.startsWith("http")
                      ? b.image
                      : `https://bookapp-production-3e11.up.railway.app/${b.image}`)
                    : "/images/book-placeholder.png"
                }
                alt={b.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x200?text=Cover+Missing"; }}
              />

            </div>

            <div className="p-3">
              <div className="text-sm text-gray-600">{b.category}</div>
              <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                {b.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {b.author}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


