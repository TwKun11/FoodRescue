"use client";
import { useState } from "react";

/**
 * CartItem - Một dòng sản phẩm trong giỏ hàng (ảnh + thông tin + số lượng)
 */
export default function CartItem({ item, onRemove, onQtyChange }) {
  const [qty, setQty] = useState(item?.quantity ?? 1);

  const handleQty = (delta) => {
    const next = Math.max(1, qty + delta);
    setQty(next);
    onQtyChange?.(item.id, next);
  };

  const {
    name = "Sản phẩm",
    image = "",
    discountPrice = 0,
    originalPrice = 0,
    storeName = "Cửa hàng",
    expiryLabel = "",
  } = item ?? {};

  const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect fill='%23f6fffb' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%230faf74' font-size='24'%3E?%3C/text%3E%3C/svg%3E";

  return (
    <div className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Ảnh sản phẩm — vuông, object-cover */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-brand-bg shrink-0">
        <img
          src={image || placeholder}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = placeholder;
          }}
        />
      </div>

      {/* Thông tin */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <p className="font-semibold text-gray-800 line-clamp-2">{name}</p>
          <p className="text-xs text-gray-500 mt-0.5">📍 {storeName}</p>
          {expiryLabel && (
            <p className="text-xs text-red-500 mt-0.5 font-medium">⏰ {expiryLabel}</p>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-brand-dark font-bold">{discountPrice.toLocaleString("vi-VN")}đ</span>
          <span className="text-gray-400 line-through text-xs">{originalPrice.toLocaleString("vi-VN")}đ</span>
        </div>
      </div>

      {/* Số lượng + Thành tiền + Xóa */}
      <div className="flex flex-col items-end justify-between shrink-0">
        <div className="flex items-center gap-1 border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50">
          <button
            type="button"
            onClick={() => handleQty(-1)}
            className="p-2 text-gray-600 hover:bg-brand/20 hover:text-brand-dark transition"
            aria-label="Giảm số lượng"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-gray-800 w-7 text-center tabular-nums">{qty}</span>
          <button
            type="button"
            onClick={() => handleQty(1)}
            className="p-2 text-gray-600 hover:bg-brand/20 hover:text-brand-dark transition"
            aria-label="Tăng số lượng"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <p className="text-sm font-bold text-gray-800 mt-2">{(discountPrice * qty).toLocaleString("vi-VN")}đ</p>
        <button
          type="button"
          onClick={() => onRemove?.(item.id)}
          className="text-xs text-red-500 hover:text-red-600 font-medium mt-1 flex items-center gap-1 transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Xóa
        </button>
      </div>
    </div>
  );
}
