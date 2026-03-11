// FE03-005 – UI Thống kê (API-connected)
"use client";
import { useState, useEffect } from "react";
import { apiGetSellerStats } from "@/lib/api";

export default function StoreStatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGetSellerStats()
      .then((res) => {
        if (res.ok && res.data?.data) {
          setStats(res.data.data);
        } else {
          setError("Không thể tải dữ liệu thống kê");
        }
      })
      .catch(() => setError("Lỗi kết nối đến máy chủ"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Đang tải thống kê...</div>;
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-2">
        <span className="text-3xl">📊</span>
        <p className="text-sm">{error || "Không có dữ liệu"}</p>
      </div>
    );
  }

  const { totalRevenue, totalOrders, completedOrders, avgOrderValue, dailyRevenue, topProducts } = stats;

  const maxRevenue = dailyRevenue?.length ? Math.max(...dailyRevenue.map((d) => Number(d.revenue) || 0), 1) : 1;

  const fmtMoney = (v) =>
    Number(v || 0) >= 1_000_000
      ? `${(Number(v) / 1_000_000).toFixed(1)}M đ`
      : `${Number(v || 0).toLocaleString("vi-VN")}đ`;

  const maxProductRevenue = topProducts?.length
    ? Math.max(...topProducts.map((p) => Number(p.totalRevenue) || 0), 1)
    : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">📈 Thống kê</h1>
        <p className="text-sm text-gray-400 mt-0.5">7 ngày gần nhất (doanh thu từ đơn hoàn thành)</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Tổng doanh thu",
            value: fmtMoney(totalRevenue),
            icon: "💰",
            sub: `${completedOrders} đơn hoàn thành`,
            color: "text-green-600",
          },
          {
            label: "Tổng đơn hàng",
            value: String(totalOrders || 0),
            icon: "📦",
            sub: `${completedOrders} đã giao`,
            color: "text-blue-600",
          },
          {
            label: "Giá trị đơn TB",
            value: fmtMoney(avgOrderValue),
            icon: "📊",
            sub: "Từ đơn hoàn thành",
            color: "text-orange-600",
          },
          {
            label: "Tỉ lệ hoàn thành",
            value: totalOrders > 0 ? `${Math.round((completedOrders / totalOrders) * 100)}%` : "—",
            icon: "✅",
            sub: `${completedOrders}/${totalOrders} đơn`,
            color: "text-purple-600",
          },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{kpi.icon}</span>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{kpi.label}</p>
            </div>
            <p className={`text-2xl font-extrabold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart – last 7 days */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-5">📊 Doanh thu 7 ngày gần nhất</h2>
        {dailyRevenue?.length ? (
          <div className="flex items-end gap-3 h-40">
            {dailyRevenue.map((d) => {
              const rev = Number(d.revenue) || 0;
              const heightPct = maxRevenue > 0 ? (rev / maxRevenue) * 100 : 0;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div className="w-full flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition">
                      {rev > 0 ? fmtMoney(rev) : "0"}
                    </span>
                    <div
                      className={`w-full rounded-t-lg transition-colors cursor-pointer ${
                        rev > 0 ? "bg-orange-300 group-hover:bg-orange-500" : "bg-gray-100"
                      }`}
                      style={{ height: `${Math.max(heightPct * 1.2, rev > 0 ? 4 : 2)}px` }}
                      title={`${d.date}: ${fmtMoney(rev)}`}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-500">{d.dayLabel}</span>
                  <span className="text-[10px] text-gray-400">{d.date}</span>
                  <span className="text-[10px] text-gray-400">{d.orders} đơn</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-10">Chưa có dữ liệu</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">🏆 Sản phẩm bán chạy (30 ngày)</h2>
          {topProducts?.length ? (
            <div className="space-y-4">
              {topProducts.map((p, i) => {
                const pct = Math.round((Number(p.totalRevenue) / maxProductRevenue) * 100);
                return (
                  <div key={p.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`text-xs font-bold w-5 ${
                            i === 0
                              ? "text-yellow-500"
                              : i === 1
                                ? "text-gray-400"
                                : i === 2
                                  ? "text-orange-400"
                                  : "text-gray-300"
                          }`}
                        >
                          #{i + 1}
                        </span>
                        <p className="text-sm text-gray-700 truncate max-w-[200px]">{p.name}</p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="text-xs font-semibold text-orange-600">
                          {Number(p.totalQty || 0).toFixed(0)} bán
                        </p>
                        <p className="text-xs text-gray-400">{fmtMoney(p.totalRevenue)}</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-orange-400 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">Chưa có dữ liệu trong 30 ngày qua</p>
          )}
        </div>

        {/* Performance summary */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">📋 Tóm tắt hiệu suất</h2>
          <div className="space-y-4">
            <InfoRow label="Tổng doanh thu (toàn thời gian)" value={fmtMoney(totalRevenue)} accent="text-green-600" />
            <InfoRow label="Tổng đơn hàng" value={String(totalOrders || 0)} />
            <InfoRow label="Đơn hoàn thành" value={String(completedOrders || 0)} accent="text-green-600" />
            <InfoRow
              label="Đơn chưa hoàn thành"
              value={String(Math.max(0, (totalOrders || 0) - (completedOrders || 0)))}
              accent="text-orange-500"
            />
            <InfoRow label="Giá trị trung bình/đơn" value={fmtMoney(avgOrderValue)} />
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100">
            <button
              className="text-xs text-orange-500 hover:underline"
              onClick={() => {
                const rows = [
                  ["Chỉ số", "Giá trị"],
                  ["Tổng doanh thu", fmtMoney(totalRevenue)],
                  ["Tổng đơn hàng", totalOrders],
                  ["Đơn hoàn thành", completedOrders],
                  ["Giá trị TB/đơn", fmtMoney(avgOrderValue)],
                ];
                const csv = rows.map((r) => r.join(",")).join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "thong_ke.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              📥 Xuất báo cáo CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold ${accent || "text-gray-800"}`}>{value}</span>
    </div>
  );
}
