// FE02-004 – UI Giỏ hàng (đồng bộ brand, hiển thị ảnh)
"use client";
import { useState } from "react";
import CartItem from "@/components/customer/CartItem";
import Link from "next/link";

// Mock data — ảnh từ public/images/products/
const INIT_CART = [
  {
    id: "1",
    name: "Rau cải xanh hữu cơ 500g",
    image: "/images/products/raucai.jpg",
    originalPrice: 35000,
    discountPrice: 17500,
    storeName: "Vinmart Q1",
    expiryLabel: "Còn 3 giờ",
    quantity: 2,
  },
  {
    id: "3",
    name: "Tôm sú tươi 200g",
    image: "/images/products/tomsu.jpg",
    originalPrice: 120000,
    discountPrice: 84000,
    storeName: "Lotte Mart Q7",
    expiryLabel: "Còn 2 giờ",
    quantity: 1,
  },
  {
    id: "4",
    name: "Bánh mì sandwich nguyên cám",
    image: "/images/products/banhmi.jpg",
    originalPrice: 45000,
    discountPrice: 22500,
    storeName: "BreadTalk",
    expiryLabel: "Còn 1 giờ",
    quantity: 3,
  },
];

const SERVICE_FEE_RATE = 0.03; // 3%

export default function CartPage() {
  const [items, setItems] = useState(INIT_CART);

  const handleRemove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const handleQtyChange = (id, newQty) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i)));
  };

  const subtotal = items.reduce((sum, i) => sum + i.discountPrice * i.quantity, 0);
  const originalTotal = items.reduce((sum, i) => sum + i.originalPrice * i.quantity, 0);
  const savings = originalTotal - subtotal;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + serviceFee;

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Giỏ hàng</h1>
        <p className="text-gray-500 text-sm mb-6">Kiểm tra sản phẩm và tiến hành thanh toán.</p>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16 px-4">
            <div className="w-20 h-20 rounded-full bg-brand/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-brand-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-700 font-medium">Giỏ hàng trống</p>
            <p className="text-gray-500 text-sm mt-1">Thêm sản phẩm ưu đãi từ cửa hàng nhé.</p>
            <Link
              href="/products"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-gray-900 font-medium text-sm hover:bg-brand-dark transition"
            >
              Tiếp tục mua sắm
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Danh sách sản phẩm */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">{items.length}</span> sản phẩm trong giỏ
                </p>
                <button
                  onClick={() => setItems([])}
                  className="text-xs text-red-500 hover:text-red-600 font-medium transition flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Xóa tất cả
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} onRemove={handleRemove} onQtyChange={handleQtyChange} />
                ))}
              </div>
            </div>

            {/* Tóm tắt đơn hàng */}
            <div className="w-full lg:w-96 shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
                <h2 className="font-bold text-gray-800 text-lg mb-4 pb-3 border-b border-gray-100">Tóm tắt đơn hàng</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span className="font-medium text-gray-800">{subtotal.toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between text-brand-dark">
                    <span>Tiết kiệm</span>
                    <span className="font-medium">-{savings.toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>
                      Phí dịch vụ
                      <span className="ml-1 text-gray-400">(3%)</span>
                    </span>
                    <span>{serviceFee.toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="border-t border-gray-100 pt-4 mt-4 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Tổng cộng</span>
                    <span className="text-xl font-bold text-brand-dark">{total.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Link
                    href="/checkout"
                    className="flex items-center justify-center w-full rounded-xl px-6 py-3 bg-brand text-gray-900 font-medium hover:bg-brand-dark transition focus:outline-none focus:ring-2 focus:ring-brand/50"
                  >
                    Tiến hành thanh toán
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link
                    href="/products"
                    className="flex items-center justify-center w-full rounded-xl px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition"
                  >
                    ← Tiếp tục mua sắm
                  </Link>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-500">
                  <p className="flex items-center gap-2">
                    <span className="text-brand-dark">✓</span> Hoàn tiền nếu sản phẩm không đảm bảo
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-brand-dark">✓</span> Thanh toán an toàn & bảo mật
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-brand-dark">✓</span> Nhận hàng trong ngày
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
