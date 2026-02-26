// FE03-003 – UI Quản lý sản phẩm
"use client";
import { useState } from "react";

const TABS = [
  { id: "all", label: "Tất cả sản phẩm", count: 124 },
  { id: "active", label: "Đang hoạt động", count: 85 },
  { id: "expiring", label: "Sắp hết hạn", count: 12 },
  { id: "violation", label: "Vi phạm", count: 2 },
  { id: "pending", label: "Chờ duyệt", count: 5 },
];

const STATUS_MAP = {
  active: { label: "Đang bán", dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50" },
  warning: { label: "Cần giảm giá thêm", dot: "bg-yellow-400", text: "text-yellow-700", bg: "bg-yellow-50" },
  pending: { label: "Chờ duyệt", dot: "bg-blue-400", text: "text-blue-700", bg: "bg-blue-50" },
};

const INIT_PRODUCTS = [
  {
    id: "1",
    image: "/images/products/raucai.jpg",
    name: "Dâu tây Đà Lạt (Hộp 250g)",
    sku: "FR-DAU-001",
    originalPrice: 65000,
    discountPrice: 39000,
    quantity: 12,
    status: "active",
  },
  {
    id: "2",
    image: "/images/products/ca-ba-sa.jpg.webp",
    name: "Súp lơ xanh hữu cơ",
    sku: "FR-SPL-942",
    originalPrice: 28000,
    discountPrice: 14000,
    quantity: 3,
    quantityLabel: "3 (Sắp hết)",
    status: "warning",
  },
  {
    id: "3",
    image: "/images/products/dualeo.jpg",
    name: "Combo rau củ hầm (Túi 1kg)",
    sku: "FR-CBO-169",
    originalPrice: 45000,
    discountPrice: 22500,
    quantity: 45,
    status: "active",
  },
  {
    id: "4",
    image: "/images/products/banhmi.jpg",
    name: "Bánh mì ổ lớn (Bake of the Day)",
    sku: "FR-BM-552",
    originalPrice: 32000,
    discountPrice: 10000,
    quantity: 8,
    status: "pending",
  },
];

export default function StoreProductsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [products, setProducts] = useState(INIT_PRODUCTS);
  const [selected, setSelected] = useState([]);
  const [category, setCategory] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const totalPages = 12;

  const toggleSelect = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () =>
    setSelected(selected.length === products.length ? [] : products.map((p) => p.id));

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 p-6 space-y-4">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Quản lý sản phẩm</h1>
          <button className="flex items-center gap-2 border border-gray-300 text-gray-600 text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Xuất file
          </button>
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

          {/* Filters */}
          <div className="px-5 py-4 flex flex-wrap items-end gap-3 border-b border-gray-100">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Danh mục</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-300 min-w-[160px]"
              >
                <option value="">Tất cả danh mục</option>
                <option>Rau củ</option>
                <option>Thịt tươi</option>
                <option>Bánh</option>
                <option>Hải sản</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Khoảng giá</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-300 min-w-[160px]"
              >
                <option value="">Tất cả mệnh giá</option>
                <option>Dưới 20.000đ</option>
                <option>20.000đ – 50.000đ</option>
                <option>Trên 50.000đ</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-300 min-w-[160px]"
              >
                <option value="">Tất cả trạng thái</option>
                <option>Đang bán</option>
                <option>Cần giảm giá thêm</option>
                <option>Chờ duyệt</option>
              </select>
            </div>
            <button className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition">
              Áp dụng bộ lọc
            </button>
            <button className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={selected.length === products.length}
                      onChange={toggleAll}
                      className="rounded border-gray-300 text-green-500 focus:ring-green-400"
                    />
                  </th>
                  <th className="px-4 py-3 text-left">Sản phẩm</th>
                  <th className="px-4 py-3 text-left">Giá (gốc / giảm)</th>
                  <th className="px-4 py-3 text-left">Kho hàng</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => {
                  const s = STATUS_MAP[p.status] || STATUS_MAP.active;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selected.includes(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          className="rounded border-gray-300 text-green-500 focus:ring-green-400"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = "https://placehold.co/48x48/f3f4f6/9ca3af?text=?"; }}
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm leading-snug">{p.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">SKU: {p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs text-gray-400 line-through">{p.originalPrice.toLocaleString("vi-VN")}đ</p>
                        <p className="text-sm font-bold text-green-600">{p.discountPrice.toLocaleString("vi-VN")}đ</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-sm font-semibold ${p.quantityLabel ? "text-orange-500" : "text-gray-700"}`}>
                          {p.quantityLabel || p.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit */}
                          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-green-600 transition" title="Chỉnh sửa">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {/* Hide */}
                          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition" title="Ẩn sản phẩm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          </button>
                          {/* Delete */}
                          <button
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-200 text-red-400 hover:bg-red-50 transition"
                            title="Xóa"
                            onClick={() => setProducts((prev) => prev.filter((x) => x.id !== p.id))}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">Hiển thị 1 - 4 trên 124 sản phẩm</p>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                    page === n
                      ? "bg-green-500 text-white"
                      : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {n}
                </button>
              ))}
              <span className="text-gray-400 text-sm px-1">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm transition">
                12
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Bottom Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-green-500 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <p className="text-white/80 text-[10px] font-bold uppercase tracking-wide">Thực phẩm đã giải cứu</p>
              <p className="text-white text-2xl font-extrabold leading-tight">1,240 kg</p>
            </div>
          </div>
          <div className="bg-blue-500 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            <div>
              <p className="text-white/80 text-[10px] font-bold uppercase tracking-wide">Lãng phí đã giảm</p>
              <p className="text-white text-2xl font-extrabold leading-tight">32%</p>
            </div>
          </div>
          <div className="bg-orange-400 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white/80 text-[10px] font-bold uppercase tracking-wide">Hàng cần date (24h)</p>
              <p className="text-white text-2xl font-extrabold leading-tight">18 món</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-200 bg-white">
        © 2024 Food Rescue System – Quản lý Cửa Hàng Tiện Lợi v2.1.0
      </footer>
    </div>
  );
}
