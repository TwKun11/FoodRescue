"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiGetMyOrders } from "@/lib/api";

const STATUS_TABS = [
  { id: "all", label: "Tất cả" },
  { id: "pending_payment", label: "Chờ thanh toán" },
  { id: "pending", label: "Chờ xác nhận" },
  { id: "confirmed", label: "Đã xác nhận" },
  { id: "packing", label: "Đang đóng gói" },
  { id: "shipping", label: "Đang giao" },
  { id: "completed", label: "Hoàn thành" },
  { id: "cancelled", label: "Đã hủy" },
];

const STATUS_STYLE = {
  pending_payment: { label: "Chờ thanh toán", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  pending: { label: "Chờ xác nhận", bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-400" },
  confirmed: { label: "Đã xác nhận", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  packing: { label: "Đang đóng gói", bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
  shipping: { label: "Đang giao", bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400" },
  completed: { label: "Hoàn thành", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  cancelled: { label: "Đã hủy", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400" },
};

const PAYMENT_STATUS = {
  unpaid: { label: "Chưa thanh toán", text: "text-red-600" },
  pending: { label: "Đang đợi PayOS", text: "text-amber-600" },
  paid: { label: "Đã thanh toán", text: "text-green-600" },
  cancelled: { label: "Thanh toán đã hủy", text: "text-gray-500" },
  expired: { label: "Thanh toán hết hạn", text: "text-gray-500" },
  failed: { label: "Thanh toán lỗi", text: "text-red-600" },
  refunded: { label: "Đã hoàn tiền", text: "text-gray-500" },
};

function fmt(n) {
  if (n == null) return "-";
  return Number(n).toLocaleString("vi-VN") + " đồng";
}

function fmtDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const load = useCallback(
    (nextPage) => {
      setLoading(true);
      apiGetMyOrders({ page: nextPage, size: 10 })
        .then((res) => {
          if (res.ok && res.data?.data) {
            const data = res.data.data;
            setOrders(data.content || []);
            setTotalPages(data.totalPages || 1);
            setPage(nextPage);
          } else if (res.status === 401) {
            router.replace("/login");
          }
        })
        .finally(() => setLoading(false));
    },
    [router],
  );

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    queueMicrotask(() => load(0));
  }, [load, router]);

  const filtered = activeTab === "all" ? orders : orders.filter((order) => order.status?.toLowerCase() === activeTab);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Đơn hàng của tôi</h1>

      <div className="flex gap-1 flex-wrap mb-5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              activeTab === tab.id ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Đang tải...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🛍️</p>
          <p className="font-semibold text-gray-600">Chưa có đơn hàng nào</p>
          <Link href="/products" className="mt-4 inline-block text-sm text-green-600 hover:underline">
            Khám phá sản phẩm →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const status = STATUS_STYLE[order.status?.toLowerCase()] || {
              label: order.status,
              bg: "bg-gray-50",
              text: "text-gray-600",
              dot: "bg-gray-400",
            };
            const paymentStatus = PAYMENT_STATUS[order.paymentStatus?.toLowerCase()];

            return (
              <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-mono text-sm font-semibold text-gray-700">#{order.orderCode}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{fmtDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                      {status.label}
                    </span>
                    {paymentStatus && <span className={`text-xs font-medium ${paymentStatus.text}`}>{paymentStatus.label}</span>}
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 truncate max-w-[260px]">
                          {item.productName}
                          {item.variantName ? ` · ${item.variantName}` : ""}
                        </span>
                        <span className="text-gray-500 shrink-0 ml-2">
                          x{item.quantity} · {fmt(item.lineTotal)}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs text-gray-400">+{order.items.length - 2} sản phẩm khác</p>
                    )}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-sm">
                    <span className="text-gray-500">Tổng cộng: </span>
                    <span className="font-bold text-gray-800">{fmt(order.totalAmount)}</span>
                  </div>
                  <Link href={`/orders/${order.id}`} className="text-sm text-green-600 font-medium hover:underline">
                    Xem chi tiết →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => load(page - 1)}
            disabled={page === 0}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
          >
            ← Trước
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-600">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => load(page + 1)}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
          >
            Tiếp →
          </button>
        </div>
      )}
    </div>
  );
}
