"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(value) {
  const v = (value || "").trim();
  if (!v) return "Email không được để trống.";
  if (!EMAIL_REGEX.test(v)) return "Email không đúng định dạng.";
  return "";
}

function validatePassword(value) {
  if (!value) return "Mật khẩu không được để trống.";
  if (value.length < 6) return "Mật khẩu phải từ 6 ký tự trở lên.";
  return "";
}

export default function LoginPage() {
  const router = useRouter();
  const linksPlaceholderRef = useRef(null);
  const [linkBoxRect, setLinkBoxRect] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const measure = () => {
      if (linksPlaceholderRef.current && typeof window !== "undefined") {
        const rect = linksPlaceholderRef.current.getBoundingClientRect();
        setLinkBoxRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    const t = requestAnimationFrame(measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      cancelAnimationFrame(t);
    };
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) return;
    setGoogleLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.message || "Đăng nhập Google thất bại.");
        return;
      }
      const payload = data?.data ?? data;
      const { accessToken, refreshToken, user } = payload;
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        if (user) localStorage.setItem("user", JSON.stringify(user));
        toast.success("Đăng nhập thành công!");
        const redirectTo = user?.role === "SELLER" ? "/store" : user?.role === "ADMIN" ? "/admin" : "/";
        setTimeout(() => router.push(redirectTo), 800);
      } else {
        toast.error("Phản hồi từ server không hợp lệ.");
      }
    } catch {
      toast.error("Không kết nối được server.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const setField = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "email") setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    if (field === "password") setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
  };

  const handleBlur = (field) => () => {
    const value = form[field];
    if (field === "email") setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    if (field === "password") setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(form.email);
    const passwordErr = validatePassword(form.password);
    setErrors({ email: emailErr, password: passwordErr });
    if (emailErr || passwordErr) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Đăng nhập thất bại.");
        return;
      }

      const payload = data?.data ?? data;
      const { accessToken, refreshToken, user } = payload;

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        if (user) localStorage.setItem("user", JSON.stringify(user));
        toast.success("Đăng nhập thành công!");
        const redirectTo = user?.role === "SELLER" ? "/store" : user?.role === "ADMIN" ? "/admin" : "/";
        setTimeout(() => router.push(redirectTo), 800);
      } else {
        toast.error("Phản hồi từ server không hợp lệ.");
      }
    } catch {
      toast.error("Không kết nối được server. Kiểm tra backend và CORS.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── LEFT: image panel (desktop only) ── */}
      <div className="hidden lg:block relative overflow-hidden">
        <img
          src="/images/landingpage/landingpage.png"
          alt=""
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-br from-brand-dark/80 via-gray-900/60 to-gray-900/40" />
        <div className="absolute inset-0 flex flex-col justify-center px-14 xl:px-20 text-white">
          <Link href="/" className="inline-flex items-center gap-3 mb-12 group w-fit">
            <span className="text-3xl">🍃</span>
            <span className="text-2xl font-extrabold tracking-tight group-hover:text-brand transition">FoodRescue</span>
          </Link>
          <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight mb-4">
            Giải cứu thực phẩm,<br />
            <span className="text-brand">bảo vệ hành tinh</span>
          </h2>
          <p className="text-white/70 text-base leading-relaxed max-w-sm">
            Kết nối cửa hàng với 50.000+ người tiêu dùng thông minh. Tiết kiệm đến 50% mỗi ngày.
          </p>
          <div className="flex gap-6 mt-10">
            {[
              { value: "500+", label: "Cửa hàng" },
              { value: "50K+", label: "Khách hàng" },
              { value: "5 tấn", label: "Thực phẩm cứu" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-extrabold text-brand">{s.value}</p>
                <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: form panel ── */}
      <div className="flex flex-col justify-center items-center px-6 py-12 bg-background">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-2xl">🍃</span>
            <span className="text-xl font-extrabold text-brand-dark">FoodRescue</span>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Chào mừng trở lại!</h1>
          <p className="text-sm text-gray-500 mb-8">Nhập thông tin để đăng nhập tài khoản.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={setField("email")}
                onBlur={handleBlur("email")}
                placeholder="you@example.com"
                autoComplete="email"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:bg-white transition ${
                  errors.email ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-brand"
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                <Link href="/forgot-password" className="text-xs text-brand-dark hover:underline font-medium">
                  Quên mật khẩu?
                </Link>
              </div>
              <input
                type="password"
                value={form.password}
                onChange={setField("password")}
                onBlur={handleBlur("password")}
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="current-password"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:bg-white transition ${
                  errors.password ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-brand"
                }`}
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 bg-brand-dark text-white font-semibold hover:bg-brand-secondary active:scale-95 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>

            {GOOGLE_CLIENT_ID && (
              <div className="relative z-0 isolate">
                <div className="relative my-2">
                  <hr className="border-gray-200" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-gray-400">
                    hoặc
                  </span>
                </div>
                <div className="relative flex justify-center w-full max-w-[320px] h-11 mx-auto overflow-hidden shrink-0">
                  <div className="absolute inset-0 z-0 flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium shadow-sm hover:bg-gray-50 transition pointer-events-none">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Đăng nhập với Google
                  </div>
                  <div className="absolute inset-0 z-10 opacity-0 [&_iframe]:w-full! [&_iframe]:h-full! [&_div]:min-w-0! [&_div]:min-h-0! overflow-hidden">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error("Đăng nhập Google không thành công.")}
                      useOneTap={false}
                      theme="outline"
                      size="large"
                      text="continue_with"
                      shape="rectangular"
                      width="320"
                      locale="vi"
                    />
                  </div>
                </div>
                {googleLoading && <p className="text-center text-sm text-gray-400">Đang xử lý đăng nhập Google...</p>}
              </div>
            )}
          </form>

          <div
            ref={linksPlaceholderRef}
            className="relative mt-6 pt-2 min-h-16"
            style={{ visibility: linkBoxRect ? "hidden" : "visible" }}
          >
            <p className="text-center text-sm text-gray-500">
              Chưa có tài khoản? Đăng ký ngay
            </p>
            <p className="text-center mt-3 text-xs text-gray-400">← Về trang chủ</p>
          </div>
        </div>
      </div>

      {typeof document !== "undefined" &&
        linkBoxRect &&
        createPortal(
          <div
            className="bg-background"
            style={{
              position: "fixed",
              top: linkBoxRect.top,
              left: linkBoxRect.left,
              width: linkBoxRect.width,
              height: linkBoxRect.height,
              zIndex: 2147483647,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: "0.5rem",
            }}
          >
            <p className="text-center text-sm text-gray-500">
              Chưa có tài khoản?{" "}
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="text-brand-dark font-semibold hover:underline cursor-pointer bg-transparent border-none p-0 align-baseline focus:outline-none focus:ring-0"
              >
                Đăng ký ngay
              </button>
            </p>
            <p className="text-center mt-3">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="text-xs text-gray-400 hover:text-brand-dark transition bg-transparent border-none p-0 cursor-pointer focus:outline-none"
              >
                ← Về trang chủ
              </button>
            </p>
          </div>,
          document.body
        )}
    </div>
  );
}
