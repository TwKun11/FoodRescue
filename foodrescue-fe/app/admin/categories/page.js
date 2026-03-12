"use client";
import { useState, useEffect, useTransition } from "react";
import {
  apiAdminGetCategories,
  apiAdminCreateCategory,
  apiAdminUpdateCategory,
  apiAdminDeleteCategory,
} from "@/lib/api";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;
const EMPTY_FORM = { name: "", slug: "", parentId: "", sortOrder: "0", isActive: true };

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState(""); // "" | "active" | "inactive"

  const load = () => {
    startTransition(async () => {
      const res = await apiAdminGetCategories();
      if (res.ok && res.data?.data) {
        setCategories(res.data.data);
      }
    });
  };

  useEffect(() => { load(); }, []);

  const searchLower = (search || "").trim().toLowerCase();
  const rootCategories = categories.filter((c) => {
    const matchSearch = !searchLower || (c.name && c.name.toLowerCase().includes(searchLower)) || (c.slug && c.slug.toLowerCase().includes(searchLower));
    const matchActive = filterActive === "" || (filterActive === "active" && c.isActive !== false) || (filterActive === "inactive" && c.isActive === false);
    return matchSearch && matchActive;
  });
  const totalRoots = rootCategories.length;
  const totalPages = Math.max(1, Math.ceil(totalRoots / PAGE_SIZE));
  const currentPage = totalPages ? Math.max(0, Math.min(page, totalPages - 1)) : 0;
  const paginatedRoots = rootCategories.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId ? String(cat.parentId) : "",
      sortOrder: String(cat.sortOrder ?? 0),
      isActive: cat.isActive !== false,
    });
    setShowForm(true);
  };

  const handleNameChange = (val) => {
    setForm((f) => ({ ...f, name: val, slug: slugify(val) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Tên và slug không được để trống");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      parentId: form.parentId ? Number(form.parentId) : null,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    };
    const res = editing
      ? await apiAdminUpdateCategory(editing.id, payload)
      : await apiAdminCreateCategory(payload);
    setSaving(false);
    if (res.ok) {
      toast.success(editing ? "Cập nhật danh mục thành công" : "Tạo danh mục thành công");
      setShowForm(false);
      load();
    } else {
      toast.error(res.data?.message || "Lỗi, thử lại");
    }
  };

  const handleDelete = async (cat) => {
    if (!confirm(`Ẩn danh mục "${cat.name}"?`)) return;
    const res = await apiAdminDeleteCategory(cat.id);
    if (res.ok) {
      toast.success("Đã ẩn danh mục");
      load();
    } else {
      toast.error(res.data?.message || "Lỗi");
    }
  };

  const handleRestore = async (cat) => {
    const res = await apiAdminUpdateCategory(cat.id, { isActive: true });
    if (res.ok) {
      toast.success("Đã khôi phục danh mục");
      load();
    } else {
      toast.error(res.data?.message || "Lỗi");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={openCreate}
          className="bg-brand hover:bg-brand-secondary text-gray-900 text-sm font-semibold px-4 py-2 rounded-xl transition"
        >
          + Thêm danh mục
        </button>
      </div>

      {/* Tìm kiếm & Bộ lọc */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] flex items-center gap-2">
          <span className="text-gray-500 text-sm shrink-0">Tìm kiếm</span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Tên danh mục, slug..."
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
            <option value="active">Đang hiển thị</option>
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

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-dark focus:outline-none"
                  placeholder="Ví dụ: Bánh mì, Rau củ..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-brand-dark focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục cha</label>
                <select
                  value={form.parentId}
                  onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-dark focus:outline-none"
                >
                  <option value="">-- Cấp 1 (gốc) --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} disabled={editing?.id === c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự sắp xếp</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-dark focus:outline-none"
                  min="0"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-brand-dark"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Đang hoạt động
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 text-gray-600 font-medium py-2 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-brand hover:bg-brand-secondary text-gray-900 font-semibold py-2 rounded-lg transition text-sm disabled:opacity-60"
                >
                  {saving ? "Đang lưu..." : editing ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPending ? (
        <div className="p-10 text-center text-gray-400">Đang tải...</div>
      ) : categories.length === 0 ? (
        <div className="p-10 text-center text-gray-400">Chưa có danh mục nào</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="space-y-3 p-4">
          {paginatedRoots.map((cat) => (
            <div
              key={cat.id}
              className={`bg-white rounded-xl border ${cat.isActive ? "border-gray-200" : "border-gray-100 opacity-60"} overflow-hidden`}
            >
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${cat.isActive ? "bg-brand" : "bg-gray-300"}`}
                  />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{cat.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{cat.slug}</p>
                  </div>
                  {!cat.isActive && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Ẩn</span>
                  )}
                  {cat.children && cat.children.length > 0 && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                      {cat.children.length} con
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(cat)}
                    className="text-xs text-blue-600 hover:underline px-2 py-1"
                  >
                    Sửa
                  </button>
                  {cat.isActive ? (
                    <button
                      onClick={() => handleDelete(cat)}
                      className="text-xs text-red-500 hover:underline px-2 py-1"
                    >
                      Ẩn
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRestore(cat)}
                      className="text-xs text-brand-dark hover:underline px-2 py-1"
                    >
                      Hiển thị
                    </button>
                  )}
                </div>
              </div>
              {cat.children && cat.children.length > 0 && (
                <div className="border-t border-gray-100 bg-gray-50 divide-y divide-gray-100">
                  {cat.children.map((child) => (
                    <div key={child.id} className="flex items-center justify-between px-8 py-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${child.isActive ? "bg-brand" : "bg-gray-300"}`}
                        />
                        <p className="text-sm text-gray-700">{child.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{child.slug}</p>
                        {!child.isActive && (
                          <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">Ẩn</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(child)}
                          className="text-xs text-blue-600 hover:underline px-2 py-1"
                        >
                          Sửa
                        </button>
                        {child.isActive ? (
                          <button
                            onClick={() => handleDelete(child)}
                            className="text-xs text-red-500 hover:underline px-2 py-1"
                          >
                            Ẩn
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(child)}
                            className="text-xs text-brand-dark hover:underline px-2 py-1"
                          >
                            Hiển thị
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          </div>
          {totalRoots > 0 && (
            <div className="px-5 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-500">
                Trang {currentPage + 1} / {totalPages} · {totalRoots} danh mục gốc (10/trang)
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