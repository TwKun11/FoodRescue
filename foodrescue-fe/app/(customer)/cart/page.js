// FE02-004 – UI Giỏ hàng
"use client";
import { useState } from "react";
import CartItem from "@/components/customer/CartItem";
import Button from "@/components/common/Button";
import Link from "next/link";

// ── Mock Data ─────────────────────────────────────────────────────────────
const INIT_CART = [
  {
    id: "1",
    name: "Rau cải xanh hữu cơ 500g",
    image: "https://placehold.co/80x80/e8f5e9/2e7d32?text=Rau",
    originalPrice: 35000,
    discountPrice: 17500,
    storeName: "Vinmart Q1",
    expiryLabel: "Còn 3 giờ",
    quantity: 2,
  },
  {
    id: "3",
    name: "Tôm sú tươi 200g",
    image: "https://placehold.co/80x80/e3f2fd/0d47a1?text=Tôm",
    originalPrice: 120000,
    discountPrice: 84000,
    storeName: "Lotte Mart Q7",
    expiryLabel: "Còn 2 giờ",
    quantity: 1,
  },
  {
    id: "4",
    name: "Bánh mì sandwich nguyên cám",
    image: "https://placehold.co/80x80/fff8e1/e65100?text=Bánh",
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🛒 Giỏ hàng</h1>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">🛒</p>
          <p className="text-gray-500 text-lg">Giỏ hàng trống</p>
          <Link href="/products" className="mt-4 inline-block text-orange-500 font-medium hover:underline">
            Tiếp tục mua sắm →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">{items.length} sản phẩm</p>
              <button onClick={() => setItems([])} className="text-xs text-red-400 hover:text-red-600 transition">
                🗑 Xóa tất cả
              </button>
            </div>

            {items.map((item) => (
              <CartItem key={item.id} item={item} onRemove={handleRemove} onQtyChange={handleQtyChange} />
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-20">
              <h2 className="font-bold text-gray-800 text-lg mb-4">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{subtotal.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Tiết kiệm được</span>
                  <span>-{savings.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>
                    Phí dịch vụ
                    <span className="ml-1 text-xs text-gray-400">(3%)</span>
                  </span>
                  <span>{serviceFee.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
                  <span>Tổng cộng</span>
                  <span className="text-orange-500 text-lg">{total.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link href="/checkout">
                  <Button variant="primary" size="lg" fullWidth>
                    Tiến hành thanh toán →
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="ghost" size="md" fullWidth>
                    ← Tiếp tục mua sắm
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-xs text-gray-400">
                <p>✅ Hoàn tiền nếu sản phẩm không đảm bảo chất lượng</p>
                <p>🔒 Thanh toán an toàn & bảo mật</p>
                <p>⏰ Nhận hàng trong hôm nay</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
