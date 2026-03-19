"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { apiSellerCreateBannerAd, apiSellerGetMyBannerAds, apiSellerUploadImage } from "@/lib/api";

const STATUS_LABEL = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Đã từ chối",
};
const STATUS_CLASS = {
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
  APPROVED: "bg-green-50 text-green-700 border border-green-200",
  REJECTED: "bg-red-50 text-red-700 border border-red-200",
};

function normalizeLocalDateTime(value) {
  const raw = (value || "").trim();
  if (!raw) return "";
  // `datetime-local` often returns `YYYY-MM-DDTHH:mm` (no seconds).
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) return `${raw}:00`;
  return raw;
}

/** Trả về chuỗi min cho datetime-local (không cho chọn ngày/giờ trong quá khứ). */
function getMinDatetimeLocal() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StoreAdsPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showList, setShowList] = useState(false);
  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    linkUrl: "",
    startDate: "",
    endDate: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState("");
  const [minDatetime, setMinDatetime] = useState(() => getMinDatetimeLocal());

  useEffect(() => {
    const t = setInterval(() => setMinDatetime(getMinDatetimeLocal()), 60_000);
    return () => clearInterval(t);
  }, []);

  const loadAds = useCallback(() => {
    setLoading(true);
    apiSellerGetMyBannerAds()
      .then((res) => {
        if (res.ok && res.data?.data) setAds(Array.isArray(res.data.data) ? res.data.data : []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (showList) {
      loadAds();
    }
  }, [showList, loadAds]);

  useEffect(() => {
    if (!imageFile) return;

    const preview = URL.createObjectURL(imageFile);
    setLocalPreviewUrl(preview);
    setForm((f) => ({ ...f, imageUrl: "" }));

    let cancelled = false;
    (async () => {
      setUploading(true);
      try {
        const res = await apiSellerUploadImage(imageFile);
        if (cancelled) return;
        if (res.ok && res.data?.data) {
          setForm((f) => ({ ...f, imageUrl: res.data.data }));
          toast.success("Tải ảnh thành công");
        } else {
          toast.error(res.data?.message || "Tải ảnh thất bại.");
        }
      } catch (_) {
        if (!cancelled) toast.error("Tải ảnh thất bại.");
      } finally {
        if (!cancelled) setUploading(false);
      }
    })();

    return () => {
      cancelled = true;
      URL.revokeObjectURL(preview);
    };
  }, [imageFile]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      toast.error("Vui lòng nhập tiêu đề.");
      return;
    }
    if (!form.imageUrl?.trim()) {
      toast.error("Vui lòng tải ảnh hoặc nhập URL ảnh.");
      return;
    }
    const start = form.startDate ? new Date(form.startDate) : null;
    const end = form.endDate ? new Date(form.endDate) : null;
    if (!start || !end) {
      toast.error("Vui lòng chọn ngày bắt đầu và kết thúc.");
      return;
    }
    if (end <= start) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu.");
      return;
    }
    setSubmitting(true);
    apiSellerCreateBannerAd({
      title: form.title.trim(),
      imageUrl: form.imageUrl.trim(),
      linkUrl: form.linkUrl?.trim() || null,
      // Backend expects LocalDateTime, so send local ISO without timezone (`Z`).
      startDate: normalizeLocalDateTime(form.startDate),
      endDate: normalizeLocalDateTime(form.endDate),
    })
      .then((res) => {
        if (res.ok) {
          setForm({ title: "", imageUrl: "", linkUrl: "", startDate: "", endDate: "" });
          setImageFile(null);
          setLocalPreviewUrl("");
          toast.success("Tạo quảng cáo thành công. Quảng cáo đang chờ Admin duyệt.");
          loadAds();
        } else {
          toast.error(res.data?.message || "Tạo banner thất bại.");
        }
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Quảng cáo Banner</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-bold text-gray-700">Tạo banner mới</h2>
          <p className="text-xs text-gray-500 mt-0.5">Sau khi tạo, banner sẽ chờ Admin duyệt.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="VD: Giảm 50% sản phẩm A"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh banner *</label>
            <div className="flex flex-wrap gap-2 items-start">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm text-gray-600"
              />
              {uploading && <span className="text-xs text-gray-500 mt-1.5">Đang tải ảnh...</span>}
            </div>
            <p className="text-xs text-gray-500 mt-1">Hoặc nhập URL ảnh:</p>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              placeholder="https://..."
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
            />
            {(localPreviewUrl || form.imageUrl) && (
              <div className="mt-2 w-full max-w-xs aspect-[3/1] rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={form.imageUrl || localPreviewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link khi click (tùy chọn)</label>
            <input
              type="url"
              value={form.linkUrl}
              onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
              placeholder="https://... hoặc /products/123"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu *</label>
              <input
                type="datetime-local"
                value={form.startDate}
                min={minDatetime}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc *</label>
              <input
                type="datetime-local"
                value={form.endDate}
                min={form.startDate || minDatetime}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-secondary text-gray-900 font-medium text-sm transition disabled:opacity-50"
          >
            {submitting ? "Đang tạo..." : "Tạo banner"}
          </button>
        </form>
      </div>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-gray-700">Danh sách quảng cáo của tôi</h2>
        <button
          type="button"
          onClick={() => setShowList((v) => !v)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          {showList ? "Ẩn danh sách" : "Xem danh sách"}
        </button>
      </div>

      {showList && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60">
            <p className="text-xs text-gray-500">Các banner đã tạo gần đây.</p>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <p className="p-8 text-center text-gray-400">Đang tải...</p>
            ) : ads.length === 0 ? (
              <p className="p-8 text-center text-gray-400">Chưa có banner nào.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="text-left px-4 py-3">Ảnh</th>
                    <th className="text-left px-4 py-3">Tiêu đề</th>
                    <th className="text-left px-4 py-3">Trạng thái</th>
                    <th className="text-left px-4 py-3">Bắt đầu – Kết thúc</th>
                    <th className="text-left px-4 py-3">Lý do từ chối</th>
                  </tr>
                </thead>
                <tbody>
                  {ads.map((ad) => (
                    <tr key={ad.id} className="border-t border-gray-50">
                      <td className="px-4 py-3">
                        <div className="w-20 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <img src={ad.imageUrl} alt="" className="w-full h-full object-cover" onError={(e) => (e.target.src = "https://placehold.co/80x48?text=Banner")} />
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{ad.title}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${STATUS_CLASS[ad.status] || "bg-gray-100 text-gray-600"}`}>
                          {STATUS_LABEL[ad.status] || ad.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {formatDate(ad.startDate)} → {formatDate(ad.endDate)}
                      </td>
                      <td className="px-4 py-3 text-xs text-red-600 max-w-[200px]">{ad.rejectReason || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
