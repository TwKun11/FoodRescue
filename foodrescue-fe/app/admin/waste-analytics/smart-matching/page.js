"use client";

import { useMemo, useState } from "react";
import { normalizeList, useWasteAnalyticsData, WastePageHero, HorizontalBars, paginateList } from "../_shared";

export default function WasteSmartMatchingPage() {
  const { loading, error, analytics } = useWasteAnalyticsData({ full: true });
  const [sortBy, setSortBy] = useState("confidence");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const items = normalizeList(analytics?.smartMatchingSuggestions);
  const sortedItems = useMemo(() => {
    const cloned = [...items];
    if (sortBy === "time") {
      cloned.sort((a, b) => String(a.suggestedTimeSlot || "").localeCompare(String(b.suggestedTimeSlot || "")));
    } else if (sortBy === "province") {
      cloned.sort((a, b) => String(a.targetProvince || "").localeCompare(String(b.targetProvince || "")));
    } else {
      cloned.sort((a, b) => (Number(b.confidenceScore) || 0) - (Number(a.confidenceScore) || 0));
    }
    return cloned;
  }, [items, sortBy]);

  const { pageItems, total, totalPages, currentPage } = paginateList(sortedItems, page, pageSize);

  if (loading) return <div className="text-gray-500">Đang tải Smart Matching...</div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>;

  const confidenceRows = items.map((item, idx) => ({
    label: item.targetProvince || item.suggestedTimeSlot || `Gợi ý ${idx + 1}`,
    value: Number(item.confidenceScore) || 0,
  }));

  return (
    <div className="space-y-5">
      <WastePageHero
        title="Gợi ý khu vực và khung giờ đẩy hàng thông minh"
        subtitle="Gợi ý khu vực và khung giờ đẩy hàng dựa trên nhu cầu lịch sử và khả năng tiêu thụ."
        imageSrc="/images/landingpage/anhtraicay.jpg"
        imageAlt="Smart matching"
      />

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="text-base font-bold text-gray-900">Biểu đồ độ tin cậy gợi ý</h2>
        <p className="mt-1 text-xs text-gray-500">Tỷ lệ độ tin cậy cho từng điểm phân phối đề xuất.</p>
        <div className="mt-4">
          <HorizontalBars rows={confidenceRows} colorClass="bg-sky-500" unit="%" emptyText="Chưa có dữ liệu gợi ý thông minh" />
        </div>
      </section>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400">Chưa có dữ liệu smart matching.</p>
      ) : (
        <>
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-gray-500">Tổng {total} gợi ý</div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
                >
                  <option value="confidence">Tin cậy giảm dần</option>
                  <option value="province">Theo khu vực A-Z</option>
                  <option value="time">Theo khung giờ</option>
                </select>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
                >
                  <option value={4}>4 / trang</option>
                  <option value={6}>6 / trang</option>
                  <option value={10}>10 / trang</option>
                </select>
              </div>
            </div>
          </section>

          <div className="space-y-3">
          {pageItems.map((item) => (
            <div key={item.batchId || item.batchCode} className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
              <p className="font-semibold text-gray-900">{item.suggestionText || "Gợi ý phân phối"}</p>
              <p className="text-xs text-gray-600 mt-1">{item.basis || "-"}</p>
              <p className="text-xs text-gray-500 mt-2">Khu vực: {item.targetProvince || "-"} • Giờ: {item.suggestedTimeSlot || "-"}</p>
              <p className="text-xs text-blue-700 mt-1 font-medium">Tin cậy {Number(item.confidenceScore || 0)}%</p>
            </div>
          ))}
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
            >
              Trước
            </button>
            <span className="text-xs text-gray-600">Trang {currentPage}/{totalPages}</span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sau
            </button>
            {currentPage < totalPages && (
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-700"
              >
                Xem thêm
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
