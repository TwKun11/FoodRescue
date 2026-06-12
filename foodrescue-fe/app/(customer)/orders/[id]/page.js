"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { apiGetOrderDetail } from "@/lib/api";
import ViolationReportForm from "@/components/customer/ViolationReportForm";

const STATUS_STEPS = ["pending_payment", "pending", "confirmed", "completed"];

const STATUS_LABEL = {
  pending_payment: "Chờ thanh toán",
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const PAYMENT_METHOD_LABEL = {
  cod: "Thanh toán khi nhận hàng",
  payos: "PayOS",
  bank_transfer: "Chuyển khoản ngân hàng",
  momo: "Ví MoMo",
  zalopay: "ZaloPay",
  vnpay: "VNPay QR",
  card: "Thẻ tín dụng / Visa",
};

const PAYMENT_STATUS_STYLE = {
  unpaid: { label: "Chưa thanh toán", text: "text-red-600", bg: "bg-red-50" },
  pending: { label: "Đang đợi PayOS", text: "text-amber-700", bg: "bg-amber-50" },
  paid: { label: "Đã thanh toán", text: "text-green-700", bg: "bg-green-50" },
  cancelled: { label: "Thanh toán đã hủy", text: "text-gray-600", bg: "bg-gray-50" },
  expired: { label: "Thanh toán hết hạn", text: "text-gray-600", bg: "bg-gray-50" },
  failed: { label: "Thanh toán lỗi", text: "text-red-700", bg: "bg-red-50" },
  refunded: { label: "Đã hoàn tiền", text: "text-gray-600", bg: "bg-gray-50" },
};

function fmt(n) {
  if (n == null) return "-";
  return Number(n).toLocaleString("vi-VN") + " đồng";
}

function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRemaining(seconds) {
  if (seconds == null) return null;

  const total = Math.max(0, Number(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) return `Con lai khoang ${hours} gio ${minutes} phut`;
  if (minutes > 0) return `Con lai khoang ${minutes} phut`;
  if (secs > 0) return `Con lai khoang ${secs} giay`;
  return "Da den han xu ly";
}

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrder = useCallback(
    async ({ silent = false } = {}) => {
      if (!id) return;

      if (!silent) {
        setLoading(true);
      }

      try {
        const res = await apiGetOrderDetail(id);
        if (res.ok && res.data?.data) {
          setOrder(res.data.data);
          setError("");
        } else if (res.status === 401) {
          router.replace("/login");
        } else if (!silent) {
          setError("Khong tim thay don hang.");
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [id, router],
  );

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!id) return;

    void loadOrder();
  }, [id, loadOrder, router]);

  if (loading) return <div className="text-center py-20 text-gray-400">Đang tải...</div>;
  if (error)
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-4xl mb-3">😕</p>
        <p className="font-semibold text-gray-600">{error}</p>
        <Link href="/orders" className="mt-4 inline-block text-sm text-green-600 hover:underline">
          ← Quay lại đơn hàng
        </Link>
      </div>
    );
  if (!order) return null;

  const items = order.items || [];
  const { subtotalBeforeDiscount, totalAfterDiscount } = items.reduce(
    (acc, item) => {
      const qty = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      const listPrice = item.listPrice != null ? Number(item.listPrice) : null;
      const originalUnitPrice = listPrice != null && listPrice > 0 ? listPrice : unitPrice;
      const lineTotal = Number(item.lineTotal) || unitPrice * qty;
      acc.subtotalBeforeDiscount += originalUnitPrice * qty;
      acc.totalAfterDiscount += lineTotal;
      return acc;
    },
    { subtotalBeforeDiscount: 0, totalAfterDiscount: 0 },
  );
  const discountAmountDisplay = Math.max(0, subtotalBeforeDiscount - totalAfterDiscount);

  const status = order.status?.toLowerCase();
  const paymentStatus = order.paymentStatus?.toLowerCase();
  const isCancelled = status === "cancelled";
  const currentStep = STATUS_STEPS.indexOf(status);
  const paymentStyle = PAYMENT_STATUS_STYLE[paymentStatus];
  const showPayOSLink =
    order.paymentMethod?.toLowerCase() === "payos" && paymentStatus === "pending" && order.payment?.checkoutUrl;

  return (
    <div className="max-w-5xl mx-auto px-6 sm:px-8 py-10">
      <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-green-600 hover:underline mb-6">
        ← Đơn hàng của tôi
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Đơn hàng #{order.orderCode}</h1>
          <p className="text-sm text-gray-400 mt-0.5">Đặt lúc {fmtDate(order.createdAt)}</p>
        </div>
        {paymentStyle && (
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${paymentStyle.bg} ${paymentStyle.text}`}>
            {paymentStyle.label}
          </span>
        )}
      </div>

      {!isCancelled ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Tiến trình đơn hàng</p>
          <div className="flex items-center gap-0 overflow-x-auto">
            {STATUS_STEPS.map((step, index) => {
              const done = currentStep >= 0 && index <= currentStep;
              const active = index === currentStep;
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none min-w-[72px]">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${
                        done ? "bg-green-500 border-green-500 text-white" : "bg-white border-gray-300 text-gray-400"
                      } ${active ? "ring-4 ring-green-100" : ""}`}
                    >
                      {done ? "✓" : index + 1}
                    </div>
                    <span
                      className={`text-[10px] mt-1 text-center leading-tight w-16 ${
                        done ? "text-green-600 font-medium" : "text-gray-400"
                      }`}
                    >
                      {STATUS_LABEL[step]}
                    </span>
                  </div>
                  {index < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-4 mx-1 ${index < currentStep ? "bg-green-400" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-center gap-3">
          <span className="text-2xl">❌</span>
          <div>
            <p className="font-semibold text-red-700">Đơn hàng đã bị hủy</p>
            {order.cancelledAt && <p className="text-xs text-red-500 mt-0.5">Lúc {fmtDate(order.cancelledAt)}</p>}
          </div>
        </div>
      )}

      {showPayOSLink && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-semibold text-amber-800">Đơn hàng đang đợi thanh toán PayOS</p>
            <p className="text-sm text-amber-700 mt-1">
              Thanh toán xong, hệ thống sẽ đợi webhook và chuyển đơn sang trạng thái chờ xác nhận.
            </p>
            <p className="text-xs text-amber-700 mt-2">
              Backend se tu dong dong bo trang thai thanh toan tu DB va PayOS.
            </p>
            {order.payment?.remainingSeconds != null && (
              <p className="text-xs text-amber-700 mt-2">
                Thoi gian con lai: {formatRemaining(order.payment.remainingSeconds)}
              </p>
            )}
            {order.payment?.expiresAt && (
              <p className="text-xs text-amber-700 mt-2">Hết hạn lúc: {fmtDate(order.payment.expiresAt)}</p>
            )}
          </div>
          <a
            href={order.payment.checkoutUrl}
            className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition"
          >
            Tiếp tục thanh toán
          </a>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Sản phẩm</p>
        </div>
        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
                <th className="text-left py-2 pr-2 w-[38%]">Sản phẩm</th>
                <th className="text-center py-2 px-2 w-[8%]">SL</th>
                <th className="text-right py-2 px-2 w-[14%]">Giá gốc</th>
                <th className="text-right py-2 px-2 w-[14%]">Giá ưu đãi</th>
                <th className="text-right py-2 pl-2 pr-5 w-[26%] min-w-[110px]">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item) => {
                const qty = Number(item.quantity) || 0;
                const unitPrice = Number(item.unitPrice) || 0;
                const listPrice = item.listPrice != null ? Number(item.listPrice) : null;
                const originalUnitPrice = listPrice != null && listPrice > 0 ? listPrice : unitPrice;
                const hasDiscount = listPrice != null && listPrice > 0 && unitPrice > 0 && unitPrice < listPrice;
                const lineTotal = Number(item.lineTotal) || unitPrice * qty;
                return (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-4 pr-3 text-gray-800 align-top break-words">
                      <p className="font-medium">{item.productName || item.variantName || "—"}</p>
                      {item.variantName && item.variantName !== (item.productName || "") && (
                        <p className="text-xs text-gray-400 mt-0.5">{item.variantName}</p>
                      )}
                      {item.productId && (
                        <div className="mt-2">
                          <ViolationReportForm
                            productId={item.productId}
                            triggerLabel="Report vi pham"
                            compact
                          />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center text-gray-600">{qty}</td>
                    <td className="py-3 px-2 text-right text-gray-500">
                      {hasDiscount ? (
                        <span className="line-through">{originalUnitPrice.toLocaleString("vi-VN")}₫</span>
                      ) : (
                        <span>{originalUnitPrice.toLocaleString("vi-VN")}₫</span>
                      )}
                    </td>
                    <td className="py-4 px-2 text-right">
                      {hasDiscount ? (
                        <span className="text-green-600 font-semibold">{unitPrice.toLocaleString("vi-VN")}₫</span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-4 pl-2 pr-5 text-right font-semibold text-gray-800">
                      {lineTotal.toLocaleString("vi-VN")}₫
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Tóm tắt thanh toán</p>
        <div className="space-y-2 text-sm">
          <Row label="Tổng tiền (trước giảm)" value={fmt(order.subtotal)} />
          {(Number(order.discountAmount) || 0) > 0 && (
            <Row
              label="Tiền được giảm"
              value={`−${(Number(order.discountAmount) || 0).toLocaleString("vi-VN")}₫`}
              valueClass="text-green-600"
            />
          )}
          <div className="border-t border-gray-100 pt-2 mt-2">
            <Row label="Tổng sau giảm" value={fmt(order.totalAmount)} bold />
          </div>
          <Row
            label="Phương thức thanh toán"
            value={PAYMENT_METHOD_LABEL[order.paymentMethod?.toLowerCase()] || order.paymentMethod || "-"}
          />
          {order.paidAt && <Row label="Thanh toán lúc" value={fmtDate(order.paidAt)} />}
          {order.payment?.providerOrderCode && <Row label="Mã PayOS" value={String(order.payment.providerOrderCode)} />}
        </div>
      </div>

      {order.note && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 mb-5">
          <span className="font-semibold">Ghi chú: </span>
          {order.note}
        </div>
      )}

      {order.payment?.failureReason && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700">
          <span className="font-semibold">Lý do payment gateway: </span>
          {order.payment.failureReason}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold, valueClass }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={bold ? "font-bold text-gray-800" : "text-gray-500"}>{label}</span>
      <span className={`${bold ? "font-bold text-gray-800" : "text-gray-700"} text-right ${valueClass || ""}`}>
        {value}
      </span>
    </div>
  );
}
