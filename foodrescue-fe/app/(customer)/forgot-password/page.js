"use client";

import { useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(value) {
  const v = (value || "").trim();
  if (!v) return "Email không được để trống.";
  if (!EMAIL_REGEX.test(v)) return "Email không đúng định dạng.";
  return "";
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const err = validateEmail(email);
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.message || "Gửi email thất bại.");
        return;
      }
      setSent(true);
      setMessage((data?.message || data?.data) ?? "Đã gửi email. Vui lòng kiểm tra hộp thư.");
    } catch (err) {
      setMessage("Không kết nối được server. Kiểm tra backend và CORS.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h1 className="text-xl font-bold text-gray-800 mb-1">Quên mật khẩu</h1>
          <p className="text-sm text-gray-500 mb-6">
            Nhập email đăng ký để nhận link đặt lại mật khẩu.
          </p>

          {message && (
            <div
              className={`mb-4 p-3 rounded-xl text-sm ${
                sent
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(validateEmail(e.target.value));
                  }}
                  onBlur={() => setError(validateEmail(email))}
                  placeholder="you@example.com"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 ${
                    error ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-brand"
                  }`}
                />
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-3 bg-brand text-gray-900 font-medium hover:bg-brand-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
              </button>
            </form>
          ) : (
            <p className="text-sm text-gray-600 mb-4">
              Kiểm tra hộp thư (và thư mục spam) để bấm link đặt lại mật khẩu.
            </p>
          )}

          <p className="mt-4 text-center text-sm text-gray-500">
            <Link href="/login" className="text-brand-dark font-medium hover:underline">
              ← Quay lại đăng nhập
            </Link>
          </p>
        </div>

        <p className="text-center mt-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-brand-dark">
            ← Về trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}
