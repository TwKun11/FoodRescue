"use client";
import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { apiAdminGetSellers, apiAdminVerifySeller, apiAdminUpdateSellerStatus } from "@/lib/api";

const PAGE_SIZE = 10;

const STATUS_LABELS = {
  pending: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-800 border border-amber-200" },
  active: { label: "Đã duyệt", className: "bg-brand-bg text-brand-dark border border-brand/30" },
  suspended: { label: "Tạm khóa", className: "bg-red-100 text-red-700" },
  closed: { label: "Từ chối / Đã đóng", className: "bg-gray-100 text-gray-600" },
};

function fmtDate(val) {
  if (!val) return "—";
  const d = new Date(val);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function AdminSellerApplicationsPage() {
  const [list, setList] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending"); // mặc định xem đơn chờ duyệt
  const [refresh, setRefresh] = useState(0);
  const [actingId, setActingId] = useState(null);

  useEffect(() => {
    startTransition(async () => {
      const res = await apiAdminGetSellers({
        page,
        size: PAGE_SIZE,
        search: search.trim() || undefined,
        status: filterStatus || undefined,
      });
      if (res.ok && res.data?.data) {
        const d = res.data.data;
        setList(d.content || []);
        setTotalPages(d.totalPages || 1);
        setTotalElements(d.totalElements ?? 0);
      }
    });
  }, [page, refresh, search, filterStatus]);

  const reload = () => setRefresh((r) => r + 1);

  const handleApprove = (seller) => {
    if (!confirm(`Phê duyệt đơn đăng ký cửa hàng "${seller.shopName}"?`)) return;
    setActingId(seller.id);
    apiAdminVerifySeller(seller.id)
      .then((res) => {
        if (res.ok) reload();
        else alert(res.data?.message || "Phê duyệt thất bại");
      })
      .finally(() => setActingId(null));
  };

  const handleReject = (seller) => {
    if (!confirm(`Từ chối đơn đăng ký cửa hàng "${seller.shopName}"? Cửa hàng sẽ chuyển sang trạng thái đã đóng.`)) return;
    setActingId(seller.id);
    apiAdminUpdateSellerStatus(seller.id, "closed")
      .then((res) => {
        if (res.ok) reload();
        else alert(res.data?.message || "Từ chối thất bại");
      })
      .finally(() => setActingId(null));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Phê duyệt đơn đăng ký cửa hàng</h1>
        <p className="text-sm text-gray-500 mt-1">
          Xem và phê duyệt / từ chối các đơn đăng ký trở thành nhà bán hàng trên hệ thống.
        </p>
      </div>

      {/* Tìm kiếm & Bộ lọc */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] flex items-center gap-2">
          <span className="text-gray-500 text-sm shrink-0">Tìm kiếm</span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Tên cửa hàng, mã, email, người liên hệ..."
            className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm shrink-0">Trạng thái đơn</span>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-dark focus:outline-none"
          >
            <option value="">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="active">Đã duyệt</option>
            <option value="closed">Từ chối / Đã đóng</option>
            <option value="suspended">Tạm khóa</option>
          </select>
        </div>
        {(search || (filterStatus !== "pending" && filterStatus !== "")) && (
          <button
            type="button"
            onClick={() => { setSearch(""); setFilterStatus("pending"); setPage(0); }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        {isPending ? (
          <div className="p-10 text-center text-gray-400">Đang tải...</div>
        ) : list.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            {filterStatus === "pending" ? (
              <>
                <p className="font-medium">Không có đơn nào chờ duyệt.</p>
                <p className="text-sm mt-1">Các đơn đăng ký cửa hàng sẽ hiển thị tại đây khi có.</p>
              </>
            ) : (
              <p>Không có dữ liệu phù hợp với bộ lọc.</p>
            )}
            <Link href="/admin/sellers" className="inline-block mt-4 text-sm font-medium text-brand-dark hover:underline">
              Xem tất cả cửa hàng →
            </Link>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Cửa hàng</th>
                  <th className="px-4 py-3 text-left">Liên hệ</th>
                  <th className="px-4 py-3 text-left">Trạng thái đơn</th>
                  <th className="px-4 py-3 text-left">Ngày</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((s) => {
                  const st = STATUS_LABELS[s.status] ?? STATUS_LABELS.pending;
                  const isPendingRow = s.status === "pending";
                  const busy = actingId === s.id;
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{s.shopName}</p>
                        <p className="text-xs text-gray-400 font-mono">{s.code}</p>
                        {s.email && <p className="text-xs text-gray-500 mt-0.5">{s.email}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <p>{s.contactName ?? "—"}</p>
                        {s.phone && <p className="text-xs text-gray-400">{s.phone}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${st.className}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(s.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        {isPendingRow ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleApprove(s)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-brand hover:bg-brand-secondary text-gray-900 transition disabled:opacity-50"
                            >
                              {busy ? "Đang xử lý..." : "Phê duyệt"}
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleReject(s)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                            >
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <Link
                            href="/admin/sellers"
                            className="text-xs font-medium text-brand-dark hover:underline"
                          >
                            Xem tại Cửa hàng
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {totalPages >= 1 && (list.length > 0 || page > 0) && (
              <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-gray-500">
                  Trang {page + 1} / {totalPages} · {totalElements} đơn (10/trang)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-brand-bg hover:border-brand/50 transition disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-sm font-medium text-gray-700 min-w-16 text-center">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-brand-bg hover:border-brand/50 transition disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-end">
        <Link href="/admin/sellers" className="text-sm font-medium text-brand-dark hover:underline">
          ← Quản lý tất cả cửa hàng
        </Link>
      </div>
    </div>
  );
}
