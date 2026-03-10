"use client";
import { useState, useEffect, useTransition } from "react";
import { apiAdminGetUsers, apiAdminUpdateUserStatus } from "@/lib/api";

const ROLE_LABELS = {
  ADMIN: { label: "Quản trị", className: "bg-purple-100 text-purple-700" },
  SELLER: { label: "Cửa hàng", className: "bg-blue-100 text-blue-700" },
  CUSTOMER: { label: "Khách hàng", className: "bg-gray-100 text-gray-600" },
};

const STATUS_LABELS = {
  ACTIVE: { label: "Hoạt động", className: "bg-green-100 text-green-700" },
  INACTIVE: { label: "Chưa xác thực", className: "bg-yellow-100 text-yellow-700" },
  LOCKED: { label: "Bị khóa", className: "bg-red-100 text-red-700" },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    startTransition(async () => {
      const res = await apiAdminGetUsers({ page, size: 20 });
      if (res.ok && res.data?.data) {
        setUsers(res.data.data.content || []);
        setTotalPages(res.data.data.totalPages || 1);
        setTotal(res.data.data.totalElements || 0);
      }
    });
  }, [page, refresh]);

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">
          Người dùng
          {total > 0 && <span className="ml-2 text-sm font-normal text-gray-400">({total})</span>}
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isPending ? (
          <div className="p-10 text-center text-gray-400">Đang tải...</div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Chưa có người dùng nào</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left w-8">ID</th>
                <th className="px-4 py-3 text-left">Họ tên</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Vai trò</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left">Hành động</th>
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
                          className={`text-xs font-medium ${u.status === "ACTIVE" ? "text-red-500 hover:underline" : "text-green-600 hover:underline"}`}
                        >
                          {u.status === "ACTIVE" ? "Khóa" : "Mở khóa"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2 justify-end">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 rounded border text-sm disabled:opacity-40"
          >
            Trước
          </button>
          <span className="px-3 py-1 text-sm text-gray-500">
            {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 rounded border text-sm disabled:opacity-40"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
