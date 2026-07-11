"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/store/Sidebar";
import SellerTutorialGuide from "@/components/store/SellerTutorialGuide";
import StoreGuard from "@/components/store/StoreGuard";
import ThemeToggle from "@/components/common/ThemeToggle";
import { apiLogout, getAuthUser, subscribeAuth } from "@/lib/api";
import { apiGetMyShop } from "@/lib/api";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [shopName, setShopName] = useState("");
  const [contactName, setContactName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await apiLogout().catch(() => {});
    router.push("/login");
  };

  const handleAddProduct = () => {
    router.push(`/store/products?create=${Date.now()}`);
  };

  const handleSwitchToCustomer = () => {
    setDropdownOpen(false);
    router.push("/");
  };

  useEffect(() => {
    apiGetMyShop()
      .then((res) => {
        if (res.ok && res.data?.data) {
          setShopName(res.data.data.shopName || "");
          setContactName(res.data.data.contactName || "");
        }
      })
      .catch(() => {});
  }, []);

  return (
    <StoreGuard>
      <div className="store-dashboard flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 shrink-0">
            {/* Search */}
            <div className="flex-1 max-w-sm relative" data-guide-title="Ô tìm kiếm nhanh" data-guide-text="Dùng để tìm nhanh sản phẩm hoặc mã SKU trong kênh người bán khi danh sách nhiều.">
              <svg
                className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm tên sản phẩm, mã SKU..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-dark"
              />
            </div>
            <div className="flex items-center gap-3 ml-auto" data-guide-title="Thanh công cụ seller" data-guide-text="Khu vực thao tác nhanh: đổi giao diện sáng/tối, thêm sản phẩm mới, xem thông báo đơn và mở menu tài khoản.">
              <ThemeToggle compact />

              {/* Add button */}
              <button
                type="button"
                data-guide-title="Thêm sản phẩm mới"
                data-guide-text="Nút này mở form tạo sản phẩm để seller đăng món mới, thêm giá, ảnh, hạn dùng và tồn kho."
                onClick={handleAddProduct}
                className="flex items-center gap-2 bg-brand hover:bg-brand-secondary text-gray-900 text-sm font-semibold px-4 py-2 rounded-lg transition"
                aria-current={pathname === "/store/products" ? "page" : undefined}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm sản phẩm mới
              </button>
              {/* Bell */}
              <button
                type="button"
                data-guide-title="Thông báo đơn hàng"
                data-guide-text="Đi nhanh tới trang đơn hàng để seller kiểm tra đơn mới, đơn chờ xác nhận hoặc các đơn cần xử lý."
                onClick={() => router.push("/store/orders")}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
                aria-label="Xem thông báo đơn hàng"
                title="Xem thông báo đơn hàng"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              {/* User avatar + dropdown */}
              <div className="relative" ref={dropdownRef} data-guide-title="Tài khoản cửa hàng" data-guide-text="Hiển thị người bán và tên cửa hàng hiện tại. Bấm để chuyển sang kênh người dùng hoặc đăng xuất.">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setDropdownOpen((v) => !v); }}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded-lg transition"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-semibold text-gray-700 leading-tight">{contactName || "Người bán"}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{shopName || "Cửa hàng"}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-brand-bg border-2 border-brand/60 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-brand-dark" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 transition ${dropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <button
                      type="button"
                      onClick={handleSwitchToCustomer}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l9-9 9 9M5 10v10h14V10" />
                      </svg>
                      Kênh người dùng
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">{children}</main>
          <SellerTutorialGuide />
        </div>
      </div>
    </StoreGuard>
  );
}
