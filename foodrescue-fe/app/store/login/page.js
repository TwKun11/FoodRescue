// FE03-001 – UI Login & Đăng ký cửa hàng
"use client";
import { useState } from "react";
import Link from "next/link";
import Button from "@/components/common/Button";

export default function StoreLoginPage() {
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    storeName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    license: null,
  });
  const [licensePreview, setLicensePreview] = useState("");

  const setL = (field) => (e) => setLoginForm((p) => ({ ...p, [field]: e.target.value }));
  const setR = (field) => (e) => setRegisterForm((p) => ({ ...p, [field]: e.target.value }));

  const handleLicense = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRegisterForm((p) => ({ ...p, license: file }));
    setLicensePreview(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-orange-500">
            <span>🍃</span> FoodRescue
          </Link>
          <p className="text-gray-500 text-sm mt-1">Cổng quản lý dành cho cửa hàng</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-4 text-sm font-semibold transition ${tab === "login" ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-400 hover:text-gray-600"}`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 py-4 text-sm font-semibold transition ${tab === "register" ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-400 hover:text-gray-600"}`}
            >
              Đăng ký cửa hàng
            </button>
          </div>

          <div className="p-6">
            {/* ── Login Form ── */}
            {tab === "login" && (
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={setL("email")}
                    placeholder="store@example.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={setL("password")}
                    placeholder="••••••••"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
                <div className="flex justify-end">
                  <button className="text-xs text-orange-500 hover:underline">Quên mật khẩu?</button>
                </div>
                <Link href="/store">
                  <Button variant="primary" size="lg" fullWidth type="button">
                    Đăng nhập →
                  </Button>
                </Link>
              </form>
            )}

            {/* ── Register Form ── */}
            {tab === "register" && (
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tên cửa hàng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={registerForm.storeName}
                      onChange={setR("storeName")}
                      placeholder="VD: Circle K Q1"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Chủ sở hữu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={registerForm.ownerName}
                      onChange={setR("ownerName")}
                      placeholder="Họ và tên"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={setR("email")}
                    placeholder="store@example.com"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input
                      type="tel"
                      value={registerForm.phone}
                      onChange={setR("phone")}
                      placeholder="0901 234 567"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Địa chỉ cửa hàng</label>
                    <input
                      type="text"
                      value={registerForm.address}
                      onChange={setR("address")}
                      placeholder="123 Đường ABC, Q1"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                  </div>
                </div>

                {/* Upload Giấy phép kinh doanh */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    📄 Giấy phép kinh doanh <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-3 cursor-pointer hover:border-orange-400 transition ${licensePreview ? "border-orange-300" : "border-gray-200"}`}
                  >
                    {licensePreview ? (
                      <div className="flex items-center gap-3">
                        <img src={licensePreview} alt="License" className="w-12 h-12 rounded-lg object-cover" />
                        <div className="text-xs text-gray-600">
                          <p className="font-medium">{registerForm.license?.name}</p>
                          <p className="text-gray-400">{(registerForm.license?.size / 1024).toFixed(0)} KB</p>
                        </div>
                        <label className="ml-auto text-xs text-orange-500 cursor-pointer hover:underline">
                          Thay đổi
                          <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleLicense} />
                        </label>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center gap-1 cursor-pointer">
                        <span className="text-2xl">📤</span>
                        <span className="text-xs text-gray-500">Click để upload ảnh / PDF</span>
                        <span className="text-xs text-gray-400">JPG, PNG, PDF – tối đa 5MB</span>
                        <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleLicense} />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={setR("password")}
                    placeholder="Ít nhất 8 ký tự"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={setR("confirmPassword")}
                    placeholder="Nhập lại mật khẩu"
                    className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                      registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword
                        ? "border-red-400"
                        : "border-gray-200"
                    }`}
                  />
                  {registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">Mật khẩu không khớp</p>
                  )}
                </div>

                <Link href="/store">
                  <Button variant="green" size="lg" fullWidth type="button">
                    📝 Đăng ký cửa hàng
                  </Button>
                </Link>

                <p className="text-xs text-gray-400 text-center">
                  Sau khi đăng ký, FoodRescue sẽ xét duyệt trong 1–2 ngày làm việc.
                </p>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/" className="hover:text-orange-500">
            ← Quay về trang khách hàng
          </Link>
        </p>
      </div>
    </div>
  );
}
