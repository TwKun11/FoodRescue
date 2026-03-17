"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiGetOrderDetail } from "@/lib/api";

export default function PayOSReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(orderId));

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    if (!orderId) return;

    apiGetOrderDetail(orderId)
      .then((res) => {
        if (res.ok && res.data?.data) {
          setOrder(res.data.data);
        }
      })
      .finally(() => setLoading(false));
  }, [orderId, router]);

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
