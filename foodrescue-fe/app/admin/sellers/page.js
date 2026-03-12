"use client";
import { useState, useEffect, useTransition } from "react";
import { apiAdminGetSellers, apiAdminCreateSeller, apiAdminUpdateSellerStatus, apiAdminVerifySeller } from "@/lib/api";

const STATUS_LABELS = {
  pending: { label: "Chờ duyệt", className: "bg-yellow-100 text-yellow-700" },
  active: { label: "Đang hoạt động", className: "bg-brand-bg text-brand-dark border border-brand/30" },
  suspended: { label: "Tạm khóa", className: "bg-red-100 text-red-700" },
  closed: { label: "Đã đóng", className: "bg-gray-100 text-gray-500" },
};

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [detailSeller, setDetailSeller] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    startTransition(async () => {
      const res = await apiAdminGetSellers({ page, size: 10, search, status: filterStatus || undefined });
      if (res.ok && res.data?.data) {
        setSellers(res.data.data.content || []);
        setTotalPages(res.data.data.totalPages || 1);
      }
    });
  }, [page, refresh, search, filterStatus]);

  const reload = () => setRefresh((r) => r + 1);

  const handleVerify = (id) => {
    apiAdminVerifySeller(id).then((res) => {
      if (res.ok) reload();
      else alert(res.data?.message || "Thất bại");
    });
  };

  const handleStatusChange = (id, status) => {
    apiAdminUpdateSellerStatus(id, status).then((res) => {
      if (res.ok) reload();
      else alert(res.data?.message || "Thất bại");
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowForm(true)}
          className="bg-brand hover:bg-brand-secondary text-gray-900 text-sm font-semibold px-4 py-2 rounded-xl transition"
        >
          + Tạo cửa hàng mới
        </button>
      </div>

      {showForm && (
        <CreateSellerForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            setPage(0);
            reload();
          }}
        />
      )}

      {/* Tìm kiếm & Bộ lọc */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] flex items-center gap-2">
          <span className="text-gray-500 text-sm shrink-0">Tìm kiếm</span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Tên cửa hàng, mã, email..."
            className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm shrink-0">Trạng thái</span>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-dark focus:outline-none"
          >
            <option value="">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="active">Đang hoạt động</option>
            <option value="suspended">Tạm khóa</option>
            <option value="closed">Đã đóng</option>
          </select>
        </div>
        {(search || filterStatus) && (
          <button
            type="button"
            onClick={() => { setSearch(""); setFilterStatus(""); setPage(0); }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        {isPending ? (
          <div className="p-10 text-center text-gray-400">Đang tải...</div>
        ) : sellers.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Chưa có cửa hàng nào</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Cửa hàng</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left">Xác minh</th>
                <th className="px-4 py-3 text-left">Hành động</th>
                <th className="px-4 py-3 text-center w-12">Xem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sellers.map((s) => {
                const st = STATUS_LABELS[s.status] ?? STATUS_LABELS.pending;
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{s.shopName}</p>
                      <p className="text-xs text-gray-400">{s.code}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${st.className}`}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {s.isVerified ? (
                        <span className="text-brand-dark font-medium text-xs">✓ Đã xác minh</span>
                      ) : (
                        <button onClick={() => handleVerify(s.id)} className="text-xs text-blue-600 hover:underline">
                          Xác minh
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={s.status}
                        onChange={(e) => handleStatusChange(s.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:ring-brand-dark"
                      >
                        <option value="pending">Chờ duyệt</option>
                        <option value="active">Hoạt động</option>
                        <option value="suspended">Tạm khóa</option>
                        <option value="closed">Đóng</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => setDetailSeller(s)}
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
        {totalPages >= 1 && (sellers.length > 0 || page > 0) && (
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

function SellerDetailModal({ seller, onClose }) {
  const st = STATUS_LABELS[seller.status] ?? STATUS_LABELS.pending;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Chi tiết cửa hàng</h2>
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
            <dd className="text-gray-800 mt-0.5">{seller.id}</dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Mã cửa hàng</dt>
            <dd className="text-gray-800 mt-0.5 font-mono">{seller.code}</dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Tên cửa hàng</dt>
            <dd className="text-gray-800 mt-0.5">{seller.shopName}</dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Slug</dt>
            <dd className="text-gray-800 mt-0.5 font-mono">{seller.shopSlug ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Email đăng nhập</dt>
            <dd className="text-gray-800 mt-0.5">{seller.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Người phụ trách</dt>
            <dd className="text-gray-800 mt-0.5">{seller.contactName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Số điện thoại</dt>
            <dd className="text-gray-800 mt-0.5">{seller.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Trạng thái</dt>
            <dd className="mt-0.5">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${st.className}`}>
                {st.label}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Xác minh</dt>
            <dd className="text-gray-800 mt-0.5">{seller.isVerified ? "✓ Đã xác minh" : "Chưa xác minh"}</dd>
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

function CreateSellerForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    code: "",
    shopName: "",
    shopSlug: "",
    contactName: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    apiAdminCreateSeller(form)
      .then((res) => {
        if (res.ok) {
          onSuccess();
        } else setError(res.data?.message || "Tạo thất bại");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Tạo cửa hàng mới</h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Row label="Email đăng nhập *" value={form.email} onChange={set("email")} type="email" />
          <Row label="Mật khẩu *" value={form.password} onChange={set("password")} type="password" />
          <Row label="Mã cửa hàng *" value={form.code} onChange={set("code")} placeholder="VD: STORE001" />
          <Row label="Tên cửa hàng *" value={form.shopName} onChange={set("shopName")} />
          <Row label="Slug *" value={form.shopSlug} onChange={set("shopSlug")} placeholder="vd: ten-cua-hang" />
          <Row label="Người phụ trách *" value={form.contactName} onChange={set("contactName")} />
          <Row label="Số điện thoại" value={form.phone} onChange={set("phone")} />
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-brand hover:bg-brand-secondary text-gray-900 rounded-lg text-sm font-semibold transition disabled:opacity-60"
            >
              {loading ? "Đang tạo..." : "Tạo cửa hàng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Row({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
      />
    </div>
  );
}
