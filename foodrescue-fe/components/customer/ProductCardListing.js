"use client";
import Link from "next/link";

/**
 * ProductCardListing - Thẻ sản phẩm cho trang danh sách (style mockup: primary #33ff99, badge, add cart)
 */
export default function ProductCardListing({ product }) {
  const {
    id = "1",
    name = "Sản phẩm",
    image = "/images/products/raucai.jpg",
    originalPrice = 0,
    discountPrice = 0,
    discountPercent = 0,
    expiryLabel = "",
    storeName = "",
    stock = null,
  } = product ?? {};

  const isOutOfStock = stock === 0;
  const isUrgent = product?.expiryHours != null && product.expiryHours < 24 && !isOutOfStock;

  const formatPrice = (n) => `${Number(n).toLocaleString("vi-VN")}đ`;

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-brand/10 overflow-hidden hover:shadow-xl hover:shadow-brand/5 transition-all duration-300">
      <Link href={`/products/${id}`} className="relative aspect-square overflow-hidden bg-slate-100 block">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = "https://placehold.co/400x400/e5f8ec/0faf74?text=Ảnh";
          }}
        />
        <div className="absolute top-3 left-3">
          {isOutOfStock ? (
            <span className="px-3 py-1 bg-slate-500 text-white text-[10px] font-bold rounded-full shadow-lg">
              HẾT HÀNG
            </span>
          ) : isUrgent ? (
            <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-lg">
              KHẨN CẤP
            </span>
          ) : discountPercent > 0 ? (
            <span className="px-3 py-1 bg-brand text-[#0f2319] text-[10px] font-bold rounded-full shadow-lg">
              GIẢM {discountPercent}%
            </span>
          ) : null}
        </div>
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold text-brand uppercase">Sản phẩm</span>
          {!isOutOfStock && (
            <div className="flex items-center gap-0.5 text-amber-500">
              <StarIcon className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-bold">4.8</span>
            </div>
          )}
        </div>
        <Link href={`/products/${id}`}>
          <h3 className="font-bold text-lg mb-2 line-clamp-1 hover:text-brand-dark transition-colors">{name}</h3>
        </Link>
        {expiryLabel && !isOutOfStock && (
          <p className="text-xs text-slate-500 mb-4">{expiryLabel}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-col min-w-0">
            {originalPrice > discountPrice && (
              <span className="text-slate-400 line-through text-xs font-medium">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="text-brand font-bold text-xl">{formatPrice(discountPrice)}</span>
          </div>
          {!isOutOfStock && (
            <Link
              href={`/products/${id}`}
              className="flex items-center justify-center size-10 bg-brand text-[#0f2319] rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand/20 shrink-0"
              aria-label="Xem chi tiết"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </Link>
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
