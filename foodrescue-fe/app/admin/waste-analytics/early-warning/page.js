"use client";

import { normalizeList, fmtQty, fmtMoney, useWasteAnalyticsData, WastePageHero, HorizontalBars } from "../_shared";

const priorityConfig = {
  CRITICAL: {
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    badgeBg: "bg-red-100",
    badgeText: "text-red-700",
    badgeLabel: "NGUY CẤP",
  },
  HIGH: {
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-700",
    badgeLabel: "CAO",
  },
  MEDIUM: {
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    badgeBg: "bg-yellow-100",
    badgeText: "text-yellow-700",
    badgeLabel: "TRUNG BÌNH",
  },
  WATCH: {
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
    badgeLabel: "QUAN SÁT",
  },
};

export default function EarlyWarningPage() {
  const { loading, error, analytics } = useWasteAnalyticsData({ full: true });

  if (loading) return <div className="text-gray-500">Đang tải hệ thống cảnh báo ...</div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>;

  const items = normalizeList(analytics?.wasteActionItems);
  const earlyWarning = analytics?.earlyWarning || {};

  // Sort by expiry time (earliest first)
  const sortedItems = [...items].sort((a, b) => (a.hoursToExpire || 0) - (b.hoursToExpire || 0));

  // Group by priority
  const itemsByPriority = {
    CRITICAL: sortedItems.filter((i) => i.priority === "CRITICAL" || i.hoursToExpire <= 12),
    HIGH: sortedItems.filter((i) => i.priority === "HIGH" || (i.hoursToExpire > 12 && i.hoursToExpire <= 24)),
    MEDIUM: sortedItems.filter((i) => i.priority === "MEDIUM" || (i.hoursToExpire > 24 && i.hoursToExpire <= 48)),
    WATCH: sortedItems.filter((i) => i.priority === "WATCH" || i.hoursToExpire > 48),
  };

  // Chart data
  const chartRows = [
    { label: `Nguy cấp (${earlyWarning.expiredNowCount || 0})`, value: earlyWarning.expiredNowCount || 0 },
    { label: `Cao (${earlyWarning.expiringIn24hCount || 0})`, value: earlyWarning.expiringIn24hCount || 0 },
    { label: `Trung bình (${earlyWarning.expiringIn48hCount || 0})`, value: earlyWarning.expiringIn48hCount || 0 },
    { label: `Quan sát (${earlyWarning.expiringIn72hCount || 0})`, value: earlyWarning.expiringIn72hCount || 0 },
  ];

  return (
    <div className="space-y-5">
      <WastePageHero
        title="Hệ Thống Cảnh báo "
        subtitle="Theo dõi các lô hàng sắp hết hạn để kịp thời xử lý. Càng sớm cảnh báo, càng có nhiều cơ hội cứu vãn."
        imageSrc="/images/landingpage/anhhoaqua.jpg"
        imageAlt="Early warning system"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-3">
          <p className="text-xs text-red-600 font-medium">NGUY CẤP</p>
          <p className="text-xl font-bold text-red-700 mt-1">{earlyWarning.expiredNowCount || 0}</p>
          <p className="text-xs text-red-500 mt-1">Hết hạn ngay</p>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
          <p className="text-xs text-orange-600 font-medium">CAO</p>
          <p className="text-xl font-bold text-orange-700 mt-1">{earlyWarning.expiringIn24hCount || 0}</p>
          <p className="text-xs text-orange-500 mt-1">24 giờ tới</p>
        </div>
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3">
          <p className="text-xs text-yellow-600 font-medium">TRUNG BÌNH</p>
          <p className="text-xl font-bold text-yellow-700 mt-1">{earlyWarning.expiringIn48hCount || 0}</p>
          <p className="text-xs text-yellow-500 mt-1">48 giờ tới</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
          <p className="text-xs text-blue-600 font-medium">QUAN SÁT</p>
          <p className="text-xl font-bold text-blue-700 mt-1">{earlyWarning.expiringIn72hCount || 0}</p>
          <p className="text-xs text-blue-500 mt-1">72 giờ tới</p>
        </div>
      </div>

      {/* Chart */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="text-base font-bold text-gray-900">Biểu đồ cảnh báo theo mức độ</h2>
        <p className="mt-1 text-xs text-gray-500">Số lô hàng theo mức độ ưu tiên xử lý.</p>
        <div className="mt-4">
          <HorizontalBars rows={chartRows} colorClass="bg-brand-dark" unit="lô" emptyText="Không có lô hàng cảnh báo" />
        </div>
      </section>

      {/* Priority Sections */}
      {["CRITICAL", "HIGH", "MEDIUM", "WATCH"].map((priority) => {
        const items = itemsByPriority[priority] || [];
        if (items.length === 0) return null;

        const config = priorityConfig[priority];
        return (
          <section key={priority} className={`rounded-2xl border ${config.borderColor} ${config.bgColor} p-4`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">{config.badgeLabel}</h3>
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${config.badgeBg} ${config.badgeText}`}>
                {items.length} lô hàng
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {items.map((item) => (
                <div
                  key={item.batchId || item.batchCode}
                  className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-3 transition hover:shadow-md`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{item.productName || "Không rõ"}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Lô: <span className="font-mono">{item.batchCode || "-"}</span> • {item.sellerName || "-"}
                      </p>
                    </div>
                    <div className={`inline-block px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${config.badgeBg} ${config.badgeText}`}>
                      {item.hoursToExpire !== null && item.hoursToExpire !== undefined
                        ? item.hoursToExpire <= 0
                          ? "Đã hết hạn"
                          : item.hoursToExpire < 24
                          ? `${item.hoursToExpire}h`
                          : item.hoursToExpire < 48
                          ? `${(item.hoursToExpire / 24).toFixed(1)}d`
                          : `${(item.hoursToExpire / 24).toFixed(1)}d`
                        : "-"}
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                    <span>{fmtQty(item.quantityAvailable)}</span>
                    <span>{fmtMoney(item.estimatedValue)}</span>
                  </div>

                  {item.reason && <p className="mt-2 text-xs text-gray-700 italic">Lý do: {item.reason}</p>}

                  {item.recommendedAction && (
                    <div className="mt-2 p-2 bg-white/50 rounded border border-gray-200">
                      <p className="text-xs font-semibold text-gray-700">Gợi ý: {item.recommendedAction}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {items.length === 0 && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
          <p className="text-sm font-semibold text-green-700">Tuyệt vời!</p>
          <p className="text-xs text-green-600 mt-1">Không có lô hàng nào cần cảnh báo .</p>
        </div>
      )}
    </div>
  );
}
