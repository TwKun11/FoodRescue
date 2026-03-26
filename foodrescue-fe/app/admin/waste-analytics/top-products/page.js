"use client";

import { useMemo, useState } from "react";
import { normalizeList, fmtQty, fmtMoney, useWasteAnalyticsData, WastePageHero, HorizontalBars, paginateList } from "../_shared";

export default function WasteTopProductsPage() {
  const { loading, error, analytics } = useWasteAnalyticsData({ full: true });
  const [sortBy, setSortBy] = useState("wasteQty");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const items = normalizeList(analytics?.topWasteProducts);
  const sortedItems = useMemo(() => {
    const cloned = [...items];
    if (sortBy === "value") {
      cloned.sort((a, b) => (Number(b.estimatedWasteValue) || 0) - (Number(a.estimatedWasteValue) || 0));
    } else if (sortBy === "name") {
      cloned.sort((a, b) => String(a.productName || "").localeCompare(String(b.productName || "")));
    } else {
      cloned.sort((a, b) => (Number(b.wasteQty) || 0) - (Number(a.wasteQty) || 0));
    }
    return cloned;
  }, [items, sortBy]);

  const { pageItems, total, totalPages, currentPage } = paginateList(sortedItems, page, pageSize);

  if (loading) return <div className="text-gray-500">Đang tải dữ liệu sản phẩm...</div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>;

  const rows = items.map((item) => ({
    label: item.productName || item.productCode || "Không rõ",
    value: Number(item.wasteQty) || 0,
  }));

  return (
    <div className="space-y-5">
      <WastePageHero
        title="Sản phẩm lãng phí nổi bật"
        subtitle="Nhóm sản phẩm có tồn kho quá hạn cao, cần ưu tiên giảm giá và điều phối nhanh."
        imageSrc="/images/products/raucai.jpg"
        imageAlt="Top waste products"
      />

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="text-base font-bold text-gray-900">Biểu đồ tổn thất theo sản phẩm</h2>
        <p className="mt-1 text-xs text-gray-500">Khối lượng lãng phí của từng sản phẩm.</p>
        <div className="mt-4">
          <HorizontalBars rows={rows} colorClass="bg-fuchsia-500" unit="đv" emptyText="Chưa có dữ liệu" />
        </div>
      </section>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400">Chưa có dữ liệu.</p>
      ) : (
        <>
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-gray-500">Tổng {total} mặt hàng</div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
                >
                  <option value="wasteQty">Lãng phí giảm dần</option>
                  <option value="value">Giá trị giảm dần</option>
                  <option value="name">Tên A-Z</option>
                </select>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
                >
                  <option value={6}>6 / trang</option>
                  <option value={9}>9 / trang</option>
                  <option value={12}>12 / trang</option>
                </select>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {pageItems.map((item) => (
            <div key={item.productId || item.productCode} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="font-semibold text-gray-900">{item.productName || "Không rõ"}</p>
              <p className="text-xs text-gray-500 mt-1">Mã: {item.productCode || "-"}</p>
              <p className="text-xs text-gray-500">Danh mục: {item.category || "Khác"}</p>
              <p className="text-xs text-gray-500">Xuất xứ: {item.originProvince || "Chưa rõ"}</p>
              <p className="text-xs text-gray-700 mt-2">{fmtQty(item.wasteQty)} • {fmtMoney(item.estimatedWasteValue)}</p>
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
