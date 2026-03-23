"use client";

import { useState, useEffect, useCallback } from "react";
import { apiSellerGetOrders, apiSellerUpdateOrderStatus } from "@/lib/api";

const PAGE_SIZE = 10;

const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "pending_payment", label: "Chờ thanh toán" },
  { id: "pending", label: "Chờ xác nhận" },
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

const PAYMENT_METHOD_LABELS = {
  cod: "Tiền mặt (COD)",
  payos: "PayOS",
  bank_transfer: "Chuyển khoản",
  momo: "Ví MoMo",
  zalopay: "ZaloPay",
  vnpay: "VNPay",
  card: "Thẻ tín dụng",
};

const NEXT_STATUS = {
  // Luồng đơn giản: khách thanh toán xong -> seller xác nhận -> hoàn thành
  pending: "completed",
};

/** Gộp danh sách có thể là từng dòng (1 SP/dòng) thành 1 đơn = 1 phần tử, mỗi đơn có items[] */
function normalizeOrders(content) {
  if (!Array.isArray(content) || content.length === 0) return [];
  const first = content[0];
  if (first.items && Array.isArray(first.items)) return content;
  const byId = new Map();
  for (const row of content) {
    const oid = row.orderId ?? row.orderCode ?? row.id;
    if (!byId.has(oid)) {
      byId.set(oid, {
        id: row.orderId ?? row.id,
        orderCode: row.orderCode ?? row.id,
        status: row.status,
        paymentStatus: row.paymentStatus,
        paymentMethod: row.paymentMethod,
        createdAt: row.createdAt,
        customerName: row.customerName ?? row.customer,
        customerEmail: row.customerEmail ?? row.email,
        customerPhone: row.customerPhone ?? row.phone,
        subtotal: row.subtotal,
        totalAmount: row.totalAmount,
        discountAmount: row.discountAmount,
        items: [],
      });
    }
    const o = byId.get(oid);
    if (row.productName != null || row.variantName != null || row.quantity != null) {
      o.items.push({
        id: row.id,
        productId: row.productId,
        productName: row.productName ?? row.variantName,
        variantName: row.variantName,
        quantity: row.quantity,
        unitPrice: row.unitPrice,
        lineTotal: row.lineTotal ?? (Number(row.quantity) || 0) * (Number(row.unitPrice) || 0),
      });
    }
  }
  return Array.from(byId.values());
}

// Mock data để xem giao diện nhanh khi API chưa có dữ liệu
const MOCK_SELLER_ORDERS = normalizeOrders([
  {
    id: 101,
    orderId: 101,
    orderCode: "FD000101",
    status: "pending",
    paymentStatus: "unpaid",
    paymentMethod: "cod",
    createdAt: new Date().toISOString(),
    customerName: "Nguyễn Văn A",
    customerEmail: "khach.a@example.com",
    customerPhone: "0909 111 222",
    subtotal: 185000,
    discountAmount: 15000,
    totalAmount: 170000,
    productId: 1,
    productName: "Sữa tươi Vinamilk 1L",
    variantName: "Chai 1L",
    quantity: 2,
    unitPrice: 45000,
    lineTotal: 90000,
  },
  {
    id: 102,
    orderId: 101,
    orderCode: "FD000101",
    status: "pending",
    paymentStatus: "unpaid",
    paymentMethod: "cod",
    createdAt: new Date().toISOString(),
    customerName: "Nguyễn Văn A",
    customerEmail: "khach.a@example.com",
    customerPhone: "0909 111 222",
    subtotal: 185000,
    discountAmount: 15000,
    totalAmount: 170000,
    productId: 2,
    productName: "Bánh mì sandwich nguyên cám",
    variantName: "Gói 500g",
    quantity: 1,
    unitPrice: 55000,
    lineTotal: 55000,
  },
  {
    id: 201,
    orderId: 201,
    orderCode: "FD000202",
    status: "shipping",
    paymentStatus: "paid",
    paymentMethod: "payos",
    createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    customerName: "Trần Thị B",
    customerEmail: "khach.b@example.com",
    customerPhone: "0912 333 444",
    subtotal: 320000,
    discountAmount: 50000,
    totalAmount: 270000,
    productId: 3,
    productName: "Combo rau củ tiết kiệm",
    variantName: "Gói 3kg",
    quantity: 1,
    unitPrice: 120000,
    lineTotal: 120000,
  },
  {
    id: 202,
    orderId: 201,
    orderCode: "FD000202",
    status: "shipping",
    paymentStatus: "paid",
    paymentMethod: "payos",
    createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    customerName: "Trần Thị B",
    customerEmail: "khach.b@example.com",
    customerPhone: "0912 333 444",
    subtotal: 320000,
    discountAmount: 50000,
    totalAmount: 270000,
    productId: 4,
    productName: "Thịt gà phi lê",
    variantName: "Khay 800g",
    quantity: 2,
    unitPrice: 100000,
    lineTotal: 200000,
  },
  {
    id: 301,
    orderId: 301,
    orderCode: "FD000303",
    status: "completed",
    paymentStatus: "paid",
    paymentMethod: "cod",
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString(),
    customerName: "Lê Văn C",
    customerEmail: "khach.c@example.com",
    customerPhone: "0987 555 666",
    subtotal: 95000,
    discountAmount: 0,
    totalAmount: 95000,
    productId: 5,
    productName: "Mì gói chay",
    variantName: "Thùng 30 gói",
    quantity: 1,
    unitPrice: 95000,
    lineTotal: 95000,
  },
]);

function OrderDetailModal({ order, onClose }) {
  if (!order) return null;
  const items = order.items || [];
  const subtotal = order.subtotal ?? items.reduce((s, i) => s + (Number(i.lineTotal) || Number(i.unitPrice) * (i.quantity || 0)), 0);
  const discountAmount = Number(order.discountAmount) || 0;
  const totalAmount = order.totalAmount ?? order.subtotal ?? subtotal - discountAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Chi tiết đơn hàng #{order.orderCode || order.id}</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
                <th className="text-left py-2 pr-2 w-[40%]">Sản phẩm</th>
                <th className="text-center py-2 px-2 w-[10%]">SL</th>
                <th className="text-right py-2 px-2 w-[15%]">Giá gốc</th>
                <th className="text-right py-2 px-2 w-[15%]">Giá ưu đãi</th>
                <th className="text-right py-2 pl-2 w-[20%]">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const qty = Number(item.quantity) || 0;
                const originalUnitPrice = Number(
                  item.listPrice ?? item.originalUnitPrice ?? item.unitPrice,
                ) || 0;
                const discountedUnitPrice = Number(item.unitPrice ?? originalUnitPrice) || 0;
                const lineTotal = Number(item.lineTotal) || discountedUnitPrice * qty;
                return (
                  <tr key={item.id || item.productId} className="border-b border-gray-100">
                    <td className="py-3 pr-2 text-gray-800">
                      <p className="font-medium truncate">{item.productName || item.variantName || "—"}</p>
                      {item.variantName && (
                        <p className="text-xs text-gray-400 mt-0.5">{item.variantName}</p>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center text-gray-600">{qty}</td>
                    <td className="py-3 px-2 text-right text-gray-400 line-through">
                      {originalUnitPrice.toLocaleString("vi-VN")}₫
                    </td>
                    <td className="py-3 px-2 text-right text-red-600 font-semibold">
                      {discountedUnitPrice.toLocaleString("vi-VN")}₫
                    </td>
                    <td className="py-3 pl-2 text-right font-semibold text-gray-800">
                      {lineTotal.toLocaleString("vi-VN")}₫
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Tổng tiền (chưa giảm)</span>
              <span className="font-medium">{(subtotal).toLocaleString("vi-VN")}₫</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Tổng tiền giảm</span>
                <span className="font-medium">−{(discountAmount).toLocaleString("vi-VN")}₫</span>
              </div>
            )}
            <div className="flex justify-between text-gray-900 font-bold pt-2 border-t border-gray-100">
              <span>Tổng tiền sau giảm</span>
              <span>{(totalAmount).toLocaleString("vi-VN")}₫</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StoreOrdersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [search, setSearch] = useState("");
  const [detailOrder, setDetailOrder] = useState(null);

  const loadOrders = useCallback(
    (nextPage) => {
      setLoading(true);
      const params = { page: nextPage ?? 0, size: PAGE_SIZE };
      if (activeTab !== "all") params.status = activeTab;

      apiSellerGetOrders(params)
        .then((res) => {
          if (res.ok && res.data?.data) {
            const data = res.data.data;
            const raw = data.content ?? data;
            const content = Array.isArray(raw) ? normalizeOrders(raw) : [];
            if (content.length > 0) {
              setOrders(content);
              setTotalPages(data.totalPages ?? 1);
              setTotalElements(data.totalElements ?? content.length);
            } else {
              setOrders(MOCK_SELLER_ORDERS);
              setTotalPages(1);
              setTotalElements(MOCK_SELLER_ORDERS.length);
            }
            setPage(nextPage ?? 0);
          } else {
            // Khi API lỗi hoặc chưa có, dùng mock để xem layout
            setOrders(MOCK_SELLER_ORDERS);
            setTotalPages(1);
            setTotalElements(MOCK_SELLER_ORDERS.length);
            setPage(0);
          }
        })
        .catch(() => {
          setOrders(MOCK_SELLER_ORDERS);
          setTotalPages(1);
          setTotalElements(MOCK_SELLER_ORDERS.length);
          setPage(0);
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
        const name = (order.customerName || order.customer || "").toString().toLowerCase();
        const email = (order.customerEmail || order.email || "").toString().toLowerCase();
        const phone = (order.customerPhone || order.phone || "").toString().toLowerCase();
        return code.includes(searchLower) || payment.includes(searchLower) || name.includes(searchLower) || email.includes(searchLower) || phone.includes(searchLower);
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
              placeholder="Mã đơn, tên khách, email, SĐT..."
              className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
            />
          </div>
          {search && (
            <button type="button" onClick={() => setSearch("")} className="text-sm text-gray-500 hover:text-gray-700 underline">
              Xóa tìm kiếm
            </button>
          )}
        </div>

        {/* <div className="px-4 pt-2 pb-1">
          <span className="text-gray-500 text-sm">Lọc theo trạng thái</span>
        </div> */}

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
                <th className="text-left px-4 py-3 whitespace-nowrap">Mã đơn</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Khách hàng</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Email</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Số điện thoại</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Thanh toán (PT)</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Trạng thái</th>
                <th className="text-right px-4 py-3 whitespace-nowrap">Tổng tiền</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Ngày tạo</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-400">
                    Đang tải...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-400">
                    Chưa có đơn hàng nào.
                  </td>
                </tr>
              ) : null}

              {filteredOrders.map((order) => {
                const statusLabel = STATUS_LABELS[order.status] || order.status;
                const statusColor = STATUS_COLORS[order.status] || "bg-gray-50 text-gray-600 border border-gray-200";
                const nextStatus = NEXT_STATUS[order.status];
                const paymentStatusLabel = PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus || "-";
                const paymentMethodLabel = PAYMENT_METHOD_LABELS[order.paymentMethod?.toLowerCase()] || order.paymentMethod || "-";
                const customerName = order.customerName || order.customer || "—";
                const customerEmail = order.customerEmail || order.email || "—";
                const customerPhone = order.customerPhone || order.phone || "—";
                const totalDisplay = order.totalAmount ?? order.subtotal ?? 0;

                return (
                  <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">#{order.orderCode || order.id}</td>
                    <td className="px-4 py-3 text-gray-800 max-w-[140px] truncate" title={customerName}>{customerName}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[160px] truncate" title={customerEmail}>{customerEmail}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{customerPhone}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{paymentMethodLabel}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${statusColor}`}>
                        {statusLabel}
                      </span>
                      <span className="block text-[11px] text-gray-500 mt-0.5">TT: {paymentStatusLabel}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                      {(totalDisplay).toLocaleString("vi-VN")}₫
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setDetailOrder(order)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition"
                          title="Xem chi tiết đơn hàng"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        {nextStatus && (
                          <button
                            disabled={updating === order.id}
                            onClick={() => handleUpdateStatus(order.id, nextStatus)}
                            className="text-xs bg-brand hover:bg-brand-secondary text-gray-900 font-medium px-2.5 py-1.5 rounded-lg transition disabled:opacity-50 whitespace-nowrap"
                          >
                            {updating === order.id ? "..." : STATUS_LABELS[nextStatus] || nextStatus}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {detailOrder && <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />}

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
