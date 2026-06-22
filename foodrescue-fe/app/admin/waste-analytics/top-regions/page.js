"use client";

import { normalizeList, fmtQty, fmtPercent, useWasteAnalyticsData, WastePageHero, HorizontalBars } from "../_shared";

export default function WasteTopRegionsPage() {
  const { loading, error, analytics } = useWasteAnalyticsData({ full: true });

  if (loading) return <div className="text-gray-500">Đang tải dữ liệu khu vực...</div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>;

  const items = normalizeList(analytics?.topWasteRegions);
  const rows = items.map((item) => ({ label: item.region || "Chưa rõ", value: Number(item.wasteQty) || 0 }));

  return (
    <div className="space-y-5">
      <WastePageHero
        title="Khu vực lãng phí nhiều"
        subtitle="Tổng hợp theo tỉnh thành xuất xứ sản phẩm để ưu tiên chương trình cứu trợ đúng điểm."
        imageSrc="/images/landingpage/veggies.jpg"
        imageAlt="Top waste regions"
      />

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="text-base font-bold text-gray-900">Biểu đồ lãng phí theo khu vực</h2>
        <p className="mt-1 text-xs text-gray-500">So sánh khối lượng tổn thất giữa các khu vực.</p>
        <div className="mt-4">
          <HorizontalBars rows={rows} colorClass="bg-emerald-500" unit="đv" emptyText="Chưa có dữ liệu" />
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
