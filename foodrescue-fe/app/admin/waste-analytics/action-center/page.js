"use client";

import { useMemo, useState } from "react";
import { normalizeList, fmtQty, fmtMoney, useWasteAnalyticsData, WastePageHero, HorizontalBars } from "../_shared";
import { paginateList } from "../_shared";

export default function WasteActionCenterPage() {
  const { loading, error, analytics } = useWasteAnalyticsData({ full: true });
  const [sortBy, setSortBy] = useState("urgency");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const items = normalizeList(analytics?.wasteActionItems);

  const sortedItems = useMemo(() => {
    const cloned = [...items];
    if (sortBy === "qty") {
      cloned.sort((a, b) => (Number(b.quantityAvailable) || 0) - (Number(a.quantityAvailable) || 0));
    } else if (sortBy === "value") {
      cloned.sort((a, b) => (Number(b.estimatedValue) || 0) - (Number(a.estimatedValue) || 0));
    } else {
      cloned.sort((a, b) => (Number(a.hoursToExpire) || 0) - (Number(b.hoursToExpire) || 0));
    }
    return cloned;
  }, [items, sortBy]);

  const { pageItems, total, totalPages, currentPage } = paginateList(sortedItems, page, pageSize);

  if (loading) return <div className="text-gray-500">Đang tải Trung tâm hành động...</div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>;

  const chartRows = items.map((item) => ({
    label: item.productName || item.batchCode || "Không rõ",
    value: Number(item.quantityAvailable) || 0,
  }));

  return (
    <div className="space-y-5">
      <WastePageHero
        title="Trung tâm hành động thực phẩm thừa"
        subtitle="Danh sách lô hàng cần xử lý ngay để giảm tổn thất và tối ưu luồng điều phối."
        imageSrc="/images/landingpage/anhhoaqua.jpg"
        imageAlt="Food action center"
      />

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="text-base font-bold text-gray-900">Biểu đồ khối lượng cần xử lý</h2>
        <p className="mt-1 text-xs text-gray-500">Top lô hàng theo số lượng tồn kho quá hạn.</p>
        <div className="mt-4">
          <HorizontalBars rows={chartRows} colorClass="bg-rose-500" unit="đv" emptyText="Chưa có lô hàng cần xử lý" />
        </div>
      </section>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400">Chưa có lô hàng cần hành động.</p>
      ) : (
        <>
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-gray-500">Tổng {total} lô hàng</div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
                >
                  <option value="urgency">Ưu tiên sắp hết hạn</option>
                  <option value="qty">Số lượng tồn giảm dần</option>
                  <option value="value">Giá trị giảm dần</option>
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

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {pageItems.map((item) => (
            <div key={item.batchId || item.batchCode} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="font-semibold text-gray-900">{item.productName || "Không rõ"}</p>
              <p className="text-xs text-gray-500 mt-1">Lô: {item.batchCode || "-"} • Cửa hàng: {item.sellerName || "-"}</p>
              <p className="text-xs text-gray-600 mt-1">Tồn: {fmtQty(item.quantityAvailable)} • Giá trị: {fmtMoney(item.estimatedValue)}</p>
              <p className="text-sm text-brand-dark font-medium mt-2">Gợi ý: {item.recommendedAction || "Theo dõi"}</p>
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
