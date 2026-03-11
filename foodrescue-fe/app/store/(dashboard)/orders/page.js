// FE03-004 – UI Quản lý đơn hàng (API-connected)
"use client";
import { useState, useEffect, useCallback } from "react";
import { apiSellerGetOrders, apiSellerUpdateOrderStatus } from "@/lib/api";

const TABS = [
  { id: "all", label: "Tat ca" },
  { id: "pending", label: "Cho xac nhan" },
  { id: "confirmed", label: "Da xac nhan" },
  { id: "packing", label: "Dang dong goi" },
  { id: "shipping", label: "Dang giao" },
  { id: "completed", label: "Hoan thanh" },
  { id: "cancelled", label: "Da huy" },
];

const STATUS_LABELS = {
  pending: "Cho xac nhan",
  confirmed: "Da xac nhan",
  packing: "Dang dong goi",
  shipping: "Dang giao",
  completed: "Hoan thanh",
  cancelled: "Da huy",
  refunded: "Hoan tien",
};

const STATUS_COLORS = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue-50 text-blue-700",
  packing: "bg-purple-50 text-purple-700",
  shipping: "bg-indigo-50 text-indigo-700",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
  refunded: "bg-gray-50 text-gray-600",
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

  const loadOrders = useCallback(function(p) {
    setLoading(true);
    var params = { page: p || 0, size: 20 };
    if (activeTab !== "all") params.status = activeTab;
    apiSellerGetOrders(params)
      .then(function(res) {
        if (res.ok && res.data && res.data.data) {
          var d = res.data.data;
          var content = d.content || d;
          if (Array.isArray(content)) {
            setOrders(content);
            setTotalPages(d.totalPages || 1);
            setTotalElements(d.totalElements || content.length);
          }
        }
      })
      .finally(function() { setLoading(false); });
  }, [activeTab]);

  useEffect(function() { loadOrders(0); setPage(0); }, [loadOrders]);

  var handleUpdateStatus = function(sellerOrderId, newStatus) {
    setUpdating(sellerOrderId);
    apiSellerUpdateOrderStatus(sellerOrderId, newStatus)
      .then(function(res) {
        if (res.ok) {
          setOrders(function(prev) {
            return prev.map(function(o) {
              return o.id === sellerOrderId ? Object.assign({}, o, { status: newStatus }) : o;
            });
          });
        } else {
          alert("Cap nhat trang thai that bai.");
        }
      })
      .finally(function() { setUpdating(null); });
  };

  return (
    <div className="p-6 space-y-4 text-sm text-gray-700">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-800">Quan ly don hang</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{totalElements} don hang</span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {TABS.map(function(tab) {
            return (
              <button
                key={tab.id}
                onClick={function() { setActiveTab(tab.id); }}
                className={"px-4 py-2.5 whitespace-nowrap font-medium border-b-2 transition " + (activeTab === tab.id ? "border-green-500 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700")}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3">Ma don</th>
                <th className="text-left px-4 py-3">San pham</th>
                <th className="text-left px-4 py-3">Doanh thu</th>
                <th className="text-left px-4 py-3">Trang thai</th>
                <th className="text-left px-4 py-3">Ngay tao</th>
                <th className="text-left px-4 py-3">Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">Dang tai...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">Chua co don hang nao.</td></tr>
              ) : null}
              {orders.map(function(order) {
                var statusLabel = STATUS_LABELS[order.status] || order.status;
                var statusColor = STATUS_COLORS[order.status] || "bg-gray-50 text-gray-600";
                var nextStatus = NEXT_STATUS[order.status];
                var items = order.items || [];
                return (
                  <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">#{order.orderCode || order.id}</td>
                    <td className="px-4 py-3">
                      {items.length > 0 ? (
                        <div className="space-y-1">
                          {items.slice(0, 2).map(function(item) {
                            return (
                              <div key={item.id} className="flex items-center gap-2">
                                <span className="text-gray-700">{item.productName || item.variantName || "-"}</span>
                                <span className="text-gray-400 text-xs">x{item.quantity}</span>
                              </div>
                            );
                          })}
                          {items.length > 2 && (
                            <span className="text-gray-400 text-xs">+{items.length - 2} san pham khac</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-green-600">
                      {(order.subtotal || 0).toLocaleString("vi-VN")}d
                    </td>
                    <td className="px-4 py-3">
                      <span className={"inline-flex items-center px-2 py-1 rounded-full text-xs font-medium " + statusColor}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {nextStatus && (
                        <button
                          disabled={updating === order.id}
                          onClick={function() { handleUpdateStatus(order.id, nextStatus); }}
                          className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                        >
                          {updating === order.id ? "..." : "Chuyen: " + (STATUS_LABELS[nextStatus] || nextStatus)}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">{orders.length} / {totalElements} don hang</p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={function() { var np = page - 1; setPage(np); loadOrders(np); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition disabled:opacity-40"
            >
              &lt;
            </button>
            <span className="text-sm text-gray-600">{page + 1} / {totalPages}</span>
            <button
              disabled={page + 1 >= totalPages}
              onClick={function() { var np = page + 1; setPage(np); loadOrders(np); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition disabled:opacity-40"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
