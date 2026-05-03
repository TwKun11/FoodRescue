"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiGetMyOrders } from "@/lib/api";

const PAGE_SIZE = 5;

const STATUS_TABS = [
  { id: "all", label: "Tất cả" },
  { id: "pending_payment", label: "Chờ thanh toán" },
  { id: "pending", label: "Chờ xác nhận" },
  { id: "confirmed", label: "Đã xác nhận" },
  { id: "completed", label: "Hoàn thành" },
  { id: "cancelled", label: "Đã hủy" },
];

const STATUS_STYLE = {
  pending_payment: { label: "Chờ thanh toán", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  pending: { label: "Chờ xác nhận", bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-400" },
  confirmed: { label: "Đã xác nhận", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
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

function formatMoney(value) {
  if (value == null) return "-";
  return `${Number(value).toLocaleString("vi-VN")} đồng`;
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getOrderSortTime(order) {
  return new Date(order?.createdAt || 0).getTime();
}

function sortOrdersNewestFirst(items) {
  return [...items].sort((left, right) => getOrderSortTime(right) - getOrderSortTime(left));
}

function ProductThumb({ item }) {
  const imageUrl = item?.primaryImageUrl;

  return (
    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={item?.productName || "Sản phẩm"}
          className="w-full h-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
            const fallback = event.currentTarget.parentElement?.querySelector("[data-fallback='true']");
            if (fallback) fallback.classList.remove("hidden");
          }}
        />
      ) : null}
      <div
        data-fallback="true"
        className={`w-full h-full items-center justify-center text-gray-400 text-xs ${imageUrl ? "hidden" : "flex"}`}
      >
        Chưa có ảnh
      </div>
    </div>
  );
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
      apiGetMyOrders({ page: nextPage, size: PAGE_SIZE })
        .then((res) => {
          if (res.ok && res.data?.data) {
            const data = res.data.data;
            setOrders(sortOrdersNewestFirst(data.content || []));
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

  const filteredOrders = useMemo(
    () => (activeTab === "all" ? orders : orders.filter((order) => order.status?.toLowerCase() === activeTab)),
    [activeTab, orders],
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Đơn hàng của tôi</h1>
          <p className="text-sm text-gray-500 mt-1">Mỗi trang hiển thị 5 đơn, bố cục ưu tiên ảnh sản phẩm.</p>
        </div>
        {totalPages > 1 && (
          <p className="text-sm text-gray-400">
            Trang {page + 1} / {totalPages}
          </p>
        )}
      </div>

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
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🛍️</p>
          <p className="font-semibold text-gray-600">Chưa có đơn hàng nào</p>
          <Link href="/products" className="mt-4 inline-block text-sm text-green-600 hover:underline">
            Khám phá sản phẩm →
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => {
            const status = STATUS_STYLE[order.status?.toLowerCase()] || {
              label: order.status,
              bg: "bg-gray-50",
              text: "text-gray-600",
              dot: "bg-gray-400",
            };
            const paymentStatus = PAYMENT_STATUS[order.paymentStatus?.toLowerCase()];

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/70 flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-mono text-sm font-semibold text-gray-700">#{order.orderCode}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                      {status.label}
                    </span>
                    {paymentStatus && (
                      <span className={`text-xs font-medium ${paymentStatus.text}`}>{paymentStatus.label}</span>
                    )}
                  </div>
                </div>

                <div className="px-5 py-4 space-y-4">
                  {(order.items || []).slice(0, 2).map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <ProductThumb item={item} />
                        <div className="min-w-0 flex-1 pt-1">
                          <p className="text-[15px] font-semibold text-gray-800 line-clamp-2">{item.productName}</p>
                          {item.variantName && <p className="text-sm text-gray-500 mt-1">{item.variantName}</p>}
                          <p className="text-sm text-gray-500 mt-2">Số lượng: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 pt-1">
                        <p className="text-sm font-semibold text-brand-dark">{formatMoney(item.lineTotal)}</p>
                        {order.status?.toLowerCase() === "completed" && (
                          <Link
                            href={`/products/${item.productId}?tab=reviews`}
                            className="inline-flex mt-3 px-3 py-1.5 text-xs bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition font-medium whitespace-nowrap"
                          >
                            Đánh giá
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}

                  {(order.items || []).length > 2 && (
                    <p className="text-sm text-gray-400">+{order.items.length - 2} sản phẩm khác</p>
                  )}
                </div>

                <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap bg-white">
                  <div className="text-sm">
                    <span className="text-gray-500">Tổng cộng: </span>
                    <span className="font-bold text-[15px] text-gray-900">{formatMoney(order.totalAmount)}</span>
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
