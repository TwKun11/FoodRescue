"use client";

import { useState, useEffect, useCallback } from "react";
import { apiSellerGetOrders, apiSellerUpdateOrderStatus } from "@/lib/api";

const PAGE_SIZE = 10;

const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "pending_payment", label: "Chờ thanh toán" },
  { id: "pending", label: "Chờ xác nhận" },
  { id: "confirmed", label: "Đã xác nhận" },
  { id: "packing", label: "Đang đóng gói" },
  { id: "shipping", label: "Đang giao" },
  { id: "completed", label: "Hoàn thành" },
  { id: "cancelled", label: "Đã hủy" },
];

const STATUS_LABELS = {
  pending_payment: "Chờ thanh toán",
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  packing: "Đang đóng gói",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  refunded: "Hoàn tiền",
};

const STATUS_COLORS = {
  pending_payment: "bg-amber-50 text-amber-700 border border-amber-200",
  pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  confirmed: "bg-blue-50 text-blue-700 border border-blue-200",
  packing: "bg-purple-50 text-purple-700 border border-purple-200",
  shipping: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  completed: "bg-brand-bg text-brand-dark border border-brand/40",
  cancelled: "bg-red-50 text-red-700 border border-red-200",
  refunded: "bg-gray-50 text-gray-600 border border-gray-200",
};

const PAYMENT_LABELS = {
  unpaid: "Chưa thanh toán",
  pending: "Chờ PayOS",
  paid: "Đã thanh toán",
  cancelled: "Đã hủy payment",
  expired: "Payment hết hạn",
  failed: "Payment lỗi",
  refunded: "Đã hoàn tiền",
};

const NEXT_STATUS = {
  pending: "confirmed",
  confirmed: "packing",
  packing: "shipping",
  shipping: "completed",
};

export default function StoreOrdersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [search, setSearch] = useState("");

  const loadOrders = useCallback(
    (nextPage) => {
      setLoading(true);
      const params = { page: nextPage ?? 0, size: PAGE_SIZE };
      if (activeTab !== "all") params.status = activeTab;

      apiSellerGetOrders(params)
        .then((res) => {
          if (res.ok && res.data?.data) {
            const data = res.data.data;
            const content = data.content || data;
            if (Array.isArray(content)) {
              setOrders(content);
              setTotalPages(data.totalPages ?? 1);
              setTotalElements(data.totalElements ?? content.length);
              setPage(nextPage ?? 0);
            }
          }
        })
        .finally(() => setLoading(false));
    },
    [activeTab],
  );

  useEffect(() => {
    queueMicrotask(() => loadOrders(0));
  }, [loadOrders]);

  const handleUpdateStatus = (sellerOrderId, newStatus) => {
    setUpdating(sellerOrderId);
    apiSellerUpdateOrderStatus(sellerOrderId, newStatus)
      .then((res) => {
        if (res.ok) {
          setOrders((prev) => prev.map((order) => (order.id === sellerOrderId ? { ...order, status: newStatus } : order)));
        } else {
          alert("Cập nhật trạng thái thất bại.");
        }
      })
      .finally(() => setUpdating(null));
  };

  const searchLower = (search || "").trim().toLowerCase();
  const filteredOrders = searchLower
    ? orders.filter((order) => {
        const code = (order.orderCode || order.id || "").toString().toLowerCase();
        const payment = (order.paymentStatus || "").toString().toLowerCase();
        return code.includes(searchLower) || payment.includes(searchLower);
      })
    : orders;

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Đơn hàng</h1>
        <p className="text-sm text-gray-500">
          {totalElements} đơn hàng
          {totalPages > 1 && (
            <span className="ml-2 text-gray-400">
              · Trang {page + 1}/{totalPages}
            </span>
          )}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 flex flex-wrap items-center gap-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <span className="text-gray-500 text-sm shrink-0">Tìm kiếm</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Mã đơn, payment status..."
              className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
            />
          </div>
          {search && (
            <button type="button" onClick={() => setSearch("")} className="text-sm text-gray-500 hover:text-gray-700 underline">
              Xóa tìm kiếm
            </button>
          )}
        </div>

        <div className="px-4 pt-2 pb-1">
          <span className="text-gray-500 text-sm">Lọc theo trạng thái</span>
        </div>

        <div className="flex overflow-x-auto border-b border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={
                "px-4 py-3 whitespace-nowrap text-sm font-medium border-b-2 transition " +
                (activeTab === tab.id ? "border-brand text-brand-dark" : "border-transparent text-gray-500 hover:text-gray-700")
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3">Mã đơn</th>
                <th className="text-left px-4 py-3">Sản phẩm</th>
                <th className="text-left px-4 py-3">Doanh thu</th>
                <th className="text-left px-4 py-3">Trạng thái</th>
                <th className="text-left px-4 py-3">Thanh toán</th>
                <th className="text-left px-4 py-3">Ngày tạo</th>
                <th className="text-left px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    Đang tải...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    Chưa có đơn hàng nào.
                  </td>
                </tr>
              ) : null}

              {filteredOrders.map((order) => {
                const statusLabel = STATUS_LABELS[order.status] || order.status;
                const statusColor = STATUS_COLORS[order.status] || "bg-gray-50 text-gray-600 border border-gray-200";
                const nextStatus = NEXT_STATUS[order.status];
                const paymentLabel = PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus || "-";
                const items = order.items || [];

                return (
                  <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">#{order.orderCode || order.id}</td>
                    <td className="px-4 py-3">
                      {items.length > 0 ? (
                        <div className="space-y-1">
                          {items.slice(0, 2).map((item) => (
                            <div key={item.id} className="flex items-center gap-2">
                              <span className="text-gray-700">{item.productName || item.variantName || "-"}</span>
                              <span className="text-gray-400 text-xs">×{item.quantity}</span>
                            </div>
                          ))}
                          {items.length > 2 && <span className="text-gray-400 text-xs">+{items.length - 2} sản phẩm khác</span>}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-brand-dark">
                      {(order.subtotal || 0).toLocaleString("vi-VN")} đồng
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{paymentLabel}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {nextStatus ? (
                        <button
                          disabled={updating === order.id}
                          onClick={() => handleUpdateStatus(order.id, nextStatus)}
                          className="text-xs bg-brand hover:bg-brand-secondary text-gray-900 font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                        >
                          {updating === order.id ? "..." : `Chuyển: ${STATUS_LABELS[nextStatus] || nextStatus}`}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              Hiển thị {orders.length} / {totalElements} đơn hàng
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => loadOrders(page - 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-brand-bg hover:border-brand/50 transition disabled:opacity-40 disabled:pointer-events-none"
              >
                ‹
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-16 text-center">
                {page + 1} / {totalPages}
              </span>
              <button
                disabled={page + 1 >= totalPages}
                onClick={() => loadOrders(page + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-brand-bg hover:border-brand/50 transition disabled:opacity-40 disabled:pointer-events-none"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
