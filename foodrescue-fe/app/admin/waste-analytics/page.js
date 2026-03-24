"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiAdminGetWasteAnalytics } from "@/lib/api";

const fmtQty = (v) => `${Number(v || 0).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} đơn vị`;
const fmtPercent = (v) => `${Number(v || 0).toLocaleString("vi-VN", { maximumFractionDigits: 2 })}%`;
const fmtMoney = (v) => `${Number(v || 0).toLocaleString("vi-VN")} đ`;
export default function AdminWasteAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);

  const loadWasteAnalytics = () => {
    setLoading(true);
    setError("");

    return apiAdminGetWasteAnalytics({ full: false, limit: 3 })
      .then((res) => {
        if (!res.ok || !res.data?.data) {
          setError("Không tải được dữ liệu analytics.");
          return;
        }
        setAnalytics(res.data.data);
      })
      .catch(() => {
        setError("Có lỗi xảy ra khi tải dữ liệu analytics.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadWasteAnalytics();
  }, []);
  const earlyWarning = analytics?.earlyWarning || null;

  if (loading) {
    return <div className="text-gray-500">Đang tải Waste Analytics...</div>;
  }

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>;
  }

  if (!analytics) {
    return <div className="text-gray-500">Chưa có dữ liệu analytics.</div>;
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-lime-50 to-amber-50 p-6 sm:p-8">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-200/40 blur-2xl" />
        <div className="absolute -left-14 bottom-0 h-40 w-40 rounded-full bg-amber-200/40 blur-2xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Admin Impact Studio</p>
          <h1 className="mt-2 text-2xl font-black text-gray-900 sm:text-3xl">Phân tích thực phẩm thừa</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-700">
            Bảng điều khiển phân tích thực phẩm lãng phí theo loại, khu vực và thời điểm dư thừa.
            Dữ liệu được tổng hợp từ các lô hàng đã quá hạn nhưng vẫn còn tồn.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Cập nhật lúc: {analytics.generatedAt ? new Date(analytics.generatedAt).toLocaleString("vi-VN") : "-"}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Khối lượng lãng phí"
          value={fmtQty(analytics.totalWasteQty)}
          tone="emerald"
          hint="Tổng tồn kho quá hạn chưa tiêu thụ"
        />
        <MetricCard
          title="Giá trị ước tính"
          value={fmtMoney(analytics.estimatedWasteValue)}
          tone="amber"
          hint="Ước tính theo giá vốn lô hàng"
        />
        <MetricCard
          title="Khối lượng đã cứu"
          value={fmtQty(analytics.totalRecoveredQty)}
          tone="sky"
          hint="Đã bán/tiêu thụ trước khi hết hạn"
        />
        <MetricCard
          title="Tỷ lệ cứu thực phẩm"
          value={fmtPercent(analytics.recoveryRatePct)}
          tone="rose"
          hint={`Số lô bị ảnh hưởng: ${Number(analytics.affectedBatches || 0).toLocaleString("vi-VN")}`}
        />
      </section>

      <section className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Thực phẩm sắp hết hạn</h2>
            <p className="mt-1 text-sm text-gray-600">Theo dõi các lô hàng có nguy cơ trong 24h/48h/72h để xử lý kịp thời</p>
          </div>
          <div className="text-sm text-gray-700">
            Rủi ro hiện tại: <strong>{fmtQty(earlyWarning?.atRiskQty)}</strong> • {fmtMoney(earlyWarning?.atRiskValue)}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <WarningCard label="Đã quá hạn" value={earlyWarning?.expiredNowCount} tone="rose" />
          <WarningCard label="Sắp hết hạn 24h" value={earlyWarning?.expiringIn24hCount} tone="red" />
          <WarningCard label="Sắp hết hạn 48h" value={earlyWarning?.expiringIn48hCount} tone="amber" />
          <WarningCard label="Sắp hết hạn 72h" value={earlyWarning?.expiringIn72hCount} tone="yellow" />
        </div>
      </section>
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Đi tới trang phân tích chi tiết</h2>
        <p className="mt-1 text-sm text-gray-500">Bấm từng mục để chuyển sang từng trang riêng, không gộp chung.</p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          <Link href="/admin/waste-analytics/action-center" className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">Trung tâm hành động thực phẩm thừa</Link>
          <Link href="/admin/waste-analytics/smart-matching" className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">Smart Matching Suggestion</Link>
          <Link href="/admin/waste-analytics/top-categories" className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">Loại thực phẩm bị bỏ nhiều nhất</Link>
          <Link href="/admin/waste-analytics/top-regions" className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">Khu vực lãng phí nhiều</Link>
          <Link href="/admin/waste-analytics/top-products" className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">Sản phẩm lãng phí nổi bật</Link>
          <Link href="/admin/waste-analytics/surplus-by-hour" className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">Thời điểm dư thừa trong ngày</Link>
        </div>
      </section>
    </div>
  );
}

function WarningCard({ label, value, tone = "amber" }) {
  const toneMap = {
    rose: "bg-rose-50 border-rose-200 text-rose-700",
    red: "bg-red-50 border-red-200 text-red-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
  };

  return (
    <div className={`rounded-xl border p-3 ${toneMap[tone] || toneMap.amber}`}>
      <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-black text-gray-900">{Number(value || 0).toLocaleString("vi-VN")}</p>
      <p className="text-xs text-gray-600">lô hàng</p>
    </div>
  );
}

function MetricCard({ title, value, hint, tone = "emerald" }) {
  const toneMap = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    sky: "border-sky-200 bg-sky-50 text-sky-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneMap[tone] || toneMap.emerald}`}>
      <p className="text-xs font-semibold uppercase tracking-wide">{title}</p>
      <p className="mt-1 text-2xl font-black text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-600">{hint}</p>
    </div>
  );
}

