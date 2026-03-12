"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/components/common/Badge";
import Link from "next/link";
import { apiGetAddresses, apiPlaceOrder } from "@/lib/api";

const PAYMENT_METHODS = [
  { id: "cod", label: "Tiền mặt (nhận tại cửa hàng)", icon: "💵", image: null },
  { id: "momo", label: "Ví MoMo", icon: null, image: "/images/banking/momo.jpg" },
  { id: "zalopay", label: "ZaloPay", icon: null, image: "/images/banking/zalopay.jpg" },
  { id: "vnpay", label: "VNPay QR", icon: null, image: "/images/banking/vnpay.jpg" },
  { id: "card", label: "Thẻ tín dụng / Visa", icon: "💳", image: null },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  });
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [note, setNote] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    apiGetAddresses()
      .then((res) => {
        if (res.ok && res.data?.data) {
          const nextAddresses = res.data.data;
          setAddresses(nextAddresses);
          const defaultAddress = nextAddresses.find((item) => item.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(String(defaultAddress.id));
          }
        } else if (res.status === 401) {
          router.replace("/login");
        }
      })
      .finally(() => setAddressesLoading(false));
  }, [router]);

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.price || item.discountPrice || 0) * (item.quantity || 1);
  }, 0);
  const total = subtotal;

  const handlePlaceOrder = () => {
    if (!agreed) return alert("Vui lòng đồng ý với điều khoản dịch vụ");
    if (cartItems.length === 0) return alert("Giỏ hàng trống.");

    setPlacing(true);
    const orderLines = cartItems.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    apiPlaceOrder({
      addressId: selectedAddressId ? Number(selectedAddressId) : null,
      paymentMethod,
      note: note.trim() || null,
      items: orderLines,
    })
      .then((res) => {
        if (res.ok && res.data?.data) {
          setOrderId(res.data.data.orderCode || res.data.data.id || "");
          localStorage.removeItem("cart");
          setPlaced(true);
        } else if (res.status === 401) {
          router.replace("/login");
        } else {
          alert(res.data?.message || "Đặt hàng thất bại.");
        }
      })
      .finally(() => {
        setPlacing(false);
      });
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
            Đơn hàng <span className="font-mono font-bold text-brand-dark">#{orderId || "—"}</span> đã được xác nhận.
          </p>
          <p className="text-gray-500 text-sm mt-1">Bạn có thể theo dõi trạng thái trong mục đơn hàng của tôi.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/orders"
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 bg-brand text-gray-900 font-medium text-sm hover:bg-brand-dark transition"
            >
              Xem đơn hàng
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
          <div className="flex-1 space-y-5">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="font-semibold text-gray-800">📍 Địa chỉ liên hệ</h2>
                <Link href="/profile/addresses" className="text-xs font-medium text-brand-dark hover:underline">
                  Quản lý địa chỉ
                </Link>
              </div>
              {addressesLoading ? (
                <p className="text-sm text-gray-400">Đang tải địa chỉ...</p>
              ) : addresses.length === 0 ? (
                <div className="bg-brand-bg rounded-xl p-4 text-sm border border-brand/20 space-y-2">
                  <p className="font-semibold text-gray-800">Chưa có địa chỉ nào được lưu</p>
                  <p className="text-gray-600 text-xs">
                    Bạn vẫn có thể đặt đơn nhận tại cửa hàng, nhưng nên thêm địa chỉ để lưu thông tin liên hệ cho đơn hàng.
                  </p>
                  <Link href="/profile/addresses" className="inline-flex text-xs font-medium text-brand-dark hover:underline">
                    + Thêm địa chỉ mới
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`block rounded-xl border-2 p-4 cursor-pointer transition ${
                        String(address.id) === selectedAddressId
                          ? "border-brand bg-brand-bg"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={String(address.id) === selectedAddressId}
                          onChange={() => setSelectedAddressId(String(address.id))}
                          className="mt-0.5 accent-brand-dark"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-800">{address.receiverName}</p>
                            <span className="text-sm text-gray-400">{address.receiverPhone}</span>
                            {address.isDefault && (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {address.addressLine}, {address.ward}, {address.district}, {address.province}
                          </p>
                          {address.note && <p className="text-xs text-gray-400 mt-1">Ghi chú: {address.note}</p>}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-800 mb-3">🏪 Nhận hàng</h2>
              <div className="bg-brand-bg rounded-xl p-4 text-sm border border-brand/20">
                <p className="font-semibold text-gray-800">FoodRescue – Click & Collect</p>
                <p className="text-gray-600 mt-1 text-xs">
                  Đơn hàng hiện được xử lý theo hình thức nhận tại cửa hàng. Địa chỉ đã chọn được dùng làm thông tin liên hệ cho đơn hàng.
                </p>
              </div>
            </div>

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
                              Object.assign(fallback.style, {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              });
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
                      <Badge variant="discount" className="shrink-0">
                        Đã chọn
                      </Badge>
                    )}
                  </label>
                ))}
              </div>
            </div>

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

          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24 space-y-4">
              <h2 className="font-bold text-gray-800 pb-3 border-b border-gray-100">Tóm tắt đơn hàng</h2>

              <div className="space-y-3">
                {cartItems.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    Giỏ hàng trống.{" "}
                    <Link href="/products" className="text-brand-dark underline">
                      Mua hàng
                    </Link>
                  </p>
                ) : null}
                {cartItems.map((item) => (
                  <div key={item.variantId} className="flex justify-between text-sm gap-2">
                    <div className="min-w-0">
                      <p className="text-gray-700 font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        x{item.quantity} • {item.storeName || ""}
                      </p>
                    </div>
                    <span className="text-gray-800 font-medium shrink-0">
                      {((item.price || item.discountPrice || 0) * (item.quantity || 1)).toLocaleString("vi-VN")} đồng
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{subtotal.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-2">
                  <span>Tổng cộng</span>
                  <span className="text-brand-dark text-lg">{total.toLocaleString("vi-VN")} đồng</span>
                </div>
                <p className="text-xs text-gray-400">Tổng tiền được đồng bộ với backend theo giá sản phẩm hiện tại.</p>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 accent-brand-dark"
                />
                <span className="text-xs text-gray-500">
                  Tôi đồng ý với <span className="text-brand-dark cursor-pointer hover:underline">điều khoản dịch vụ</span> và{" "}
                  <span className="text-brand-dark cursor-pointer hover:underline">chính sách hoàn tiền</span>.
                </span>
              </label>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={!agreed || placing || cartItems.length === 0}
                className="w-full rounded-xl px-6 py-3 bg-brand text-gray-900 font-medium hover:bg-brand-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {placing ? "Đang đặt hàng..." : "Đặt hàng ngay"}
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
