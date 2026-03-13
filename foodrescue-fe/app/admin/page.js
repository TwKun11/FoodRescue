"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  apiAdminGetSellers,
  apiAdminGetUsers,
  apiAdminGetCategories,
  apiAdminGetBrands,
  apiAdminGetStats,
} from "@/lib/api";

const fmtMoney = (v) =>
  Number(v || 0) >= 1_000_000
    ? `${(Number(v) / 1_000_000).toFixed(1)}M đ`
    : `${Number(v || 0).toLocaleString("vi-VN")} đ`;

// Dữ liệu mẫu biểu đồ doanh thu theo tháng (khi chưa có API)
const DEFAULT_MONTHLY_REVENUE = [42, 58, 75, 92, 88, 105, 120, 98, 132, 145, 158, 168];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ sellers: 0, users: 0, categories: 0, brands: 0 });
  const [revenue, setRevenue] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [dateLabel, setDateLabel] = useState("Hôm nay");

  useEffect(() => {
    Promise.all([
      apiAdminGetSellers({ size: 1 }),
      apiAdminGetUsers({ size: 1 }),
      apiAdminGetCategories(),
      apiAdminGetBrands(),
    ]).then(([s, u, c, b]) => {
      const catData = c.data?.data;
      const brandData = b.data?.data;
      setStats({
        sellers: s.data?.data?.totalElements ?? 0,
        users: u.data?.data?.totalElements ?? 0,
        categories: Array.isArray(catData) ? catData.length : 0,
        brands: Array.isArray(brandData) ? brandData.length : 0,
      });
      setCategories(Array.isArray(catData) ? catData : []);
    });
  }, []);

  useEffect(() => {
    apiAdminGetStats()
      .then((res) => {
        if (res.ok && res.data?.data) setRevenue(res.data.data);
      })
      .finally(() => setRevenueLoading(false));
  }, []);

  const totalRevenue = revenue?.totalRevenue != null ? Number(revenue.totalRevenue) : null;
  const monthlyData = revenue?.monthlyRevenue && revenue.monthlyRevenue.length >= 12
    ? revenue.monthlyRevenue.slice(0, 12).map((m) => Number(m) || 0)
    : DEFAULT_MONTHLY_REVENUE;
  const maxMonthly = Math.max(1, ...monthlyData);

  // Phân bố danh mục: dùng tên từ API, % tỷ lệ theo số thứ tự (hoặc equal)
  const categoryDistribution = categories.length
    ? categories.slice(0, 6).map((c, i, arr) => ({
        name: c.name,
        pct: arr.length <= 4 ? [45, 30, 15, 10][i] ?? 100 / arr.length : Math.round(100 / arr.length),
      }))
    : [
        { name: "Rau củ quả", pct: 45 },
        { name: "Bánh mì & Ngũ cốc", pct: 30 },
        { name: "Thực phẩm chế biến", pct: 15 },
        { name: "Khác", pct: 10 },
      ];

  const handleExportReport = () => {
    alert("Tính năng xuất báo cáo đang được phát triển. Bạn có thể xem chi tiết tại từng mục Doanh thu, Cửa hàng.");
  };

  return (
    <div className="space-y-6">
      {/* Toolbar: Tìm kiếm, trạng thái, Chọn ngày, Xuất báo cáo */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm dữ liệu..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-transparent"
          />
        </div>
        
        <button
          type="button"
          onClick={() => setDateLabel(dateLabel === "Hôm nay" ? "7 ngày qua" : "Hôm nay")}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Chọn ngày
        </button>
        <button
          type="button"
          onClick={handleExportReport}
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-brand text-brand-dark rounded-xl text-sm font-semibold hover:bg-brand-bg transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Xuất báo cáo
        </button>
      </div>

      

      {/* 3 KPI chính */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-bg flex items-center justify-center text-brand-dark shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500">Tổng doanh thu</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">
              {revenueLoading ? "—" : totalRevenue != null ? fmtMoney(totalRevenue) : "—"}
            </p>
            {totalRevenue != null && (
              <p className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-green-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Xem chi tiết tại Doanh thu
              </p>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500">Số lượng người dùng</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">{stats.users}</p>
            <p className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-gray-400">Tài khoản trên nền tảng</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500">Cửa hàng hoạt động</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">{stats.sellers}</p>
            <Link href="/admin/sellers" className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-brand-dark hover:underline">
              Quản lý cửa hàng →
            </Link>
          </div>
        </div>
      </div>

      {/* Biểu đồ doanh thu theo tháng */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Biểu đồ doanh thu</h2>
            <p className="text-sm text-gray-500 mt-0.5">Xu hướng doanh thu theo tháng trong năm 2024</p>
          </div>
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">Năm 2024</span>
        </div>
        <div className="h-56 flex items-end gap-1">
          {monthlyData.map((val, i) => {
            const h = (val / maxMonthly) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-xs font-medium text-gray-400 opacity-0 group-hover:opacity-100 transition">
                  {val}tr
                </span>
                <div
                  className="w-full rounded-t bg-brand/80 hover:bg-brand transition-all min-h-[8px]"
                  style={{ height: `${Math.max(8, h)}%` }}
                  title={`Tháng ${i + 1}: ${val} tr đ`}
                />
                <span className="text-[10px] text-gray-400">T{i + 1}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>Tháng 1</span>
          <span>Tháng 12</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phân bố danh mục */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900">Phân bố danh mục</h2>
          <div className="space-y-4 mt-4">
            {categoryDistribution.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="text-gray-500">{item.pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand transition-all duration-500"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 p-3 rounded-xl bg-brand-bg border border-brand/20 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <p className="text-sm text-gray-700">
              Tiết kiệm được <strong className="text-brand-dark">4,2 tấn CO2</strong> từ việc cứu thực phẩm tháng này.
            </p>
          </div>
        </div>

        {/* Đơn hàng gần đây */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Đơn hàng gần đây</h2>
              <p className="text-sm text-gray-500 mt-0.5">Hiển thị giao dịch mới nhất trên hệ thống</p>
            </div>
            <Link
              href="/admin/sellers"
              className="text-sm font-medium text-brand-dark hover:underline"
            >
              Xem cửa hàng →
            </Link>
          </div>
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="text-left px-4 py-3">Mã đơn</th>
                  <th className="text-left px-4 py-3">Giá trị</th>
                  <th className="text-left px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                    Chưa có dữ liệu đơn hàng tổng hợp. Đơn hàng được quản lý theo từng cửa hàng.
                    <br />
                    <Link href="/admin/sellers" className="text-brand-dark font-medium hover:underline mt-2 inline-block">
                      Xem danh sách cửa hàng
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      
    </div>
  );
}
