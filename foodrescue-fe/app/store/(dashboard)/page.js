// FE03-002 – UI Dashboard cửa hàng (Tổng quan)
import StatCard from "@/components/store/StatCard";
import Badge from "@/components/common/Badge";
import Link from "next/link";

// ── Icon SVG hiện đại (outline, 24x24) ─────────────────────────────────────
const IconClock = () => (
  <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconPackage = () => (
  <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);
const IconCurrency = () => (
  <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconChart = () => (
  <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h2v-2H3v2zm4 4h2v-4H7v4zm4 0h2v-6h-2v6zm4 0h2V7h-2v10z" />
  </svg>
);
const IconAlert = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
const IconCart = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);
const IconTrending = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

// ── Mock Data ─────────────────────────────────────────────────────────────
const EXPIRING_PRODUCTS = [
  { id: "1", name: "Rau cải xanh hữu cơ", remaining: 5, expiryLabel: "Còn 1 giờ" },
  { id: "2", name: "Bánh mì bơ tươi", remaining: 12, expiryLabel: "Còn 2 giờ" },
  { id: "3", name: "Sữa chua nếp cẩm", remaining: 8, expiryLabel: "Còn 3 giờ" },
];

const RECENT_ORDERS = [
  { id: "FR001234", product: "Rau cải xanh x2", customer: "Nguyễn An", total: 35000, status: "pending", time: "14:32" },
  { id: "FR001235", product: "Tôm sú tươi x1", customer: "Trần Bình", total: 84000, status: "confirmed", time: "14:18" },
  { id: "FR001236", product: "Bánh mì x3", customer: "Lê Cường", total: 67500, status: "done", time: "13:55" },
  { id: "FR001237", product: "Cá basa phi lê x2", customer: "Phạm Dương", total: 90000, status: "cancelled", time: "13:40" },
];

const STATUS_MAP = {
  pending: { label: "Chờ xác nhận", variant: "status_pending" },
  confirmed: { label: "Đã xác nhận", variant: "status_confirmed" },
  done: { label: "Hoàn thành", variant: "status_done" },
  cancelled: { label: "Đã hủy", variant: "status_cancelled" },
};

const PENDING_COUNT = 8;
const EXPIRING_COUNT = 12;
const REVENUE_HOURS = [320, 580, 920, 1200, 840, 1540, 1800, 960];
const REVENUE_MAX = Math.max(...REVENUE_HOURS);

export default function StoreDashboardPage() {
  return (
    <div className="p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Xin chào, Circle K Q1!</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <IconClock />
            Thứ Hai, 24/02/2025 — 14:35
          </p>
        </div>
      </div>

      {/* Cần làm ngay — nổi bật */}
      <div className="rounded-2xl border border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <IconAlert />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{PENDING_COUNT} đơn chờ xác nhận</p>
              <p className="text-xs text-gray-600">Xác nhận sớm để không bỏ lỡ đơn hàng</p>
            </div>
          </div>
          <div className="h-8 w-px bg-amber-200 hidden sm:block" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
              <IconClock />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{EXPIRING_COUNT} sản phẩm sắp hết hạn</p>
              <p className="text-xs text-gray-600">Cập nhật giảm giá để tăng doanh thu</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/store/orders"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
          >
            <IconCart />
            Xử lý đơn
          </Link>
          <Link
            href="/store/products"
            className="inline-flex items-center gap-2 border-2 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
          >
            Cập nhật giá
          </Link>
        </div>
      </div>

      {/* Stats Grid — 4 ô thống kê với icon hiện đại */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Tổng quan hôm nay</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Sản phẩm sắp hết hạn"
            value="12"
            subtitle="Cần cập nhật giảm giá"
            icon={<IconClock />}
            color="red"
            trend="+3"
          />
          <StatCard
            title="Đơn hàng hôm nay"
            value="47"
            subtitle="8 đơn chờ xác nhận"
            icon={<IconPackage />}
            color="blue"
            trend="+12%"
          />
          <Link href="/store/stats" className="block">
            <StatCard
              title="Doanh thu hôm nay"
              value="3.2M đồng"
              subtitle="Mục tiêu: 5M đồng"
              icon={<IconCurrency />}
              color="green"
              trend="+8%"
            />
          </Link>
          <Link href="/store/stats" className="block">
            <StatCard
              title="Tổng doanh thu tháng"
              value="62M đồng"
              subtitle="So với tháng trước"
              icon={<IconTrending />}
              color="orange"
              trend="+15%"
            />
          </Link>
        </div>
      </div>

      {/* Hai cột: Sản phẩm sắp hết hạn + Đơn hàng gần nhất */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sản phẩm sắp hết hạn */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                <IconClock />
              </div>
              <h2 className="font-semibold text-gray-900">Sản phẩm sắp hết hạn</h2>
            </div>
            <Link href="/store/products" className="text-sm font-medium text-brand-dark hover:text-brand-secondary transition">
              Quản lý →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {EXPIRING_PRODUCTS.map((p) => (
              <div key={p.id} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/80 transition">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Còn {p.remaining} sản phẩm</p>
                </div>
                <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg shrink-0">
                  {p.expiryLabel}
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/store/products"
            className="block py-3 text-center text-sm text-gray-500 hover:text-brand-dark font-medium transition bg-gray-50/50"
          >
            Xem tất cả {EXPIRING_COUNT} sản phẩm sắp hết hạn
          </Link>
        </div>

        {/* Đơn hàng gần nhất */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-brand-bg flex items-center justify-center text-brand-dark">
                <IconCart />
              </div>
              <h2 className="font-semibold text-gray-900">Đơn hàng gần nhất</h2>
            </div>
            <Link href="/store/orders" className="text-sm font-medium text-brand-dark hover:text-brand-secondary transition">
              Xem tất cả →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {RECENT_ORDERS.map((order) => {
              const status = STATUS_MAP[order.status];
              return (
                <div key={order.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50/80 transition">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-gray-400">#{order.id}</span>
                      <span className="text-xs text-gray-400">{order.time}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate mt-0.5">{order.product}</p>
                    <p className="text-xs text-gray-500">{order.customer}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-brand-dark">{order.total.toLocaleString("vi-VN")} đồng</p>
                    <Badge variant={status.variant} className="mt-1">{status.label}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Doanh thu theo giờ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-brand-bg flex items-center justify-center text-brand-dark">
            <IconChart />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Doanh thu theo giờ</h2>
            <p className="text-xs text-gray-500 mt-0.5">Hôm nay — so sánh theo từng khung giờ</p>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-end gap-2 h-32">
            {REVENUE_HOURS.map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div
                  className="w-full bg-brand/50 rounded-t-lg hover:bg-brand-dark transition-all cursor-pointer min-h-[8px]"
                  style={{ height: `${(val / REVENUE_MAX) * 100}%` }}
                  title={`${idx + 9}:00 — ${(val / 1000).toFixed(0)}k đồng`}
                />
                <span className="text-[10px] font-medium text-gray-400 group-hover:text-gray-600">{idx + 9}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
