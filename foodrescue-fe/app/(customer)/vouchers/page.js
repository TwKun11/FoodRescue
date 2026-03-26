"use client";

import { useEffect, useState } from "react";
import { apiClaimVoucher, apiGetVoucherStore } from "@/lib/api";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("vi-VN") + " đ";
}

function discountText(v) {
  if (v.discountType === "percentage") {
    return `${Number(v.discountValue || 0)}%`;
  }
  if (v.discountType === "freeship") {
    return "Freeship";
  }
  return formatMoney(v.discountValue || 0);
}

export default function VoucherWalletPage() {
  const [store, setStore] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    const storeRes = await apiGetVoucherStore();
    setStore(storeRes.ok ? (storeRes.data?.data || []) : []);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const claim = async (voucherId) => {
    setBusyId(voucherId);
    const res = await apiClaimVoucher(voucherId);
    if (!res.ok) {
      window.alert(res.data?.message || "Không thể nhận voucher");
      setBusyId(null);
      return;
    }
    window.dispatchEvent(new Event("voucher-wallet-updated"));
    await loadAll();
    setBusyId(null);
  };

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Kho voucher</h1>
          <p className="mt-1 text-sm text-gray-500">Nhận voucher và dùng mã tại trang checkout.</p>
        </div>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Voucher có thể nhận</h2>
          {loading ? <p className="mt-3 text-sm text-gray-400">Đang tải...</p> : null}
          {!loading && store.length === 0 ? <p className="mt-3 text-sm text-gray-500">Hiện chưa có voucher nào.</p> : null}
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {store.map((v) => (
              <div key={v.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-gray-900">{v.name}</p>
                    <p className="text-xs text-gray-500">Mã: <span className="font-mono font-semibold text-brand-dark">{v.code}</span></p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">{discountText(v)}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">Đơn tối thiểu: {formatMoney(v.minOrderValue || 0)}</p>
                <p className="text-xs text-gray-500">Lượt dùng: {v.usedCount || 0}/{v.maxUses || "∞"}</p>
                <button
                  type="button"
                  disabled={v.claimed || busyId === v.id}
                  onClick={() => claim(v.id)}
                  className="mt-3 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {v.claimed ? "Đã nhận" : busyId === v.id ? "Đang nhận..." : "Nhận voucher"}
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
