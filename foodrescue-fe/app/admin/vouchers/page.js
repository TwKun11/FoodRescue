"use client";
import { useEffect, useMemo, useState } from "react";
import {
  apiAdminCreateVoucher,
  apiAdminGetVouchers,
  apiAdminUpdateVoucher,
  apiAdminUpdateVoucherStatus,
} from "@/lib/api";

const PAGE_SIZE = 10;
const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Tạm tắt" },
  { value: "expired", label: "Hết hạn" },
];

const TYPE_OPTIONS = [
  { value: "", label: "Tất cả loại giảm" },
  { value: "fixed_amount", label: "Giảm số tiền" },
  { value: "percentage", label: "Giảm phần trăm" },
  { value: "freeship", label: "Freeship" },
];

const EMPTY_FORM = {
  name: "",
  code: "",
  description: "",
  discountType: "fixed_amount",
  discountValue: "10000",
  maxDiscountAmount: "",
  minOrderValue: "",
  maxUses: "",
  activeFrom: "",
  activeUntil: "",
  expiryHoursThreshold: "24",
  targetProvince: "",
  comboItemThreshold: "",
  autoTriggerEnabled: false,
  status: "active",
};

function toLocalInputDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hour = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${min}`;
}

function parseNumber(value) {
  if (value === "" || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function statusBadge(status) {
  if (status === "active") return "bg-green-100 text-green-700";
  if (status === "inactive") return "bg-slate-100 text-slate-600";
  return "bg-amber-100 text-amber-700";
}

function normalizeCode(input) {
  return (input || "")
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9_-]/g, "");
}

function typeLabel(type) {
  if (type === "fixed_amount") return "Giảm số tiền";
  if (type === "percentage") return "Giảm %";
  return "Freeship";
}

export default function AdminVouchersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [discountType, setDiscountType] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await apiAdminGetVouchers({ page, size: PAGE_SIZE, search, status, discountType });
    if (res.ok && res.data?.data) {
      setRows(res.data.data.content || []);
      setTotalPages(Math.max(1, res.data.data.totalPages || 1));
      setTotalElements(res.data.data.totalElements || 0);
    } else {
      setRows([]);
      setTotalPages(1);
      setTotalElements(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, discountType]);

  const flashMessage = (msg) => {
    setFlash(msg);
    setTimeout(() => setFlash(""), 2500);
  };

  const setField = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "code") next.code = normalizeCode(value);
      if (field === "discountType" && value === "freeship") {
        next.discountValue = "0";
        next.maxDiscountAmount = "";
      }
      return next;
    });
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name || "",
      code: row.code || "",
      description: row.description || "",
      discountType: row.discountType || "fixed_amount",
      discountValue: String(row.discountValue ?? 0),
      maxDiscountAmount: row.maxDiscountAmount != null ? String(row.maxDiscountAmount) : "",
      minOrderValue: row.minOrderValue != null ? String(row.minOrderValue) : "",
      maxUses: row.maxUses != null ? String(row.maxUses) : "",
      activeFrom: toLocalInputDateTime(row.activeFrom),
      activeUntil: toLocalInputDateTime(row.activeUntil),
      expiryHoursThreshold: row.expiryHoursThreshold != null ? String(row.expiryHoursThreshold) : "",
      targetProvince: row.targetProvince || "",
      comboItemThreshold: row.comboItemThreshold != null ? String(row.comboItemThreshold) : "",
      autoTriggerEnabled: Boolean(row.autoTriggerEnabled),
      status: row.status || "active",
    });
    setError("");
    setShowForm(true);
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    code: normalizeCode(form.code),
    description: form.description.trim() || null,
    discountType: form.discountType,
    discountValue: parseNumber(form.discountValue) ?? 0,
    maxDiscountAmount: parseNumber(form.maxDiscountAmount),
    minOrderValue: parseNumber(form.minOrderValue),
    maxUses: parseNumber(form.maxUses),
    activeFrom: form.activeFrom ? new Date(form.activeFrom).toISOString() : null,
    activeUntil: form.activeUntil ? new Date(form.activeUntil).toISOString() : null,
    expiryHoursThreshold: parseNumber(form.expiryHoursThreshold),
    targetProvince: form.targetProvince.trim() || null,
    comboItemThreshold: parseNumber(form.comboItemThreshold),
    autoTriggerEnabled: Boolean(form.autoTriggerEnabled),
    status: form.status,
  });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Tên voucher không được để trống");
      return;
    }
    if (!normalizeCode(form.code)) {
      setError("Mã voucher không hợp lệ");
      return;
    }

    setSaving(true);
    const payload = buildPayload();
    const res = editing ? await apiAdminUpdateVoucher(editing.id, payload) : await apiAdminCreateVoucher(payload);
    setSaving(false);

    if (!res.ok) {
      setError(res.data?.message || "Không thể lưu voucher");
      return;
    }

    setShowForm(false);
    flashMessage(editing ? "Đã cập nhật voucher" : "Đã tạo voucher mới");
    load();
  };

  const updateStatus = async (row, nextStatus) => {
    const res = await apiAdminUpdateVoucherStatus(row.id, nextStatus);
    if (res.ok) {
      flashMessage("Đã cập nhật trạng thái voucher");
      load();
    }
  };

  const appliedModeHints = useMemo(() => {
    const hints = [];
    if (parseNumber(form.expiryHoursThreshold)) hints.push("Expiry-based");
    if (form.targetProvince.trim()) hints.push("Location-based");
    if (parseNumber(form.comboItemThreshold)) hints.push("Combo");
    if (form.autoTriggerEnabled) hints.push("Auto-trigger");
    return hints;
  }, [form]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voucher</h1>
          <p className="text-sm text-gray-500 mt-1">Tạo voucher cơ bản và voucher theo rule FoodRescue: cận hạn, khu vực, combo, tự động.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="bg-brand hover:bg-brand-secondary text-gray-900 text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          + Tạo voucher
        </button>
      </div>

      {flash && (
        <div className="bg-brand-bg border border-brand/30 text-brand-dark text-sm rounded-lg px-4 py-3">✓ {flash}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] flex items-center gap-2">
          <span className="text-gray-500 text-sm shrink-0">Tìm kiếm</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(0);
                load();
              }
            }}
            placeholder="Tên voucher, mã voucher"
            className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-transparent"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-dark focus:outline-none"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={discountType}
          onChange={(e) => {
            setDiscountType(e.target.value);
            setPage(0);
          }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-dark focus:outline-none"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            setPage(0);
            load();
          }}
          className="px-3 py-2 text-sm font-semibold text-brand-dark border border-brand/40 rounded-xl hover:bg-brand-bg"
        >
          Lọc
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editing ? "Cập nhật voucher" : "Tạo voucher mới"}
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">{error}</div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tên voucher *</label>
                  <input
                    value={form.name}
                    onChange={setField("name")}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                    placeholder="FLASH SAVE 30%"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Mã voucher *</label>
                  <input
                    value={form.code}
                    onChange={setField("code")}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-brand-dark"
                    placeholder="FLASH30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Mô tả</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={setField("description")}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark resize-none"
                  placeholder="Mô tả ngắn về voucher"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Loại giảm *</label>
                  <select
                    value={form.discountType}
                    onChange={setField("discountType")}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                  >
                    <option value="fixed_amount">Giảm số tiền</option>
                    <option value="percentage">Giảm phần trăm</option>
                    <option value="freeship">Freeship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Giá trị giảm {form.discountType === "percentage" ? "(%)" : "(VND)"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.discountValue}
                    onChange={setField("discountValue")}
                    disabled={form.discountType === "freeship"}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Giảm tối đa (VND)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.maxDiscountAmount}
                    onChange={setField("maxDiscountAmount")}
                    disabled={form.discountType !== "percentage"}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Đơn tối thiểu</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.minOrderValue}
                    onChange={setField("minOrderValue")}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Giới hạn lượt dùng</label>
                  <input
                    type="number"
                    min="1"
                    value={form.maxUses}
                    onChange={setField("maxUses")}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Bắt đầu</label>
                  <input
                    type="datetime-local"
                    value={form.activeFrom}
                    onChange={setField("activeFrom")}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Kết thúc</label>
                  <input
                    type="datetime-local"
                    value={form.activeUntil}
                    onChange={setField("activeUntil")}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                  />
                </div>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/60 space-y-3">
                <p className="text-sm font-semibold text-gray-700">Rule FoodRescue</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Expiry-based (giờ cận hạn)</label>
                    <input
                      type="number"
                      min="1"
                      value={form.expiryHoursThreshold}
                      onChange={setField("expiryHoursThreshold")}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                      placeholder="24"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Location-based (tỉnh/thành)</label>
                    <input
                      value={form.targetProvince}
                      onChange={setField("targetProvince")}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                      placeholder="Pleiku"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Combo-based (số sản phẩm)</label>
                    <input
                      type="number"
                      min="2"
                      value={form.comboItemThreshold}
                      onChange={setField("comboItemThreshold")}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                      placeholder="3"
                    />
                  </div>
                </div>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.autoTriggerEnabled}
                    onChange={setField("autoTriggerEnabled")}
                    className="w-4 h-4 accent-brand-dark"
                  />
                  Bật auto trigger (gợi ý voucher tự động)
                </label>
                <div className="text-xs text-gray-500">
                  Rule đang bật: {appliedModeHints.length ? appliedModeHints.join(", ") : "Chưa bật rule nào (voucher cơ bản)"}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Trạng thái</label>
                <select
                  value={form.status}
                  onChange={setField("status")}
                  className="w-full md:w-60 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Tạm tắt</option>
                  <option value="expired">Hết hạn</option>
                </select>
              </div>

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
                  {saving ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Tạo voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Đang tải...</div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Chưa có voucher nào</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Voucher</th>
                  <th className="px-4 py-3 text-left">Loại</th>
                  <th className="px-4 py-3 text-left">Rule</th>
                  <th className="px-4 py-3 text-center">Lượt dùng</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row) => {
                  const ruleTags = [];
                  if (row.expiryHoursThreshold) ruleTags.push(`Expiry < ${row.expiryHoursThreshold}h`);
                  if (row.targetProvince) ruleTags.push(row.targetProvince);
                  if (row.comboItemThreshold) ruleTags.push(`Combo ${row.comboItemThreshold}+`);
                  if (row.autoTriggerEnabled) ruleTags.push("Auto");

                  const valueText = row.discountType === "percentage"
                    ? `${Number(row.discountValue || 0)}%`
                    : row.discountType === "freeship"
                    ? "Freeship"
                    : `${Number(row.discountValue || 0).toLocaleString("vi-VN")} đ`;

                  return (
                    <tr key={row.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">{row.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{row.code} • {valueText}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{typeLabel(row.discountType)}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {ruleTags.length ? (
                          <div className="flex flex-wrap gap-1">
                            {ruleTags.map((tag) => (
                              <span key={tag} className="inline-block px-2 py-0.5 rounded-full bg-brand-bg text-brand-dark text-[11px] font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Voucher cơ bản</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {row.usedCount || 0}{row.maxUses ? ` / ${row.maxUses}` : ""}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge(row.status)}`}>
                          {row.status === "active" ? "Hoạt động" : row.status === "inactive" ? "Tạm tắt" : "Hết hạn"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => openEdit(row)} className="text-xs text-blue-600 hover:underline">Sửa</button>
                          {row.status !== "active" && (
                            <button onClick={() => updateStatus(row, "active")} className="text-xs text-green-600 hover:underline">Bật</button>
                          )}
                          {row.status === "active" && (
                            <button onClick={() => updateStatus(row, "inactive")} className="text-xs text-red-500 hover:underline">Tắt</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="px-5 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-500">
                Trang {page + 1} / {totalPages} · {totalElements} voucher (10/trang)
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-brand-bg hover:border-brand/50 transition disabled:opacity-40 disabled:pointer-events-none"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-700 min-w-16 text-center">{page + 1} / {totalPages}</span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-brand-bg hover:border-brand/50 transition disabled:opacity-40 disabled:pointer-events-none"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
