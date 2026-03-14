"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "@/lib/runtime-config";

const API_URL = getApiBaseUrl();

function validatePassword(value) {
  if (!value) return "Mật khẩu không được để trống.";
  if (value.length < 6) return "Mật khẩu phải từ 6 ký tự trở lên.";
  return "";
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: null, text: "" });
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) router.replace("/login");
  }, [router]);

  const setField = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "newPassword") {
      setErrors((prev) => ({
        ...prev,
        newPassword: validatePassword(value),
        confirmPassword:
          form.confirmPassword && value !== form.confirmPassword ? "Mật khẩu xác nhận không khớp." : "",
      }));
    }
    if (field === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: value !== form.newPassword ? "Mật khẩu xác nhận không khớp." : "",
      }));
    }
  };

  const handleBlur = (field) => () => {
    if (field === "newPassword") setErrors((prev) => ({ ...prev, newPassword: validatePassword(form.newPassword) }));
    if (field === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: form.confirmPassword !== form.newPassword ? "Mật khẩu xác nhận không khớp." : "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: null, text: "" });
    const currentErr = form.currentPassword ? "" : "Nhập mật khẩu hiện tại.";
    const newErr = validatePassword(form.newPassword);
    const confirmErr = form.newPassword !== form.confirmPassword ? "Mật khẩu xác nhận không khớp." : "";
    setErrors({
      currentPassword: currentErr,
      newPassword: newErr,
      confirmPassword: confirmErr,
    });
    if (currentErr || newErr || confirmErr) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data?.message || "Đổi mật khẩu thất bại." });
        return;
      }
      setMessage({ type: "success", text: (data?.message || data?.data) ?? "Đổi mật khẩu thành công." });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMessage({ type: "error", text: "Không kết nối được server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h1 className="text-xl font-bold text-gray-800 mb-1">Đổi mật khẩu</h1>
          <p className="text-sm text-gray-500 mb-6">Nhập mật khẩu hiện tại và mật khẩu mới. Không cần xác thực email.</p>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
              <input
                type="password"
                value={form.currentPassword}
                onChange={setField("currentPassword")}
                placeholder="••••••••"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 ${
                  errors.currentPassword ? "border-red-400" : "border-gray-200"
                }`}
              />
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
              <input
                type="password"
                value={form.newPassword}
                onChange={setField("newPassword")}
                onBlur={handleBlur("newPassword")}
                placeholder="Tối thiểu 6 ký tự"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 ${
                  errors.newPassword ? "border-red-400" : "border-gray-200"
                }`}
              />
              {errors.newPassword && <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={setField("confirmPassword")}
                onBlur={handleBlur("confirmPassword")}
                placeholder="Nhập lại mật khẩu mới"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 ${
                  errors.confirmPassword ? "border-red-400" : "border-gray-200"
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 bg-brand text-gray-900 font-medium hover:bg-brand-dark transition disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            <Link href="/profile" className="text-brand-dark hover:underline">
              ← Về thông tin cá nhân
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
