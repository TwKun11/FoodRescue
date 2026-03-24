"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiGetOrderDetail, apiSyncOrderPayment } from "@/lib/api";

function formatRemaining(seconds) {
  if (seconds == null) return null;

  const total = Math.max(0, Number(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) return `Còn lại khoảng ${hours} giờ ${minutes} phút`;
  if (minutes > 0) return `Còn lại khoảng ${minutes} phút`;
  if (secs > 0) return `Còn lại khoảng ${secs} giây`;
  return "Đã đến hạn xử lý";
}

function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase();
}

function getPaymentSummary(order) {
  const paymentStatus = normalizeStatus(order?.paymentStatus);
  const orderStatus = normalizeStatus(order?.status);

  if (paymentStatus === "paid") {
    return {
      tone: "green",
      title: "Thanh toán thành công",
      description: "Đơn hàng đã được ghi nhận và chuyển sang trạng thái chờ cửa hàng xác nhận.",
    };
  }

  if (paymentStatus === "cancelled") {
    return {
      tone: "red",
      title: "Giao dịch đã bị hủy",
      description: "PayOS đã trả về kết quả hủy giao dịch. Đơn hàng này sẽ không tiếp tục xử lý.",
    };
  }

  if (paymentStatus === "expired") {
    return {
      tone: "red",
      title: "Giao dịch đã hết hạn",
      description: "Quá thời gian thanh toán nên đơn đã được đánh dấu hết hạn.",
    };
  }

  if (paymentStatus === "failed") {
    return {
      tone: "red",
      title: "Thanh toán thất bại",
      description: "Gateway đã trả về trạng thái thất bại. Vui lòng kiểm tra lại trước khi đặt đơn mới.",
    };
  }

  if (paymentStatus === "pending" || orderStatus === "pending_payment") {
    return {
      tone: "amber",
      title: "Đang chờ đối soát thanh toán",
      description: "Hệ thống đang đồng bộ trạng thái từ PayOS để xử lý các trường hợp timeout hoặc phản hồi chậm.",
    };
  }

  return {
    tone: "slate",
    title: "Đã nhận phản hồi từ PayOS",
    description: "Bạn có thể mở chi tiết đơn hàng để kiểm tra trạng thái mới nhất.",
  };
}

function toneClasses(tone) {
  switch (tone) {
    case "green":
      return "border-green-200 bg-green-50 text-green-800";
    case "red":
      return "border-red-200 bg-red-50 text-red-800";
    case "amber":
      return "border-amber-200 bg-amber-50 text-amber-800";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default function PayOSReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(orderId));

  const loadOrder = useCallback(
    async ({ silent = false } = {}) => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      if (!silent) setLoading(true);

      try {
        let res = await apiSyncOrderPayment(orderId);
        if (!res.ok) {
          res = await apiGetOrderDetail(orderId);
        }

        if (res.ok && res.data?.data) {
          setOrder(res.data.data);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [orderId],
  );

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    void loadOrder();
  }, [loadOrder, router]);

  const summary = useMemo(() => getPaymentSummary(order), [order]);

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-12">
      <div className="mx-auto max-w-xl rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand/20">
          <span className="text-2xl">🏦</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">Đã quay lại từ PayOS</h1>
        <p className="mt-2 text-sm text-gray-600">
          Trang này chủ động đối soát lại trạng thái thanh toán để xử lý các trường hợp webhook đến chậm, timeout
          hoặc người dùng đóng gateway giữa chừng.
        </p>

        <div className={`mt-5 rounded-xl border p-4 text-sm ${toneClasses(summary.tone)}`}>
          <p className="font-semibold">{summary.title}</p>
          <p className="mt-1">{summary.description}</p>
        </div>

        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          {loading ? (
            <p>Đang tải thông tin đơn hàng...</p>
          ) : order ? (
            <div className="space-y-1">
              <p>
                Đơn hàng: <span className="font-mono font-semibold">#{order.orderCode}</span>
              </p>
              <p>Trạng thái đơn: {order.status || "-"}</p>
              <p>Trạng thái thanh toán: {order.paymentStatus || "-"}</p>
              {order.payment?.failureReason ? <p>Lý do lỗi: {order.payment.failureReason}</p> : null}
              {order.payment?.remainingSeconds != null ? (
                <p>Thời gian còn lại: {formatRemaining(order.payment.remainingSeconds)}</p>
              ) : null}
            </div>
          ) : (
            <p>Không đọc được thông tin đơn hàng. Bạn có thể mở lại trong mục đơn hàng của tôi.</p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {orderId ? (
            <Link
              href={`/orders/${orderId}`}
              className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-brand-dark"
            >
              Xem chi tiết đơn hàng
            </Link>
          ) : (
            <Link
              href="/orders"
              className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-brand-dark"
            >
              Đơn hàng của tôi
            </Link>
          )}

          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-xl border border-brand px-5 py-2.5 text-sm font-medium text-brand-dark transition hover:bg-brand-bg"
          >
            Tiếp tục mua hàng
          </Link>
        </div>
      </div>
    </div>
  );
}
