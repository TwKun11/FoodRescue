"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Badge from "@/components/common/Badge";
import { apiGetAddresses, apiPlaceOrder } from "@/lib/api";
import { clearCheckoutCart, getCheckoutItems, removeCheckoutItemsFromCart } from "@/lib/cart";

const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Thanh toán khi nhận hàng",
    description: "Đặt chỗ tại cửa hàng. Thanh toán khi đến nhận hoặc khi shop hoàn tất quy trình giao.",
    icon: "💵",
  },
  {
    id: "payos",
    label: "Thanh toán qua PayOS",
    description: "Tạo link QR/chuyển khoản ngay sau khi tạo đơn và chờ webhook xác nhận thành công.",
    icon: "🏦",
  },
];

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN") + " đồng";
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems] = useState(() => getCheckoutItems());
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
            return;
          }
          if (nextAddresses[0]) {
            setSelectedAddressId(String(nextAddresses[0].id));
          }
          return;
        }

        if (res.status === 401) {
          router.replace("/login");
        }
      })
      .finally(() => setAddressesLoading(false));
  }, [router]);

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  const originalTotal = cartItems.reduce(
    (sum, item) => sum + Number(item.originalPrice || item.price || 0) * Number(item.quantity || 0),
    0,
  );
  const savings = Math.max(0, originalTotal - subtotal);
  const lineCount = cartItems.length;
  const qtyCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const handlePlaceOrder = () => {
    if (!agreed) {
      window.alert("Vui lòng đồng ý điều khoản trước khi đặt hàng.");
      return;
    }
    if (cartItems.length === 0) {
      window.alert("Không có sản phẩm nào được chọn để thanh toán.");
      return;
    }

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
        const order = res.data?.data;
        if (res.ok && order) {
          if (order.paymentMethod === "payos") {
            if (order.payment?.checkoutUrl) {
              removeCheckoutItemsFromCart(cartItems);
              window.location.assign(order.payment.checkoutUrl);
              return;
            }
            window.alert("Đơn PayOS đã tạo thành công nhưng backend chưa trả checkoutUrl.");
            return;
          }

          removeCheckoutItemsFromCart(cartItems);
          setOrderId(order.orderCode || order.id || "");
          setPlaced(true);
          return;
        }

        if (res.status === 401) {
          router.replace("/login");
          return;
        }

        window.alert(res.data?.message || "Đặt hàng thất bại.");
      })
      .finally(() => {
        setPlacing(false);
      });
  };

  if (placed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-bg px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/20">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Đặt hàng thành công</h2>
          <p className="mt-2 text-sm text-gray-500">
            Đơn hàng <span className="font-mono font-bold text-brand-dark">#{orderId || "-"}</span> đã được tạo.
          </p>
          <p className="mt-1 text-sm text-gray-500">Bạn có thể theo dõi trạng thái trong mục đơn hàng của tôi.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/orders"
              className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-brand-dark"
            >
              Xem đơn hàng
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-xl border border-brand px-5 py-2.5 text-sm font-medium text-brand-dark transition hover:bg-brand-bg"
            >
              Mua tiếp
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-brand-bg px-4 py-12">
        <div className="mx-auto max-w-xl rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293A1 1 0 005.414 17H17"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Không có sản phẩm để thanh toán</h1>
          <p className="mt-2 text-sm text-gray-500">Hãy quay lại giỏ hàng và chọn các món muốn mua trước khi đặt đơn.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/cart"
              className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-3 text-sm font-medium text-gray-900 transition hover:bg-brand-dark"
            >
              Quay lại giỏ hàng
            </Link>
            <button
              type="button"
              onClick={() => {
                clearCheckoutCart();
                router.push("/products");
              }}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Xem sản phẩm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Thanh toán</h1>
          <p className="mt-1 text-sm text-gray-500">Chỉ nhận phần sản phẩm được chọn trong giỏ hàng. Các món khác vẫn giữ nguyên.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="font-semibold text-gray-800">Địa chỉ liên hệ</h2>
                <Link href="/profile/addresses" className="text-xs font-medium text-brand-dark hover:underline">
                  Quản lý địa chỉ
                </Link>
              </div>

              {addressesLoading ? (
                <p className="text-sm text-gray-400">Đang tải địa chỉ...</p>
              ) : addresses.length === 0 ? (
                <div className="rounded-xl border border-brand/20 bg-brand-bg p-4 text-sm">
                  <p className="font-semibold text-gray-800">Chưa có địa chỉ nào được lưu</p>
                  <p className="mt-2 text-xs text-gray-600">
                    Đơn hiện tại theo hình thức click and collect. Địa chỉ được dùng để lưu thông tin liên hệ khi cần.
                  </p>
                  <Link href="/profile/addresses" className="mt-2 inline-flex text-xs font-medium text-brand-dark hover:underline">
                    + Thêm địa chỉ mới
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`block cursor-pointer rounded-xl border-2 p-4 transition ${
                        String(address.id) === selectedAddressId ? "border-brand bg-brand-bg" : "border-gray-200 hover:border-gray-300"
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
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-gray-800">{address.receiverName}</p>
                            <span className="text-sm text-gray-400">{address.receiverPhone}</span>
                            {address.isDefault ? (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">Mặc định</span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            {address.addressLine}, {address.ward}, {address.district}, {address.province}
                          </p>
                          {address.note ? <p className="mt-1 text-xs text-gray-400">Ghi chú: {address.note}</p> : null}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-semibold text-gray-800">Nhận hàng</h2>
              <div className="rounded-xl border border-brand/20 bg-brand-bg p-4 text-sm">
                <p className="font-semibold text-gray-800">FoodRescue - Click and Collect</p>
                <p className="mt-1 text-xs text-gray-600">Đơn được shop xác nhận và chuẩn bị để nhận tại điểm bán.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold text-gray-800">Phương thức thanh toán</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition ${
                      paymentMethod === method.id ? "border-brand bg-brand-bg" : "border-gray-200 bg-white hover:border-gray-300"
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
                    <span className="w-10 shrink-0 text-center text-xl">{method.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-700">{method.label}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{method.description}</p>
                    </div>
                    {paymentMethod === method.id ? (
                      <Badge variant="discount" className="shrink-0">
                        Đã chọn
                      </Badge>
                    ) : null}
                  </label>
                ))}
              </div>

              {paymentMethod === "payos" ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                  Hệ thống tạo đơn ở trạng thái chờ thanh toán và đợi webhook PayOS để chuyển đơn sang chờ xác nhận.
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-semibold text-gray-800">Ghi chú đơn hàng</h2>
              <textarea
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Ví dụ: Gọi trước khi đến, đóng gói riêng từng món..."
                className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-sm xl:sticky xl:top-24">
            <h2 className="border-b border-gray-100 pb-3 text-lg font-bold text-gray-800">Tóm tắt đơn hàng</h2>

            <div className="mt-4 space-y-3">
              {cartItems.map((item) => (
                <div key={item.variantId} className="flex justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-700">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      x{item.quantity}
                      {item.variantName ? ` • ${item.variantName}` : ""}
                      {item.storeName ? ` • ${item.storeName}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 font-medium text-gray-800">
                    {formatCurrency(Number(item.price || 0) * Number(item.quantity || 0))}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-gray-100 pt-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Số dòng sản phẩm</span>
                <span>{lineCount}</span>
              </div>
              <div className="mt-2 flex justify-between text-gray-600">
                <span>Tổng số lượng</span>
                <span>{qtyCount}</span>
              </div>
              <div className="mt-2 flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="mt-2 flex justify-between text-brand-dark">
                <span>Tiết kiệm</span>
                <span>-{formatCurrency(savings)}</span>
              </div>
              <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 text-base font-bold text-gray-900">
                <span>Tổng cộng</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <p className="mt-2 text-xs text-gray-400">Giá trị thanh toán được backend chốt lại theo biến thể và tồn kho hiện tại.</p>
            </div>

            <label className="mt-5 flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                className="mt-0.5 accent-brand-dark"
              />
              <span className="text-xs text-gray-500">
                Tôi đồng ý với điều khoản dịch vụ và chính sách hoàn hủy theo quy định của nền tảng.
              </span>
            </label>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={!agreed || placing || cartItems.length === 0}
              className="mt-5 flex w-full items-center justify-center rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {placing ? (paymentMethod === "payos" ? "Đang tạo link PayOS..." : "Đang đặt hàng...") : paymentMethod === "payos" ? "Đặt hàng và thanh toán PayOS" : "Đặt hàng ngay"}
            </button>

            <Link href="/cart" className="mt-3 block text-center text-sm text-gray-600 transition hover:text-brand-dark">
              ← Quay lại giỏ hàng
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
