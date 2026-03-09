"use client";
import AdminGuard from "@/components/common/AdminGuard";

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 overflow-hidden">
          <AdminHeader />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}

function AdminSidebar() {
  const NAV = [
    { href: "/admin", label: "Tổng quan", icon: "📊" },
    { href: "/admin/sellers", label: "Cửa hàng", icon: "🏪" },
    { href: "/admin/users", label: "Người dùng", icon: "👥" },
    { href: "/admin/categories", label: "Danh mục", icon: "🗂️" },
  ];
  return (
    <aside className="w-52 shrink-0 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="px-4 py-4 border-b border-gray-100">
        <p className="font-bold text-gray-800 text-sm">Food Rescue</p>
        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Admin Panel</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
          >
            <span>{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.clear();
              window.location.href = "/login";
            }
          }}
          className="w-full text-left text-sm text-red-500 hover:text-red-700 transition"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}

function AdminHeader() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
      <div className="flex-1" />
      <span className="text-xs font-semibold bg-red-50 text-red-600 px-2 py-1 rounded-full">ADMIN</span>
    </header>
  );
}
