"use client";

import { normalizeList, fmtQty, fmtMoney, useWasteAnalyticsData, WastePageHero, HorizontalBars } from "../_shared";

export default function WasteActionCenterPage() {
  const { loading, error, analytics } = useWasteAnalyticsData({ full: true });

  if (loading) return <div className="text-gray-500">Đang tải Trung tâm hành động...</div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>;

  const items = normalizeList(analytics?.wasteActionItems);
  const chartRows = items.map((item) => ({
    label: item.productName || item.batchCode || "Khong ro",
    value: Number(item.quantityAvailable) || 0,
  }));

  return (
    <div className="space-y-5">
      <WastePageHero
        title="Trung tam hanh dong thuc pham thua"
        subtitle="Danh sach lo hang can xu ly ngay de giam ton that va toi uu luong dieu phoi."
        imageSrc="/images/landingpage/anhhoaqua.jpg"
        imageAlt="Food action center"
      />

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="text-base font-bold text-gray-900">Bieu do khoi luong can xu ly</h2>
        <p className="mt-1 text-xs text-gray-500">Top lo hang theo so luong ton kho qua han.</p>
        <div className="mt-4">
          <HorizontalBars rows={chartRows} colorClass="bg-rose-500" unit="dv" emptyText="Chua co lo hang can xu ly" />
        </div>
      </section>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400">Chưa có lô hàng cần hành động.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {items.map((item) => (
            <div key={item.batchId || item.batchCode} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="font-semibold text-gray-900">{item.productName || "Không rõ"}</p>
              <p className="text-xs text-gray-500 mt-1">Lô: {item.batchCode || "-"} • Cửa hàng: {item.sellerName || "-"}</p>
              <p className="text-xs text-gray-600 mt-1">Tồn: {fmtQty(item.quantityAvailable)} • Giá trị: {fmtMoney(item.estimatedValue)}</p>
              <p className="text-sm text-brand-dark font-medium mt-2">Gợi ý: {item.recommendedAction || "Theo dõi"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
