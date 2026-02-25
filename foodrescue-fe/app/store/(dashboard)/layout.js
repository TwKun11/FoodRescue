import Sidebar from "@/components/store/Sidebar";

/**
 * Store Dashboard Layout — Sidebar + main content
 * Áp dụng cho: /store, /store/products, /store/orders, /store/stats
 * Sử dụng Route Group (dashboard) để nhóm các trang dashboard mà không thêm segment URL.
 */
export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
