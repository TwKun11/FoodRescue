"use client";

import { normalizeList, fmtQty, fmtMoney, useWasteAnalyticsData, WastePageHero, HorizontalBars } from "../_shared";

export default function WasteTopProductsPage() {
  const { loading, error, analytics } = useWasteAnalyticsData({ full: true });

  if (loading) return <div className="text-gray-500">Đang tải dữ liệu sản phẩm...</div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>;

  const items = normalizeList(analytics?.topWasteProducts);
  const rows = items.map((item) => ({
    label: item.productName || item.productCode || "Khong ro",
    value: Number(item.wasteQty) || 0,
  }));

  return (
    <div className="space-y-5">
      <WastePageHero
        title="San pham lang phi noi bat"
        subtitle="Nhom san pham co ton kho qua han cao, can uu tien giam gia va dieu phoi nhanh."
        imageSrc="/images/products/raucai.jpg"
        imageAlt="Top waste products"
      />

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="text-base font-bold text-gray-900">Bieu do ton that theo san pham</h2>
        <p className="mt-1 text-xs text-gray-500">Khoi luong lang phi cua tung san pham.</p>
        <div className="mt-4">
          <HorizontalBars rows={rows} colorClass="bg-fuchsia-500" unit="dv" emptyText="Chua co du lieu" />
        </div>
      </section>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400">Chưa có dữ liệu.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div key={item.productId || item.productCode} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="font-semibold text-gray-900">{item.productName || "Không rõ"}</p>
              <p className="text-xs text-gray-500 mt-1">Mã: {item.productCode || "-"}</p>
              <p className="text-xs text-gray-500">Danh mục: {item.category || "Khác"}</p>
              <p className="text-xs text-gray-500">Xuất xứ: {item.originProvince || "Chưa rõ"}</p>
              <p className="text-xs text-gray-700 mt-2">{fmtQty(item.wasteQty)} • {fmtMoney(item.estimatedWasteValue)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
