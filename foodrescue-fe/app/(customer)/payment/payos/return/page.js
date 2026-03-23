"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiGetOrderDetail } from "@/lib/api";

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

      if (!silent) {
        setLoading(true);
      }

      try {
        const res = await apiGetOrderDetail(orderId);
        if (res.ok && res.data?.data) {
          setOrder(res.data.data);
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
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

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-12">
      <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="w-14 h-14 rounded-full bg-brand/20 flex items-center justify-center mb-4">
          <span className="text-2xl">🏦</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Đã quay lại từ PayOS</h1>
        <p className="text-sm text-gray-600 mt-2">
          Hệ thống sẽ cập nhật đơn hàng sau khi webhook PayOS được xác minh. Nếu payment thành công, đơn sẽ chuyển sang
          trạng thái chờ xác nhận.
        </p>
        {order?.paymentMethod?.toLowerCase() === "payos" && order?.paymentStatus?.toLowerCase() === "pending" && (
          <p className="text-xs text-amber-700 mt-2">Backend se tu dong dong bo trang thai thanh toan tu DB va PayOS.</p>
        )}

        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          {loading ? (
            <p>Đang tải thông tin đơn hàng...</p>
          ) : order ? (
            <div className="space-y-1">
              <p>
                Đơn hàng: <span className="font-mono font-semibold">#{order.orderCode}</span>
              </p>
              <p>Trạng thái đơn: {order.status || "-"}</p>
              <p>Trạng thái payment: {order.paymentStatus || "-"}</p>
              {order.payment?.remainingSeconds != null && <p>Thoi gian con lai: {formatRemaining(order.payment.remainingSeconds)}</p>}
            </div>
          ) : (
            <p>Không đọc được thông tin đơn hàng. Bạn có thể mở lại trong mục đơn hàng của tôi.</p>
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {orderId ? (
            <Link
              href={`/orders/${orderId}`}
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 bg-brand text-gray-900 font-medium text-sm hover:bg-brand-dark transition"
            >
              Xem chi tiết đơn hàng
            </Link>
          ) : (
            <Link
              href="/orders"
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 bg-brand text-gray-900 font-medium text-sm hover:bg-brand-dark transition"
            >
              Đơn hàng của tôi
            </Link>
          )}
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 border border-brand text-brand-dark font-medium text-sm hover:bg-brand-bg transition"
          >
            Tiếp tục mua hàng
          </Link>
        </div>
      </div>
    </div>
  );
}
