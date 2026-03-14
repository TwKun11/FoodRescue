"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiBaseUrl } from "@/lib/runtime-config";

const API_URL = getApiBaseUrl();

function validatePassword(value) {
  if (!value) return "Mật khẩu không được để trống.";
  if (value.length < 6) return "Mật khẩu phải từ 6 ký tự trở lên.";
  return "";
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: null, text: "" });
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({ password: "", confirm: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: null, text: "" });
    const pwErr = validatePassword(password);
    const confirmErr = password !== confirm ? "Mật khẩu xác nhận không khớp." : "";
    setErrors({ password: pwErr, confirm: confirmErr });
    if (pwErr || confirmErr) return;
    if (!token) {
      setMessage({ type: "error", text: "Link không hợp lệ. Thiếu mã xác thực." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data?.message || "Đặt lại mật khẩu thất bại." });
        return;
      }
      setMessage({ type: "success", text: (data?.message || data?.data) ?? "Đặt lại mật khẩu thành công." });
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setMessage({ type: "error", text: "Không kết nối được server. Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-brand-bg py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 text-center">
            <h1 className="text-xl font-bold text-gray-800 mb-2">Link không hợp lệ</h1>
            <p className="text-gray-600 mb-4">Thiếu mã xác thực. Vui lòng dùng link trong email.</p>
            <Link href="/login" className="text-brand-dark font-medium hover:underline">
              ← Về trang đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h1 className="text-xl font-bold text-gray-800 mb-1">Đặt lại mật khẩu</h1>
          <p className="text-sm text-gray-500 mb-6">Nhập mật khẩu mới cho tài khoản của bạn.</p>

          {message.text && (
            <div
              className={`mb-4 p-3 rounded-xl text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: validatePassword(e.target.value) }));
                }}
                onBlur={() => setErrors((prev) => ({ ...prev, password: validatePassword(password) }))}
                placeholder="Tối thiểu 6 ký tự"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 ${
                  errors.password ? "border-red-400" : "border-gray-200"
                }`}
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    confirm: e.target.value !== password ? "Mật khẩu xác nhận không khớp." : "",
                  }));
                }}
                onBlur={() =>
                  setErrors((prev) => ({
                    ...prev,
                    confirm: confirm !== password ? "Mật khẩu xác nhận không khớp." : "",
                  }))
                }
                placeholder="Nhập lại mật khẩu mới"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 ${
                  errors.confirm ? "border-red-400" : "border-gray-200"
                }`}
              />
              {errors.confirm && <p className="mt-1 text-sm text-red-500">{errors.confirm}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 bg-brand text-gray-900 font-medium hover:bg-brand-dark transition disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            <Link href="/login" className="text-brand-dark hover:underline">
              ← Về trang đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-bg flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
