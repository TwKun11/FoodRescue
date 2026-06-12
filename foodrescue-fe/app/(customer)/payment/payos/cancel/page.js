"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiGetOrderDetail, apiSyncOrderPayment } from "@/lib/api";

function normalizeStatus(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export default function PayOSCancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [loading, setLoading] = useState(() => Boolean(orderId));
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    if (!orderId) {
      setLoading(false);
      return;
    }

    let active = true;

    async function load() {
      try {
        let res = await apiSyncOrderPayment(orderId);
        if (!res.ok) {
          res = await apiGetOrderDetail(orderId);
        }
        if (active && res.ok && res.data?.data) {
          setOrder(res.data.data);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [orderId, router]);

  const paymentStatus = normalizeStatus(order?.paymentStatus);
  const isCancelled = paymentStatus === "cancelled" || paymentStatus === "expired" || paymentStatus === "failed";

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-12">
      <div className="mx-auto max-w-xl rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <span className="text-2xl">↩️</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">Bạn đã thoát khỏi PayOS</h1>
        <p className="mt-2 text-sm text-gray-600">
          Hệ thống đã kiểm tra lại giao dịch để tránh các trường hợp người dùng thoát giữa chừng nhưng gateway vẫn trả
          trạng thái sau đó.
        </p>

        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          {loading ? (
            <p>Đang đồng bộ trạng thái thanh toán...</p>
          ) : order ? (
            <div className="space-y-1">
              <p>
                Đơn hàng: <span className="font-mono font-semibold">#{order.orderCode}</span>
              </p>
              <p>Trạng thái đơn: {order.status || "-"}</p>
              <p>Trạng thái thanh toán: {order.paymentStatus || "-"}</p>
              {order.payment?.failureReason ? <p>Lý do: {order.payment.failureReason}</p> : null}
            </div>
          ) : (
            <p>Chưa lấy được trạng thái đơn hàng. Bạn có thể mở lại trong danh sách đơn hàng để kiểm tra.</p>
          )}
        </div>

        <div
          className={`mt-5 rounded-xl border p-4 text-sm ${
            isCancelled ? "border-red-200 bg-red-50 text-red-800" : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          {isCancelled
            ? "Đơn hàng đã được đánh dấu hủy. Trường hợp double payment hoặc thanh toán muộn sẽ bị bỏ qua."
            : "Giao dịch có thể vẫn đang chờ đối soát. Nếu PayOS xác nhận thành công, trạng thái sẽ được cập nhật ở trang chi tiết đơn hàng."}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {orderId ? (
            <Link
              href={`/orders/${orderId}`}
              className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-brand-dark"
            >
              Mở lại đơn hàng
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
