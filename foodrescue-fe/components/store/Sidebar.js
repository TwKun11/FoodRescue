"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/store", label: "Dashboard", icon: "📊" },
  { href: "/store/products", label: "Sản phẩm", icon: "🛍️" },
  { href: "/store/orders", label: "Đơn hàng", icon: "📦" },
  { href: "/store/stats", label: "Thống kê", icon: "📈" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-gray-900 text-gray-300 min-h-screen flex flex-col">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-gray-700">
        <Link href="/store" className="flex items-center gap-2 text-white font-bold text-lg">
          <span>🍃</span>
          <span>FoodRescue</span>
        </Link>
        <p className="text-xs text-gray-500 mt-0.5">Store Dashboard</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/store" ? pathname === "/store" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                active ? "bg-orange-500 text-white" : "hover:bg-gray-800 text-gray-300"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
            C
          </div>
          <div>
            <p className="text-white text-xs font-semibold">Circle K Q1</p>
            <p className="text-gray-500 text-xs">store@circlek.vn</p>
          </div>
        </div>
        <Link href="/store/login" className="text-xs text-gray-500 hover:text-red-400 transition">
          🚪 Đăng xuất
        </Link>
      </div>
    </aside>
  );
}
