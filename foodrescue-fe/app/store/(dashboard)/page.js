// FE03-002 – UI Dashboard cửa hàng
import StatCard from "@/components/store/StatCard";
import Badge from "@/components/common/Badge";
import Link from "next/link";

// ── Mock Data ─────────────────────────────────────────────────────────────
const EXPIRING_PRODUCTS = [
  { id: "1", name: "Rau cải xanh hữu cơ", remaining: 5, expiryLabel: "Còn 1 giờ" },
  { id: "2", name: "Bánh mì bơ tươi", remaining: 12, expiryLabel: "Còn 2 giờ" },
  { id: "3", name: "Sữa chua nếp cẩm", remaining: 8, expiryLabel: "Còn 3 giờ" },
];

const RECENT_ORDERS = [
  { id: "FR001234", product: "Rau cải xanh x2", customer: "Nguyễn An", total: 35000, status: "pending", time: "14:32" },
  {
    id: "FR001235",
    product: "Tôm sú tươi x1",
    customer: "Trần Bình",
    total: 84000,
    status: "confirmed",
    time: "14:18",
  },
  { id: "FR001236", product: "Bánh mì x3", customer: "Lê Cường", total: 67500, status: "done", time: "13:55" },
  {
    id: "FR001237",
    product: "Cá basa phi lê x2",
    customer: "Phạm Dương",
    total: 90000,
    status: "cancelled",
    time: "13:40",
  },
];

const STATUS_MAP = {
  pending: { label: "Chờ xác nhận", variant: "status_pending" },
  confirmed: { label: "Đã xác nhận", variant: "status_confirmed" },
  done: { label: "Hoàn thành", variant: "status_done" },
  cancelled: { label: "Đã hủy", variant: "status_cancelled" },
};

export default function StoreDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Xin chào, Circle K Q1! 👋</h1>
          <p className="text-sm text-gray-400 mt-0.5">Thứ Hai, 24/02/2025 — 14:35</p>
        </div>
        <Link
          href="/store/products"
          className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 transition"
        >
          + Thêm sản phẩm
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Sản phẩm sắp hết hạn"
          value="12"
          subtitle="Cần cập nhật giảm giá"
          icon="⚠️"
          color="red"
          trend="+3"
        />
        <StatCard
          title="Đơn hàng hôm nay"
          value="47"
          subtitle="8 đơn chờ xác nhận"
          icon="📦"
          color="blue"
          trend="+12%"
        />
        <StatCard
          title="Doanh thu hôm nay"
          value="3.2M đ"
          subtitle="Mục tiêu: 5M đ"
          icon="💰"
          color="green"
          trend="+8%"
        />
        <StatCard
          title="Tổng doanh thu tháng"
          value="62M đ"
          subtitle="So với tháng trước"
          icon="📈"
          color="orange"
          trend="+15%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sản phẩm sắp hết hạn */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">⏰ Sản phẩm sắp hết hạn</h2>
            <Link href="/store/products" className="text-xs text-orange-500 hover:underline">
              Quản lý →
            </Link>
          </div>
          <div className="space-y-3">
            {EXPIRING_PRODUCTS.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-400">Còn {p.remaining} sản phẩm</p>
                </div>
                <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-full">
                  {p.expiryLabel}
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/store/products"
            className="block mt-3 text-center text-xs text-gray-400 hover:text-orange-500 transition"
          >
            Xem tất cả 12 sản phẩm sắp hết hạn
          </Link>
        </div>

        {/* Đơn hàng gần nhất */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">📦 Đơn hàng gần nhất</h2>
            <Link href="/store/orders" className="text-xs text-orange-500 hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-3">
            {RECENT_ORDERS.map((order) => {
              const status = STATUS_MAP[order.status];
              return (
                <div key={order.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-400">#{order.id}</span>
                      <span className="text-xs text-gray-400">{order.time}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 truncate">{order.product}</p>
                    <p className="text-xs text-gray-400">{order.customer}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-orange-600">{order.total.toLocaleString("vi-VN")}đ</p>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Revenue bar */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4">📊 Doanh thu theo giờ (hôm nay)</h2>
        <div className="flex items-end gap-2 h-28">
          {[320, 580, 920, 1200, 840, 1540, 1800, 960].map((val, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-orange-200 rounded-t-md hover:bg-orange-400 transition cursor-pointer"
                style={{ height: `${(val / 1800) * 100}%` }}
                title={`${idx + 9}:00 — ${val.toLocaleString()}k đ`}
              />
              <span className="text-[10px] text-gray-400">{idx + 9}h</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
