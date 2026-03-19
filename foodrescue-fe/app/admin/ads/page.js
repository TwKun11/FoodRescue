"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  apiAdminGetBannerAdsByStatus,
  apiAdminApproveBannerAd,
  apiAdminRejectBannerAd,
} from "@/lib/api";

const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ duyệt" },
  { id: "approved", label: "Đã duyệt" },
  { id: "rejected", label: "Đã từ chối" },
];

const STATUS_LABEL = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
};

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

function AdCard({ ad, onApprove, onReject, acting }) {
  const canAct = ad.status === "PENDING";

  return (
    <div className="p-5 flex flex-wrap gap-4 items-start border-b border-gray-100 last:border-b-0">
      <div className="w-48 aspect-[3/1] rounded-xl overflow-hidden bg-gray-100 shrink-0">
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full h-full object-cover"
          onError={(e) => (e.target.src = "https://placehold.co/192x64?text=Banner")}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-gray-800">{ad.title}</h3>
          <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
            {STATUS_LABEL[ad.status] || ad.status}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">Seller ID: {ad.sellerId}</p>
        {ad.linkUrl && (
          <p className="text-xs text-gray-600 mt-1 truncate">Link: {ad.linkUrl}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {formatDate(ad.startDate)} → {formatDate(ad.endDate)}
        </p>
        {ad.rejectReason && (
          <p className="text-xs text-red-600 mt-1">Lý do từ chối: {ad.rejectReason}</p>
        )}
        {canAct && (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onApprove(ad.id)}
              disabled={acting === ad.id}
              className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {acting === ad.id ? "..." : "Duyệt"}
            </button>
            <button
              type="button"
              onClick={() => onReject(ad)}
              disabled={acting === ad.id}
              className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 border border-red-200 disabled:opacity-50"
            >
              Từ chối
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminAdsPage() {
  const [statusTab, setStatusTab] = useState("all");
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectAd, setRejectAd] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const loadByStatus = useCallback((status) => {
    setLoading(true);
    const fetchOne = (s) =>
      apiAdminGetBannerAdsByStatus(s).then((res) => (res.ok && Array.isArray(res.data?.data) ? res.data.data : []));

    if (status === "all") {
      Promise.all([fetchOne("pending"), fetchOne("approved"), fetchOne("rejected")])
        .then(([p, a, r]) => {
          const merged = [...p, ...a, ...r];
          merged.sort((x, y) => {
            const tx = new Date(x.createdAt || x.startDate || 0).getTime();
            const ty = new Date(y.createdAt || y.startDate || 0).getTime();
            return ty - tx;
          });
          setAds(merged);
        })
        .finally(() => setLoading(false));
      return;
    }

    apiAdminGetBannerAdsByStatus(status)
      .then((res) => {
        if (res.ok && res.data?.data) setAds(Array.isArray(res.data.data) ? res.data.data : []);
        else setAds([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadByStatus(statusTab);
  }, [statusTab, loadByStatus]);

  const handleApprove = (id) => {
    setActing(id);
    apiAdminApproveBannerAd(id)
      .then((res) => {
        if (res.ok) {
          toast.success("Đã duyệt quảng cáo");
          loadByStatus(statusTab);
        } else toast.error(res.data?.message || "Duyệt thất bại.");
      })
      .finally(() => setActing(null));
  };

  const handleRejectClick = (ad) => {
    setRejectAd(ad);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectAd?.id) return;
    const reason = rejectReason.trim();
    if (!reason) {
      toast.error("Vui lòng nhập lý do từ chối.");
      return;
    }
    setActing(rejectAd.id);
    apiAdminRejectBannerAd(rejectAd.id, reason)
      .then((res) => {
        if (res.ok) {
          toast.success("Đã từ chối quảng cáo");
          setRejectModalOpen(false);
          setRejectAd(null);
          setRejectReason("");
          loadByStatus(statusTab);
        } else {
          toast.error(res.data?.message || "Từ chối thất bại.");
        }
      })
      .finally(() => setActing(null));
  };

  const handleRejectCancel = () => {
    setRejectModalOpen(false);
    setRejectAd(null);
    setRejectReason("");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý quảng cáo</h1>
      <p className="text-sm text-gray-500">
        Xem banner theo trạng thái. Duyệt hoặc từ chối banner chờ duyệt. Chỉ banner đã duyệt và trong thời gian chạy mới hiển thị tại trang Sản phẩm.
      </p>

      <div className="flex gap-2 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
              statusTab === tab.id
                ? "border-brand text-brand-dark"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-bold text-gray-700">
            {TABS.find((t) => t.id === statusTab)?.label || "Banner"}
          </h2>
        </div>
        {loading ? (
          <p className="p-8 text-center text-gray-400">Đang tải...</p>
        ) : ads.length === 0 ? (
          <p className="p-8 text-center text-gray-400">
            Không có banner nào ở trạng thái này.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {ads.map((ad) => (
              <AdCard
                key={ad.id}
                ad={ad}
                onApprove={handleApprove}
                onReject={handleRejectClick}
                acting={acting}
              />
            ))}
          </div>
        )}
      </div>

      {rejectModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Nhập lý do từ chối"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) handleRejectCancel();
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-800">Từ chối quảng cáo</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Nhập lý do để Seller biết và chỉnh sửa lại.
              </p>
            </div>
            <div className="p-5 space-y-3">
              <div className="text-sm text-gray-700">
                <span className="font-semibold">Tiêu đề:</span> {rejectAd?.title || "—"}
              </div>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ví dụ: Ảnh bị mờ / nội dung không phù hợp / thiếu thông tin..."
                className="w-full min-h-[110px] border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleRejectCancel}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleRejectSubmit}
                  disabled={acting === rejectAd?.id}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  {acting === rejectAd?.id ? "Đang gửi..." : "Gửi lý do từ chối"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
