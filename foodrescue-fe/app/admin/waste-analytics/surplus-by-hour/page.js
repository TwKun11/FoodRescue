"use client";

import { normalizeList, fmtQty, useWasteAnalyticsData, WastePageHero, HorizontalBars } from "../_shared";

export default function WasteSurplusByHourPage() {
  const { loading, error, analytics } = useWasteAnalyticsData({ full: true });

  if (loading) return <div className="text-gray-500">Đang tải dữ liệu theo giờ...</div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>;

  const items = normalizeList(analytics?.surplusByHour);
  const rows = items.map((slot) => ({ label: slot.label || `${slot.hour}:00`, value: Number(slot.wasteQty) || 0 }));

  return (
    <div className="space-y-5">
      <WastePageHero
        title="Thoi diem du thua trong ngay"
        subtitle="Xac dinh khung gio phat sinh du thua de toi uu nhan su, chuong trinh flash sale va dieu phoi."
        imageSrc="/images/landingpage/landingpage.png"
        imageAlt="Surplus by hour"
      />

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="text-base font-bold text-gray-900">Bieu do du thua theo gio</h2>
        <p className="mt-1 text-xs text-gray-500">Khung gio co ton that cao nhat trong ngay.</p>
        <div className="mt-4">
          <HorizontalBars rows={rows} colorClass="bg-indigo-500" unit="dv" emptyText="Chua co du lieu" />
        </div>
      </section>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400">Chưa có dữ liệu.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8">
          {items.map((slot) => (
            <div key={slot.hour} className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
              <p className="text-xs font-semibold text-gray-700">{slot.label}</p>
              <p className="text-xs text-gray-500 mt-1">{fmtQty(slot.wasteQty)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
