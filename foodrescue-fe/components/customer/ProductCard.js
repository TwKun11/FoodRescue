"use client";
import Link from "next/link";
import Badge from "../common/Badge";

/**
 * ProductCard - Hiển thị thẻ sản phẩm trong danh sách / trang chủ
 * @param {object} product - { id, name, image, originalPrice, discountPrice, discountPercent, expiryLabel, storeName }
 */
export default function ProductCard({ product }) {
  const {
    id = "1",
    name = "Sản phẩm mẫu",
    image = "/placeholder-food.jpg",
    originalPrice = 100000,
    discountPrice = 50000,
    discountPercent = 50,
    expiryLabel = "Còn 3 giờ",
    storeName = "Vinmart Q1",
  } = product ?? {};

  return (
    <Link
      href={`/products/${id}`}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group border border-gray-100"
    >
      {/* Image */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = "https://placehold.co/400x300/FFF3E0/E65100?text=Food";
          }}
        />
        <Badge variant="discount" className="absolute top-2 left-2">
          -{discountPercent}%
        </Badge>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-semibold text-gray-800 truncate text-sm">{name}</p>
        <p className="text-xs text-gray-400 mt-0.5">📍 {storeName}</p>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-orange-500 font-bold text-base">{discountPrice.toLocaleString("vi-VN")}đ</span>
          <span className="text-gray-400 line-through text-xs">{originalPrice.toLocaleString("vi-VN")}đ</span>
        </div>

        <p className="text-xs text-red-500 font-medium mt-1">⏰ {expiryLabel}</p>
      </div>
    </Link>
  );
}
