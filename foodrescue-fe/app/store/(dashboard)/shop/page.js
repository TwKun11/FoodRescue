// FE03-005 – UI Quản lý Cửa hàng
"use client";
import { useState } from "react";

const TABS = [
  { id: "info", label: "Thông tin cửa hàng" },
  { id: "decoration", label: "Trang trí shop" },
  { id: "rating", label: "Đánh giá", count: 24 },
  { id: "violation", label: "Vi phạm", count: 0 },
  { id: "policy", label: "Chính sách" },
];

const SHOP_STATS = [
  { label: "Tổng sản phẩm", value: "124", icon: "📦", color: "bg-green-50 text-green-600" },
  { label: "Đơn hàng tháng này", value: "318", icon: "🛒", color: "bg-blue-50 text-blue-600" },
  { label: "Đánh giá trung bình", value: "4.8 ★", icon: "⭐", color: "bg-yellow-50 text-yellow-600" },
  { label: "Tỉ lệ giao thành công", value: "96%", icon: "✅", color: "bg-purple-50 text-purple-600" },
];

const INITIAL_SHOP = {
  name: "Circle K – Cửa Hàng Tiện Lợi Q1",
  description: "Cửa hàng tiện lợi chuyên cung cấp thực phẩm tươi sống, bánh mì, đồ uống và các nhu yếu phẩm hàng ngày với mức giá hợp lý.",
  address: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
  phone: "028 3822 1234",
  email: "circlek.q1@foodrescue.vn",
  openTime: "06:00",
  closeTime: "23:00",
  category: "Cửa hàng tiện lợi",
  status: "active",
  logo: "/images/products/raucai.jpg",
  banner: "/images/products/banhmi.jpg",
  taxCode: "0312345678",
  bankName: "Vietcombank",
  bankAccount: "1234567890",
  bankOwner: "CONG TY TNHH CIRCLE K VIET NAM",
};

const RECENT_REVIEWS = [
  { id: 1, customer: "Nguyễn Văn A", rating: 5, comment: "Hàng tươi ngon, giao nhanh!", date: "24/02/2026", avatar: "N" },
  { id: 2, customer: "Trần Thị B", rating: 4, comment: "Sản phẩm ok, đóng gói cẩn thận.", date: "23/02/2026", avatar: "T" },
  { id: 3, customer: "Lê Minh C", rating: 5, comment: "Giá rẻ, chất lượng tốt. Sẽ ủng hộ tiếp!", date: "22/02/2026", avatar: "L" },
];

export default function ShopPage() {
  const [activeTab, setActiveTab] = useState("info");
  const [shop, setShop] = useState(INITIAL_SHOP);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(INITIAL_SHOP);

  const handleSave = () => {
    setShop(form);
    setEditing(false);
  };

  const handleCancel = () => {
    setForm(shop);
    setEditing(false);
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 p-6 space-y-4">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Quản lý cửa hàng</h1>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 border border-gray-300 text-gray-600 text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Chỉnh sửa
            </button>
          )}
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {SHOP_STATS.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${s.color}`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-gray-400">{s.label}</p>
                <p className="text-base font-bold text-gray-800">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Card ── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-1.5 text-xs ${activeTab === tab.id ? "text-green-600" : "text-gray-400"}`}>
                    ({tab.count})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Tab: Thông tin cửa hàng ── */}
          {activeTab === "info" && (
            <div className="p-6">
              {/* Shop header preview */}
              <div className="relative mb-6 rounded-xl overflow-hidden border border-gray-200">
                <div className="h-32 bg-gradient-to-r from-green-400 to-green-600 relative">
                  <img
                    src={shop.banner}
                    alt="Banner"
                    className="w-full h-full object-cover opacity-40"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  {editing && (
                    <button className="absolute bottom-2 right-2 bg-white/80 text-gray-700 text-xs px-2 py-1 rounded-lg flex items-center gap-1 hover:bg-white transition">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Đổi banner
                    </button>
                  )}
                </div>
                <div className="px-5 pb-4 pt-0 flex items-end gap-4 -mt-8">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl border-4 border-white overflow-hidden bg-white shadow-md shrink-0">
                      <img
                        src={shop.logo}
                        alt="Logo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentNode.classList.add("bg-green-500");
                        }}
                      />
                    </div>
                    {editing && (
                      <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="pb-1">
                    <p className="font-bold text-gray-800">{shop.name}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Đang hoạt động
                    </span>
                  </div>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left column */}
                <div className="space-y-4">
                  <Field
                    label="Tên cửa hàng"
                    value={editing ? form.name : shop.name}
                    editing={editing}
                    onChange={(v) => setForm({ ...form, name: v })}
                  />
                  <Field
                    label="Danh mục"
                    value={editing ? form.category : shop.category}
                    editing={editing}
                    type="select"
                    options={["Cửa hàng tiện lợi", "Siêu thị mini", "Nhà hàng", "Bakery", "Hải sản"]}
                    onChange={(v) => setForm({ ...form, category: v })}
                  />
                  <Field
                    label="Số điện thoại"
                    value={editing ? form.phone : shop.phone}
                    editing={editing}
                    onChange={(v) => setForm({ ...form, phone: v })}
                  />
                  <Field
                    label="Email"
                    value={editing ? form.email : shop.email}
                    editing={editing}
                    onChange={(v) => setForm({ ...form, email: v })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Giờ mở cửa"
                      value={editing ? form.openTime : shop.openTime}
                      editing={editing}
                      type="time"
                      onChange={(v) => setForm({ ...form, openTime: v })}
                    />
                    <Field
                      label="Giờ đóng cửa"
                      value={editing ? form.closeTime : shop.closeTime}
                      editing={editing}
                      type="time"
                      onChange={(v) => setForm({ ...form, closeTime: v })}
                    />
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  <Field
                    label="Địa chỉ"
                    value={editing ? form.address : shop.address}
                    editing={editing}
                    onChange={(v) => setForm({ ...form, address: v })}
                  />
                  <Field
                    label="Mô tả cửa hàng"
                    value={editing ? form.description : shop.description}
                    editing={editing}
                    type="textarea"
                    onChange={(v) => setForm({ ...form, description: v })}
                  />
                  <Field
                    label="Mã số thuế"
                    value={editing ? form.taxCode : shop.taxCode}
                    editing={editing}
                    onChange={(v) => setForm({ ...form, taxCode: v })}
                  />
                </div>
              </div>

              {/* Bank Info */}
              <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Thông tin thanh toán</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field
                    label="Ngân hàng"
                    value={editing ? form.bankName : shop.bankName}
                    editing={editing}
                    onChange={(v) => setForm({ ...form, bankName: v })}
                  />
                  <Field
                    label="Số tài khoản"
                    value={editing ? form.bankAccount : shop.bankAccount}
                    editing={editing}
                    onChange={(v) => setForm({ ...form, bankAccount: v })}
                  />
                  <Field
                    label="Chủ tài khoản"
                    value={editing ? form.bankOwner : shop.bankOwner}
                    editing={editing}
                    onChange={(v) => setForm({ ...form, bankOwner: v })}
                  />
                </div>
              </div>

              {/* Action buttons */}
              {editing && (
                <div className="mt-5 flex gap-3 justify-end">
                  <button
                    onClick={handleCancel}
                    className="px-5 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Đánh giá ── */}
          {activeTab === "rating" && (
            <div className="p-6 space-y-4">
              {/* Rating summary */}
              <div className="flex items-center gap-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-center">
                  <p className="text-5xl font-extrabold text-yellow-500">4.8</p>
                  <p className="text-yellow-400 text-xl mt-1">★★★★★</p>
                  <p className="text-xs text-gray-400 mt-1">24 đánh giá</p>
                </div>
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct = star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : star === 2 ? 2 : 1;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-4">{star}</span>
                        <span className="text-yellow-400 text-xs">★</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-6">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review list */}
              <div className="divide-y divide-gray-100">
                {RECENT_REVIEWS.map((r) => (
                  <div key={r.id} className="py-4 flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {r.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-800">{r.customer}</p>
                        <p className="text-xs text-gray-400">{r.date}</p>
                      </div>
                      <p className="text-yellow-400 text-sm mt-0.5">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                      <p className="text-sm text-gray-600 mt-1">{r.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Tab: Vi phạm ── */}
          {activeTab === "violation" && (
            <div className="p-12 text-center text-gray-400">
              <p className="text-4xl mb-3">✅</p>
              <p className="font-semibold text-gray-600">Không có vi phạm nào</p>
              <p className="text-sm mt-1">Cửa hàng của bạn đang hoạt động tốt.</p>
            </div>
          )}

          {/* ── Tab: Trang trí / Chính sách ── */}
          {(activeTab === "decoration" || activeTab === "policy") && (
            <div className="p-12 text-center text-gray-400">
              <p className="text-4xl mb-3">🚧</p>
              <p className="font-semibold text-gray-600">Tính năng đang phát triển</p>
              <p className="text-sm mt-1">Sẽ ra mắt trong phiên bản tiếp theo.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-200 bg-white">
        © 2024 Food Rescue System – Quản lý Cửa Hàng Tiện Lợi v2.1.0
      </footer>
    </div>
  );
}

// ── Helper component ──────────────────────────────────────────────────────
function Field({ label, value, editing, onChange, type = "text", options = [] }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </label>
      {!editing ? (
        <p className="text-sm text-gray-800 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[38px]">
          {value || <span className="text-gray-400">—</span>}
        </p>
      ) : type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
        />
      ) : type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-300"
        >
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-300"
        />
      )}
    </div>
  );
}
