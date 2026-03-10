"use client";
import { useState, useEffect, useTransition } from "react";
import { apiAdminGetSellers, apiAdminCreateSeller, apiAdminUpdateSellerStatus, apiAdminVerifySeller } from "@/lib/api";

const STATUS_LABELS = {
  pending: { label: "Chờ duyệt", className: "bg-yellow-100 text-yellow-700" },
  active: { label: "Đang hoạt động", className: "bg-green-100 text-green-700" },
  suspended: { label: "Tạm khóa", className: "bg-red-100 text-red-700" },
  closed: { label: "Đã đóng", className: "bg-gray-100 text-gray-500" },
};

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    startTransition(async () => {
      const res = await apiAdminGetSellers({ page, size: 20 });
      if (res.ok && res.data?.data) {
        setSellers(res.data.data.content || []);
        setTotalPages(res.data.data.totalPages || 1);
      }
    });
  }, [page, refresh]);

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Quản lý cửa hàng</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
                        <span className="text-green-600 font-medium text-xs">✓ Đã xác minh</span>
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
                        className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                      >
                        <option value="pending">Chờ duyệt</option>
                        <option value="active">Hoạt động</option>
                        <option value="suspended">Tạm khóa</option>
                        <option value="closed">Đóng</option>
                      </select>
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
              className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60"
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
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
      />
    </div>
  );
}
