"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { apiGetOrderDetail } from "@/lib/api";

const STATUS_STEPS = ["pending", "confirmed", "packing", "shipping", "completed"];

const STATUS_LABEL = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  packing: "Đang đóng gói",
  shipping: "Đang giao hàng",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const PAYMENT_METHOD_LABEL = {
  cod: "Thanh toán khi nhận hàng (COD)",
  bank_transfer: "Chuyển khoản ngân hàng",
  e_wallet: "Ví điện tử",
};

const PAYMENT_STATUS_STYLE = {
  unpaid: { label: "Chưa thanh toán", text: "text-red-600", bg: "bg-red-50" },
  paid: { label: "Đã thanh toán", text: "text-green-700", bg: "bg-green-50" },
  refunded: { label: "Đã hoàn tiền", text: "text-gray-600", bg: "bg-gray-50" },
};

function fmt(n) {
  if (n == null) return "—";
  return Number(n).toLocaleString("vi-VN") + "đ";
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

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!id) return;

    apiGetOrderDetail(id)
      .then((res) => {
        if (res.ok && res.data?.data) {
          setOrder(res.data.data);
        } else if (res.status === 401) {
          router.replace("/login");
        } else {
          setError("Không tìm thấy đơn hàng.");
        }
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <div className="text-center py-20 text-gray-400">Đang tải...</div>;
  if (error)
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-3">😕</p>
        <p className="font-semibold text-gray-600">{error}</p>
        <Link href="/orders" className="mt-4 inline-block text-sm text-green-600 hover:underline">
          ← Quay lại đơn hàng
        </Link>
      </div>
    );
  if (!order) return null;

  const status = order.status?.toLowerCase();
  const isCancelled = status === "cancelled";
  const currentStep = STATUS_STEPS.indexOf(status);
  const ps = PAYMENT_STATUS_STYLE[order.paymentStatus?.toLowerCase()];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-green-600 hover:underline mb-6">
        ← Đơn hàng của tôi
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Đơn hàng #{order.orderCode}</h1>
          <p className="text-sm text-gray-400 mt-0.5">Đặt lúc {fmtDate(order.createdAt)}</p>
        </div>
        {ps && <span className={`text-sm font-medium px-3 py-1 rounded-full ${ps.bg} ${ps.text}`}>{ps.label}</span>}
      </div>

      {/* Progress tracker */}
      {!isCancelled ? (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Tiến trình đơn hàng</p>
          <div className="flex items-center gap-0">
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${done ? "bg-green-500 border-green-500 text-white" : "bg-white border-gray-300 text-gray-400"} ${active ? "ring-4 ring-green-100" : ""}`}
                    >
                      {done ? "✓" : i + 1}
                    </div>
                    <span
                      className={`text-[10px] mt-1 text-center leading-tight w-16 ${done ? "text-green-600 font-medium" : "text-gray-400"}`}
                    >
                      {STATUS_LABEL[step]}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-4 mx-1 ${i < currentStep ? "bg-green-400" : "bg-gray-200"}`} />
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

      {/* Order items */}
      <div className="bg-white rounded-xl border border-gray-200 mb-5 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Sản phẩm</p>
        </div>
        <div className="divide-y divide-gray-50">
          {(order.items || []).map((item, i) => (
            <div key={i} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{item.productName}</p>
                {item.variantName && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.variantName} · {item.unit}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm text-gray-500">
                  x{item.quantity} × {fmt(item.unitPrice)}
                </p>
                <p className="text-sm font-bold text-gray-800">{fmt(item.lineTotal)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Tóm tắt thanh toán</p>
        <div className="space-y-2 text-sm">
          <Row label="Tạm tính" value={fmt(order.subtotal)} />
          <Row label="Phí giao hàng" value={fmt(order.shippingFee)} />
          {order.discountAmount > 0 && (
            <Row label="Giảm giá" value={`-${fmt(order.discountAmount)}`} valueClass="text-green-600" />
          )}
          <div className="border-t border-gray-100 pt-2 mt-2">
            <Row label="Tổng cộng" value={fmt(order.totalAmount)} bold />
          </div>
          <Row
            label="Phương thức thanh toán"
            value={PAYMENT_METHOD_LABEL[order.paymentMethod?.toLowerCase()] || order.paymentMethod || "—"}
          />
        </div>
      </div>

      {/* Note */}
      {order.note && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          <span className="font-semibold">Ghi chú: </span>
          {order.note}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold, valueClass }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "font-bold text-gray-800" : "text-gray-500"}>{label}</span>
      <span className={`${bold ? "font-bold text-gray-800" : "text-gray-700"} ${valueClass || ""}`}>{value}</span>
    </div>
  );
}
