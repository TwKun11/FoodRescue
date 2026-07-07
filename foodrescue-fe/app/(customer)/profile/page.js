"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiGetMe, apiUpdateMe, updateAuthUser } from "@/lib/api";

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

function normalizeFullName(value) {
  return (value || "").trim().replace(/\s+/g, " ");
}

function parseDateInput(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
}

function addYears(date, years) {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
}

function validateFullName(value) {
  const normalized = normalizeFullName(value);

  if (!normalized) return "Vui lòng nhập họ và tên.";
  if (normalized.length < 2) return "Họ và tên phải có ít nhất 2 ký tự.";
  if (normalized.length > 80) return "Họ và tên không được vượt quá 80 ký tự.";
  if (/\p{N}/u.test(normalized)) return "Họ và tên không được chứa số.";
  if (/[@#$%^*<>/\\{}\[\]=+]/.test(normalized)) return "Họ và tên chứa ký tự không hợp lệ.";
  if (!/^[\p{L}\s'.-]+$/u.test(normalized)) return "Họ và tên chỉ được chứa chữ cái, khoảng trắng, dấu ', dấu - và dấu .";

  return "";
}

function validatePhone(value) {
  const v = (value || "").trim();
  if (!v) return "";
  if (!/^\d+$/.test(v)) return "Số điện thoại chỉ được chứa chữ số.";
  if (v.length !== 10) return "Số điện thoại phải đúng 10 chữ số.";
  if (!v.startsWith("0")) return "Số điện thoại phải bắt đầu bằng 0.";
  if (!/^(03|05|07|08|09)/.test(v)) return "Số điện thoại phải thuộc đầu số Việt Nam hợp lệ.";
  return "";
}

function validateDateOfBirth(value) {
  if (!value) return "";

  const chosen = parseDateInput(value);
  if (!chosen) return "Ngày sinh không hợp lệ.";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (chosen >= today) return "Ngày sinh không được là hôm nay hoặc tương lai.";

  const oldestAllowed = addYears(today, -120);
  if (chosen < oldestAllowed) return "Tuổi không được lớn hơn 120.";

  const youngestAllowed = addYears(today, -13);
  if (chosen > youngestAllowed) return "Bạn phải đủ ít nhất 13 tuổi.";

  return "";
}

function validateAvatarFile(file) {
  if (!file) return "";
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) return "Avatar chỉ chấp nhận ảnh JPEG, PNG hoặc WEBP.";
  if (file.size > MAX_AVATAR_SIZE_BYTES) return "Avatar không được vượt quá 2MB.";
  return "";
}

function validateProfileForm(form, avatarError = "") {
  const normalizedFullName = normalizeFullName(form.fullName);
  const phone = (form.phone || "").trim();
  const dateOfBirth = form.dateOfBirth || "";
  const avatar = (form.avatar || "").trim();

  return {
    errors: {
      fullName: validateFullName(normalizedFullName),
      phone: validatePhone(phone),
      dateOfBirth: validateDateOfBirth(dateOfBirth),
      avatar: avatarError,
    },
    values: {
      fullName: normalizedFullName,
      phone: phone || null,
      dateOfBirth: dateOfBirth || null,
      avatar: avatar || null,
    },
  };
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
  const [errors, setErrors] = useState({ fullName: "", phone: "", dateOfBirth: "", avatar: "" });

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

  const applyUserToForm = useCallback((nextUser) => {
    setUser(nextUser);
    setForm({
      fullName: nextUser.fullName || "",
      phone: nextUser.phone || "",
      dateOfBirth: nextUser.dateOfBirth ? nextUser.dateOfBirth.slice(0, 10) : "",
      avatar: nextUser.avatar || "",
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    apiGetMe()
      .then((res) => {
        if (cancelled) return;
        const u = res.data?.data ?? res.data;
        if (!res.ok || !u?.email) {
          router.replace("/login");
          return;
        }
        applyUserToForm(u);
      })
      .catch(() => {
        if (!cancelled) router.replace("/login");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [applyUserToForm, router]);

  const setField = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const handleBlur = (field) => () => {
    const value = field === "fullName" ? normalizeFullName(form.fullName) : form[field];
    if (field === "fullName") {
      setForm((prev) => ({ ...prev, fullName: value }));
    }
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    const error = validateAvatarFile(file);

    if (error) {
      setErrors((prev) => ({ ...prev, avatar: error }));
      e.target.value = "";
      return;
    }

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, avatar: typeof reader.result === "string" ? reader.result : "" }));
      setErrors((prev) => ({ ...prev, avatar: "" }));
    };
    reader.onerror = () => setErrors((prev) => ({ ...prev, avatar: "Không thể đọc file avatar." }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: null, text: "" });

    const { errors: nextErrors, values } = validateProfileForm(form, errors.avatar);
    setErrors(nextErrors);
    setForm((prev) => ({ ...prev, fullName: values.fullName, phone: values.phone || "", dateOfBirth: values.dateOfBirth || "" }));
    if (Object.values(nextErrors).some(Boolean)) return;

    setSaving(true);
    try {
      const res = await apiUpdateMe(values);
      const data = res.data;
      if (!res.ok) {
        setMessage({ type: "error", text: data?.message || data?.error || "Cập nhật thất bại." });
        return;
      }

      const updated = data?.data ?? data;
      applyUserToForm(updated);
      updateAuthUser(updated);
      setErrors({ fullName: "", phone: "", dateOfBirth: "", avatar: "" });
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

  const avatarPreview = form.avatar || user?.avatar || null;
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

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <span className="text-lg" aria-hidden="true">📷</span>
                </label>
              </div>
              <span className="text-xs text-gray-500">Bấm icon để đổi ảnh đại diện</span>
              {errors.avatar && <p className="text-sm text-red-500 text-center">{errors.avatar}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input
                type="text"
                value={form.fullName}
                onChange={setField("fullName")}
                onBlur={handleBlur("fullName")}
                placeholder="Nguyễn Văn A"
                aria-invalid={Boolean(errors.fullName)}
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
                aria-invalid={Boolean(errors.phone)}
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
                aria-invalid={Boolean(errors.dateOfBirth)}
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

        {user?.role === "CUSTOMER" && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Trở thành nhà bán hàng</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Gửi hồ sơ cửa hàng để admin xét duyệt. Sau khi được duyệt, tài khoản của bạn sẽ có quyền seller.
                </p>
              </div>
              <Link
                href="/become-seller"
                className="inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-brand-dark transition"
              >
                Gửi hồ sơ seller
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
