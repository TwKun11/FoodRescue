"use client";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  // Mock cart count — sẽ thay bằng global state / context sau
  const cartCount = 3;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-orange-500">
          <span className="text-2xl">🍃</span>
          <span>FoodRescue</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-orange-500 transition">
            Trang chủ
          </Link>
          <Link href="/products" className="hover:text-orange-500 transition">
            Sản phẩm
          </Link>
          <Link href="/products?category=rau" className="hover:text-orange-500 transition">
            Rau củ
          </Link>
          <Link href="/products?category=thit" className="hover:text-orange-500 transition">
            Thịt
          </Link>
          <Link href="/products?category=haisan" className="hover:text-orange-500 transition">
            Hải sản
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link href="/cart" className="relative p-1">
            <span className="text-2xl">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Store CTA */}
          <Link
            href="/store/login"
            className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-orange-600 transition hidden sm:block"
          >
            Cửa hàng
          </Link>

          {/* Mobile menu toggle */}
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
          <Link href="/cart" onClick={() => setMenuOpen(false)}>
            Giỏ hàng ({cartCount})
          </Link>
          <Link href="/store/login" onClick={() => setMenuOpen(false)}>
            Đăng nhập cửa hàng
          </Link>
        </nav>
      )}
    </header>
  );
}
