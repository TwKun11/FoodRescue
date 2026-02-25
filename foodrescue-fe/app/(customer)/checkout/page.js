// FE02-005 – UI Thanh toán
"use client";
import { useState } from "react";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Link from "next/link";

// ── Mock Order ─────────────────────────────────────────────────────────────
const ORDER_ITEMS = [
  { id: "1", name: "Rau cải xanh hữu cơ 500g", discountPrice: 17500, quantity: 2, storeName: "Vinmart Q1" },
  { id: "3", name: "Tôm sú tươi 200g", discountPrice: 84000, quantity: 1, storeName: "Lotte Mart Q7" },
  { id: "4", name: "Bánh mì sandwich nguyên cám", discountPrice: 22500, quantity: 3, storeName: "BreadTalk" },
];

const PAYMENT_METHODS = [
  { id: "cod", label: "Tiền mặt (nhận tại cửa hàng)", icon: "💵" },
  { id: "momo", label: "Ví MoMo", icon: "🟣" },
  { id: "zalopay", label: "ZaloPay", icon: "🔵" },
  { id: "vnpay", label: "VNPay QR", icon: "🏦" },
  { id: "card", label: "Thẻ tín dụng / Visa", icon: "💳" },
];

const SERVICE_FEE_RATE = 0.03;

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [note, setNote] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [placed, setPlaced] = useState(false);

  const subtotal = ORDER_ITEMS.reduce((s, i) => s + i.discountPrice * i.quantity, 0);
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + serviceFee;

  const handlePlaceOrder = () => {
    if (!agreed) return alert("Vui lòng đồng ý với điều khoản dịch vụ");
    setPlaced(true);
  };

  if (placed) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800">Đặt hàng thành công!</h2>
        <p className="text-gray-500 mt-2 text-sm">
          Đơn hàng <span className="font-mono font-bold text-orange-600">#FR{Date.now().toString().slice(-6)}</span> đã
          được xác nhận.
        </p>
        <p className="text-gray-500 text-sm mt-1">Vui lòng đến cửa hàng để nhận sản phẩm trước khi hết hạn.</p>
        <div className="mt-8 flex gap-3 justify-center">
          <Link href="/">
            <Button variant="primary">Về trang chủ</Button>
          </Link>
          <Link href="/products">
            <Button variant="secondary">Mua tiếp</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">💳 Thanh toán</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Payment Options */}
        <div className="flex-1 space-y-5">
          {/* Pickup Info */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-3">📍 Nhận hàng tại cửa hàng</h2>
            <div className="bg-orange-50 rounded-xl p-3 text-sm text-orange-800">
              <p className="font-semibold">FoodRescue – Click & Collect</p>
              <p className="text-xs mt-1 text-orange-600">
                Đặt hàng online → đến cửa hàng cụ thể để nhận trong ngày. Mang theo mã đơn khi đến nhận.
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4">💰 Chọn phương thức thanh toán</h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                    paymentMethod === method.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="accent-orange-500"
                  />
                  <span className="text-xl">{method.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{method.label}</span>
                  {paymentMethod === method.id && (
                    <Badge variant="discount" className="ml-auto">
                      Đã chọn
                    </Badge>
                  )}
                </label>
              ))}
            </div>

            {paymentMethod === "momo" && (
              <div className="mt-3 bg-purple-50 rounded-xl p-3 text-xs text-purple-700">
                📱 Quét mã QR MoMo tại bước xác nhận. SĐT MoMo: <strong>0901 234 567</strong>
              </div>
            )}
            {paymentMethod === "card" && (
              <div className="mt-3 space-y-2">
                <input
                  placeholder="Số thẻ"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                <div className="flex gap-2">
                  <input
                    placeholder="MM/YY"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <input
                    placeholder="CVV"
                    className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Note */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-3">📝 Ghi chú đơn hàng</h2>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Đóng gói riêng từng món, gọi trước khi đến..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
            />
          </div>
        </div>

        {/* Right: Order Review */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-20 space-y-4">
            <h2 className="font-bold text-gray-800">📋 Review đơn hàng</h2>

            {/* Items */}
            <div className="space-y-3">
              {ORDER_ITEMS.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="min-w-0">
                    <p className="text-gray-700 font-medium truncate max-w-[160px]">{item.name}</p>
                    <p className="text-xs text-gray-400">
                      x{item.quantity} • {item.storeName}
                    </p>
                  </div>
                  <span className="text-gray-800 font-medium shrink-0 ml-2">
                    {(item.discountPrice * item.quantity).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Tạm tính</span>
                <span>{subtotal.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Phí dịch vụ (3%)</span>
                <span>{serviceFee.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-1">
                <span>Tổng cộng</span>
                <span className="text-orange-500 text-lg">{total.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>

            {/* Agreement */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 accent-orange-500"
              />
              <span className="text-xs text-gray-500">
                Tôi đồng ý với{" "}
                <span className="text-orange-500 cursor-pointer hover:underline">điều khoản dịch vụ</span> và{" "}
                <span className="text-orange-500 cursor-pointer hover:underline">chính sách hoàn tiền</span>.
              </span>
            </label>

            <Button variant="primary" size="lg" fullWidth onClick={handlePlaceOrder} disabled={!agreed}>
              ✅ Đặt hàng ngay
            </Button>

            <Link href="/cart">
              <Button variant="ghost" size="sm" fullWidth>
                ← Quay lại giỏ hàng
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
