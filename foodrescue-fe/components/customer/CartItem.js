"use client";
import { useState } from "react";
import Button from "../common/Button";

/**
 * CartItem - Một dòng sản phẩm trong giỏ hàng
 * @param {object} item - { id, name, image, discountPrice, originalPrice, store, quantity }
 * @param {function} onRemove - callback xóa item
 * @param {function} onQtyChange - callback (id, newQty)
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

  return (
    <div className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Image */}
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
        <img
          src={image || "https://placehold.co/80x80/FFF3E0/E65100?text=Food"}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "https://placehold.co/80x80/FFF3E0/E65100?text=Food";
          }}
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 truncate">{name}</p>
        <p className="text-xs text-gray-400">📍 {storeName}</p>
        {expiryLabel && <p className="text-xs text-red-500 mt-0.5">⏰ {expiryLabel}</p>}

        <div className="flex items-center gap-2 mt-1">
          <span className="text-orange-500 font-bold">{discountPrice.toLocaleString("vi-VN")}đ</span>
          <span className="text-gray-400 line-through text-xs">{originalPrice.toLocaleString("vi-VN")}đ</span>
        </div>
      </div>

      {/* Right: qty + remove */}
      <div className="flex flex-col items-end justify-between shrink-0">
        {/* Quantity Controls */}
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg overflow-hidden">
          <button onClick={() => handleQty(-1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition">
            −
          </button>
          <span className="text-sm font-semibold w-5 text-center">{qty}</span>
          <button onClick={() => handleQty(1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition">
            +
          </button>
        </div>

        {/* Subtotal */}
        <p className="text-sm font-bold text-gray-800">{(discountPrice * qty).toLocaleString("vi-VN")}đ</p>

        {/* Remove */}
        <button onClick={() => onRemove?.(item.id)} className="text-xs text-red-400 hover:text-red-600 transition">
          🗑 Xóa
        </button>
      </div>
    </div>
  );
}
