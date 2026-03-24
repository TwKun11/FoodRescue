"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { apiAdminGetStats, apiAdminGetSellers } from "@/lib/api";

const PAGE_SIZE = 10;
const fmtMoney = (v) =>
  Number(v || 0) >= 1_000_000
    ? `${(Number(v) / 1_000_000).toFixed(1)}M đ`
    : `${Number(v || 0).toLocaleString("vi-VN")} đ`;

export default function AdminRevenuePage() {
  const [stats, setStats] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStores, setTotalStores] = useState(0);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiAdminGetStats().then((res) => (res.ok && res.data?.data ? res.data.data : null)),
      apiAdminGetSellers({ page, size: PAGE_SIZE, search, status: filterStatus || undefined }),
    ]).then(([data, sellersRes]) => {
      setStats(data);
      if (sellersRes?.ok && sellersRes.data?.data) {
        setSellers(sellersRes.data.data.content || []);
        setTotalPages(sellersRes.data.data.totalPages || 1);
        setTotalStores(sellersRes.data.data.totalElements || 0);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [page, search, filterStatus]);

  const totalRevenue = stats?.totalRevenue != null ? Number(stats.totalRevenue) : null;
  const monthlyDataRaw = stats?.monthlyRevenue && stats.monthlyRevenue.length >= 12
    ? stats.monthlyRevenue.slice(0, 12).map((m) => Number(m) || 0)
    : [42, 58, 75, 92, 88, 105, 120, 98, 132, 145, 158, 168];
  const monthlyData = monthlyDataRaw.map((v) => v / 1_000_000); // convert VND -> million VND
  const maxMonthly = Math.max(1, ...monthlyData);
  const chartHeightPx = 150;

  const getLevel = (value) => {
    const ratio = value / maxMonthly;
    if (ratio >= 0.66) return { label: "Cao", color: "bg-emerald-500" };
    if (ratio >= 0.33) return { label: "Trung bình", color: "bg-amber-400" };
    return { label: "Thấp", color: "bg-slate-300" };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Doanh thu</h1>
        <p className="text-sm text-gray-500 mt-1">Tổng hợp doanh thu toàn nền tảng và theo từng cửa hàng</p>
      </div>

      {/* Tổng quan nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tổng doanh thu</p>
          <p className="text-xl font-bold text-brand-dark mt-1">
            {totalRevenue != null ? fmtMoney(totalRevenue) : "—"}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tổng đơn hàng</p>
          <p className="text-xl font-bold text-gray-800 mt-1">{stats?.totalOrders ?? "—"}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Số cửa hàng</p>
          <p className="text-xl font-bold text-gray-800 mt-1">{totalStores}</p>
        </div>
      </div>

      {/* Biểu đồ doanh thu theo tháng */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Biểu đồ doanh thu theo tháng</h2>
        <p className="text-sm text-gray-500 mb-4">Xu hướng doanh thu 12 tháng (đơn vị: triệu đồng)</p>
        <div className="mb-4 flex items-center gap-4 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />Cao</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-amber-400" />Trung bình</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-slate-300" />Thấp</span>
        </div>
        <div className="h-56 flex items-stretch gap-1">
          {monthlyData.map((val, i) => (
            <div key={i} className="h-full flex-1 flex flex-col items-center justify-end gap-1 group">
              <span className="text-xs font-medium text-gray-500 opacity-0 group-hover:opacity-100 transition">
                {val.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tr
              </span>
              <div
                className={`w-full rounded-t transition-all ${getLevel(val).color} group-hover:opacity-90`}
                style={{ height: `${val <= 0 ? 6 : Math.max(14, (val / maxMonthly) * chartHeightPx)}px` }}
                title={`Tháng ${i + 1}: ${val.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu (${getLevel(val).label})`}
              />
              <span className="text-[10px] text-gray-400">{"T" + (i + 1)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danh sách doanh thu từng cửa hàng */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Doanh thu từng cửa hàng</h2>
          <p className="text-sm text-gray-500 mt-0.5">Danh sách cửa hàng — doanh thu chi tiết theo từng seller (10/trang)</p>
        </div>
        {/* Tìm kiếm & Bộ lọc */}
        <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap items-center gap-3 bg-gray-50/50">
          <div className="flex-1 min-w-[180px] flex items-center gap-2">
            <span className="text-gray-500 text-sm shrink-0">Tìm kiếm</span>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Tên cửa hàng, mã, email..."
              className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm shrink-0">Trạng thái</span>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-dark focus:outline-none"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ duyệt</option>
              <option value="active">Đang hoạt động</option>
              <option value="suspended">Tạm khóa</option>
              <option value="closed">Đã đóng</option>
            </select>
          </div>
          {(search || filterStatus) && (
            <button
              type="button"
              onClick={() => { setSearch(""); setFilterStatus(""); setPage(0); }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
        {loading ? (
          <div className="p-10 text-center text-gray-400">Đang tải...</div>
        ) : sellers.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            Chưa có cửa hàng nào.{" "}
            <Link href="/admin/sellers" className="text-brand-dark font-medium hover:underline">
              Tạo cửa hàng
            </Link>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Cửa hàng</th>
                  <th className="px-4 py-3 text-left">Mã</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sellers.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{s.shopName}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{s.code}</td>
                    <td className="px-4 py-3 text-gray-600">{s.email ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      {s.totalRevenue != null ? fmtMoney(s.totalRevenue) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-gray-500">
                Trang {page + 1} / {totalPages} · {totalStores} cửa hàng
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-brand-bg hover:border-brand/50 transition disabled:opacity-40 disabled:pointer-events-none"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-700 min-w-16 text-center">
                  {page + 1} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-brand-bg hover:border-brand/50 transition disabled:opacity-40 disabled:pointer-events-none"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end">
        <Link
          href="/admin/sellers"
          className="text-sm font-medium text-brand-dark hover:underline"
        >
          ← Xem danh sách cửa hàng
        </Link>
      </div>
    </div>
  );
}
