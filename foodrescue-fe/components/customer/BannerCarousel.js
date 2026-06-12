"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/**
 * Carousel banner quảng cáo sản phẩm – tự chuyển slide, có nút prev/next và dots.
 */
export default function BannerCarousel({ banners = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const len = banners.length;

  useEffect(() => {
    if (len <= 1) return;
    const t = setInterval(() => setActiveIndex((i) => (i + 1) % len), 5000);
    return () => clearInterval(t);
  }, [len]);

  if (!len) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-slate-100">
      <div className="relative aspect-[1200/400] w-full max-h-[320px] sm:max-h-[380px]">
        {banners.map((b, i) => (
          <Link
            key={b.id}
            href={b.productId ? `/products/${b.productId}` : (b.link || "#")}
            className={`absolute inset-0 block transition-opacity duration-500 ${
              i === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={b.image}
              alt={b.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.src = "https://placehold.co/1200x400/e5f8ec/0faf74?text=Banner";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <p className="text-sm font-medium text-white drop-shadow-md">{b.storeName}</p>
              <h2 className="mt-1 text-2xl font-bold text-white drop-shadow-md">{b.title}</h2>
            </div>
          </Link>
        ))}
      </div>

      {len > 1 && (
        <>
          <button
            type="button"
            onClick={() => setActiveIndex((i) => (i - 1 + len) % len)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-slate-700 hover:bg-white transition"
            aria-label="Banner trước"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setActiveIndex((i) => (i + 1) % len)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-slate-700 hover:bg-white transition"
            aria-label="Banner sau"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`size-2 rounded-full transition-all ${
                  i === activeIndex ? "bg-white w-6" : "bg-white/60 hover:bg-white/80"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
