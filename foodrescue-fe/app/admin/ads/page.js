"use client";

import { useState, useEffect, useCallback } from "react";
import {
  apiAdminGetBannerAdsByStatus,
  apiAdminApproveBannerAd,
  apiAdminRejectBannerAd,
} from "@/lib/api";

const TABS = [
  { id: "pending", label: "Chờ duyệt" },
  { id: "approved", label: "Đã duyệt" },
  { id: "rejected", label: "Đã từ chối" },
];

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

function AdCard({ ad, statusTab, onApprove, onReject, acting, rejectingId, rejectReason, setRejectReason, onRejectSubmit, onRejectCancel }) {
  const isPending = statusTab === "pending";

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
        <h3 className="font-semibold text-gray-800">{ad.title}</h3>
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
        {isPending && (
          rejectingId === ad.id ? (
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Lý do từ chối (tùy chọn)"
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[200px]"
              />
              <button
                type="button"
                onClick={() => onRejectSubmit(ad.id)}
                disabled={acting === ad.id}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {acting === ad.id ? "..." : "Từ chối"}
              </button>
              <button
                type="button"
                onClick={onRejectCancel}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50"
              >
                Hủy
              </button>
            </div>
          ) : (
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
                onClick={() => onReject(ad.id)}
                disabled={acting === ad.id}
                className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 border border-red-200 disabled:opacity-50"
              >
                Từ chối
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function AdminAdsPage() {
  const [statusTab, setStatusTab] = useState("pending");
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState(null);

  const loadByStatus = useCallback((status) => {
    setLoading(true);
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
        if (res.ok) loadByStatus(statusTab);
        else alert(res.data?.message || "Duyệt thất bại.");
      })
      .finally(() => setActing(null));
  };

  const handleRejectClick = (id) => {
    setRejectingId(id);
    setRejectReason("");
  };

  const handleRejectSubmit = (id) => {
    setActing(id);
    apiAdminRejectBannerAd(id, rejectReason)
      .then((res) => {
        if (res.ok) {
          setRejectingId(null);
          setRejectReason("");
          loadByStatus(statusTab);
        } else {
          alert(res.data?.message || "Từ chối thất bại.");
        }
      })
      .finally(() => setActing(null));
  };

  const handleRejectCancel = () => {
    setRejectingId(null);
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
                statusTab={statusTab}
                onApprove={handleApprove}
                onReject={handleRejectClick}
                acting={acting}
                rejectingId={rejectingId}
                rejectReason={rejectReason}
                setRejectReason={setRejectReason}
                onRejectSubmit={handleRejectSubmit}
                onRejectCancel={handleRejectCancel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
