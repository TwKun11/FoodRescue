"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^0\d{0,9}$/;

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

function validateFullName(value) {
  return "";
}

function validatePhone(value) {
  const v = (value || "").trim();
  if (!v) return "";
  if (!/^\d+$/.test(v)) return "Số điện thoại chỉ được chứa chữ số.";
  if (v.length !== 10) return "Số điện thoại phải đúng 10 chữ số.";
  if (v[0] !== "0") return "Số điện thoại phải bắt đầu bằng 0.";
  return "";
}

function validateDateOfBirth(value) {
  if (!value) return "";
  const chosen = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  chosen.setHours(0, 0, 0, 0);
  if (chosen >= today) return "Ngày sinh không được là hiện tại hoặc tương lai.";
  return "";
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: null, text: "" });
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    dateOfBirth: "",
    phone: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    dateOfBirth: "",
  });

  const validateField = useCallback((field, value) => {
    switch (field) {
      case "email":
        return validateEmail(value);
      case "password":
        return validatePassword(value);
      case "fullName":
        return validateFullName(value);
      case "phone":
        return validatePhone(value);
      case "dateOfBirth":
        return validateDateOfBirth(value);
      default:
        return "";
    }
  }, []);

  const setField = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const handleBlur = (field) => () => {
    const value = form[field];
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: null, text: "" });
    const newErrors = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      fullName: validateFullName(form.fullName),
      phone: validatePhone(form.phone),
      dateOfBirth: validateDateOfBirth(form.dateOfBirth),
    };
    setErrors(newErrors);
    const hasError = Object.values(newErrors).some((err) => err !== "");
    if (hasError) return;

    setLoading(true);
    try {
      const body = {
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim() || null,
        dateOfBirth: form.dateOfBirth || null,
        phone: form.phone.trim() || null,
      };
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = data?.message || (data?.errors ? "Dữ liệu không hợp lệ." : "Đăng ký thất bại.");
        setMessage({ type: "error", text: msg });
        return;
      }

      if (data?.success && data?.message) {
        setMessage({ type: "success", text: data.message });
        setForm({ email: "", password: "", fullName: "", dateOfBirth: "", phone: "" });
        setErrors({ email: "", password: "", fullName: "", phone: "", dateOfBirth: "" });
      } else {
        setMessage({ type: "success", text: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Không kết nối được server. Kiểm tra backend và CORS." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h1 className="text-xl font-bold text-gray-800 mb-1">Đăng ký tài khoản</h1>
          <p className="text-sm text-gray-500 mb-6">Sau khi đăng ký, vui lòng xác thực email.</p>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={setField("email")}
                onBlur={handleBlur("email")}
                placeholder="you@example.com"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 ${
                  errors.email ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-brand"
                }`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={form.password}
                onChange={setField("password")}
                onBlur={handleBlur("password")}
                placeholder="Tối thiểu 6 ký tự"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 ${
                  errors.password ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-brand"
                }`}
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input
                type="text"
                value={form.fullName}
                onChange={setField("fullName")}
                onBlur={handleBlur("fullName")}
                placeholder="Nhập họ và tên"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 ${
                  errors.fullName ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-brand"
                }`}
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input
                type="tel"
                inputMode="numeric"
                value={form.phone}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setForm((prev) => ({ ...prev, phone: v }));
                  setErrors((prev) => ({ ...prev, phone: validatePhone(v) }));
                }}
                onBlur={handleBlur("phone")}
                placeholder="Nhập số điện thoại"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 ${
                  errors.phone ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-brand"
                }`}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={setField("dateOfBirth")}
                onBlur={handleBlur("dateOfBirth")}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 ${
                  errors.dateOfBirth ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-brand"
                }`}
              />
              {errors.dateOfBirth && <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 bg-brand text-gray-900 font-medium hover:bg-brand-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-brand-dark font-medium hover:underline">
              Đăng nhập
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
