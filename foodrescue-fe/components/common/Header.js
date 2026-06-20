"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CART_UPDATED_EVENT, getCartQuantityCount, readCart } from "@/lib/cart";
import { apiGetMyVouchers } from "@/lib/api";

const NAV_ITEMS = [
  { id: "home", label: "Trang chủ" },
  { href: "/products", label: "Sản phẩm" },
  { id: "how-it-works", label: "Cách hoạt động" },
  { id: "deals", label: "Ưu đãi" },
  { id: "for-stores", label: "Dành cho cửa hàng" },
  { id: "about-food-rescue", label: "Về Food Rescue" },
];

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

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [unusedVoucherCount, setUnusedVoucherCount] = useState(0);
  const dropdownRef = useRef(null);

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled;
  const displayName = user?.fullName?.trim() || user?.email || "Bạn";

  useEffect(() => {
    setMounted(true);
    setUser(readUserFromStorage());
    setCartCount(getCartQuantityCount(readCart()));

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
    if (!user) {
      setUnusedVoucherCount(0);
      return;
    }

    const loadUnusedVoucherCount = () =>
      apiGetMyVouchers().then((res) => {
        if (!res.ok) return;
        const vouchers = res.data?.data || [];
        setUnusedVoucherCount(vouchers.filter((item) => !item.usedAt).length);
      });

    loadUnusedVoucherCount();
    window.addEventListener("voucher-wallet-updated", loadUnusedVoucherCount);
    return () =>
      window.removeEventListener(
        "voucher-wallet-updated",
        loadUnusedVoucherCount,
      );
  }, [user, pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    setMenuOpen(false);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  const handleLoginNavigation = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
    router.push("/login");
  };

  const scrollToSection = (sectionId) => {
    if (pathname !== "/") {
      router.push(`/#${sectionId}`);
      return;
    }

    const element = document.getElementById(sectionId);

    if (!element) return;

    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-[70] transition-all duration-300 ${
        transparent
          ? "bg-transparent"
          : "border-b border-emerald-100 bg-white/95 shadow-sm backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link
          href="/"
          className={`flex items-center gap-2.5 transition-colors ${transparent ? "text-white" : "text-emerald-900"}`}
          onClick={() => setMenuOpen(false)}
          aria-label="Food Rescue trang chủ"
        >
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-emerald-100">
            <Image
              src="/images/logo.png"
              alt=""
              width={40}
              height={40}
              className="h-full w-full object-contain"
              priority
            />
          </span>
          <span className="text-xl font-extrabold tracking-tight">
            Food Rescue
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-semibold md:flex">
          {NAV_ITEMS.map((item) =>
            item.href ? (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${
                  transparent
                    ? "text-white/85 hover:text-white"
                    : "text-gray-600 hover:text-emerald-800"
                }`}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`transition-colors ${
                  transparent
                    ? "text-white/85 hover:text-white"
                    : "text-gray-600 hover:text-emerald-800"
                }`}
              >
                {item.label}
              </button>
            ),
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/vouchers"
            className="relative p-1"
            aria-label="Kho voucher"
          >
            <span
              className={`text-xl ${transparent ? "brightness-0 invert" : ""}`}
            >
              🎟️
            </span>
            {unusedVoucherCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-xs font-bold text-white">
                {unusedVoucherCount > 99 ? "99+" : unusedVoucherCount}
              </span>
            )}
          </Link>

          <Link href="/cart" className="relative p-1" aria-label="Giỏ hàng">
            <span
              className={`text-xl ${transparent ? "brightness-0 invert" : ""}`}
            >
              🛒
            </span>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs font-bold text-gray-900">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {!mounted || !user ? (
            <button
              type="button"
              onClick={handleLoginNavigation}
              className="hidden rounded-full bg-[#33FF99] px-4 py-2 text-sm font-bold text-gray-950 shadow-md shadow-emerald-900/20 transition hover:bg-[#12d18e] focus:outline-none focus:ring-2 focus:ring-[#33FF99]/60 sm:block"
            >
              Đăng nhập
            </button>
          ) : (
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((open) => !open)}
                className={`flex items-center gap-2 rounded-full px-2 py-1 transition-colors ${
                  dropdownOpen ? "bg-emerald-100" : "hover:bg-gray-100"
                } focus:outline-none focus:ring-0`}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <span
                  className={`max-w-32 truncate text-sm ${transparent ? "text-white" : "text-gray-600"}`}
                >
                  Xin chào, {displayName}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-gray-900">
                  {(displayName.charAt(0) || "U").toUpperCase()}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full z-[80] mt-2 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                  <div className="border-b border-gray-100 px-4 py-2">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {displayName}
                    </p>
                    {user?.email && (
                      <p className="truncate text-xs text-gray-500">
                        {user.email}
                      </p>
                    )}
                  </div>
                  <DropdownLink
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Thông tin cá nhân
                  </DropdownLink>
                  <DropdownLink
                    href="/orders"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Đơn hàng của tôi
                  </DropdownLink>
                  <DropdownLink
                    href="/vouchers"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Kho voucher
                    {unusedVoucherCount > 0 ? ` (${unusedVoucherCount})` : ""}
                  </DropdownLink>
                  <DropdownLink
                    href="/profile/addresses"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Địa chỉ giao hàng
                  </DropdownLink>
                  {user?.role === "CUSTOMER" && (
                    <DropdownLink
                      href="/become-seller"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Trở thành nhà bán hàng
                    </DropdownLink>
                  )}
                  {user?.role === "SELLER" && (
                    <DropdownLink
                      href="/store"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Chuyển đến kênh người bán
                    </DropdownLink>
                  )}
                  <DropdownLink
                    href="/change-password"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Đổi mật khẩu
                  </DropdownLink>
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
            className={`text-2xl transition md:hidden ${transparent ? "text-white" : "text-gray-700"}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Mở menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-3 border-t border-gray-100 bg-white px-4 py-4 text-sm font-semibold text-gray-700 md:hidden">
          {NAV_ITEMS.map((item) =>
            item.href ? (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  scrollToSection(item.id);
                  setMenuOpen(false);
                }}
                className="text-left"
              >
                {item.label}
              </button>
            ),
          )}
          <Link href="/cart" onClick={() => setMenuOpen(false)}>
            Giỏ hàng ({cartCount})
          </Link>
          {mounted && user ? (
            <>
              <p className="text-gray-500">Xin chào, {displayName}</p>
              <Link href="/profile" onClick={() => setMenuOpen(false)}>
                Thông tin cá nhân
              </Link>
              <Link href="/orders" onClick={() => setMenuOpen(false)}>
                Đơn hàng của tôi
              </Link>
              <Link href="/vouchers" onClick={() => setMenuOpen(false)}>
                Kho voucher
                {unusedVoucherCount > 0 ? ` (${unusedVoucherCount})` : ""}
              </Link>
              <Link
                href="/profile/addresses"
                onClick={() => setMenuOpen(false)}
              >
                Địa chỉ giao hàng
              </Link>
              {user?.role === "CUSTOMER" && (
                <Link href="/become-seller" onClick={() => setMenuOpen(false)}>
                  Trở thành nhà bán hàng
                </Link>
              )}
              {user?.role === "SELLER" && (
                <Link href="/store" onClick={() => setMenuOpen(false)}>
                  Chuyển đến kênh người bán
                </Link>
              )}
              <Link href="/change-password" onClick={() => setMenuOpen(false)}>
                Đổi mật khẩu
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-left text-red-600"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleLoginNavigation}
              className="w-fit rounded-full bg-[#33FF99] px-4 py-2 text-left font-bold text-gray-950 shadow-sm transition hover:bg-[#12d18e]"
            >
              Đăng nhập
            </button>
          )}
        </nav>
      )}
    </header>
  );
}

function DropdownLink({ href, onClick, children }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
    >
      {children}
    </Link>
  );
}
