// FE03-002 – UI Dashboard cửa hàng (Tổng quan) – Redesigned
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
const IconFire = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.343L12 24m0 0l-5.657-5.657M12 24V12m0 0L5.343 6.343M12 12l6.657-6.657" />
  </svg>
);

// ── Status Map ─────────────────────────────────────────────────────────────
const STATUS_MAP = {
  pending: { label: "Chờ xác nhận", variant: "status_pending" },
  confirmed: { label: "Đã xác nhận", variant: "status_confirmed" },
  done: { label: "Hoàn thành", variant: "status_done" },
  cancelled: { label: "Đã hủy", variant: "status_cancelled" },
};

// ── Main Component ────────────────────────────────────────────────────────
export default function StoreDashboardPage() {
  return (
    <div className="p-6 sm:p-8 space-y-8">
      {/* ════ HEADER ════ */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Tổng quan cửa hàng</h1>
        </div>
      </div>

      {/* ════ QUICK STATS GRID (5 carts) ════ */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. Đơn hàng chờ xác nhận */}
          <Link href="/store/orders?status=pending" className="block">
            <StatCard
              title="Đơn chờ xác nhận"
              value="-"
              subtitle="Click để xử lý"
              icon={<IconAlert />}
              color="red"
            />
          </Link>

          {/* 2. Sản phẩm sắp hết hạn */}
          <Link href="/store/products?filter=expiring" className="block">
            <StatCard
              title="Sắp hết hạn"
              value="-"
              subtitle="Click để cập nhật"
              icon={<IconClock />}
              color="orange"
            />
          </Link>

          {/* 3. Tổng sản phẩm */}
          <Link href="/store/products" className="block">
            <StatCard
              title="Tổng sản phẩm"
              value="-"
              subtitle="Tất cả sản phẩm"
              icon={<IconPackage />}
              color="blue"
            />
          </Link>

          {/* 4. Doanh thu hôm nay */}
          <Link href="/store/stats" className="block">
            <StatCard
              title="Doanh thu hôm nay"
              value="-"
              subtitle="Chi tiết →"
              icon={<IconCurrency />}
              color="green"
            />
          </Link>

          {/* 5. Tổng doanh thu tháng */}
          <Link href="/store/stats" className="block">
            <StatCard
              title="Doanh thu tháng"
              value="-"
              subtitle="Chi tiết →"
              icon={<IconTrending />}
              color="green"
            />
          </Link>
        </div>
      </div>



      {/* ════ THREE COLUMNS: Top Sellers | Expiring | Recent Orders ════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── 1. Sản phẩm bán chạy nhất ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                <IconFire />
              </div>
              <h2 className="font-semibold text-gray-900">Bán chạy nhất</h2>
            </div>
            <Link href="/store/stats" className="text-sm font-medium text-brand-dark hover:text-brand-secondary transition">
              Chi tiết →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {/* TOP SELLERS PLACEHOLDER */}
            <div className="px-5 py-8 text-center text-gray-400">
              <p className="text-sm">Dữ liệu sẽ được cập nhật từ Backend API</p>
            </div>
          </div>
          <Link
            href="/store/stats"
            className="block py-3 text-center text-sm text-gray-500 hover:text-brand-dark font-medium transition bg-gray-50/50"
          >
            Xem tất cả
          </Link>
        </div>

        {/* ── 2. Sản phẩm sắp hết hạn ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                <IconClock />
              </div>
              <h2 className="font-semibold text-gray-900">Sắp hết hạn</h2>
            </div>
            <Link href="/store/products?filter=expiring" className="text-sm font-medium text-brand-dark hover:text-brand-secondary transition">
              Quản lý →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {/* EXPIRING PRODUCTS PLACEHOLDER */}
            <div className="px-5 py-8 text-center text-gray-400">
              <p className="text-sm">Dữ liệu sẽ được cập nhật từ Backend API</p>
            </div>
          </div>
          <Link
            href="/store/products?filter=expiring"
            className="block py-3 text-center text-sm text-gray-500 hover:text-brand-dark font-medium transition bg-gray-50/50"
          >
            Xem tất cả
          </Link>
        </div>

        {/* ── 3. Đơn hàng gần nhất ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-brand-bg flex items-center justify-center text-brand-dark">
                <IconCart />
              </div>
              <h2 className="font-semibold text-gray-900">Đơn gần nhất</h2>
            </div>
            <Link href="/store/orders" className="text-sm font-medium text-brand-dark hover:text-brand-secondary transition">
              Xem tất cả →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {/* RECENT ORDERS PLACEHOLDER */}
            <div className="px-5 py-8 text-center text-gray-400">
              <p className="text-sm">Dữ liệu sẽ được cập nhật từ Backend API</p>
            </div>
          </div>
          <Link
            href="/store/orders"
            className="block py-3 text-center text-sm text-gray-500 hover:text-brand-dark font-medium transition bg-gray-50/50"
          >
            Xem tất cả
          </Link>
        </div>
      </div>


    </div>
  );
}
