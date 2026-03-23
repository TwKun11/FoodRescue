"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Badge from "@/components/common/Badge";
import { apiGetAddresses, apiPlaceOrder } from "@/lib/api";
import { clearCheckoutCart, getCheckoutItems, removeCheckoutItemsFromCart } from "@/lib/cart";

const PAYMENT_METHODS = [
  {
    id: "payos",
    label: "PayOS",
    subtitle: "QR / Chuyển khoản",
    helper: "Đang hoạt động",
    enabled: true,
    tileClass: "border border-emerald-200 bg-emerald-100 text-emerald-700",
  },
  {
    id: "momo",
    label: "MoMo",
    subtitle: "Ví điện tử",
    helper: "Sắp hỗ trợ",
    enabled: false,
    logoSrc: "/images/banking/momo.jpg",
  },
  {
    id: "vnpay",
    label: "VNPay",
    subtitle: "QR / Ngân hàng",
    helper: "Sắp hỗ trợ",
    enabled: false,
    logoSrc: "/images/banking/vnpay.jpg",
  },
];

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN") + " đồng";
}

function subscribeClientSnapshot() {
  return () => {};
}

function PaymentLogo({ method, compact = false }) {
  const sizeClass = compact ? "h-12 w-14 rounded-xl" : "h-14 w-24 rounded-2xl";

  if (method.logoSrc) {
    return (
      <div className={`relative overflow-hidden border border-gray-200 bg-white ${sizeClass}`}>
        <Image
          src={method.logoSrc}
          alt={method.label}
          fill
          sizes={compact ? "44px" : "(max-width: 1024px) 160px, 220px"}
          className="object-contain p-2"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${sizeClass} ${method.tileClass}`}>
      <div className="text-center">
        <p className={`${compact ? "text-sm" : "text-lg"} font-black tracking-[0.2em]`}>PO</p>
        {!compact ? <p className="text-[10px] font-semibold uppercase tracking-[0.24em]">PayOS</p> : null}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("payos");
  const [note, setNote] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [placing, setPlacing] = useState(false);
  const isClient = useSyncExternalStore(subscribeClientSnapshot, () => true, () => false);

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

  const items = isClient ? getCheckoutItems() : [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  const originalTotal = items.reduce(
    (sum, item) => sum + Number(item.originalPrice || item.price || 0) * Number(item.quantity || 0),
    0,
  );
  const savings = Math.max(0, originalTotal - subtotal);
  const lineCount = items.length;
  const qtyCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const selectedPayment = PAYMENT_METHODS.find((method) => method.id === paymentMethod) ?? PAYMENT_METHODS[0];

  const handlePlaceOrder = () => {
    if (!selectedPayment?.enabled) {
      window.alert("Phương thức thanh toán này chưa khả dụng.");
      return;
    }
    if (!agreed) {
      window.alert("Vui lòng đồng ý điều khoản trước khi đặt hàng.");
      return;
    }
    if (items.length === 0) {
      window.alert("Không có sản phẩm nào được chọn để thanh toán.");
      return;
    }

    setPlacing(true);
    const orderLines = items.map((item) => ({
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
              removeCheckoutItemsFromCart(items);
              window.location.assign(order.payment.checkoutUrl);
              return;
            }
            window.alert("Đơn PayOS đã tạo thành công nhưng backend chưa trả checkoutUrl.");
            return;
          }

          removeCheckoutItemsFromCart(items);
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

  if (!isClient) {
    return (
      <div className="min-h-screen bg-brand-bg px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-gray-700">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

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

  if (items.length === 0) {
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
        <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-white/70 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-dark">Checkout</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Thanh toán</h1>
            <p className="mt-1 text-sm text-gray-500">Chọn cổng thanh toán và xác nhận đơn.</p>
          </div>
          <Badge variant="default" className="w-fit bg-emerald-100 px-3 py-1 text-emerald-700">
            PayOS đang hoạt động
          </Badge>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-dark">Bước 1</p>
                  <h2 className="font-semibold text-gray-800">Địa chỉ liên hệ</h2>
                </div>
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
              <div className="mb-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-dark">Bước 2</p>
                <h2 className="font-semibold text-gray-800">Nhận hàng</h2>
              </div>
              <div className="rounded-xl border border-brand/20 bg-brand-bg p-4 text-sm">
                <p className="font-semibold text-gray-800">FoodRescue - Click and Collect</p>
                <p className="mt-1 text-xs text-gray-600">Đơn được shop xác nhận và chuẩn bị để nhận tại điểm bán.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-dark">Bước 3</p>
                  <h2 className="text-base font-semibold text-gray-800">Phương thức thanh toán</h2>
                  <p className="mt-1 text-sm text-gray-500">PayOS dùng được. MoMo và VNPay chỉ hiển thị.</p>
                </div>
                <Badge variant="default" className="w-fit bg-slate-100 text-slate-600">
                  1 cổng đang mở
                </Badge>
              </div>

              <div className="mt-4 space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`relative flex items-center gap-4 rounded-2xl border p-4 transition ${
                      method.enabled ? "cursor-pointer" : "cursor-not-allowed opacity-75"
                    } ${
                      paymentMethod === method.id
                        ? "border-brand bg-brand-bg shadow-[0_0_0_1px_rgba(193,154,107,0.15)]"
                        : method.enabled
                          ? "border-gray-200 bg-white hover:border-gray-300"
                          : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => {
                        if (method.enabled) {
                          setPaymentMethod(method.id);
                        }
                      }}
                      disabled={!method.enabled}
                      className="sr-only"
                    />

                    <div className="shrink-0">
                      <PaymentLogo method={method} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold text-gray-800">{method.label}</p>
                      <p className="mt-1 text-sm text-gray-500">{method.subtitle}</p>
                    </div>

                    <div className="flex shrink-0 items-center">
                      {paymentMethod === method.id ? (
                        <Badge variant="discount" className="shrink-0">
                          Đang được chọn
                        </Badge>
                      ) : (
                        <Badge variant="default" className={method.enabled ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}>
                          {method.helper}
                        </Badge>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              <p className="mt-4 text-xs text-gray-400">MoMo và VNPay sẽ được mở khi backend có luồng thanh toán thật.</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-dark">Bước 4</p>
                <h2 className="font-semibold text-gray-800">Ghi chú đơn hàng</h2>
              </div>
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

            <div className="mt-4 rounded-2xl border border-brand/20 bg-brand-bg p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-dark">Thanh toán đang chọn</p>
              <div className="mt-3 flex items-start gap-3">
                <PaymentLogo method={selectedPayment} compact />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{selectedPayment.label}</p>
                  <p className="mt-1 text-xs leading-5 text-gray-600">{selectedPayment.subtitle}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {items.map((item) => (
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
              disabled={!agreed || placing || items.length === 0 || !selectedPayment?.enabled}
              className="mt-5 flex w-full items-center justify-center rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {placing ? "Đang tạo đơn và mở PayOS..." : "Tạo đơn và chuyển sang PayOS"}
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
