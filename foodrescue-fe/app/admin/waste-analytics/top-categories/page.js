"use client";

import { normalizeList, fmtQty, fmtPercent, useWasteAnalyticsData, WastePageHero, HorizontalBars } from "../_shared";

export default function WasteTopCategoriesPage() {
  const { loading, error, analytics } = useWasteAnalyticsData({ full: true });

  if (loading) return <div className="text-gray-500">Đang tải dữ liệu loại thực phẩm...</div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>;

  const items = normalizeList(analytics?.topWasteCategories);
  const rows = items.map((item) => ({ label: item.category || "Khác", value: Number(item.wasteQty) || 0 }));

  return (
    <div className="space-y-5">
      <WastePageHero
        title="Loại thực phẩm bị bỏ nhiều nhất"
        subtitle="Theo dõi các danh mục có lượng lãng phí cao để ưu tiên chương trình giảm tổn thất."
        imageSrc="/images/landingpage/anhhoaquatrengia.jpg"
        imageAlt="Top waste categories"
      />

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="text-base font-bold text-gray-900">Biểu đồ danh mục lãng phí</h2>
        <p className="mt-1 text-xs text-gray-500">Khối lượng tổn thất theo từng danh mục.</p>
        <div className="mt-4">
          <HorizontalBars rows={rows} colorClass="bg-amber-500" unit="đv" emptyText="Chưa có dữ liệu" />
        </div>
      </section>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400">Chưa có dữ liệu.</p>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.category} className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{item.category || "Khác"}</span>
                <span className="text-gray-500">{fmtQty(item.wasteQty)} • {fmtPercent(item.sharePct)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
