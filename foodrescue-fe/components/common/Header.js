"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CART_UPDATED_EVENT, getCartQuantityCount, readCart } from "@/lib/cart";
import { apiGetMyVouchers, apiLogout, getAuthUser, subscribeAuth } from "@/lib/api";
import ThemeToggle from "@/components/common/ThemeToggle";

const NAV_ITEMS = [
  { id: "home", label: "Trang chủ" },
  { href: "/products", label: "Sản phẩm" },
  { id: "how-it-works", label: "Cách hoạt động" },
  { id: "deals", label: "Ưu đãi" },
  { id: "for-stores", label: "Dành cho cửa hàng" },
  { id: "about-food-rescue", label: "Về Food Rescue" },
];

function readUserFromAuth() {
  return getAuthUser();
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
  const [activeNavId, setActiveNavId] = useState("");
  const dropdownRef = useRef(null);

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled;
  const displayName = user?.fullName?.trim() || user?.email || "Bạn";

  const isNavActive = (item) => {
    if (item.href) return pathname === item.href || pathname.startsWith(`${item.href}/`);
    return isHome && activeNavId === item.id;
  };

  const getNavClassName = (active) =>
    [
      "relative inline-flex h-11 items-center justify-center whitespace-nowrap px-1 text-center leading-none transition-colors after:absolute after:bottom-1 after:left-0 after:h-0.5 after:rounded-full after:bg-emerald-500 after:transition-all after:duration-300",
      active ? "after:w-full" : "after:w-0 hover:after:w-full",
      transparent
        ? active
          ? "text-white after:bg-emerald-300"
          : "text-white/85 hover:text-white after:bg-emerald-300"
        : active
          ? "text-emerald-800 dark:text-emerald-200"
          : "text-gray-600 hover:text-emerald-800 dark:text-slate-300 dark:hover:text-emerald-200",
    ].join(" ");

  const getMobileNavClassName = (active) =>
    [
      "border-l-4 py-1 pl-3 text-left transition-colors",
      active
        ? "border-emerald-500 text-emerald-800 dark:text-emerald-200"
        : "border-transparent text-gray-700 hover:border-emerald-200 hover:text-emerald-800 dark:text-slate-300 dark:hover:text-emerald-200",
    ].join(" ");

  useEffect(() => {
    setMounted(true);
    setUser(readUserFromAuth());
    setCartCount(getCartQuantityCount(readCart()));

    const syncHeaderState = () => {
      setUser(readUserFromAuth());
      setCartCount(getCartQuantityCount(readCart()));
    };
    const unsubscribeAuth = subscribeAuth(({ user }) => setUser(user || null));

    window.addEventListener(CART_UPDATED_EVENT, syncHeaderState);
    return () => {
      unsubscribeAuth();
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
    return () => window.removeEventListener("voucher-wallet-updated", loadUnusedVoucherCount);
  }, [user, pathname]);

  useEffect(() => {
    if (!isHome) {
      setActiveNavId("");
      return;
    }

    const syncActiveNav = () => {
      const hashId = window.location.hash.replace("#", "");
      setActiveNavId(hashId || "home");
    };

    syncActiveNav();
    window.addEventListener("hashchange", syncActiveNav);
    return () => window.removeEventListener("hashchange", syncActiveNav);
  }, [isHome]);

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

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMenuOpen(false);
    await apiLogout().catch(() => {});
    setUser(null);
    router.push("/");
  };

  const handleLoginNavigation = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
    router.push("/login");
  };

  const scrollToSection = (sectionId) => {
    setActiveNavId(sectionId);

    if (sectionId === "home") {
      if (pathname !== "/") {
        router.push("/");
        return;
      }
      window.history.replaceState(null, "", "/");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (pathname !== "/") {
      router.push(`/#${sectionId}`);
      return;
    }

    const element = document.getElementById(sectionId);
    if (!element) return;

    window.history.replaceState(null, "", `#${sectionId}`);
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-[70] transition-all duration-300 ${
        transparent
          ? "bg-transparent"
          : "border-b border-emerald-100 bg-white/95 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center gap-5 px-5">
        <Link
          href="/"
          className={`flex h-11 min-w-[174px] items-center gap-2.5 transition-colors ${
            transparent ? "text-white" : "text-emerald-900 dark:text-emerald-100"
          }`}
          onClick={() => setMenuOpen(false)}
          aria-label="Food Rescue trang chủ"
        >
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-emerald-100">
            <Image src="/images/logo.png" alt="" width={40} height={40} className="h-full w-full object-contain" priority />
          </span>
          <span className="whitespace-nowrap text-xl font-extrabold leading-none tracking-tight">Food Rescue</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-5 text-sm font-semibold xl:flex">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(item);
            return item.href ? (
              <Link key={item.href} href={item.href} className={getNavClassName(active)} aria-current={active ? "page" : undefined}>
                {item.label}
              </Link>
            ) : (
              <button key={item.id} type="button" onClick={() => scrollToSection(item.id)} className={getNavClassName(active)} aria-current={active ? "page" : undefined}>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center justify-end gap-3">
          <ThemeToggle compact />

          <Link
            href="/vouchers"
            className={`relative inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
              transparent
                ? "border-white/70 bg-white/90 text-emerald-800 shadow-sm hover:bg-white"
                : "border-emerald-100 bg-white/90 text-emerald-800 shadow-sm hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-100 dark:hover:bg-slate-800"
            }`}
            aria-label="Kho voucher"
          >
            <TicketIcon className="h-5 w-5" />
            {unusedVoucherCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-xs font-bold text-white">
                {unusedVoucherCount > 99 ? "99+" : unusedVoucherCount}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            className={`relative inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
              transparent
                ? "border-white/70 bg-white/90 text-emerald-800 shadow-sm hover:bg-white"
                : "border-emerald-100 bg-white/90 text-emerald-800 shadow-sm hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-100 dark:hover:bg-slate-800"
            }`}
            aria-label="Giỏ hàng"
          >
            <CartIcon className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs font-bold text-gray-950">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {!mounted || !user ? (
            <button
              type="button"
              onClick={handleLoginNavigation}
              className="hidden rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-emerald-900/20 transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 sm:block"
            >
              Đăng nhập
            </button>
          ) : (
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((open) => !open)}
                className={`flex h-11 items-center gap-2 rounded-full border px-2.5 transition-colors ${
                  transparent
                    ? "border-white/70 bg-white/90 text-slate-700 shadow-sm hover:bg-white"
                    : dropdownOpen
                      ? "border-emerald-100 bg-emerald-100 dark:border-slate-700 dark:bg-slate-800"
                      : "border-transparent hover:bg-gray-100 dark:hover:bg-slate-800"
                } focus:outline-none focus:ring-0`}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <span className={`max-w-36 truncate text-sm font-medium leading-none ${transparent ? "text-slate-700" : "text-gray-600 dark:text-slate-300"}`}>
                  Xin chào, {displayName}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold leading-none text-gray-950">
                  {(displayName.charAt(0) || "U").toUpperCase()}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full z-[80] mt-2 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                  <div className="border-b border-gray-100 px-4 py-2 dark:border-slate-800">
                    <p className="truncate text-sm font-semibold text-gray-800 dark:text-slate-100">{displayName}</p>
                    {user?.email && <p className="truncate text-xs text-gray-500 dark:text-slate-400">{user.email}</p>}
                  </div>
                  <DropdownLink href="/profile" onClick={() => setDropdownOpen(false)}>Thông tin cá nhân</DropdownLink>
                  <DropdownLink href="/orders" onClick={() => setDropdownOpen(false)}>Đơn hàng của tôi</DropdownLink>
                  <DropdownLink href="/vouchers" onClick={() => setDropdownOpen(false)}>
                    Kho voucher{unusedVoucherCount > 0 ? ` (${unusedVoucherCount})` : ""}
                  </DropdownLink>
                  <DropdownLink href="/profile/addresses" onClick={() => setDropdownOpen(false)}>Địa chỉ giao hàng</DropdownLink>
                  {user?.role === "CUSTOMER" && <DropdownLink href="/become-seller" onClick={() => setDropdownOpen(false)}>Trở thành nhà bán hàng</DropdownLink>}
                  {user?.role === "SELLER" && <DropdownLink href="/store" onClick={() => setDropdownOpen(false)}>Chuyển đến kênh người bán</DropdownLink>}
                  <DropdownLink href="/change-password" onClick={() => setDropdownOpen(false)}>Đổi mật khẩu</DropdownLink>
                  <button type="button" onClick={handleLogout} className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/30">
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-xl transition xl:hidden ${
              transparent ? "bg-white/90 text-emerald-900 shadow-sm" : "text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-800"
            }`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Mở menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-3 border-t border-gray-100 bg-white px-4 py-4 text-sm font-semibold text-gray-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 xl:hidden">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(item);
            return item.href ? (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={getMobileNavClassName(active)} aria-current={active ? "page" : undefined}>
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
                className={getMobileNavClassName(active)}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </button>
            );
          })}
          <Link href="/cart" onClick={() => setMenuOpen(false)}>Giỏ hàng ({cartCount})</Link>
          {mounted && user ? (
            <>
              <p className="text-gray-500 dark:text-slate-400">Xin chào, {displayName}</p>
              <Link href="/profile" onClick={() => setMenuOpen(false)}>Thông tin cá nhân</Link>
              <Link href="/orders" onClick={() => setMenuOpen(false)}>Đơn hàng của tôi</Link>
              <Link href="/vouchers" onClick={() => setMenuOpen(false)}>
                Kho voucher{unusedVoucherCount > 0 ? ` (${unusedVoucherCount})` : ""}
              </Link>
              <Link href="/profile/addresses" onClick={() => setMenuOpen(false)}>Địa chỉ giao hàng</Link>
              {user?.role === "CUSTOMER" && <Link href="/become-seller" onClick={() => setMenuOpen(false)}>Trở thành nhà bán hàng</Link>}
              {user?.role === "SELLER" && <Link href="/store" onClick={() => setMenuOpen(false)}>Chuyển đến kênh người bán</Link>}
              <Link href="/change-password" onClick={() => setMenuOpen(false)}>Đổi mật khẩu</Link>
              <button type="button" onClick={handleLogout} className="text-left text-red-600 dark:text-red-300">Đăng xuất</button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleLoginNavigation}
              className="w-fit rounded-full bg-emerald-600 px-4 py-2 text-left font-bold text-white shadow-sm transition hover:bg-emerald-700"
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
    <Link href={href} onClick={onClick} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-800">
      {children}
    </Link>
  );
}

function TicketIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9a3 3 0 0 0 0 6v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2a3 3 0 0 0 0-6V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2Z" />
      <path d="M13 5v14" />
    </svg>
  );
}

function CartIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6h15l-1.5 9h-12L6 6Z" />
      <path d="M6 6 5.5 3H3" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}
