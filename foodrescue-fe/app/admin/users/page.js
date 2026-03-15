"use client";
import { useState, useEffect, useTransition } from "react";
import { apiAdminGetUsers, apiAdminUpdateUserStatus } from "@/lib/api";

const ROLE_LABELS = {
  ADMIN: { label: "Quản trị", className: "bg-purple-100 text-purple-700" },
  SELLER: { label: "Cửa hàng", className: "bg-blue-100 text-blue-700" },
  CUSTOMER: { label: "Khách hàng", className: "bg-gray-100 text-gray-600" },
};

const STATUS_LABELS = {
  ACTIVE: { label: "Hoạt động", className: "bg-brand-bg text-brand-dark border border-brand/30" },
  INACTIVE: { label: "Chưa xác thực", className: "bg-yellow-100 text-yellow-700" },
  LOCKED: { label: "Bị khóa", className: "bg-red-100 text-red-700" },
};

function UserDetailModal({ user, onClose }) {
  const role = ROLE_LABELS[user.role] ?? ROLE_LABELS.CUSTOMER;
  const status = STATUS_LABELS[user.status] ?? STATUS_LABELS.ACTIVE;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Chi tiết người dùng</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-gray-500 font-medium">ID</dt>
            <dd className="text-gray-800 mt-0.5">{user.id}</dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Họ tên</dt>
            <dd className="text-gray-800 mt-0.5">{user.fullName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Email</dt>
            <dd className="text-gray-800 mt-0.5">{user.email}</dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Số điện thoại</dt>
            <dd className="text-gray-800 mt-0.5">{user.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Vai trò</dt>
            <dd className="mt-0.5">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${role.className}`}>
                {role.label}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Trạng thái</dt>
            <dd className="mt-0.5">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
                {status.label}
              </span>
            </dd>
          </div>
        </dl>
        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [detailUser, setDetailUser] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    startTransition(async () => {
      const res = await apiAdminGetUsers({
        page,
        size: 10,
        search,
        role: filterRole || undefined,
        status: filterStatus || undefined,
      });
      if (res.ok && res.data?.data) {
        setUsers(res.data.data.content || []);
        setTotalPages(res.data.data.totalPages || 1);
        setTotal(res.data.data.totalElements || 0);
      }
    });
  }, [page, refresh, search, filterRole, filterStatus]);

  const reload = () => setRefresh((r) => r + 1);

  const handleStatusToggle = (user) => {
    const next = user.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
    if (!confirm(`${next === "LOCKED" ? "Khóa" : "Mở khóa"} tài khoản ${user.email}?`)) return;
    apiAdminUpdateUserStatus(user.id, next).then((res) => {
      if (res.ok) reload();
      else alert(res.data?.message || "Thất bại");
    });
  };

  return (
    <div className="space-y-6">
  

      {detailUser && (
        <UserDetailModal user={detailUser} onClose={() => setDetailUser(null)} />
      )}

      {/* Tìm kiếm & Bộ lọc */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] flex items-center gap-2">
          <span className="text-gray-500 text-sm shrink-0">Tìm kiếm</span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Họ tên, email, SĐT..."
            className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm shrink-0">Vai trò</span>
          <select
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); setPage(0); }}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-dark focus:outline-none"
          >
            <option value="">Tất cả</option>
            <option value="ADMIN">Quản trị</option>
            <option value="SELLER">Cửa hàng</option>
            <option value="CUSTOMER">Khách hàng</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm shrink-0">Trạng thái</span>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-dark focus:outline-none"
          >
            <option value="">Tất cả</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Chưa xác thực</option>
            <option value="LOCKED">Bị khóa</option>
          </select>
        </div>
        {(search || filterRole || filterStatus) && (
          <button
            type="button"
            onClick={() => { setSearch(""); setFilterRole(""); setFilterStatus(""); setPage(0); }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isPending ? (
          <div className="p-10 text-center text-gray-400">Đang tải...</div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Chưa có người dùng nào</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left w-8">ID</th>
                <th className="px-4 py-3 text-left">Họ tên</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Vai trò</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left">Hành động</th>
                <th className="px-4 py-3 text-center w-12">Xem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => {
                const role = ROLE_LABELS[u.role] ?? ROLE_LABELS.CUSTOMER;
                const status = STATUS_LABELS[u.status] ?? STATUS_LABELS.ACTIVE;
                return (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 text-xs">{u.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{u.fullName || "—"}</p>
                      {u.phone && <p className="text-xs text-gray-400">{u.phone}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${role.className}`}
                      >
                        {role.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.role !== "ADMIN" && (
                        <button
                          onClick={() => handleStatusToggle(u)}
                          className={`text-xs font-medium ${u.status === "ACTIVE" ? "text-red-500 hover:underline" : "text-brand-dark hover:underline"}`}
                        >
                          {u.status === "ACTIVE" ? "Khóa" : "Mở khóa"}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => setDetailUser(u)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-brand-bg hover:text-brand-dark transition"
                        title="Xem chi tiết"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {totalPages >= 1 && (users.length > 0 || page > 0) && (
          <div className="px-5 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500">Trang {page + 1} / {totalPages} (10/trang)</p>
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
              <span className="text-sm font-medium text-gray-700 min-w-16 text-center">{page + 1} / {totalPages}</span>
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
      </div>
    </div>
  );
}
