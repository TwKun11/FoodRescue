"use client";

import { normalizeList, useWasteAnalyticsData, WastePageHero, HorizontalBars } from "../_shared";

export default function WasteSmartMatchingPage() {
  const { loading, error, analytics } = useWasteAnalyticsData({ full: true });

  if (loading) return <div className="text-gray-500">Đang tải Smart Matching...</div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>;

  const items = normalizeList(analytics?.smartMatchingSuggestions);
  const confidenceRows = items.map((item, idx) => ({
    label: item.targetProvince || item.suggestedTimeSlot || `Goi y ${idx + 1}`,
    value: Number(item.confidenceScore) || 0,
  }));

  return (
    <div className="space-y-5">
      <WastePageHero
        title="Smart Matching Suggestion"
        subtitle="Goi y khu vuc va khung gio day hang dua tren nhu cau lich su va kha nang tieu thu."
        imageSrc="/images/landingpage/anhtraicay.jpg"
        imageAlt="Smart matching"
      />

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="text-base font-bold text-gray-900">Bieu do do tin cay goi y</h2>
        <p className="mt-1 text-xs text-gray-500">Ty le confidence score cho tung diem phan phoi de xuat.</p>
        <div className="mt-4">
          <HorizontalBars rows={confidenceRows} colorClass="bg-sky-500" unit="%" emptyText="Chua co du lieu smart matching" />
        </div>
      </section>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400">Chưa có dữ liệu smart matching.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.batchId || item.batchCode} className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
              <p className="font-semibold text-gray-900">{item.suggestionText || "Gợi ý phân phối"}</p>
              <p className="text-xs text-gray-600 mt-1">{item.basis || "-"}</p>
              <p className="text-xs text-gray-500 mt-2">Khu vực: {item.targetProvince || "-"} • Giờ: {item.suggestedTimeSlot || "-"}</p>
              <p className="text-xs text-blue-700 mt-1 font-medium">Tin cậy {Number(item.confidenceScore || 0)}%</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
