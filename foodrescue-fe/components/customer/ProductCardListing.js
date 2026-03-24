"use client";

import Link from "next/link";
import CountdownTimer from "@/components/customer/CountdownTimer";

/**
 * ProductCardListing - Thẻ sản phẩm cho trang danh sách: ảnh, tên, sao, hạn dùng, countdown, giá, địa chỉ, giỏ hàng.
 */
export default function ProductCardListing({ product, onAddToCart }) {
  const {
    id = "1",
    name = "Sản phẩm",
    image = "/images/products/raucai.jpg",
    originalPrice = 0,
    discountPrice = 0,
    discountPercent = 0,
    expiryLabel = "",
    expiryAt = null,
    storeName = "",
    address = "",
    province = "",
    distanceLabel = "",
    rating = 0,
    stock = null,
  } = product ?? {};
  const cityLabel = province || address || "";

  const isOutOfStock = stock === 0;
  const hasExpiry = !!expiryAt;
  const formatPrice = (n) => `${Number(n).toLocaleString("vi-VN")} đồng`;
  const displayRating = Number(rating) || 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof onAddToCart === "function") onAddToCart(product);
    else window.location.href = `/products/${id}`;
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
      <Link href={`/products/${id}`} className="block w-full overflow-hidden bg-slate-100">
        <div className="relative w-full aspect-square">
          <img
            src={image}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-400"
            onError={(e) => {
              e.target.src = "https://placehold.co/400x400/e5f8ec/0faf74?text=Ảnh";
            }}
          />
          <div className="absolute top-3 left-3">
          {isOutOfStock ? (
            <span className="px-3 py-1 bg-slate-500 text-white text-[10px] font-bold rounded-full shadow-lg">
              HẾT HÀNG
            </span>
          ) : discountPercent > 0 ? (
            <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full shadow-md">
              GIẢM {discountPercent}%
            </span>
          ) : null}
          </div>
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2 mb-1">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Sản phẩm</span>
          {!isOutOfStock && displayRating > 0 && (
            <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
              <StarIcon className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-bold">{displayRating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <Link href={`/products/${id}`}>
          <h3 className="font-bold text-base mb-1 line-clamp-2 hover:text-emerald-700 transition-colors text-slate-800">{name}</h3>
        </Link>
        {expiryLabel && !isOutOfStock && (
          <p className="text-xs text-slate-500 mb-1">{expiryLabel}</p>
        )}
        {hasExpiry && !isOutOfStock && (
          <div className="mb-2">
            <CountdownTimer targetTime={expiryAt} variant="default" />
          </div>
        )}
        <div className="flex flex-col gap-0.5 mb-2">
          {originalPrice > discountPrice && (
            <span className="text-red-500 line-through text-sm font-medium">{formatPrice(originalPrice)}</span>
          )}
          <span className="text-emerald-600 font-bold text-lg">{formatPrice(discountPrice)}</span>
        </div>
        {typeof stock === "number" && (
          <p className="text-xs text-slate-500 mb-1">
            Còn <span className="font-semibold text-slate-700">{stock}</span> sản phẩm
          </p>
        )}
        {cityLabel && (
          <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
            <LocationIcon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="line-clamp-1">{cityLabel}</span>
          </p>
        )}
        {distanceLabel && (
          <p className="text-xs text-emerald-700 mb-3 font-medium">{distanceLabel}</p>
        )}
        <div className="mt-auto flex items-center justify-end">
          {!isOutOfStock && (
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex items-center justify-center size-10 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-900/20"
              aria-label="Thêm vào giỏ hàng"
            >
              <CartIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StarIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function LocationIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function CartIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}
