"use client";
import { useState, useEffect } from "react";
import {
  apiAdminGetBrands,
  apiAdminCreateBrand,
  apiAdminUpdateBrand,
  apiAdminDeleteBrand,
  apiAdminRestoreBrand,
} from "@/lib/api";

const PAGE_SIZE = 10;
const EMPTY_FORM = { name: "", slug: "", description: "", isActive: true };

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [flashMsg, setFlashMsg] = useState("");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState(""); // "" | "active" | "inactive"

  const load = async () => {
    setLoading(true);
    const res = await apiAdminGetBrands();
    if (res.ok && res.data?.data) setBrands(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    queueMicrotask(load);
  }, []);

  const flash = (msg) => {
    setFlashMsg(msg);
    setTimeout(() => setFlashMsg(""), 3000);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  };

  const openEdit = (brand) => {
    setEditing(brand);
    setForm({
      name: brand.name,
      slug: brand.slug,
      description: brand.description || "",
      isActive: brand.isActive !== false,
    });
    setError("");
    setShowForm(true);
  };

  const setField = (k) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => {
      const next = { ...f, [k]: val };
      if (k === "name" && !editing) next.slug = slugify(val);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.slug.trim()) {
      setError("Tên và slug không được để trống");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      isActive: form.isActive,
    };
    const res = editing ? await apiAdminUpdateBrand(editing.id, payload) : await apiAdminCreateBrand(payload);
    setSaving(false);
    if (res.ok) {
      setShowForm(false);
      flash(editing ? "Đã cập nhật thương hiệu" : "Đã thêm thương hiệu mới");
      load();
    } else {
      setError(res.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleToggle = async (brand) => {
    const res = brand.isActive ? await apiAdminDeleteBrand(brand.id) : await apiAdminRestoreBrand(brand.id);
    if (res.ok) {
      flash(brand.isActive ? "Đã vô hiệu hóa thương hiệu" : "Đã kích hoạt lại thương hiệu");
      load();
    }
  };

  const searchLower = (search || "").trim().toLowerCase();
  const filteredBrands = brands.filter((b) => {
    const matchSearch = !searchLower || (b.name && b.name.toLowerCase().includes(searchLower)) || (b.slug && b.slug.toLowerCase().includes(searchLower));
    const matchActive = filterActive === "" || (filterActive === "active" && b.isActive !== false) || (filterActive === "inactive" && b.isActive === false);
    return matchSearch && matchActive;
  });
  const total = filteredBrands.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.max(0, Math.min(page, totalPages - 1));
  const paginatedBrands = filteredBrands.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        
        <button
          onClick={openCreate}
          className="bg-brand hover:bg-brand-secondary text-gray-900 text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          + Thêm thương hiệu
        </button>
      </div>

      {/* Flash */}
      {flashMsg && (
        <div className="bg-brand-bg border border-brand/30 text-brand-dark text-sm rounded-lg px-4 py-3">
          ✓ {flashMsg}
        </div>
      )}

      {/* Tìm kiếm & Bộ lọc */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] flex items-center gap-2">
          <span className="text-gray-500 text-sm shrink-0">Tìm kiếm</span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Tên thương hiệu, slug..."
            className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm shrink-0">Trạng thái</span>
          <select
            value={filterActive}
            onChange={(e) => { setFilterActive(e.target.value); setPage(0); }}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-dark focus:outline-none"
          >
            <option value="">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã ẩn</option>
          </select>
        </div>
        {(search || filterActive) && (
          <button
            type="button"
            onClick={() => { setSearch(""); setFilterActive(""); setPage(0); }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editing ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu mới"}
            </h2>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tên thương hiệu *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={setField("name")}
                  placeholder="VD: TH True Milk"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={setField("slug")}
                  placeholder="th-true-milk"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Mô tả</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={setField("description")}
                  placeholder="Mô tả ngắn về thương hiệu..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark resize-none"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={setField("isActive")}
                  className="w-4 h-4 accent-brand-dark"
                />
                Kích hoạt
              </label>
              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-brand hover:bg-brand-secondary text-gray-900 text-sm font-semibold rounded-lg transition disabled:opacity-60"
                >
                  {saving ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Đang tải...</div>
      ) : brands.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🏷️</p>
          <p>Chưa có thương hiệu nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Tên</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-left">Mô tả</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedBrands.map((brand) => (
                <tr key={brand.id} className={`hover:bg-gray-50 transition ${!brand.isActive ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 font-medium text-gray-800">{brand.name}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{brand.slug}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{brand.description || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        brand.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {brand.isActive ? "Hoạt động" : "Vô hiệu"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(brand)} className="text-xs text-blue-600 hover:underline">
                        Sửa
                      </button>
                      <button
                        onClick={() => handleToggle(brand)}
                        className={`text-xs hover:underline ${brand.isActive ? "text-red-500" : "text-brand-dark"}`}
                      >
                        {brand.isActive ? "Vô hiệu" : "Kích hoạt"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {total > 0 && (
            <div className="px-5 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-500">
                Trang {currentPage + 1} / {totalPages} · {total} thương hiệu (10/trang)
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-brand-bg hover:border-brand/50 transition disabled:opacity-40 disabled:pointer-events-none"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-700 min-w-16 text-center">{currentPage + 1} / {totalPages}</span>
                <button
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-brand-bg hover:border-brand/50 transition disabled:opacity-40 disabled:pointer-events-none"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
