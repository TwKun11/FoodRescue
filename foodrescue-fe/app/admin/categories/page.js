"use client";
import { useState, useEffect, useTransition } from "react";
import {
  apiAdminGetCategories,
  apiAdminCreateCategory,
  apiAdminUpdateCategory,
  apiAdminDeleteCategory,
} from "@/lib/api";
import toast from "react-hot-toast";

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

  const load = () => {
    startTransition(async () => {
      const res = await apiAdminGetCategories();
      if (res.ok && res.data?.data) {
        setCategories(res.data.data);
      }
    });
  };

  useEffect(() => { load(); }, []);

  const rootCategories = categories;

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
      toast.error("Ten va slug khong duoc de trong");
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
      toast.success(editing ? "Cap nhat danh muc thanh cong" : "Tao danh muc thanh cong");
      setShowForm(false);
      load();
    } else {
      toast.error(res.data?.message || "Loi, thu lai");
    }
  };

  const handleDelete = async (cat) => {
    if (!confirm(`An danh muc "${cat.name}"?`)) return;
    const res = await apiAdminDeleteCategory(cat.id);
    if (res.ok) {
      toast.success("Da an danh muc");
      load();
    } else {
      toast.error(res.data?.message || "Loi");
    }
  };

  const handleRestore = async (cat) => {
    const res = await apiAdminUpdateCategory(cat.id, { isActive: true });
    if (res.ok) {
      toast.success("Da khoi phuc danh muc");
      load();
    } else {
      toast.error(res.data?.message || "Loi");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Quan ly danh muc</h1>
        <button
          onClick={openCreate}
          className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          + Them danh muc
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editing ? "Chinh sua danh muc" : "Them danh muc moi"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ten danh muc *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                  placeholder="Vi du: Banh mi, Rau cu..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-green-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh muc cha</label>
                <select
                  value={form.parentId}
                  onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                >
                  <option value="">-- Cap 1 (goc) --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} disabled={editing?.id === c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thu tu sap xep</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                  min="0"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-green-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Dang hoat dong
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 text-gray-600 font-medium py-2 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  Huy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition text-sm disabled:opacity-60"
                >
                  {saving ? "Dang luu..." : editing ? "Cap nhat" : "Tao moi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPending ? (
        <div className="p-10 text-center text-gray-400">Dang tai...</div>
      ) : categories.length === 0 ? (
        <div className="p-10 text-center text-gray-400">Chua co danh muc nao</div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`bg-white rounded-xl border ${cat.isActive ? "border-gray-200" : "border-gray-100 opacity-60"} overflow-hidden`}
            >
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${cat.isActive ? "bg-green-400" : "bg-gray-300"}`}
                  />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{cat.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{cat.slug}</p>
                  </div>
                  {!cat.isActive && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">An</span>
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
                    Sua
                  </button>
                  {cat.isActive ? (
                    <button
                      onClick={() => handleDelete(cat)}
                      className="text-xs text-red-500 hover:underline px-2 py-1"
                    >
                      An
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRestore(cat)}
                      className="text-xs text-green-600 hover:underline px-2 py-1"
                    >
                      Hien thi
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
                          className={`w-1.5 h-1.5 rounded-full ${child.isActive ? "bg-green-400" : "bg-gray-300"}`}
                        />
                        <p className="text-sm text-gray-700">{child.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{child.slug}</p>
                        {!child.isActive && (
                          <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">An</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(child)}
                          className="text-xs text-blue-600 hover:underline px-2 py-1"
                        >
                          Sua
                        </button>
                        {child.isActive ? (
                          <button
                            onClick={() => handleDelete(child)}
                            className="text-xs text-red-500 hover:underline px-2 py-1"
                          >
                            An
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(child)}
                            className="text-xs text-green-600 hover:underline px-2 py-1"
                          >
                            Hien thi
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
      )}
    </div>
  );
}