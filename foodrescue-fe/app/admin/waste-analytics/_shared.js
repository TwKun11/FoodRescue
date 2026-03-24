"use client";

import { useEffect, useState } from "react";
import { apiAdminGetWasteAnalytics } from "@/lib/api";
import Image from "next/image";

export const fmtQty = (v) => `${Number(v || 0).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} đơn vị`;
export const fmtPercent = (v) => `${Number(v || 0).toLocaleString("vi-VN", { maximumFractionDigits: 2 })}%`;
export const fmtMoney = (v) => `${Number(v || 0).toLocaleString("vi-VN")} đ`;

export function normalizeList(list) {
  return Array.isArray(list) ? list : [];
}

export function useWasteAnalyticsData(options = {}) {
  const { full = true, limit = 5 } = options;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    apiAdminGetWasteAnalytics({ full, limit })
      .then((res) => {
        if (!mounted) return;
        if (!res.ok || !res.data?.data) {
          setError("Không tải được dữ liệu analytics.");
          return;
        }
        setAnalytics(res.data.data);
      })
      .catch(() => {
        if (mounted) setError("Có lỗi xảy ra khi tải dữ liệu analytics.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [full, limit]);

  return { loading, error, analytics };
}

export function WastePageHero({ title, subtitle, imageSrc, imageAlt = "Waste analytics" }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-lime-50 to-amber-50 p-5 sm:p-6">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-200/40 blur-2xl" />
      <div className="absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-amber-200/40 blur-2xl" />
      <div className="relative grid grid-cols-1 gap-4 md:grid-cols-5 md:items-center">
        <div className="md:col-span-3">
          <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-gray-700">{subtitle}</p>
        </div>
        <div className="relative h-36 overflow-hidden rounded-2xl border border-white/70 bg-white/70 md:col-span-2">
          <Image src={imageSrc} alt={imageAlt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 35vw" />
        </div>
      </div>
    </section>
  );
}

export function HorizontalBars({ rows, colorClass = "bg-emerald-500", unit = "", emptyText = "Chua co du lieu" }) {
  const list = normalizeList(rows).slice(0, 8);
  const maxValue = list.reduce((max, row) => Math.max(max, Number(row.value) || 0), 0) || 1;

  if (list.length === 0) {
    return <p className="text-sm text-gray-400">{emptyText}</p>;
  }

  return (
    <div className="space-y-3">
      {list.map((row, index) => {
        const value = Number(row.value) || 0;
        const ratio = Math.max(6, (value / maxValue) * 100);
        return (
          <div key={`${row.label}-${index}`} className="space-y-1">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-medium text-gray-700">{row.label}</span>
              <span className="text-gray-600">{value.toLocaleString("vi-VN")} {unit}</span>
            </div>
            <div className="h-2.5 rounded-full bg-gray-100">
              <div className={`h-2.5 rounded-full ${colorClass}`} style={{ width: `${ratio}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
