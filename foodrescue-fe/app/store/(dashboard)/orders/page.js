// FE03-004 – UI Danh sách đơn hàng
"use client";
import { useState } from "react";
import OrderTable from "@/components/store/OrderTable";
import Button from "@/components/common/Button";

// ── Mock Data ─────────────────────────────────────────────────────────────
const INIT_ORDERS = [
  {
    id: "FR001234",
    productName: "Rau cải xanh hữu cơ 500g",
    quantity: 2,
    customerName: "Nguyễn An",
    total: 35000,
    status: "pending",
    createdAt: "14:32 – 24/02",
  },
  {
    id: "FR001235",
    productName: "Tôm sú tươi 200g",
    quantity: 1,
    customerName: "Trần Bình",
    total: 84000,
    status: "confirmed",
    createdAt: "14:18 – 24/02",
  },
  {
    id: "FR001236",
    productName: "Bánh mì sandwich x3",
    quantity: 3,
    customerName: "Lê Cường",
    total: 67500,
    status: "done",
    createdAt: "13:55 – 24/02",
  },
  {
    id: "FR001237",
    productName: "Cá basa phi lê 400g",
    quantity: 2,
    customerName: "Phạm Dương",
    total: 90000,
    status: "cancelled",
    createdAt: "13:40 – 24/02",
  },
  {
    id: "FR001230",
    productName: "Sườn heo non 400g",
    quantity: 1,
    customerName: "Hoàng Yến",
    total: 55000,
    status: "pending",
    createdAt: "13:20 – 24/02",
  },
  {
    id: "FR001229",
    productName: "Bắp cải tím 700g",
    quantity: 2,
    customerName: "Ngô Minh",
    total: 33600,
    status: "done",
    createdAt: "12:48 – 24/02",
  },
  {
    id: "FR001228",
    productName: "Mực ống tươi 250g",
    quantity: 1,
    customerName: "Đinh Hoa",
    total: 66500,
    status: "confirmed",
    createdAt: "12:30 – 24/02",
  },
  {
    id: "FR001227",
    productName: "Dưa leo 1kg",
    quantity: 3,
    customerName: "Bùi Quân",
    total: 30000,
    status: "pending",
    createdAt: "12:15 – 24/02",
  },
];

export default function StoreOrdersPage() {
  const [orders, setOrders] = useState(INIT_ORDERS);

  const handleConfirm = (orderId) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "confirmed" } : o)));
  };

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const todayRevenue = orders.filter((o) => o.status === "done").reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📦 Danh sách đơn hàng</h1>
          <p className="text-sm text-gray-400 mt-0.5">Hôm nay, 24/02/2025</p>
        </div>
        <div className="flex gap-3">
          {pendingCount > 0 && (
            <span className="bg-yellow-100 text-yellow-700 text-sm font-semibold px-3 py-1.5 rounded-xl">
              ⚠️ {pendingCount} đơn chờ xác nhận
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Tổng đơn", value: orders.length, color: "bg-blue-50 text-blue-700" },
          {
            label: "Chờ xác nhận",
            value: orders.filter((o) => o.status === "pending").length,
            color: "bg-yellow-50 text-yellow-700",
          },
          {
            label: "Hoàn thành",
            value: orders.filter((o) => o.status === "done").length,
            color: "bg-green-50 text-green-700",
          },
          {
            label: "Doanh thu",
            value: `${todayRevenue.toLocaleString("vi-VN")}đ`,
            color: "bg-orange-50 text-orange-700",
          },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-2xl p-3 text-center`}>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Order Table */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <OrderTable orders={orders} onConfirm={handleConfirm} />
      </div>
    </div>
  );
}
