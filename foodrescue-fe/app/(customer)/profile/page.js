"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: null, text: "" });
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    dateOfBirth: "",
    avatar: "",
  });
  const [errors, setErrors] = useState({ fullName: "", phone: "", dateOfBirth: "" });

  const validateField = useCallback((field, value) => {
    switch (field) {
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

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const u = data?.data ?? data;
        if (!u?.email) {
          router.replace("/login");
          return;
        }
        setUser(u);
        setForm({
          fullName: u.fullName || "",
          phone: u.phone || "",
          dateOfBirth: u.dateOfBirth ? u.dateOfBirth.slice(0, 10) : "",
          avatar: u.avatar || "",
        });
      })
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const setField = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const handleBlur = (field) => () => {
    setErrors((prev) => ({ ...prev, [field]: validateField(field, form[field]) }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: null, text: "" });
    const newErrors = {
      fullName: validateFullName(form.fullName),
      phone: validatePhone(form.phone),
      dateOfBirth: validateDateOfBirth(form.dateOfBirth),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some((err) => err !== "")) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: form.fullName.trim() || null,
          phone: form.phone.trim() || null,
          dateOfBirth: form.dateOfBirth || null,
          avatar: form.avatar.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data?.message || "Cập nhật thất bại." });
        return;
      }
      const updated = data?.data ?? data;
      setUser(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(updated));
      }
      setMessage({ type: "success", text: "Cập nhật thông tin thành công." });
    } catch (err) {
      setMessage({ type: "error", text: "Không kết nối được server." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const avatarPreview = form.avatar || (user?.avatar || null);
  const displayName = user?.fullName?.trim() || user?.email || "Bạn";

  return (
    <div className="min-h-screen bg-brand-bg py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h1 className="text-xl font-bold text-gray-800 mb-1">Thông tin cá nhân</h1>
          <p className="text-sm text-gray-500 mb-6">Xem và cập nhật thông tin của bạn.</p>

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
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <span className="w-24 h-24 rounded-full bg-brand text-gray-900 font-semibold text-2xl flex items-center justify-center">
                    {(displayName.charAt(0) || "U").toUpperCase()}
                  </span>
                )}
                <label className="absolute bottom-0 right-0 bg-brand text-gray-900 rounded-full p-1.5 cursor-pointer hover:bg-brand-dark transition">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <span className="text-lg">📷</span>
                </label>
              </div>
              <span className="text-xs text-gray-500">Bấm icon để đổi ảnh đại diện</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input
                type="text"
                value={form.fullName}
                onChange={setField("fullName")}
                onBlur={handleBlur("fullName")}
                placeholder="Nguyễn Văn A"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 ${
                  errors.fullName ? "border-red-400" : "border-gray-200"
                }`}
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={user?.email ?? ""}
                disabled
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">Email không thể thay đổi.</p>
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
                placeholder="0901234567"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 ${
                  errors.phone ? "border-red-400" : "border-gray-200"
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
                  errors.dateOfBirth ? "border-red-400" : "border-gray-200"
                }`}
              />
              {errors.dateOfBirth && <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl py-3 bg-brand text-gray-900 font-medium hover:bg-brand-dark transition disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            <Link href="/" className="text-brand-dark hover:underline">
              ← Về trang chủ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
