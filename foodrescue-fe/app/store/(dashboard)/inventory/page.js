"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiSellerGetBatches, apiSellerAddBatch, apiSellerGetProducts } from "@/lib/api";

function genBatchCode() {
  return `BATCH-${Date.now().toString(36).toUpperCase()}`;
}

const EMPTY_BATCH = {
  variantId: "",
  batchCode: genBatchCode(),
  supplierName: "",
  receivedAt: new Date().toISOString().slice(0, 16),
  manufacturedAt: "",
  expiredAt: "",
  costPrice: "",
  quantityReceived: "",
  note: "",
};

const STATUS_STYLE = {
  active: { label: "Còn hàng", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  depleted: { label: "Đã hết", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400" },
  expired: { label: "Hết hạn", bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" },
  blocked: { label: "Bị chặn", bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
};

function fmt(n) {
  if (n == null) return "—";
  return Number(n).toLocaleString("vi-VN");
}

function fmtMoney(n) {
  if (n == null) return "—";
  return Number(n).toLocaleString("vi-VN") + "đ";
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function daysUntil(isoDate) {
  if (!isoDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(isoDate);
  exp.setHours(0, 0, 0, 0);
  return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
}

export default function InventoryPage() {
  const router = useRouter();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [keyword, setKeyword] = useState("");

  // Add-batch modal
  const [showModal, setShowModal] = useState(false);
  const [batchForm, setBatchForm] = useState(EMPTY_BATCH);
  const [variants, setVariants] = useState([]); // [{id, label}]
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    apiSellerGetBatches()
      .then((res) => {
        if (res.ok && res.data?.data) {
          const d = res.data.data;
          setBatches(Array.isArray(d) ? d : d.content || []);
        } else if (res.status === 401) {
          router.replace("/login");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    queueMicrotask(load);
  }, [load, router]);

  const openModal = useCallback(async () => {
    setBatchForm({ ...EMPTY_BATCH, batchCode: genBatchCode() });
    setFormError("");
    setShowModal(true);
    if (variants.length === 0) {
      setVariantsLoading(true);
      const res = await apiSellerGetProducts({ size: 200 });
      if (res.ok && res.data?.data) {
        const products = res.data.data.content ?? res.data.data;
        const flat = [];
        products.forEach((p) => {
          (p.variants || []).forEach((v) => {
            flat.push({ id: v.id, label: `${p.name} – ${v.name || v.variantCode} (${v.unit || ""})` });
          });
        });
        setVariants(flat);
      }
      setVariantsLoading(false);
    }
  }, [variants.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!batchForm.variantId) {
      setFormError("Vui lòng chọn biến thể sản phẩm");
      return;
    }
    if (!batchForm.costPrice || Number(batchForm.costPrice) < 0) {
      setFormError("Nhập giá vốn hợp lệ");
      return;
    }
    if (!batchForm.quantityReceived || Number(batchForm.quantityReceived) <= 0) {
      setFormError("Số lượng nhập phải > 0");
      return;
    }

    const toDateTime = (v) => (v ? (v.length === 16 ? v + ":00" : v) : null);

    const payload = {
      variantId: Number(batchForm.variantId),
      batchCode: batchForm.batchCode.trim(),
      supplierName: batchForm.supplierName.trim() || null,
      receivedAt: toDateTime(batchForm.receivedAt),
      manufacturedAt: toDateTime(batchForm.manufacturedAt) || null,
      expiredAt: toDateTime(batchForm.expiredAt) || null,
      costPrice: Number(batchForm.costPrice),
      quantityReceived: Number(batchForm.quantityReceived),
      note: batchForm.note.trim() || null,
    };

    setSubmitting(true);
    const res = await apiSellerAddBatch(payload);
    setSubmitting(false);
    if (res.ok) {
      setShowModal(false);
      load();
    } else {
      setFormError(res.data?.message || "Nhập lô thất bại, vui lòng thử lại");
    }
  };

  const filtered = batches.filter((b) => {
    if (filterStatus !== "all" && b.status?.toLowerCase() !== filterStatus) return false;
    if (keyword) {
      const kw = keyword.toLowerCase();
      if (
        !b.batchCode?.toLowerCase().includes(kw) &&
        !b.variantName?.toLowerCase().includes(kw) &&
        !b.supplierName?.toLowerCase().includes(kw)
      )
        return false;
    }
    return true;
  });

  const stats = {
    total: batches.length,
    active: batches.filter((b) => b.status?.toLowerCase() === "active").length,
    expiringSoon: batches.filter((b) => {
      if (b.status?.toLowerCase() !== "active") return false;
      const d = daysUntil(b.expiredAt);
      return d !== null && d <= 7 && d >= 0;
    }).length,
    depleted: batches.filter((b) => b.status?.toLowerCase() === "depleted").length,
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Quản lý kho hàng</h1>
          <button
            onClick={openModal}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            <span className="text-base leading-none">+</span> Nhập lô hàng
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Tổng lô hàng", value: stats.total, icon: "📦", color: "bg-blue-50 text-blue-600" },
            { label: "Đang có hàng", value: stats.active, icon: "✅", color: "bg-green-50 text-green-600" },
            {
              label: "Sắp hết hạn (≤7 ngày)",
              value: stats.expiringSoon,
              icon: "⚠️",
              color: "bg-orange-50 text-orange-600",
            },
            { label: "Đã hết hàng", value: stats.depleted, icon: "❌", color: "bg-red-50 text-red-600" },
          ].map((s) => (
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

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Tìm kiếm</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Mã lô, tên biến thể, nhà cung cấp..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-300 min-w-60"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-300 bg-white"
            >
              <option value="all">Tất cả</option>
              <option value="active">Còn hàng</option>
              <option value="depleted">Đã hết</option>
              <option value="expired">Hết hạn</option>
              <option value="blocked">Bị chặn</option>
            </select>
          </div>
          <button
            onClick={load}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            Làm mới
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Mã lô</th>
                  <th className="px-4 py-3 text-left">Biến thể sản phẩm</th>
                  <th className="px-4 py-3 text-left">Nhà cung cấp</th>
                  <th className="px-4 py-3 text-right">Nhập kho</th>
                  <th className="px-4 py-3 text-right">Còn lại</th>
                  <th className="px-4 py-3 text-right">Giá nhập</th>
                  <th className="px-4 py-3 text-left">Ngày nhập</th>
                  <th className="px-4 py-3 text-left">Hạn sử dụng</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-gray-400">
                      Đang tải...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-gray-400">
                      Không có lô hàng nào.
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => {
                    const st = STATUS_STYLE[b.status?.toLowerCase()] || STATUS_STYLE.active;
                    const days = daysUntil(b.expiredAt);
                    const expiringSoon =
                      b.status?.toLowerCase() === "active" && days !== null && days <= 7 && days >= 0;
                    const alreadyExpired = days !== null && days < 0;

                    return (
                      <tr
                        key={b.id}
                        className={`hover:bg-gray-50 transition ${b.status?.toLowerCase() === "depleted" ? "opacity-60" : ""}`}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{b.batchCode}</td>
                        <td className="px-4 py-3 text-gray-800 font-medium">{b.variantName || "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{b.supplierName || "—"}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{fmt(b.quantityReceived)}</td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={
                              b.status?.toLowerCase() === "depleted"
                                ? "text-red-500 font-bold"
                                : Number(b.quantityAvailable) <= 5
                                  ? "text-orange-500 font-semibold"
                                  : "text-gray-700"
                            }
                          >
                            {fmt(b.quantityAvailable)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500">{fmtMoney(b.costPrice)}</td>
                        <td className="px-4 py-3 text-gray-500">{fmtDate(b.receivedAt)}</td>
                        <td className="px-4 py-3">
                          {b.expiredAt ? (
                            <span
                              className={`font-medium ${alreadyExpired ? "text-red-500" : expiringSoon ? "text-orange-500" : "text-gray-600"}`}
                            >
                              {fmtDate(b.expiredAt)}
                              {expiringSoon && !alreadyExpired && (
                                <span className="ml-1 text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
                                  còn {days} ngày
                                </span>
                              )}
                              {alreadyExpired && (
                                <span className="ml-1 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                                  hết hạn
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${st.bg} ${st.text}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Batch Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 text-base">📦 Nhập lô hàng mới</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Variant */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Biến thể sản phẩm *</label>
                {variantsLoading ? (
                  <p className="text-xs text-gray-400">Đang tải danh sách biến thể...</p>
                ) : (
                  <select
                    value={batchForm.variantId}
                    onChange={(e) => setBatchForm((p) => ({ ...p, variantId: e.target.value }))}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-white"
                  >
                    <option value="">-- Chọn biến thể --</option>
                    {variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Batch Code */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Mã lô hàng *</label>
                <input
                  type="text"
                  value={batchForm.batchCode}
                  onChange={(e) => setBatchForm((p) => ({ ...p, batchCode: e.target.value }))}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Cost Price */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Giá vốn (đ) *</label>
                  <input
                    type="number"
                    min={0}
                    value={batchForm.costPrice}
                    onChange={(e) => setBatchForm((p) => ({ ...p, costPrice: e.target.value }))}
                    required
                    placeholder="VD: 25000"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                  />
                </div>
                {/* Quantity */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Số lượng nhập *</label>
                  <input
                    type="number"
                    min={1}
                    value={batchForm.quantityReceived}
                    onChange={(e) => setBatchForm((p) => ({ ...p, quantityReceived: e.target.value }))}
                    required
                    placeholder="VD: 100"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                  />
                </div>
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nhà cung cấp</label>
                <input
                  type="text"
                  value={batchForm.supplierName}
                  onChange={(e) => setBatchForm((p) => ({ ...p, supplierName: e.target.value }))}
                  placeholder="Tên nhà cung cấp..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Received At */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ngày nhập kho *</label>
                  <input
                    type="datetime-local"
                    value={batchForm.receivedAt}
                    onChange={(e) => setBatchForm((p) => ({ ...p, receivedAt: e.target.value }))}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                  />
                </div>
                {/* Manufactured At */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ngày sản xuất</label>
                  <input
                    type="datetime-local"
                    value={batchForm.manufacturedAt}
                    onChange={(e) => setBatchForm((p) => ({ ...p, manufacturedAt: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                  />
                </div>
              </div>

              {/* Expired At */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Hạn sử dụng</label>
                <input
                  type="datetime-local"
                  value={batchForm.expiredAt}
                  onChange={(e) => setBatchForm((p) => ({ ...p, expiredAt: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Ghi chú</label>
                <textarea
                  rows={2}
                  value={batchForm.note}
                  onChange={(e) => setBatchForm((p) => ({ ...p, note: e.target.value }))}
                  placeholder="Ghi chú thêm về lô hàng..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
                />
              </div>

              {formError && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-60"
                >
                  {submitting ? "Đang lưu..." : "Nhập kho"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
