// FE02-005 – UI Thanh toán (đồng bộ brand, ảnh từ images/banking)
"use client";
import { useState } from "react";
import Badge from "@/components/common/Badge";
import Link from "next/link";

// Mock order
const ORDER_ITEMS = [
  { id: "1", name: "Rau cải xanh hữu cơ 500g", discountPrice: 17500, quantity: 2, storeName: "Vinmart Q1" },
  { id: "3", name: "Tôm sú tươi 200g", discountPrice: 84000, quantity: 1, storeName: "Lotte Mart Q7" },
  { id: "4", name: "Bánh mì sandwich nguyên cám", discountPrice: 22500, quantity: 3, storeName: "BreadTalk" },
];

// Ảnh Momo, ZaloPay, VNPay từ public/images/banking
const PAYMENT_METHODS = [
  { id: "cod", label: "Tiền mặt (nhận tại cửa hàng)", icon: "💵", image: null },
  { id: "momo", label: "Ví MoMo", icon: null, image: "/images/banking/momo.jpg" },
  { id: "zalopay", label: "ZaloPay", icon: null, image: "/images/banking/zalopay.jpg" },
  { id: "vnpay", label: "VNPay QR", icon: null, image: "/images/banking/vnpay.jpg" },
  { id: "card", label: "Thẻ tín dụng / Visa", icon: "💳", image: null },
];

const SERVICE_FEE_RATE = 0.03;

// Mock danh sách voucher (mã → { type: 'percent'|'fixed', value, label })
const VOUCHERS = {
  FOOD10: { type: "percent", value: 10, label: "Giảm 10% đơn hàng" },
  FOOD20: { type: "percent", value: 20, label: "Giảm 20% đơn hàng" },
  GIAM20K: { type: "fixed", value: 20000, label: "Giảm 20.000đ" },
  GIAM50K: { type: "fixed", value: 50000, label: "Giảm 50.000đ" },
};

// Danh sách voucher hiển thị để chọn từ hệ thống
const AVAILABLE_VOUCHERS = Object.entries(VOUCHERS).map(([code, v]) => ({ code, ...v }));

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [note, setNote] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState("");

  const subtotal = ORDER_ITEMS.reduce((s, i) => s + i.discountPrice * i.quantity, 0);
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const beforeVoucher = subtotal + serviceFee;

  const voucherDiscount = appliedVoucher
    ? appliedVoucher.type === "percent"
      ? Math.round(beforeVoucher * (appliedVoucher.value / 100))
      : Math.min(appliedVoucher.value, beforeVoucher)
    : 0;
  const total = Math.max(0, beforeVoucher - voucherDiscount);

  const applyVoucherByCode = (code) => {
    setVoucherError("");
    const c = (code || voucherInput.trim()).toUpperCase();
    if (!c) {
      setVoucherError("Vui lòng nhập mã voucher");
      return;
    }
    const v = VOUCHERS[c];
    if (!v) {
      setVoucherError("Mã không hợp lệ hoặc đã hết hạn");
      return;
    }
    setAppliedVoucher({ code: c, ...v });
    setVoucherInput("");
  };

  const handleApplyVoucher = () => applyVoucherByCode(voucherInput.trim());

  const handleSelectVoucher = (code) => applyVoucherByCode(code);

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherError("");
  };

  const handlePlaceOrder = () => {
    if (!agreed) return alert("Vui lòng đồng ý với điều khoản dịch vụ");
    setPlaced(true);
  };

  if (placed) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Đặt hàng thành công!</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Đơn hàng <span className="font-mono font-bold text-brand-dark">#FR{Date.now().toString().slice(-6)}</span> đã được xác nhận.
          </p>
          <p className="text-gray-500 text-sm mt-1">Vui lòng đến cửa hàng để nhận sản phẩm trước khi hết hạn.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 bg-brand text-gray-900 font-medium text-sm hover:bg-brand-dark transition"
            >
              Về trang chủ
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 border border-brand text-brand-dark font-medium text-sm hover:bg-brand-bg transition"
            >
              Mua tiếp
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Thanh toán</h1>
        <p className="text-gray-500 text-sm mb-6">Chọn phương thức thanh toán và xác nhận đơn hàng.</p>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cột trái: Nhận hàng + Phương thức thanh toán + Ghi chú */}
          <div className="flex-1 space-y-5">
            {/* Nhận hàng tại cửa hàng */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-800 mb-3">📍 Nhận hàng tại cửa hàng</h2>
              <div className="bg-brand-bg rounded-xl p-4 text-sm border border-brand/20">
                <p className="font-semibold text-gray-800">FoodRescue – Click & Collect</p>
                <p className="text-gray-600 mt-1 text-xs">
                  Đặt hàng online → đến cửa hàng cụ thể để nhận trong ngày. Mang theo mã đơn khi đến nhận.
                </p>
              </div>
            </div>

            {/* Phương thức thanh toán — ảnh từ images/banking cho Momo, ZaloPay, VNPay */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-800 mb-4">Chọn phương thức thanh toán</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                      paymentMethod === method.id
                        ? "border-brand bg-brand-bg"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="accent-brand-dark"
                    />
                    {method.image ? (
                      <div className="w-12 h-10 rounded-lg overflow-hidden bg-gray-50 shrink-0 flex items-center justify-center relative">
                        <img
                          src={method.image}
                          alt={method.label}
                          className="object-contain w-full h-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            const fallback = e.target.parentElement?.querySelector(".payment-fallback");
                            if (fallback) {
                              fallback.classList.remove("hidden");
                              Object.assign(fallback.style, { display: "flex", alignItems: "center", justifyContent: "center" });
                            }
                          }}
                        />
                        <span className="payment-fallback hidden absolute inset-0 text-lg">💳</span>
                      </div>
                    ) : (
                      <span className="text-xl w-10 text-center shrink-0">{method.icon}</span>
                    )}
                    <span className="text-sm font-medium text-gray-700 flex-1">{method.label}</span>
                    {paymentMethod === method.id && (
                      <Badge variant="discount" className="shrink-0">Đã chọn</Badge>
                    )}
                  </label>
                ))}
              </div>

              {paymentMethod === "momo" && (
                <div className="mt-3 bg-brand-bg rounded-xl p-3 text-xs text-gray-700 border border-brand/20">
                  📱 Quét mã QR MoMo tại bước xác nhận. SĐT MoMo: <strong>0901 234 567</strong>
                </div>
              )}
              {(paymentMethod === "zalopay" || paymentMethod === "vnpay") && (
                <div className="mt-3 bg-brand-bg rounded-xl p-3 text-xs text-gray-700 border border-brand/20">
                  📱 Bạn sẽ được chuyển đến trang thanh toán để quét QR hoặc nhập thông tin.
                </div>
              )}
              {paymentMethod === "card" && (
                <div className="mt-3 space-y-2">
                  <input
                    placeholder="Số thẻ"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                  <div className="flex gap-2">
                    <input
                      placeholder="MM/YY"
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                    />
                    <input
                      placeholder="CVV"
                      className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Ghi chú */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-800 mb-3">📝 Ghi chú đơn hàng</h2>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Đóng gói riêng từng món, gọi trước khi đến..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none"
              />
            </div>
          </div>

          {/* Cột phải: Review đơn hàng */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24 space-y-4">
              <h2 className="font-bold text-gray-800 pb-3 border-b border-gray-100">Tóm tắt đơn hàng</h2>

              <div className="space-y-3">
                {ORDER_ITEMS.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm gap-2">
                    <div className="min-w-0">
                      <p className="text-gray-700 font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">x{item.quantity} • {item.storeName}</p>
                    </div>
                    <span className="text-gray-800 font-medium shrink-0">
                      {(item.discountPrice * item.quantity).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                ))}
              </div>

              {/* Mã voucher: nhập hoặc chọn từ hệ thống */}
              <div className="border-t border-gray-100 pt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Mã voucher</p>
                {appliedVoucher ? (
                  <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-brand-bg border border-brand/20">
                    <div>
                      <p className="text-sm font-semibold text-brand-dark">{appliedVoucher.code}</p>
                      <p className="text-xs text-gray-600">{appliedVoucher.label}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      className="text-xs text-red-500 hover:text-red-600 font-medium shrink-0"
                    >
                      Xóa
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherInput}
                        onChange={(e) => { setVoucherInput(e.target.value); setVoucherError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyVoucher()}
                        placeholder="Nhập mã giảm giá"
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                      />
                      <button
                        type="button"
                        onClick={handleApplyVoucher}
                        className="shrink-0 rounded-xl px-4 py-2 text-sm font-medium bg-brand text-gray-900 hover:bg-brand-dark transition"
                      >
                        Áp dụng
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-500 shrink-0">Hoặc chọn:</span>
                      <select
                        value=""
                        onChange={(e) => {
                          const code = e.target.value;
                          if (code) handleSelectVoucher(code);
                          e.target.value = "";
                        }}
                        className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white"
                      >
                        <option value="">Chọn voucher từ hệ thống...</option>
                        {AVAILABLE_VOUCHERS.map((v) => (
                          <option key={v.code} value={v.code}>
                            {v.code} – {v.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                {voucherError && <p className="text-xs text-red-500 mt-1">{voucherError}</p>}
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{subtotal.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí dịch vụ (3%)</span>
                  <span>{serviceFee.toLocaleString("vi-VN")}đ</span>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between text-brand-dark">
                    <span>Voucher ({appliedVoucher.code})</span>
                    <span>-{voucherDiscount.toLocaleString("vi-VN")}đ</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 pt-2">
                  <span>Tổng cộng</span>
                  <span className="text-brand-dark text-lg">{total.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 accent-brand-dark"
                />
                <span className="text-xs text-gray-500">
                  Tôi đồng ý với{" "}
                  <span className="text-brand-dark cursor-pointer hover:underline">điều khoản dịch vụ</span> và{" "}
                  <span className="text-brand-dark cursor-pointer hover:underline">chính sách hoàn tiền</span>.
                </span>
              </label>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={!agreed}
                className="w-full rounded-xl px-6 py-3 bg-brand text-gray-900 font-medium hover:bg-brand-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Đặt hàng ngay
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>

              <Link
                href="/cart"
                className="block text-center text-sm text-gray-600 hover:text-brand-dark transition py-2"
              >
                ← Quay lại giỏ hàng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
