"use client";

import { useEffect, useState, useTransition } from "react";
import { apiAdminGetModerationStats, apiAdminGetViolationReports, apiAdminUpdateViolationReportStatus } from "@/lib/api";

const PAGE_SIZE = 12;

const TYPE_LABEL = {
  SPOILED_FOOD: "Thuc pham hong",
  MISDESCRIPTION: "Sai mo ta",
};

const STATUS_LABEL = {
  PENDING: "Cho xu ly",
  IN_REVIEW: "Dang kiem tra",
  RESOLVED: "Da xu ly",
  REJECTED: "Tu choi",
};

function fmtDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("vi-VN");
}

export default function AdminReportsPage() {
  const [list, setList] = useState([]);
  const [stats, setStats] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [actingId, setActingId] = useState(null);

  useEffect(() => {
    startTransition(async () => {
      const [listRes, statsRes] = await Promise.all([
        apiAdminGetViolationReports({ page, size: PAGE_SIZE, search, type, status }),
        apiAdminGetModerationStats(6),
      ]);

      if (listRes.ok && listRes.data?.data) {
        setList(listRes.data.data.content || []);
        setTotalPages(listRes.data.data.totalPages || 1);
      } else {
        setList([]);
        setTotalPages(1);
      }

      if (statsRes.ok && statsRes.data?.data) {
        setStats(statsRes.data.data);
      } else {
        setStats(null);
      }
    });
  }, [page, search, type, status, refreshKey]);

  const reload = () => setRefreshKey((k) => k + 1);

  const updateStatus = async (row, nextStatus) => {
    const note = prompt(`Ghi chu xu ly cho bao cao #${row.id}:`, row.adminNote || "");
    if (note === null) return;
    setActingId(row.id);
    try {
      const res = await apiAdminUpdateViolationReportStatus(row.id, {
        status: nextStatus,
        adminNote: note,
      });
      if (!res.ok) {
        alert(res.data?.message || "Cap nhat that bai");
        return;
      }
      reload();
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bao cao vi pham</h1>
        <p className="text-sm text-gray-500 mt-1">Tiep nhan report thuc pham hong, sai mo ta va xu ly boi admin.</p>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
            <MetricCard label="Tong report" value={stats.totalReports} hint={`Open: ${(stats.pendingReports || 0) + (stats.inReviewReports || 0)}`} />
            <MetricCard label="Ty le spam review" value={`${Number(stats.spamRate || 0).toFixed(1)}%`} hint={`${stats.spamReviews || 0}/${stats.totalReviews || 0} reviews`} />
            <MetricCard label="Review tieu cuc da flag" value={stats.flaggedNegativeReviews || 0} hint="Rating <= 2" />
            <MetricCard label="SLA xu ly TB" value={`${Number(stats.avgResolutionHours || 0).toFixed(1)}h`} hint="Tu tao den resolved" />
            <MetricCard label="Report thuc pham hong" value={stats.spoiledFoodReports || 0} hint={`Sai mo ta: ${stats.misdescriptionReports || 0}`} />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-800">Top seller bi report</h3>
            </div>
            {(stats.topSellersByReports || []).length === 0 ? (
              <div className="p-6 text-sm text-gray-500">Chua co du lieu report theo seller.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Seller</th>
                    <th className="px-4 py-3 text-right">Tong report</th>
                    <th className="px-4 py-3 text-right">Dang mo</th>
                    <th className="px-4 py-3 text-right">Da xu ly</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(stats.topSellersByReports || []).map((row) => (
                    <tr key={row.sellerId || row.sellerName}>
                      <td className="px-4 py-3 text-gray-800">{row.sellerName || "-"}</td>
                      <td className="px-4 py-3 text-right font-semibold">{row.totalReports || 0}</td>
                      <td className="px-4 py-3 text-right text-amber-700">{row.openReports || 0}</td>
                      <td className="px-4 py-3 text-right text-green-700">{row.resolvedReports || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Tim theo noi dung, san pham, email..."
          className="min-w-[240px] flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm"
        />
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(0);
          }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
        >
          <option value="">Loai report</option>
          <option value="SPOILED_FOOD">Thuc pham hong</option>
          <option value="MISDESCRIPTION">Sai mo ta</option>
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
        >
          <option value="">Trang thai</option>
          <option value="PENDING">Cho xu ly</option>
          <option value="IN_REVIEW">Dang kiem tra</option>
          <option value="RESOLVED">Da xu ly</option>
          <option value="REJECTED">Tu choi</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isPending ? (
          <div className="p-10 text-center text-gray-400">Dang tai...</div>
        ) : list.length === 0 ? (
          <div className="p-10 text-center text-gray-500">Khong co bao cao.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Bao cao</th>
                <th className="px-4 py-3 text-left">Nguoi gui</th>
                <th className="px-4 py-3 text-left">San pham</th>
                <th className="px-4 py-3 text-left">Trang thai</th>
                <th className="px-4 py-3 text-right">Xu ly</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((row) => {
                const busy = actingId === row.id;
                return (
                  <tr key={row.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">#{row.id} · {TYPE_LABEL[row.type] || row.type}</p>
                      <p className="text-gray-700 mt-1 line-clamp-2">{row.description}</p>
                      {row.evidenceUrl && (
                        <a href={row.evidenceUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-dark hover:underline mt-1 inline-block">
                          Xem bang chung
                        </a>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{fmtDate(row.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <p>{row.reporterName || "-"}</p>
                      <p className="text-xs text-gray-400">{row.reporterEmail || "-"}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <p>{row.productName || "-"}</p>
                      <p className="text-xs text-gray-400">Product #{row.productId || "-"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="inline-flex px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                        {STATUS_LABEL[row.status] || row.status}
                      </p>
                      {row.adminNote && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{row.adminNote}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          disabled={busy}
                          onClick={() => updateStatus(row, "IN_REVIEW")}
                          className="px-3 py-1.5 rounded-lg border border-amber-200 text-amber-700 text-xs disabled:opacity-40"
                        >
                          Dang kiem tra
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => updateStatus(row, "RESOLVED")}
                          className="px-3 py-1.5 rounded-lg border border-green-200 text-green-700 text-xs disabled:opacity-40"
                        >
                          Da xu ly
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => updateStatus(row, "REJECTED")}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-xs disabled:opacity-40"
                        >
                          Tu choi
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">Trang {page + 1}/{Math.max(1, totalPages)}</p>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40"
            >
              Truoc
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, hint }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-400">{hint}</p>
    </div>
  );
}
