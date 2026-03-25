"use client";

import { useEffect, useState, useTransition } from "react";
import {
  apiAdminDeleteReview,
  apiAdminFlagNegativeReview,
  apiAdminGetReviews,
  apiAdminMarkReviewSpam,
} from "@/lib/api";

const PAGE_SIZE = 12;

function fmtDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  return d.toLocaleString("vi-VN");
}

export default function AdminReviewsPage() {
  const [list, setList] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [actingId, setActingId] = useState(null);

  useEffect(() => {
    startTransition(async () => {
      const spamOnly = filterType === "spam" ? true : null;
      const flaggedOnly = filterType === "negative" ? true : null;
      const res = await apiAdminGetReviews({
        page,
        size: PAGE_SIZE,
        search,
        minRating,
        maxRating,
        spamOnly,
        flaggedOnly,
      });

      if (res.ok && res.data?.data) {
        setList(res.data.data.content || []);
        setTotalPages(res.data.data.totalPages || 1);
      } else {
        setList([]);
        setTotalPages(1);
      }
    });
  }, [page, search, minRating, maxRating, filterType, refreshKey]);

  const reload = () => setRefreshKey((v) => v + 1);

  const markSpam = async (row) => {
    const note = prompt("Ghi chú moderation (không bắt buộc):", row.moderationNote || "");
    if (note === null) return;
    setActingId(row.id);
    try {
      const res = await apiAdminMarkReviewSpam(row.id, note);
      if (!res.ok) {
        alert(res.data?.message || "Không thể đánh dấu spam");
        return;
      }
      reload();
    } finally {
      setActingId(null);
    }
  };

  const flagNegative = async (row) => {
    const note = prompt("Lý do gắn cờ review tiêu cực:", row.moderationNote || "");
    if (note === null) return;
    setActingId(row.id);
    try {
      const res = await apiAdminFlagNegativeReview(row.id, note);
      if (!res.ok) {
        alert(res.data?.message || "Không thể gắn cờ review");
        return;
      }
      reload();
    } finally {
      setActingId(null);
    }
  };

  const removeReview = async (row) => {
    if (!confirm(`Xóa review #${row.id} của ${row.userEmail}?`)) return;
    setActingId(row.id);
    try {
      const res = await apiAdminDeleteReview(row.id);
      if (!res.ok) {
        alert(res.data?.message || "Xóa review thất bại");
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
        <h1 className="text-2xl font-bold text-gray-900">Quan ly danh gia</h1>
        <p className="text-sm text-gray-500 mt-1">Xoa review spam va gan co review tieu cuc bat thuong.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Tim theo noi dung, san pham, email..."
          className="min-w-[230px] flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm"
        />
        <select
          value={minRating}
          onChange={(e) => {
            setMinRating(e.target.value);
            setPage(0);
          }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
        >
          <option value="">Min sao</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
        <select
          value={maxRating}
          onChange={(e) => {
            setMaxRating(e.target.value);
            setPage(0);
          }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
        >
          <option value="">Max sao</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setPage(0);
          }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
        >
          <option value="all">Tat ca</option>
          <option value="spam">Chi spam</option>
          <option value="negative">Chi da gan co tieu cuc</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isPending ? (
          <div className="p-10 text-center text-gray-400">Dang tai...</div>
        ) : list.length === 0 ? (
          <div className="p-10 text-center text-gray-500">Khong co review phu hop.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Danh gia</th>
                <th className="px-4 py-3 text-left">Nguoi dung</th>
                <th className="px-4 py-3 text-left">San pham / Seller</th>
                <th className="px-4 py-3 text-left">Trang thai</th>
                <th className="px-4 py-3 text-right">Thao tac</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((row) => {
                const busy = actingId === row.id;
                return (
                  <tr key={row.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">#{row.id} · {"★".repeat(Math.max(1, Number(row.rating || 0)))}</p>
                      <p className="text-gray-700 mt-1 line-clamp-2">{row.comment || "(khong co noi dung)"}</p>
                      <p className="text-xs text-gray-400 mt-1">{fmtDate(row.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <p>{row.userName || "-"}</p>
                      <p className="text-xs text-gray-400">{row.userEmail || "-"}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <p>{row.productName || "-"}</p>
                      <p className="text-xs text-gray-400">{row.sellerName || "-"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {row.isSpam && <span className="inline-flex w-fit px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">Spam</span>}
                        {row.isNegativeFlagged && <span className="inline-flex w-fit px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700">Da gan co tieu cuc</span>}
                        {row.unusualNegative && <span className="inline-flex w-fit px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Tieu cuc bat thuong</span>}
                        {row.moderationNote && <p className="text-xs text-gray-500 line-clamp-2">{row.moderationNote}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={busy || row.isSpam}
                          onClick={() => markSpam(row)}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-xs disabled:opacity-40"
                        >
                          Danh dau spam
                        </button>
                        <button
                          type="button"
                          disabled={busy || row.isNegativeFlagged}
                          onClick={() => flagNegative(row)}
                          className="px-3 py-1.5 rounded-lg border border-amber-200 text-amber-700 text-xs disabled:opacity-40"
                        >
                          Gan co tieu cuc
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => removeReview(row)}
                          className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs disabled:opacity-40"
                        >
                          Xoa
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
