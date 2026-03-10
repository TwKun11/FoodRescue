"use client";

import { useState } from "react";
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
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [googleLoading, setGoogleLoading] = useState(false);

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
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Blurred video fill — scale lớn để lấp góc trống, không bị đen */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 scale-110 blur-sm brightness-90"
      >
        <source src="/videos/videosdemo.mp4" type="video/mp4" />
      </video>

      {/* Main video — giữ nguyên tỉ lệ, không zoom */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-contain z-[1] blur-sm">
        <source src="/videos/videosdemo.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 z-[2]" />

      {/* Branding — góc trên trái */}
      <div className="absolute top-8 left-10 z-[3] hidden lg:flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="bg-green-500 text-white rounded-xl w-10 h-10 flex items-center justify-center text-lg shadow-lg">
            🥗
          </span>
          <span className="text-white text-2xl font-extrabold tracking-tight drop-shadow-lg group-hover:text-green-300 transition">
            FoodRescue
          </span>
        </Link>
      </div>

      {/* Form panel — bên phải, nổi trên video */}
      <div
        className="relative z-[3] ml-auto flex flex-col justify-center items-center
                      w-full lg:w-[420px] min-h-screen
                      bg-white/10 lg:bg-white/10 backdrop-blur-xl
                      border-l border-white/10 px-8 py-12 sm:px-12"
      >
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="bg-green-500 text-white rounded-xl w-9 h-9 flex items-center justify-center text-base">
              🥗
            </span>
            <span className="text-white text-xl font-extrabold tracking-tight drop-shadow">FoodRescue</span>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-white mb-1">Chào mừng trở lại!</h1>
          <p className="text-sm text-white/60 mb-8">Nhập thông tin để đăng nhập tài khoản.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={setField("email")}
                onBlur={handleBlur("email")}
                placeholder="you@example.com"
                autoComplete="email"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white/90 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white transition ${
                  errors.email ? "border-red-400" : "border-white/40 focus:border-green-400"
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-300">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-white/80">Mật khẩu</label>
                <Link href="/forgot-password" className="text-xs text-green-300 hover:underline font-medium">
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
                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white/90 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white transition ${
                  errors.password ? "border-red-400" : "border-white/40 focus:border-green-400"
                }`}
              />
              {errors.password && <p className="mt-1 text-xs text-red-300">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 bg-green-500 text-white font-semibold hover:bg-green-400 active:scale-95 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>

            {GOOGLE_CLIENT_ID && (
              <>
                <div className="relative my-2">
                  <hr className="border-white/20" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-transparent px-3 text-xs text-white/50">
                    hoặc
                  </span>
                </div>
                <div className="relative flex justify-center w-full max-w-[320px] h-[44px] mx-auto">
                  <div className="absolute inset-0 z-0 flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/90 text-gray-700 text-sm font-medium shadow-sm hover:bg-white transition">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Đăng nhập với Google
                  </div>
                  <div className="absolute inset-0 z-10 opacity-0 [&_iframe]:!w-full [&_iframe]:!h-full [&_div]:!min-w-0 [&_div]:!min-h-0">
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
                {googleLoading && <p className="text-center text-sm text-white/50">Đang xử lý đăng nhập Google...</p>}
              </>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-white/60">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-green-300 font-semibold hover:underline">
              Đăng ký ngay
            </Link>
          </p>

          <p className="text-center mt-3">
            <Link href="/" className="text-xs text-white/40 hover:text-green-300 transition">
              ← Về trang chủ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
