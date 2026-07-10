"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/store", label: "Tổng quan", icon: DashboardIcon },
  { href: "/store/shop", label: "Cửa hàng", icon: ShopIcon },
  { href: "/store/products", label: "Sản phẩm", icon: BoxIcon },
  { href: "/store/orders", label: "Đơn hàng", icon: OrderIcon },
  { href: "/store/reviews", label: "Đánh giá", icon: ReviewIcon },  { href: "/store/stats", label: "Doanh thu", icon: RevenueIcon },
  { href: "/store/wallet", label: "Vi & chi tra", icon: WalletIcon },
  { href: "/store/inventory", label: "Kho hàng", icon: InventoryIcon },
  { href: "/store/ads", label: "Quảng cáo", icon: AdsIcon },
  { href: "/store/settings", label: "Cài đặt", icon: SettingsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-48 shrink-0 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="px-4 py-4 border-b border-gray-100">
        <Link href="/store" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-dark flex items-center justify-center shrink-0">
            <LeafIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm leading-tight">Food Rescue</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Hệ thống quản lý</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/store" ? pathname === "/store" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? "bg-brand text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "text-white" : "text-gray-400"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
        >
          <HomeIcon className="h-5 w-5 text-emerald-600" />
          Kênh người dùng
        </Link>
      </div>

      <div className="mx-3 bg-brand-bg border border-brand/50 rounded-xl p-3">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Gói cửa hàng</p>
        <p className="text-xs text-gray-500 mb-2">Hạn dùng: 15/12/2024</p>
        <button className="w-full bg-brand hover:bg-brand-secondary text-white text-xs font-semibold py-1.5 rounded-lg transition">
          Gia hạn ngay
        </button>
      </div>
    </aside>
  );
}

function IconBase({ className, children }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

function LeafIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17 8C8 10 5.9 16.17 3.82 19.34c-.06.1.04.22.15.17C6.84 18 12.5 15.5 17 8z" />
      <path d="M17 8c0 0-2 7-14 11 0 0 2-11 14-11z" opacity=".4" />
    </svg>
  );
}

function DashboardIcon(props) { return <IconBase {...props}><path d="M4 5h6v6H4z" /><path d="M14 5h6v6h-6z" /><path d="M4 15h6v4H4z" /><path d="M14 15h6v4h-6z" /></IconBase>; }
function ShopIcon(props) { return <IconBase {...props}><path d="M4 10h16" /><path d="M5 10l1-5h12l1 5" /><path d="M6 10v9h12v-9" /><path d="M9 19v-5h6v5" /></IconBase>; }
function BoxIcon(props) { return <IconBase {...props}><path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></IconBase>; }
function OrderIcon(props) { return <IconBase {...props}><path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><path d="M3 6h.01" /><path d="M3 12h.01" /><path d="M3 18h.01" /></IconBase>; }
function ReviewIcon(props) { return <IconBase {...props}><path d="M21 15a4 4 0 0 1-4 4H7l-4 2 1.4-4.2A4 4 0 0 1 3 14V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" /><path d="m8 10 2 2 4-4" /></IconBase>; }
function RevenueIcon(props) { return <IconBase {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v10" /><path d="M15 9.5A3 3 0 0 0 12 8c-1.7 0-3 .9-3 2s1.3 2 3 2 3 .9 3 2-1.3 2-3 2a3 3 0 0 1-3-1.5" /></IconBase>; }
function WalletIcon(props) { return <IconBase {...props}><path d="M20 7H5a2 2 0 0 0 0 4h15v8H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h13v4" /><path d="M16 14h.01" /></IconBase>; }
function InventoryIcon(props) { return <IconBase {...props}><path d="M3 21h18" /><path d="M4 21V9l8-6 8 6v12" /><path d="M9 21v-8h6v8" /></IconBase>; }
function AdsIcon(props) { return <IconBase {...props}><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h10" /></IconBase>; }
function SettingsIcon(props) { return <IconBase {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3h.1A1.7 1.7 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1A1.7 1.7 0 0 0 20.9 10h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></IconBase>; }
function HomeIcon(props) { return <IconBase {...props}><path d="M3 12 12 3l9 9" /><path d="M5 10v10h14V10" /></IconBase>; }
