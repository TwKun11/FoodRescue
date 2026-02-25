// FE03-005 – UI Thống kê
import Link from "next/link";

// ── Mock Data ─────────────────────────────────────────────────────────────
const WEEKLY_REVENUE = [
  { day: "T2", revenue: 2300000, orders: 28 },
  { day: "T3", revenue: 3100000, orders: 41 },
  { day: "T4", revenue: 2700000, orders: 34 },
  { day: "T5", revenue: 4200000, orders: 58 },
  { day: "T6", revenue: 3800000, orders: 52 },
  { day: "T7", revenue: 5100000, orders: 70 },
  { day: "CN", revenue: 4600000, orders: 63 },
];

const TOP_PRODUCTS = [
  { name: "Rau cải xanh hữu cơ 500g", sold: 140, revenue: 2450000, percent: 100 },
  { name: "Tôm sú tươi 200g", sold: 98, revenue: 8232000, percent: 70 },
  { name: "Bánh mì sandwich nguyên cám", sold: 87, revenue: 1957500, percent: 62 },
  { name: "Thịt heo ba chỉ 300g", sold: 73, revenue: 3723000, percent: 52 },
  { name: "Cá basa phi lê 400g", sold: 61, revenue: 2745000, percent: 44 },
];

const CATEGORY_STATS = [
  { label: "Rau củ", percent: 38, color: "bg-green-500" },
  { label: "Hải sản", percent: 28, color: "bg-blue-500" },
  { label: "Thịt tươi", percent: 20, color: "bg-red-400" },
  { label: "Bánh", percent: 14, color: "bg-yellow-400" },
];

const MAX_REVENUE = Math.max(...WEEKLY_REVENUE.map((d) => d.revenue));

export default function StoreStatsPage() {
  const totalWeekRevenue = WEEKLY_REVENUE.reduce((s, d) => s + d.revenue, 0);
  const totalWeekOrders = WEEKLY_REVENUE.reduce((s, d) => s + d.orders, 0);
  const avgOrderValue = Math.round(totalWeekRevenue / totalWeekOrders);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">📈 Thống kê</h1>
        <p className="text-sm text-gray-400 mt-0.5">Tuần 18–24/02/2025</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Doanh thu tuần",
            value: `${(totalWeekRevenue / 1_000_000).toFixed(1)}M đ`,
            icon: "💰",
            sub: "+18% so với tuần trước",
            color: "text-green-600",
          },
          {
            label: "Tổng đơn hàng",
            value: totalWeekOrders,
            icon: "📦",
            sub: "+12% so với tuần trước",
            color: "text-blue-600",
          },
          {
            label: "Giá trị đơn TB",
            value: `${avgOrderValue.toLocaleString("vi-VN")}đ`,
            icon: "📊",
            sub: "+5% so với tuần trước",
            color: "text-orange-600",
          },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{kpi.icon}</span>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{kpi.label}</p>
            </div>
            <p className={`text-3xl font-extrabold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-green-600 mt-1 font-medium">▲ {kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-5">📊 Doanh số theo ngày trong tuần</h2>
        <div className="flex items-end gap-3 h-40">
          {WEEKLY_REVENUE.map((d) => {
            const heightPct = (d.revenue / MAX_REVENUE) * 100;
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div className="w-full flex flex-col items-center">
                  <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition">
                    {(d.revenue / 1_000_000).toFixed(1)}M
                  </span>
                  <div
                    className="w-full bg-orange-300 group-hover:bg-orange-500 rounded-t-lg transition-colors cursor-pointer"
                    style={{ height: `${heightPct * 1.2}px` }}
                    title={`${d.day}: ${d.revenue.toLocaleString("vi-VN")}đ`}
                  />
                </div>
                <span className="text-xs font-medium text-gray-500">{d.day}</span>
                <span className="text-[10px] text-gray-400">{d.orders} đơn</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">🏆 Sản phẩm bán chạy nhất</h2>
          <div className="space-y-4">
            {TOP_PRODUCTS.map((p, i) => (
              <div key={p.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`text-xs font-bold w-5 ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-orange-400" : "text-gray-300"}`}
                    >
                      #{i + 1}
                    </span>
                    <p className="text-sm text-gray-700 truncate max-w-[200px]">{p.name}</p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-xs font-semibold text-orange-600">{p.sold} bán</p>
                    <p className="text-xs text-gray-400">{(p.revenue / 1000).toFixed(0)}k đ</p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-orange-400 h-1.5 rounded-full transition-all" style={{ width: `${p.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">🗂️ Phân bổ theo danh mục</h2>
          <div className="space-y-4">
            {CATEGORY_STATS.map((cat) => (
              <div key={cat.label} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{cat.label}</span>
                  <span className="text-gray-500">{cat.percent}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className={`${cat.color} h-3 rounded-full transition-all`}
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Donut-style legend */}
          <div className="mt-6 grid grid-cols-2 gap-2">
            {CATEGORY_STATS.map((cat) => (
              <div key={cat.label} className="flex items-center gap-2 text-xs text-gray-600">
                <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                <span>
                  {cat.label} ({cat.percent}%)
                </span>
              </div>
            ))}
          </div>

          {/* Export hint */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button className="text-xs text-orange-500 hover:underline">📥 Xuất báo cáo CSV</button>
          </div>
        </div>
      </div>
    </div>
  );
}
