"use client";
import { useState } from "react";
import Badge from "../common/Badge";
import Button from "../common/Button";

const STATUS_MAP = {
  pending: { label: "Chờ xác nhận", variant: "status_pending" },
  confirmed: { label: "Đã xác nhận", variant: "status_confirmed" },
  completed: { label: "Hoàn thành", variant: "status_done" },
  cancelled: { label: "Đã hủy", variant: "status_cancelled" },
};

const FILTER_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];

/**
 * OrderTable - Bảng danh sách đơn hàng của cửa hàng
 * @param {Array} orders - danh sách đơn hàng
 * @param {function} onConfirm - callback(orderId)
 */
export default function OrderTable({ orders = [], onConfirm }) {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              filter === opt.value ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-400">{filtered.length} đơn</span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">📦</p>
          <p className="text-sm">Không có đơn hàng nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Tổng tiền</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((order) => {
                const statusInfo = STATUS_MAP[order.status] ?? STATUS_MAP.pending;
                return (
                  <tr key={order.id} className="bg-white hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">#{order.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 max-w-[180px] truncate">{order.productName}</p>
                      <p className="text-gray-400 text-xs">x{order.quantity}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.customerName}</td>
                    <td className="px-4 py-3 font-semibold text-orange-600">{order.total?.toLocaleString("vi-VN")} đồng</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{order.createdAt}</td>
                    <td className="px-4 py-3">
                      {order.status === "pending" && (
                        <Button size="sm" variant="green" onClick={() => onConfirm?.(order.id)}>
                          ✓ Xác nhận
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
