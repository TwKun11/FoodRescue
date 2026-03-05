"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Mock cart count — sẽ thay bằng global state / context sau
  const cartCount = 3;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("user");
      const token = localStorage.getItem("accessToken");
      if (token && raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, [mounted]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = () => {
    setDropdownOpen(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
    setUser(null);
    router.push("/");
  };

  const displayName = user?.fullName?.trim() || user?.email || "Bạn";

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-brand-dark">
          <span className="text-2xl">🍃</span>
          <span>FoodRescue</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-brand-dark transition">
            Trang chủ
          </Link>
          <Link href="/products" className="hover:text-brand-dark transition">
            Sản phẩm
          </Link>
          <Link href="/contact" className="hover:text-brand-dark transition">
            Liên hệ
          </Link>
          <Link href="/about" className="hover:text-brand-dark transition">
            Về chúng tôi
          </Link>
          <Link href="/store" className="hover:text-brand-dark transition">
            Quản lý
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link href="/cart" className="relative p-1">
            <span className="text-2xl">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-brand text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Đăng nhập hoặc User avatar + dropdown (sau mount mới đọc localStorage) */}
          {!mounted || !user ? (
            <Link
              href="/login"
              className="bg-brand text-gray-900 px-4 py-1.5 rounded-full text-sm font-medium hover:opacity-90 transition hidden sm:block"
            >
              Đăng nhập
            </Link>
          ) : (
            <>
              <div className="relative hidden sm:block" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-brand/50"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <span className="text-sm text-gray-600 max-w-[120px] truncate">
                    Xin chào, {displayName}
                  </span>
                  <span className="w-9 h-9 rounded-full bg-brand text-gray-900 font-semibold flex items-center justify-center text-sm shrink-0">
                    {(displayName.charAt(0) || "U").toUpperCase()}
                  </span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800 truncate">{displayName}</p>
                      {user?.email && (
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      )}
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Thông tin cá nhân
                    </Link>
                    <Link
                      href="/change-password"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Đổi mật khẩu
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          <button className="md:hidden text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="text-2xl">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <nav className="md:hidden bg-white border-t px-4 py-3 flex flex-col gap-3 text-sm font-medium text-gray-600">
          <Link href="/" onClick={() => setMenuOpen(false)}>
            Trang chủ
          </Link>
          <Link href="/products" onClick={() => setMenuOpen(false)}>
            Sản phẩm
          </Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)}>
            Liên hệ
          </Link>
          <Link href="/about" onClick={() => setMenuOpen(false)}>
            Về chúng tôi
          </Link>
          <Link href="/store" onClick={() => setMenuOpen(false)}>
            Quản lý
          </Link>
          <Link href="/cart" onClick={() => setMenuOpen(false)}>
            Giỏ hàng ({cartCount})
          </Link>
          {mounted && user ? (
            <>
              <p className="px-1 text-gray-500">Xin chào, {displayName}</p>
              <Link href="/profile" onClick={() => setMenuOpen(false)}>
                Thông tin cá nhân
              </Link>
              <Link href="/change-password" onClick={() => setMenuOpen(false)}>
                Đổi mật khẩu
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="text-left text-red-600"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              Đăng nhập
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
