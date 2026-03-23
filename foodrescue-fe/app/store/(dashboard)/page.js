// FE03-002 – UI Dashboard cửa hàng (Tổng quan) – Redesigned
"use client";
import { useState, useEffect } from "react";
import StatCard from "@/components/store/StatCard";
import Badge from "@/components/common/Badge";
import Link from "next/link";
import { apiSellerGetProducts, apiSellerGetOrders, apiGetSellerStats } from "@/lib/api";

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
const IconProduct = () => (
  <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10m0-10l8 4m0 0v10l-8 4m0-10l-8-4" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
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
// Helper: Tính số ngày còn lại
function calculateRemainingDays(createdAt, shelfLifeDays) {
  if (!createdAt || shelfLifeDays === null || shelfLifeDays === undefined) {
    return null;
  }
  const created = new Date(createdAt);
  const expiryDate = new Date(created);
  expiryDate.setDate(expiryDate.getDate() + shelfLifeDays);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiryDate.setHours(0, 0, 0, 0);
  const remainingDays = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
  return remainingDays;
}

export default function StoreDashboardPage() {
  const [productCount, setProductCount] = useState(0);
  const [expiringCount, setExpiringCount] = useState(0);
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [topProducts, setTopProducts] = useState([]);

  // Fetch products
  useEffect(() => {
    apiSellerGetProducts({ page: 0, size: 1000 })
      .then((res) => {
        if (res.ok && res.data?.data) {
          const products = res.data.data.content || res.data.data;
          setProductCount(res.data.data.totalElements || products.length);
          
          // Lọc sản phẩm sắp hết hạn
          const expiring = (Array.isArray(products) ? products : [])
            .filter((p) => {
              const remainingDays = calculateRemainingDays(p.createdAt, p.shelfLifeDays);
              return remainingDays !== null && remainingDays >= 0 && remainingDays <= 3;
            })
            .sort((a, b) => {
              const daysA = calculateRemainingDays(a.createdAt, a.shelfLifeDays) ?? 999;
              const daysB = calculateRemainingDays(b.createdAt, b.shelfLifeDays) ?? 999;
              return daysA - daysB;
            })
            .slice(0, 5);
          
          setExpiringCount(expiring.length);
          setExpiringProducts(expiring);
        }
      })
      .finally(() => setProductsLoading(false));
  }, []);

  // Fetch recent orders
  useEffect(() => {
    apiSellerGetOrders({ page: 0, size: 5 })
      .then((res) => {
        if (res.ok && res.data?.data) {
          const data = res.data.data;
          const orders = data.content || data;
          setRecentOrders(Array.isArray(orders) ? orders.slice(0, 5) : []);
        }
      })
      .finally(() => setOrdersLoading(false));
  }, []);

  // Fetch stats
  useEffect(() => {
    apiGetSellerStats()
      .then((res) => {
        if (res.ok && res.data?.data) {
          const s = res.data.data;
          setStats(s);
          
          // Tính doanh thu hôm nay (backend format: "dd/MM")
          if (s.dailyRevenue && Array.isArray(s.dailyRevenue)) {
            // Format date as "dd/MM" to match backend
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const today = `${day}/${month}`;
            
            const todayData = s.dailyRevenue.find((d) => d.date === today);
            setTodayRevenue(todayData ? Number(todayData.revenue) : 0);
          }
          
          // Tính doanh thu tháng này
          if (s.totalRevenue) {
            setMonthRevenue(Number(s.totalRevenue));
          }
          
          // Lấy top sản phẩm bán chạy nhất
          // Backend trả về: name, totalQty, totalRevenue
          if (s.topProducts && Array.isArray(s.topProducts)) {
            const sorted = s.topProducts
              .map(p => ({
                productName: p.name,
                quantity: Number(p.totalQty) || 0,
                totalRevenue: Number(p.totalRevenue) || 0,
                price: 0 // Backend không cung cấp giá, để mặc định 0
              }))
              .sort((a, b) => b.quantity - a.quantity)
              .slice(0, 5);
            setTopProducts(sorted);
          }
        }
      })
      .catch((err) => console.error("Stats fetch error:", err))
      .finally(() => setStatsLoading(false));
  }, []);

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
              value={productsLoading ? "-" : expiringCount}
              subtitle="0-3 ngày còn lại"
              icon={<IconClock />}
              color="orange"
            />
          </Link>

          {/* 3. Tổng sản phẩm */}
          <Link href="/store/products" className="block">
            <StatCard
              title="Tổng sản phẩm"
              value={productsLoading ? "-" : productCount}
              subtitle="Tất cả sản phẩm"
              icon={<IconPackage />}
              color="blue"
            />
          </Link>

          {/* 4. Doanh thu hôm nay */}
          <Link href="/store/stats" className="block">
            <StatCard
              title="Doanh thu hôm nay"
              value={statsLoading ? "-" : (todayRevenue).toLocaleString("vi-VN") + "₫"}
              subtitle="Chi tiết →"
              icon={<IconCurrency />}
              color="green"
            />
          </Link>

          {/* 5. Tổng doanh thu tháng */}
          <Link href="/store/stats" className="block">
            <StatCard
              title="Doanh thu tháng"
              value={statsLoading ? "-" : (monthRevenue).toLocaleString("vi-VN") + "₫"}
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                <IconFire />
              </div>
              <h2 className="font-semibold text-gray-900">Bán chạy nhất</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-50 flex-1 overflow-y-auto">
            {statsLoading ? (
              <div className="px-5 py-8 text-center text-gray-400">
                <p className="text-sm">Đang tải...</p>
              </div>
            ) : topProducts.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400">
                <p className="text-sm">Chưa có dữ liệu bán hàng</p>
              </div>
            ) : (
              topProducts.map((product, idx) => {
                const quantity = Number(product.quantity) || 0;
                const revenue = Number(product.totalRevenue) || 0;
                return (
                  <div key={idx} className="px-4 py-3 hover:bg-orange-50/30 transition">
                    <div className="flex items-center gap-3">
                      {/* Ranking Badge */}
                      <span className={`font-bold text-xs w-6 h-6 shrink-0 flex items-center justify-center rounded-full ${
                        idx === 0 ? "bg-yellow-400 text-white" :
                        idx === 1 ? "bg-gray-400 text-white" :
                        idx === 2 ? "bg-orange-400 text-white" : "bg-gray-200 text-gray-600"
                      }`}>
                        {idx + 1}
                      </span>
                      
                      {/* Product Image Placeholder */}
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center shrink-0">
                        <IconProduct />
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{product.productName || "Sản phẩm"}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{quantity} bán • {(revenue).toLocaleString("vi-VN")}₫</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <Link
            href="/store/stats"
            className="py-3 text-center text-sm text-gray-500 hover:text-brand-dark font-medium transition bg-gray-50/50 border-t border-gray-100"
          >
            Xem tất cả →
          </Link>
        </div>

        {/* ── 2. Sản phẩm sắp hết hạn ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                <IconClock />
              </div>
              <h2 className="font-semibold text-gray-900">Sắp hết hạn</h2>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {productsLoading ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">Đang tải...</p>
              </div>
            ) : expiringProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">✓ Không có sản phẩm sắp hết hạn</p>
              </div>
            ) : (
              <div className="space-y-3">
                {expiringProducts.map((p) => {
                  const remainingDays = calculateRemainingDays(p.createdAt, p.shelfLifeDays);
                  return (
                    <Link
                      key={p.id}
                      href={`/store/products/${p.id}`}
                      className="group flex gap-3 rounded-lg overflow-hidden border border-gray-200 hover:border-orange-300 transition hover:shadow-md"
                    >
                      {/* Ảnh sản phẩm - to hơn */}
                      <div className="relative w-20 h-20 shrink-0 bg-gray-100 overflow-hidden">
                        <img
                          src={p.primaryImageUrl || "/images/products/default.jpg"}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition"
                        />
                        
                        {/* Badge ngày */}
                        <div className="absolute -top-1 -right-1 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-[10px] font-bold shadow-lg">
                          {remainingDays}d
                        </div>
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0 py-2 pr-3">
                        <p className="font-medium text-gray-800 text-sm line-clamp-2">{p.name}</p>
                        <p className={`text-xs font-semibold mt-1 px-1.5 py-0.5 rounded-full inline-flex ${
                          remainingDays <= 1 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                        }`}>
                          Còn {remainingDays} ngày
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          <Link
            href="/store/products?filter=expiring"
            className="block py-3 text-center text-sm text-gray-500 hover:text-brand-dark font-medium transition bg-gray-50/50 border-t border-gray-100"
          >
            Xem tất cả →
          </Link>
        </div>

        {/* ── 3. Đơn hàng gần nhất ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-brand-bg flex items-center justify-center text-brand-dark">
                <IconCart />
              </div>
              <h2 className="font-semibold text-gray-900">Đơn gần nhất</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-50 flex-1 overflow-y-auto">
            {ordersLoading ? (
              <div className="px-5 py-8 text-center text-gray-400">
                <p className="text-sm">Đang tải...</p>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400">
                <p className="text-sm">Chưa có đơn hàng nào</p>
              </div>
            ) : (
              recentOrders.map((order) => {
                const orderCode = order.orderCode || order.id;
                const total = order.totalAmount || order.subtotal || 0;
                const status = order.status || "pending";
                const items = order.items || [];
                
                // Get the first item as representative product
                const firstItem = items.length > 0 ? items[0] : null;
                const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
                
                const statusLabels = {
                  pending: "Chờ xác nhận",
                  confirmed: "Đã xác nhận",
                  packing: "Đang đóng gói",
                  shipping: "Đang giao",
                  completed: "Hoàn thành",
                  cancelled: "Đã hủy",
                };
                const statusColors = {
                  pending: "bg-yellow-50 text-yellow-700",
                  confirmed: "bg-blue-50 text-blue-700",
                  packing: "bg-purple-50 text-purple-700",
                  shipping: "bg-indigo-50 text-indigo-700",
                  completed: "bg-brand-bg text-brand-dark",
                  cancelled: "bg-red-50 text-red-700",
                };
                
                return (
                  <Link
                    key={order.id}
                    href={`/store/orders?id=${order.id}`}
                    className="block px-5 py-3 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start gap-3">
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm text-gray-700 font-semibold">#{orderCode}</p>
                        {firstItem ? (
                          <>
                            <p className="text-xs text-gray-600 mt-1 truncate">
                              <span className="font-medium">{firstItem.productName}</span>
                              {items.length > 1 && (
                                <span className="text-gray-500"> +{items.length - 1} sản phẩm khác</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Số lượng: <span className="font-semibold text-gray-700">{totalItems}</span>
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-gray-500 mt-1">{order.customerName || "Khách hàng"}</p>
                        )}
                      </div>
                      
                      {/* Right side: Total & Status */}
                      <div className="text-right shrink-0">
                        <p className="font-bold text-gray-900 text-sm">{(total).toLocaleString("vi-VN")}₫</p>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full inline-flex mt-1 ${statusColors[status] || "bg-gray-50 text-gray-600"}`}>
                          {statusLabels[status] || status}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
          <Link
            href="/store/orders"
            className="py-3 text-center text-sm text-gray-500 hover:text-brand-dark font-medium transition bg-gray-50/50 border-t border-gray-100"
          >
            Xem tất cả →
          </Link>
        </div>
      </div>


    </div>
  );
}
