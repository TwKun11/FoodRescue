// FE03-005 – UI Doanh thu / Thống kê (API-connected)
"use client";
import { useState, useEffect } from "react";
import { apiGetSellerStats } from "@/lib/api";
import Link from "next/link";

// ── Icons SVG ─────────────────────────────────────────────────────────────
const IconChart = () => (
  <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h2v-2H3v2zm4 4h2v-6H7v6zm4 0h2v-6h-2v6zm4 0h2V7h-2v10z" />
  </svg>
);
const IconCurrency = () => (
  <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconPackage = () => (
  <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);
const IconTrending = () => (
  <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconTrophy = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);
const IconDownload = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

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
    return (
      <div className="p-6 sm:p-8 flex flex-col items-center justify-center min-h-[320px]">
        <div className="w-12 h-12 rounded-xl bg-brand-bg flex items-center justify-center text-brand-dark animate-pulse">
          <IconChart />
        </div>
        <p className="text-sm text-gray-500 mt-4">Đang tải thống kê...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 sm:p-8 flex flex-col items-center justify-center min-h-[320px] text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
          <IconChart />
        </div>
        <p className="font-medium text-gray-700">{error || "Không có dữ liệu"}</p>
        <p className="text-sm text-gray-500 mt-1">Vui lòng thử lại sau hoặc liên hệ hỗ trợ.</p>
      </div>
    );
  }

  const { totalRevenue, totalOrders, completedOrders, avgOrderValue, dailyRevenue, topProducts } = stats;
  const maxRevenue = dailyRevenue?.length ? Math.max(...dailyRevenue.map((d) => Number(d.revenue) || 0), 1) : 1;
  const fmtMoney = (v) =>
    Number(v || 0) >= 1_000_000
      ? `${(Number(v) / 1_000_000).toFixed(1)}M đồng`
      : `${Number(v || 0).toLocaleString("vi-VN")} đồng`;
  const maxProductRevenue = topProducts?.length
    ? Math.max(...topProducts.map((p) => Number(p.totalRevenue) || 0), 1)
    : 1;
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  const kpis = [
    {
      label: "Tổng doanh thu",
      value: fmtMoney(totalRevenue),
      sub: `${completedOrders} đơn hoàn thành`,
      icon: <IconCurrency />,
      bg: "bg-brand-bg",
      iconColor: "text-brand-dark",
      valueColor: "text-brand-dark",
    },
    {
      label: "Tổng đơn hàng",
      value: String(totalOrders || 0),
      sub: `${completedOrders} đã giao`,
      icon: <IconPackage />,
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
      valueColor: "text-blue-600",
    },
    {
      label: "Giá trị đơn TB",
      value: fmtMoney(avgOrderValue),
      sub: "Từ đơn hoàn thành",
      icon: <IconTrending />,
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
      valueColor: "text-amber-600",
    },
    {
      label: "Tỉ lệ hoàn thành",
      value: totalOrders > 0 ? `${completionRate}%` : "—",
      sub: `${completedOrders}/${totalOrders} đơn`,
      icon: <IconCheck />,
      bg: "bg-purple-50",
      iconColor: "text-purple-600",
      valueColor: "text-purple-600",
    },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Doanh thu</h1>
          <p className="text-sm text-gray-500 mt-1">
            7 ngày gần nhất — doanh thu từ đơn hoàn thành
          </p>
        </div>
        <Link
          href="/store"
          className="text-sm font-medium text-brand-dark hover:text-brand-secondary transition"
        >
          ← Tổng quan
        </Link>
      </div>

      {/* KPI Cards */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Chỉ số chính</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 hover:border-brand/30 transition"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${kpi.bg} ${kpi.iconColor}`}>
                {kpi.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{kpi.label}</p>
                <p className={`text-xl font-bold mt-0.5 ${kpi.valueColor}`}>{kpi.value}</p>
                <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Doanh thu 7 ngày */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-brand-bg flex items-center justify-center text-brand-dark">
            <IconChart />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Doanh thu 7 ngày gần nhất</h2>
            <p className="text-xs text-gray-500 mt-0.5">Hover vào cột để xem chi tiết</p>
          </div>
        </div>
        <div className="p-5">
          {dailyRevenue?.length ? (
            <div className="flex items-end gap-3 h-44">
              {dailyRevenue.map((d) => {
                const rev = Number(d.revenue) || 0;
                const heightPct = maxRevenue > 0 ? (rev / maxRevenue) * 100 : 0;
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-medium text-gray-400 opacity-0 group-hover:opacity-100 transition order-1">
                      {rev > 0 ? fmtMoney(rev) : "0"}
                    </span>
                    <div
                      className={`w-full rounded-t-lg transition-all cursor-pointer min-h-[6px] ${
                        rev > 0 ? "bg-brand/60 group-hover:bg-brand-dark" : "bg-gray-100"
                      }`}
                      style={{ height: `${Math.max(heightPct * 1.1, rev > 0 ? 8 : 4)}px` }}
                      title={`${d.date}: ${fmtMoney(rev)} • ${d.orders || 0} đơn`}
                    />
                    <span className="text-xs font-medium text-gray-600">{d.dayLabel}</span>
                    <span className="text-[10px] text-gray-400">{d.date}</span>
                    <span className="text-[10px] text-gray-400">{d.orders ?? 0} đơn</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                <IconChart />
              </div>
              <p className="text-sm text-gray-500 mt-3">Chưa có dữ liệu 7 ngày qua</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sản phẩm bán chạy */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <IconTrophy />
            </div>
            <h2 className="font-semibold text-gray-900">Sản phẩm bán chạy</h2>
            <span className="text-xs text-gray-400 ml-1">(30 ngày)</span>
          </div>
          <div className="p-5">
            {topProducts?.length ? (
              <div className="space-y-4">
                {topProducts.map((p, i) => {
                  const pct = Math.round((Number(p.totalRevenue) / maxProductRevenue) * 100);
                  const rankStyle =
                    i === 0 ? "text-amber-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-gray-300";
                  return (
                    <div key={p.name || i} className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-xs font-bold w-5 shrink-0 ${rankStyle}`}>#{i + 1}</span>
                          <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-semibold text-brand-dark">{fmtMoney(p.totalRevenue)}</p>
                          <p className="text-[10px] text-gray-400">{Number(p.totalQty || 0).toFixed(0)} đã bán</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-brand h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-500">Chưa có dữ liệu trong 30 ngày qua</p>
              </div>
            )}
          </div>
        </div>

        {/* Tóm tắt hiệu suất + Xuất CSV */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Tóm tắt hiệu suất</h2>
          </div>
          <div className="p-5 space-y-4">
            <InfoRow label="Tổng doanh thu (toàn thời gian)" value={fmtMoney(totalRevenue)} accent="text-brand-dark" />
            <InfoRow label="Tổng đơn hàng" value={String(totalOrders || 0)} />
            <InfoRow label="Đơn hoàn thành" value={String(completedOrders || 0)} accent="text-brand-dark" />
            <InfoRow
              label="Đơn chưa hoàn thành"
              value={String(Math.max(0, (totalOrders || 0) - (completedOrders || 0)))}
              accent="text-amber-600"
            />
            <InfoRow label="Giá trị trung bình / đơn" value={fmtMoney(avgOrderValue)} />
          </div>
          <div className="px-5 pb-5 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                const rows = [
                  ["Chỉ số", "Giá trị"],
                  ["Tổng doanh thu", fmtMoney(totalRevenue)],
                  ["Tổng đơn hàng", totalOrders],
                  ["Đơn hoàn thành", completedOrders],
                  ["Giá trị TB/đơn", fmtMoney(avgOrderValue)],
                ];
                const csv = rows.map((r) => r.join(",")).join("\n");
                const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "thong_ke_doanh_thu.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-dark hover:text-brand-secondary transition"
            >
              <IconDownload />
              Xuất báo cáo CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold ${accent || "text-gray-800"}`}>{value}</span>
    </div>
  );
}
