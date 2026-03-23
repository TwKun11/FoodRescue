"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CART_UPDATED_EVENT, getCartQuantityCount, readCart } from "@/lib/cart";

function readUserFromStorage() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");
    return token && raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const NAV_ITEMS = [
  { href: "/", label: "Trang chủ" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/contact", label: "Liên hệ" },
  { href: "/about", label: "Về chúng tôi" },
  { href: "/store", label: "Quản lý" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.scrollY > 60;
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef(null);

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled;
  const displayName = user?.fullName?.trim() || user?.email || "Bạn";
  const canAccessStore = user?.role === "SELLER" || user?.role === "ADMIN";

  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
      setUser(readUserFromStorage());
      setCartCount(getCartQuantityCount(readCart()));
    });

    const syncHeaderState = () => {
      setUser(readUserFromStorage());
      setCartCount(getCartQuantityCount(readCart()));
    };

    window.addEventListener("storage", syncHeaderState);
    window.addEventListener(CART_UPDATED_EVENT, syncHeaderState);
    return () => {
      window.removeEventListener("storage", syncHeaderState);
      window.removeEventListener(CART_UPDATED_EVENT, syncHeaderState);
    };
  }, []);

  useEffect(() => {
    if (!isHome) return;

    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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

  const handleLoginNavigation = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
    if (pathname !== "/login") {
      router.push("/login");
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[70] transition-all duration-300 ${
        transparent ? "bg-transparent" : "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
      }`}
    >
      <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link
          href="/"
          className={`flex items-center gap-2 text-xl font-bold transition-colors duration-300 ${
            transparent ? "text-white" : "text-brand-dark"
          }`}
        >
          <span className="text-2xl">🍃</span>
          <span>FoodRescue</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {NAV_ITEMS.map((item) => {
            const isStoreLink = item.href === "/store";
            if (isStoreLink && !canAccessStore) {
              return (
                <span
                  key={item.href}
                  aria-disabled="true"
                  title="Chỉ khả dụng cho tài khoản nhà bán hàng hoặc quản trị viên"
                  className={`cursor-not-allowed transition-colors duration-200 ${
                    transparent ? "text-white/35" : "text-gray-300"
                  }`}
                >
                  {item.label}
                </span>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors duration-200 ${
                  transparent ? "text-white/85 hover:text-white" : "text-gray-600 hover:text-brand-dark"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="relative z-20 flex shrink-0 items-center gap-3">
          <Link href="/cart" className="relative p-1" aria-label="Giỏ hàng">
            <span className={`text-2xl transition-all duration-200 ${transparent ? "filter brightness-0 invert" : ""}`}>
              🛒
            </span>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs font-bold text-gray-900">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {!mounted || !user ? (
            <button
              type="button"
              onClick={handleLoginNavigation}
              className={`relative z-20 hidden rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 sm:block ${
                transparent
                  ? "border border-white/30 bg-white/15  backdrop-blur-sm hover:bg-white/25"
                  : "bg-brand text-gray-900 hover:opacity-90"
              }`}
            >
              Đăng nhập
            </button>
          ) : (
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((open) => !open)}
                className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-brand/50"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <span className="max-w-30 truncate text-sm text-gray-600">Xin chào, {displayName}</span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-gray-900">
                  {(displayName.charAt(0) || "U").toUpperCase()}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full z-[80] mt-1 w-52 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                  <div className="border-b border-gray-100 px-4 py-2">
                    <p className="truncate text-sm font-medium text-gray-800">{displayName}</p>
                    {user?.email && <p className="truncate text-xs text-gray-500">{user.email}</p>}
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Thông tin cá nhân
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Đơn hàng của tôi
                  </Link>
                  <Link
                    href="/profile/addresses"
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Địa chỉ giao hàng
                  </Link>
                  {user?.role === "CUSTOMER" && (
                    <Link
                      href="/become-seller"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Trở thành nhà bán hàng
                    </Link>
                  )}
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
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            className={`transition-colors duration-200 md:hidden ${transparent ? "text-white" : "text-gray-600"}`}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="text-2xl">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-3 border-t bg-white px-4 py-3 text-sm font-medium text-gray-600 md:hidden">
          {NAV_ITEMS.map((item) => {
            const isStoreLink = item.href === "/store";
            if (isStoreLink && !canAccessStore) {
              return (
                <span
                  key={item.href}
                  aria-disabled="true"
                  className="cursor-not-allowed text-gray-300"
                  title="Chỉ khả dụng cho tài khoản nhà bán hàng hoặc quản trị viên"
                >
                  {item.label}
                </span>
              );
            }

            return (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            );
          })}
          <Link href="/cart" onClick={() => setMenuOpen(false)}>
            Giỏ hàng ({cartCount})
          </Link>
          {mounted && user ? (
            <>
              <p className="px-1 text-gray-500">Xin chào, {displayName}</p>
              <Link href="/profile" onClick={() => setMenuOpen(false)}>
                Thông tin cá nhân
              </Link>
              <Link href="/orders" onClick={() => setMenuOpen(false)}>
                Đơn hàng của tôi
              </Link>
              <Link href="/profile/addresses" onClick={() => setMenuOpen(false)}>
                Địa chỉ giao hàng
              </Link>
              {user?.role === "CUSTOMER" && (
                <Link href="/become-seller" onClick={() => setMenuOpen(false)}>
                  Trở thành nhà bán hàng
                </Link>
              )}
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
            <button type="button" onClick={handleLoginNavigation} className="text-left">
              Đăng nhập
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
