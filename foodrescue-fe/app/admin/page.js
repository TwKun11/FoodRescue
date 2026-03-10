"use client";
import { useState, useEffect } from "react";
import { apiAdminGetSellers, apiAdminGetUsers } from "@/lib/api";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ sellers: 0, users: 0 });

  useEffect(() => {
    Promise.all([apiAdminGetSellers({ size: 1 }), apiAdminGetUsers({ size: 1 })]).then(([s, u]) => {
      setStats({
        sellers: s.data?.data?.totalElements ?? 0,
        users: u.data?.data?.totalElements ?? 0,
      });
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h1>
        <p className="text-sm text-gray-400 mt-0.5">Quản trị viên toàn hệ thống</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Cửa hàng" value={stats.sellers} color="green" />
        <StatCard label="Người dùng" value={stats.users} color="blue" />
        <StatCard label="Vai trò" value="ADMIN" color="red" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuickLink href="/admin/sellers" label="Quản lý cửa hàng" desc="Tạo, xem xét và xác minh seller" icon="🏪" />
        <QuickLink href="/admin/users" label="Quản lý người dùng" desc="Xem danh sách và khoá tài khoản" icon="👥" />
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <div className={`rounded-xl p-5 ${colors[color]}`}>
      <p className="text-sm font-medium opacity-70">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

function QuickLink({ href, label, desc, icon }) {
  return (
    <a
      href={href}
      className="flex items-start gap-4 bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition"
    >
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="font-semibold text-gray-800">{label}</p>
        <p className="text-sm text-gray-400 mt-0.5">{desc}</p>
      </div>
    </a>
  );
}
