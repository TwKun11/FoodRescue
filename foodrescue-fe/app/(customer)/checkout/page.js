"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Badge from "@/components/common/Badge";
import VoucherPanel from "@/components/customer/VoucherPanel";
import { apiGetAddresses, apiGetMyVouchers, apiGetVoucherStore, apiPlaceOrder, apiPreviewVoucher } from "@/lib/api";
import { clearCheckoutCart, getCheckoutItems, removeCheckoutItemsFromCart } from "@/lib/cart";

const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Thanh toán khi nhận hàng",
    subtitle: "COD",
    helper: "Khả dụng",
    enabled: true,
    tileClass: "border border-amber-200 bg-amber-100 text-amber-700",
    shortLabel: "COD",
  },
  {
    id: "payos",
    label: "PayOS",
    subtitle: "QR / Chuyển khoản",
    helper: "Cần cấu hình API key",
    enabled: true,
    tileClass: "border border-emerald-200 bg-emerald-100 text-emerald-700",
    shortLabel: "PO",
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
        <p className={`${compact ? "text-sm" : "text-lg"} font-black tracking-[0.2em]`}>{method.shortLabel || "PM"}</p>
        {!compact ? <p className="text-[10px] font-semibold uppercase tracking-[0.24em]">{method.subtitle}</p> : null}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [note, setNote] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [myVouchers, setMyVouchers] = useState([]);
  const [eligibleVouchers, setEligibleVouchers] = useState([]);
  const [voucherOptionsLoading, setVoucherOptionsLoading] = useState(false);
  const [voucherLoadHint, setVoucherLoadHint] = useState("");
  const [voucherPreview, setVoucherPreview] = useState({
    loading: false,
    discountAmount: 0,
    finalTotal: null,
    error: "",
  });
  const isClient = useSyncExternalStore(
    subscribeClientSnapshot,
    () => true,
    () => false,
  );

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

    Promise.all([apiGetMyVouchers(), apiGetVoucherStore()]).then(([myRes, storeRes]) => {
      const myList = myRes.ok ? (myRes.data?.data || []) : [];
      const storeClaimedList = storeRes.ok ? (storeRes.data?.data || []).filter((item) => item.claimed) : [];

      const mergedMap = new Map();
      [...myList, ...storeClaimedList].forEach((item) => {
        if (!item?.code) return;
        const existing = mergedMap.get(item.code);
        if (!existing) {
          mergedMap.set(item.code, item);
          return;
        }
        // Prefer item from /my because it usually has the latest user-voucher status.
        if (existing.claimed !== true && item.claimed === true) {
          mergedMap.set(item.code, item);
        }
      });

      const merged = Array.from(mergedMap.values()).filter((item) => !item.usedAt);
      setMyVouchers(merged);

      if (merged.length === 0) {
        setVoucherLoadHint("Bạn chưa có voucher đã nhận.");
      } else if (myList.length === 0 && storeClaimedList.length > 0) {
        setVoucherLoadHint(`Đã tải ${merged.length} voucher từ kho voucher.`);
      } else {
        setVoucherLoadHint("");
      }
    });
  }, [router]);

  const items = isClient ? getCheckoutItems() : [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  const originalTotal = items.reduce(
    (sum, item) => sum + Number(item.originalPrice || item.price || 0) * Number(item.quantity || 0),
    0,
  );
  const savings = Math.max(0, originalTotal - subtotal);
  const voucherCodeTrimmed = voucherCode.trim();
  const lineCount = items.length;
  const qtyCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const selectedAddress = addresses.find((address) => String(address.id) === selectedAddressId) || null;
  const selectedProvince = selectedAddress?.province || "";
  const voucherDiscount = Number(voucherPreview.discountAmount || 0);
  const finalTotal = Math.max(0, subtotal - voucherDiscount);
  const selectedPayment = PAYMENT_METHODS.find((method) => method.id === paymentMethod) ?? PAYMENT_METHODS[0];

  useEffect(() => {
    const fromQuery = (searchParams.get("voucher") || "").trim().toUpperCase();
    const fromStorage = typeof window !== "undefined"
      ? (localStorage.getItem("checkoutVoucherCode") || "").trim().toUpperCase()
      : "";
    const prefill = fromQuery || fromStorage;
    if (prefill && !voucherCodeTrimmed) {
      setVoucherCode(prefill);
    }
    if (fromStorage && typeof window !== "undefined") {
      localStorage.removeItem("checkoutVoucherCode");
    }
  }, [searchParams, voucherCodeTrimmed]);

  useEffect(() => {
    if (myVouchers.length === 0 || subtotal <= 0) {
      setEligibleVouchers([]);
      return;
    }

    let cancelled = false;
    setVoucherOptionsLoading(true);

    Promise.all(
      myVouchers.map(async (voucher) => {
        const res = await apiPreviewVoucher({
          code: voucher.code,
          orderValue: subtotal,
          totalQuantity: qtyCount,
          province: selectedProvince || undefined,
        });
        if (res.ok && res.data?.data) {
          return {
            id: voucher.id,
            code: voucher.code,
            name: voucher.name,
            discountAmount: Number(res.data.data.discountAmount || 0),
            finalTotal: Number(res.data.data.finalTotal || 0),
          };
        }
        return null;
      }),
    )
      .then((results) => {
        if (cancelled) return;
        const nextEligible = results
          .filter(Boolean)
          .sort((a, b) => (b.discountAmount || 0) - (a.discountAmount || 0));
        setEligibleVouchers(nextEligible);
      })
      .finally(() => {
        if (!cancelled) {
          setVoucherOptionsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [myVouchers, subtotal, qtyCount, selectedProvince, voucherCodeTrimmed]);

  useEffect(() => {
    if (!voucherCodeTrimmed) {
      setVoucherPreview({ loading: false, discountAmount: 0, finalTotal: null, error: "" });
      return;
    }
    if (subtotal <= 0) {
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      setVoucherPreview((prev) => ({ ...prev, loading: true, error: "" }));
      apiPreviewVoucher({
        code: voucherCodeTrimmed,
        orderValue: subtotal,
        totalQuantity: qtyCount,
        province: selectedProvince || undefined,
      })
        .then((res) => {
          if (cancelled) return;
          if (res.ok && res.data?.data) {
            setVoucherPreview({
              loading: false,
              discountAmount: Number(res.data.data.discountAmount || 0),
              finalTotal: Number(res.data.data.finalTotal || 0),
              error: "",
            });
            return;
          }
          setVoucherPreview({
            loading: false,
            discountAmount: 0,
            finalTotal: null,
            error: res.data?.message || "Mã voucher chưa áp dụng được.",
          });
        })
        .catch(() => {
          if (cancelled) return;
          setVoucherPreview({
            loading: false,
            discountAmount: 0,
            finalTotal: null,
            error: "Không thể kiểm tra voucher lúc này.",
          });
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [voucherCodeTrimmed, subtotal, qtyCount, selectedProvince]);

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
      voucherCode: voucherCodeTrimmed || null,
      items: orderLines,
    })
      .then((res) => {
        const order = res.data?.data;
        if (res.ok && order) {
          if (voucherCodeTrimmed) {
            window.dispatchEvent(new Event("voucher-wallet-updated"));
          }
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
          <p className="mt-2 text-sm text-gray-500">
            Hãy quay lại giỏ hàng và chọn các món muốn mua trước khi đặt đơn.
          </p>
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
          <Badge variant="default" className="w-fit bg-amber-100 px-3 py-1 text-amber-700">
            COD đang khả dụng
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
                  <Link
                    href="/profile/addresses"
                    className="mt-2 inline-flex text-xs font-medium text-brand-dark hover:underline"
                  >
                    + Thêm địa chỉ mới
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`block cursor-pointer rounded-xl border-2 p-4 transition ${
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
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-gray-800">{address.receiverName}</p>
                            <span className="text-sm text-gray-400">{address.receiverPhone}</span>
                            {address.isDefault ? (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                                Mặc định
                              </span>
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
                  <p className="mt-1 text-sm text-gray-500">COD đang hoạt động. PayOS cần cấu hình API key để sử dụng.</p>
                </div>
                <Badge variant="default" className="w-fit bg-slate-100 text-slate-600">
                  2 phương thức đang mở
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
                        <Badge
                          variant="default"
                          className={method.enabled ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}
                        >
                          {method.helper}
                        </Badge>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              <p className="mt-4 text-xs text-gray-400">
                MoMo và VNPay sẽ được mở khi backend có luồng thanh toán thật.
              </p>
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

            <VoucherPanel
              voucherCode={voucherCode}
              setVoucherCode={setVoucherCode}
              voucherCodeTrimmed={voucherCodeTrimmed}
              voucherPreview={voucherPreview}
              voucherDiscount={voucherDiscount}
              voucherOptionsLoading={voucherOptionsLoading}
              myVouchers={myVouchers}
              eligibleVouchers={eligibleVouchers}
              voucherLoadHint={voucherLoadHint}
              formatCurrency={formatCurrency}
            />

            <div className="hidden mt-4 rounded-2xl border border-gray-100 bg-white p-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-brand-dark">Voucher áp dụng</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(event) => setVoucherCode(event.target.value.toUpperCase())}
                  placeholder="Nhập mã voucher"
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm uppercase transition focus:outline-none focus:ring-2 ${
                    voucherPreview.error
                      ? "border-red-300 bg-red-50 text-red-700 focus:border-red-400 focus:ring-red-200"
                      : voucherDiscount > 0
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800 focus:border-emerald-400 focus:ring-emerald-200"
                        : "border-gray-200 focus:border-brand focus:ring-brand/30"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setVoucherCode("")}
                  disabled={!voucherCodeTrimmed && !voucherPreview.loading}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Xóa
                </button>
              </div>
              {voucherCodeTrimmed ? (
                <div
                  className={`mt-2 rounded-xl border px-3 py-2 text-xs ${
                    voucherPreview.loading
                      ? "border-slate-200 bg-slate-50 text-slate-600"
                      : voucherPreview.error
                        ? "border-red-200 bg-red-50 text-red-700"
                        : voucherDiscount > 0
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}
                >
                  {voucherPreview.loading
                    ? `Đang kiểm tra mã ${voucherCodeTrimmed}...`
                    : voucherPreview.error
                      ? voucherPreview.error
                      : voucherDiscount > 0
                        ? `Áp dụng thành công. Giảm ${formatCurrency(voucherDiscount)}`
                        : "Mã voucher chưa tạo ra giảm giá hợp lệ."}
                </div>
              ) : null}
              <select
                value={voucherCode}
                onChange={(event) => setVoucherCode(event.target.value)}
                className="hidden"
              >
                <option value="">Không dùng voucher</option>
                {voucherCodeTrimmed && !eligibleVouchers.some((voucher) => String(voucher.code).toUpperCase() === voucherCodeTrimmed.toUpperCase()) ? (
                  <option value={voucherCodeTrimmed}>
                    {voucherCodeTrimmed} - Äang kiá»ƒm tra Ä‘iá»u kiá»‡n
                  </option>
                ) : null}
                {eligibleVouchers.map((voucher) => (
                  <option key={voucher.code} value={voucher.code}>
                    {voucher.code} - {voucher.name} (giảm {formatCurrency(voucher.discountAmount)})
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-500">
                {voucherOptionsLoading
                  ? "Đang tìm voucher phù hợp với sản phẩm và địa chỉ đã chọn..."
                  : myVouchers.length > 0
                    ? `Đã nhận ${myVouchers.length} voucher, có ${eligibleVouchers.length} voucher đủ điều kiện.`
                    : "Bạn chưa nhận voucher nào."}
              </p>
              {voucherLoadHint ? <p className="mt-1 text-xs text-amber-700">{voucherLoadHint}</p> : null}
              {eligibleVouchers.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {eligibleVouchers.map((voucher) => {
                    const active = String(voucher.code).toUpperCase() === voucherCodeTrimmed.toUpperCase();
                    return (
                      <button
                        key={voucher.code}
                        type="button"
                        onClick={() => setVoucherCode(String(voucher.code || "").toUpperCase())}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                          active
                            ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                            : "border-gray-200 bg-white text-gray-700 hover:border-emerald-200 hover:bg-emerald-50"
                        }`}
                      >
                        {voucher.code} - giảm {formatCurrency(voucher.discountAmount)}
                      </button>
                    );
                  })}
                </div>
              ) : null}
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
              {voucherCodeTrimmed ? (
                <>
                  <div className="mt-2 flex justify-between text-emerald-700">
                    <span>Voucher</span>
                    <span>{voucherPreview.loading ? "Đang kiểm tra..." : `Đang áp: ${voucherCodeTrimmed}`}</span>
                  </div>
                  {voucherDiscount > 0 ? (
                    <div className="mt-2 flex justify-between text-emerald-700">
                      <span>Giảm voucher</span>
                      <span>-{formatCurrency(voucherDiscount)}</span>
                    </div>
                  ) : null}
                  {voucherPreview.error ? (
                    <p className="mt-2 text-xs text-red-500">{voucherPreview.error}</p>
                  ) : null}
                </>
              ) : null}
              <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 text-base font-bold text-gray-900">
                <span>Tổng cộng</span>
                <span>{formatCurrency(voucherPreview.finalTotal != null ? voucherPreview.finalTotal : finalTotal)}</span>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Giá trị thanh toán được backend chốt lại theo biến thể và tồn kho hiện tại.
              </p>
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
              {placing
                ? "Đang tạo đơn..."
                : paymentMethod === "payos"
                  ? "Tạo đơn và chuyển sang PayOS"
                  : "Tạo đơn COD"}
            </button>

            <Link
              href="/cart"
              className="mt-3 block text-center text-sm text-gray-600 transition hover:text-brand-dark"
            >
              ← Quay lại giỏ hàng
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
