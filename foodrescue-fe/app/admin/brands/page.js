"use client";
import { useState, useEffect } from "react";
import {
  apiAdminGetBrands,
  apiAdminCreateBrand,
  apiAdminUpdateBrand,
  apiAdminDeleteBrand,
  apiAdminRestoreBrand,
} from "@/lib/api";

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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🏷️ Thương hiệu</h1>
          <p className="text-sm text-gray-400 mt-0.5">Quản lý danh sách thương hiệu sản phẩm</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          + Thêm thương hiệu
        </button>
      </div>

      {/* Flash */}
      {flashMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
          ✓ {flashMsg}
        </div>
      )}

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
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
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
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Mô tả</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={setField("description")}
                  placeholder="Mô tả ngắn về thương hiệu..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={setField("isActive")}
                  className="w-4 h-4 accent-green-500"
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
                  className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition disabled:opacity-60"
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
              {brands.map((brand) => (
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
                        className={`text-xs hover:underline ${brand.isActive ? "text-red-500" : "text-green-600"}`}
                      >
                        {brand.isActive ? "Vô hiệu" : "Kích hoạt"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
