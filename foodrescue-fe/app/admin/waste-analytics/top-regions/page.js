"use client";

import { normalizeList, fmtQty, fmtPercent, useWasteAnalyticsData, WastePageHero, HorizontalBars } from "../_shared";

export default function WasteTopRegionsPage() {
  const { loading, error, analytics } = useWasteAnalyticsData({ full: true });

  if (loading) return <div className="text-gray-500">Đang tải dữ liệu khu vực...</div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>;

  const items = normalizeList(analytics?.topWasteRegions);
  const rows = items.map((item) => ({ label: item.region || "Chua ro", value: Number(item.wasteQty) || 0 }));

  return (
    <div className="space-y-5">
      <WastePageHero
        title="Khu vuc lang phi nhieu"
        subtitle="Tong hop theo tinh thanh xuat xu san pham de uu tien chuong trinh cuu tro dung diem."
        imageSrc="/images/landingpage/veggies.jpg"
        imageAlt="Top waste regions"
      />

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="text-base font-bold text-gray-900">Bieu do lang phi theo khu vuc</h2>
        <p className="mt-1 text-xs text-gray-500">So sanh khoi luong ton that giua cac khu vuc.</p>
        <div className="mt-4">
          <HorizontalBars rows={rows} colorClass="bg-emerald-500" unit="dv" emptyText="Chua co du lieu" />
        </div>
      </section>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400">Chưa có dữ liệu.</p>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.region} className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{item.region || "Chưa rõ"}</span>
                <span className="text-gray-500">{fmtQty(item.wasteQty)} • {fmtPercent(item.sharePct)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
