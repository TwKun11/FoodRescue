"use client";
import Link from "next/link";
import Badge from "../common/Badge";

/**
 * ProductCard - Hiển thị thẻ sản phẩm trong danh sách / trang chủ
 * @param {object} product - { id, name, image, originalPrice, discountPrice, discountPercent, expiryLabel, storeName, stock }
 */
export default function ProductCard({ product }) {
  const {
    id = "1",
    name = "Sản phẩm mẫu",
    image = "/placeholder-food.jpg",
    originalPrice = 100000,
    discountPrice = 50000,
    discountPercent = 50,
    expiryLabel = "",
    storeName = "",
    stock = null,
  } = product ?? {};

  const isOutOfStock = stock === 0;
  const isLowStock = stock != null && stock > 0 && stock <= 5;

  return (
    <Link
      href={`/products/${id}`}
      className={`bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group border ${
        isOutOfStock ? "border-gray-200 opacity-70" : "border-gray-100 hover:border-brand/30"
      } flex flex-col`}
    >
      {/* Image */}
      <div className="relative aspect-square w-full bg-gray-100 overflow-hidden shrink-0">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = "https://placehold.co/400x300/F6FFFB/0FAF74?text=Ảnh";
          }}
        />
        {discountPercent > 0 && !isOutOfStock && (
          <Badge variant="discount" className="absolute top-2 left-2 text-xs">
            -{discountPercent}%
          </Badge>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white/90 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">Hết hàng</span>
          </div>
        )}
        {isLowStock && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Còn {stock}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="font-semibold text-gray-800 line-clamp-2 text-sm leading-snug">{name}</p>
        {storeName && (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{storeName}</span>
          </p>
        )}

        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-brand-dark font-extrabold text-base">{discountPrice.toLocaleString("vi-VN")}đ</span>
          {originalPrice > discountPrice && (
            <span className="text-gray-400 line-through text-xs">{originalPrice.toLocaleString("vi-VN")}đ</span>
          )}
        </div>

        {expiryLabel && !isOutOfStock && (
          <p className="text-[11px] text-orange-500 font-medium flex items-center gap-1 mt-0.5">
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {expiryLabel}
          </p>
        )}
      </div>
    </Link>
  );
}
