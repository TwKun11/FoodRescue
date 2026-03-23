"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  apiAdminApproveSellerApplication,
  apiAdminGetSellerApplications,
  apiAdminRejectSellerApplication,
} from "@/lib/api";

const PAGE_SIZE = 10;

const STATUS_LABELS = {
  pending: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-800 border border-amber-200" },
  active: { label: "Đã duyệt", className: "bg-brand-bg text-brand-dark border border-brand/30" },
  closed: { label: "Từ chối", className: "bg-red-100 text-red-700 border border-red-200" },
};

function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function AdminSellerApplicationsPage() {
  const [list, setList] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [refresh, setRefresh] = useState(0);
  const [actingId, setActingId] = useState(null);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    startTransition(async () => {
      const res = await apiAdminGetSellerApplications({
        page,
        size: PAGE_SIZE,
        search: search.trim() || undefined,
        status: filterStatus || undefined,
      });
      if (res.ok && res.data?.data) {
        const data = res.data.data;
        setList(data.content || []);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements ?? 0);
      } else {
        setList([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    });
  }, [page, refresh, search, filterStatus]);

  const reload = () => setRefresh((value) => value + 1);

  const handleApprove = (item) => {
    if (!confirm(`Phê duyệt hồ sơ seller của "${item.shopName}"?`)) return;
    setActingId(item.id);
    apiAdminApproveSellerApplication(item.id)
      .then((res) => {
        if (res.ok) {
          reload();
          setDetail(null);
        } else alert(res.data?.message || "Phê duyệt thất bại");
      })
      .finally(() => setActingId(null));
  };

  const handleReject = (item) => {
    const note = prompt(`Nhập lý do từ chối hồ sơ của "${item.shopName}" (không bắt buộc):`, item.adminNote || "");
    if (note === null) return;
    setActingId(item.id);
    apiAdminRejectSellerApplication(item.id, note)
      .then((res) => {
        if (res.ok) {
          reload();
          setDetail(null);
        } else alert(res.data?.message || "Từ chối thất bại");
      })
      .finally(() => setActingId(null));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Phê duyệt hồ sơ seller</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kiểm tra thông tin pháp lý, địa chỉ, ngân hàng và ảnh hồ sơ trước khi cấp quyền bán hàng.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px] flex items-center gap-2">
          <span className="text-gray-500 text-sm shrink-0">Tìm kiếm</span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Tên cửa hàng, slug, email, người liên hệ..."
            className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm shrink-0">Trạng thái</span>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(0);
            }}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-dark focus:outline-none"
          >
            <option value="">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="active">Đã duyệt</option>
            <option value="closed">Từ chối</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isPending ? (
          <div className="p-10 text-center text-gray-400">Đang tải...</div>
        ) : list.length === 0 ? (
          <div className="p-10 text-center text-gray-500">Không có hồ sơ phù hợp.</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Cửa hàng</th>
                  <th className="px-4 py-3 text-left">Liên hệ</th>
                  <th className="px-4 py-3 text-left">Pháp lý</th>
                  <th className="px-4 py-3 text-left">Ngân hàng</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Ngày gửi</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((item) => {
                  const status = STATUS_LABELS[item.status] ?? STATUS_LABELS.pending;
                  const busy = actingId === item.id;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 align-top">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{item.shopName}</p>
                        <p className="text-xs text-gray-400 font-mono">@{item.shopSlug}</p>
                        {item.email && <p className="text-xs text-gray-500 mt-0.5">{item.email}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <p>{item.contactName || "—"}</p>
                        <p className="text-xs text-gray-400">{item.phone || "—"}</p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.pickupAddress || "Chưa có địa chỉ"}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <p className="text-xs">{item.legalName || "Không có tên pháp lý"}</p>
                        <p className="text-xs text-gray-400 mt-1">MST: {item.taxCode || "—"}</p>
                        <p className="text-xs text-gray-400">GPKD: {item.businessLicenseNumber || "—"}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <p className="text-xs">{item.bankName || "—"}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.bankAccountName || "—"}</p>
                        <p className="text-xs text-gray-400">{item.bankAccountNumber || "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(item.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setDetail(item)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                          >
                            Xem hồ sơ
                          </button>
                          {item.status === "pending" && (
                            <>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleApprove(item)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-brand hover:bg-brand-secondary text-gray-900 transition disabled:opacity-50"
                              >
                                {busy ? "Đang xử lý..." : "Duyệt"}
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleReject(item)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                              >
                                Từ chối
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-gray-500">
                Trang {page + 1} / {totalPages} · {totalElements} hồ sơ ({PAGE_SIZE}/trang)
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((value) => value - 1)}
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
                  onClick={() => setPage((value) => value + 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-brand-bg hover:border-brand/50 transition disabled:opacity-40 disabled:pointer-events-none"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {detail && (
        <ApplicationDetailModal
          item={detail}
          acting={actingId === detail.id}
          onClose={() => setDetail(null)}
          onApprove={() => handleApprove(detail)}
          onReject={() => handleReject(detail)}
        />
      )}

      <div className="flex justify-end">
        <Link href="/admin/sellers" className="text-sm font-medium text-brand-dark hover:underline">
          ← Quản lý tất cả cửa hàng
        </Link>
      </div>
    </div>
  );
}

function ApplicationDetailModal({ item, acting, onClose, onApprove, onReject }) {
  const status = STATUS_LABELS[item.status] ?? STATUS_LABELS.pending;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center" onClick={onClose}>
      <div className="w-full max-w-4xl rounded-3xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{item.shopName}</h2>
            <p className="mt-1 text-sm text-gray-500">@{item.shopSlug} · {item.email || "—"}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <DetailSection title="Thông tin vận hành">
            <DetailItem label="Người liên hệ" value={item.contactName || "—"} />
            <DetailItem label="Số điện thoại" value={item.phone || "—"} />
            <DetailItem label="Địa chỉ lấy hàng" value={item.pickupAddress || "—"} multiline />
            <DetailItem label="Loại hình kinh doanh" value={item.businessType || "—"} />
            <DetailItem label="Mô tả cửa hàng" value={item.description || "—"} multiline />
          </DetailSection>

          <DetailSection title="Thông tin pháp lý">
            <DetailItem label="Tên pháp lý" value={item.legalName || "—"} />
            <DetailItem label="Mã số thuế" value={item.taxCode || "—"} />
            <DetailItem label="Số giấy phép kinh doanh" value={item.businessLicenseNumber || "—"} />
            <DetailItem label="Số CCCD/CMND" value={item.identityNumber || "—"} />
            <DetailItem label="Điều khoản đã chấp nhận" value={item.termsVersion || "seller-terms-v1"} />
            <DetailItem label="Trạng thái" value={status.label} badgeClass={status.className} />
          </DetailSection>

          <DetailSection title="Thông tin ngân hàng">
            <DetailItem label="Ngân hàng" value={item.bankName || "—"} />
            <DetailItem label="Chủ tài khoản" value={item.bankAccountName || "—"} />
            <DetailItem label="Số tài khoản" value={item.bankAccountNumber || "—"} />
          </DetailSection>

          <DetailSection title="Ảnh hồ sơ">
            <ImageLink label="Ảnh mặt tiền / quầy bán" href={item.storefrontImageUrl} />
            <ImageLink label="Ảnh giấy phép kinh doanh" href={item.businessLicenseImageUrl} />
            <ImageLink label="Ảnh CCCD/CMND" href={item.identityCardImageUrl} />
          </DetailSection>

          {item.adminNote && (
            <div className="md:col-span-2">
              <DetailSection title="Ghi chú từ admin">
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 whitespace-pre-line">{item.adminNote}</p>
              </DetailSection>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 p-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Đóng
          </button>
          {item.status === "pending" && (
            <>
              <button
                type="button"
                disabled={acting}
                onClick={onReject}
                className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Từ chối
              </button>
              <button
                type="button"
                disabled={acting}
                onClick={onApprove}
                className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-brand-dark disabled:opacity-50"
              >
                {acting ? "Đang xử lý..." : "Phê duyệt"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <div className="space-y-3 rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {children}
    </div>
  );
}

function DetailItem({ label, value, multiline = false, badgeClass }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      {badgeClass ? (
        <span className={`mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass}`}>{value}</span>
      ) : (
        <p className={`mt-1 text-sm text-gray-800 ${multiline ? "whitespace-pre-line" : ""}`}>{value}</p>
      )}
    </div>
  );
}

function ImageLink({ label, href }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-brand-dark hover:underline break-all">
          Xem ảnh
        </a>
      ) : (
        <p className="mt-1 text-sm text-gray-500">Chưa có</p>
      )}
    </div>
  );
}
