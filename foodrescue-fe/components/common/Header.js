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
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-brand-dark">
          <span className="text-2xl">🍃</span>
          <span>FoodRescue</span>
        </Link>

        {/* Desktop Nav: Trang chủ, Sản phẩm, Liên hệ, Về chúng tôi */}
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
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link href="/cart" className="relative p-1">
            <span className="text-2xl">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-brand text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Đăng nhập (thay Cửa hàng) */}
          <Link
            href="/login"
            className="bg-brand text-gray-900 px-4 py-1.5 rounded-full text-sm font-medium hover:opacity-90 transition hidden sm:block"
          >
            Đăng nhập
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
          <Link href="/contact" onClick={() => setMenuOpen(false)}>
            Liên hệ
          </Link>
          <Link href="/about" onClick={() => setMenuOpen(false)}>
            Về chúng tôi
          </Link>
          <Link href="/cart" onClick={() => setMenuOpen(false)}>
            Giỏ hàng ({cartCount})
          </Link>
          <Link href="/login" onClick={() => setMenuOpen(false)}>
            Đăng nhập
          </Link>
        </nav>
      )}
    </header>
  );
}
