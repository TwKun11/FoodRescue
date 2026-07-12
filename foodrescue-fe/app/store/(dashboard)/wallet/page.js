"use client";

import { useEffect, useMemo, useState } from "react";
import {
  apiGetMyShop,
  apiGetSellerStats,
  apiGetSellerWallet,
  apiSimulateSellerPayout,
  apiUpdateMyShop,
} from "@/lib/api";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "₫";
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString("vi-VN") : "-";
}

function sanitizeDigits(value, max = 30) {
  return (value || "").replace(/[^\d]/g, "").slice(0, max);
}

export default function StoreWalletPage() {
  const [wallet, setWallet] = useState(null);
  const [stats, setStats] = useState(null);
  const [shop, setShop] = useState(null);
  const [form, setForm] = useState({
    bankName: "",
    bankAccountName: "",
    bankAccountNumber: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [payouting, setPayouting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const transactions = wallet?.transactions || [];
  const completedRevenue = stats?.totalRevenue || 0;

  const payoutReady = useMemo(() => {
    return Boolean(form.bankName && form.bankAccountName && form.bankAccountNumber);
  }, [form.bankAccountName, form.bankAccountNumber, form.bankName]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([apiGetSellerWallet(30), apiGetSellerStats(), apiGetMyShop()])
      .then(([walletRes, statsRes, shopRes]) => {
        if (cancelled) return;

        if (walletRes.ok) {
          setWallet(walletRes.data?.data || null);
        }
        if (statsRes.ok) {
          setStats(statsRes.data?.data || null);
        }
        if (shopRes.ok) {
          const nextShop = shopRes.data?.data || null;
          setShop(nextShop);
          setForm({
            bankName: nextShop?.bankName || "",
            bankAccountName: nextShop?.bankAccountName || "",
            bankAccountNumber: nextShop?.bankAccountNumber || "",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const setField = (field) => (event) => {
    const value = event.target.value;
    setMessage({ type: "", text: "" });
    setForm((prev) => ({
      ...prev,
      [field]: field === "bankAccountNumber" ? sanitizeDigits(value, 30) : value,
    }));
  };

  const handleSaveBank = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await apiUpdateMyShop({
        bankName: form.bankName || null,
        bankAccountName: form.bankAccountName || null,
        bankAccountNumber: form.bankAccountNumber || null,
      });

      if (!res.ok) {
        setMessage({
          type: "error",
          text: res.data?.message || "Không thể cập nhật tài khoản nhận tiền.",
        });
        return;
      }

      setShop(res.data?.data || shop);
      setMessage({ type: "success", text: "Đã cập nhật tài khoản nhận tiền." });
    } finally {
      setSaving(false);
    }
  };

  const handleSimulatePayout = async () => {
    setPayouting(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await apiSimulateSellerPayout();
      if (!res.ok) {
        setMessage({
          type: "error",
          text: res.data?.message || "Không thể tạo yêu cầu chi trả demo.",
        });
        return;
      }

      setWallet(res.data?.data || null);
      setMessage({ type: "success", text: "Đã mô phỏng chi trả thành công và cập nhật lịch sử ví." });
    } finally {
      setPayouting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-8 flex min-h-[320px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Ví & chi trả</h1>
          <p className="mt-1 text-sm text-gray-500">Quản lý số dư, giao dịch và tài khoản nhận tiền.</p>
        </div>
        <button
          type="button"
          onClick={handleSimulatePayout}
          disabled={payouting || !payoutReady || Number(wallet?.availableBalance || 0) <= 0}
          className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
        >
          {payouting ? "Đang chi trả demo..." : "Yêu cầu chi trả demo"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Metric label="Số dư khả dụng" value={formatMoney(wallet?.availableBalance)} tone="green" />
        <Metric label="Đang chi trả" value={formatMoney(wallet?.payoutProcessingBalance)} tone="blue" />
        <Metric label="Đã ghi nhận" value={formatMoney(wallet?.totalCredited)} tone="slate" />
        <Metric label="Doanh thu hoàn tất" value={formatMoney(completedRevenue)} tone="amber" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-6">
        <form onSubmit={handleSaveBank} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div>
            <h2 className="font-semibold text-gray-900">Tài khoản nhận tiền</h2>
            <p className="mt-1 text-sm text-gray-500">{shop?.shopName || "Cửa hàng"}</p>
          </div>

          {message.text && (
            <div
              className={`rounded-xl border px-3 py-2 text-sm ${
                message.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <Field
            label="Ngân hàng"
            value={form.bankName}
            onChange={setField("bankName")}
            placeholder="Vietcombank"
          />
          <Field
            label="Chủ tài khoản"
            value={form.bankAccountName}
            onChange={setField("bankAccountName")}
            placeholder="NGUYEN VAN A"
          />
          <Field
            label="Số tài khoản"
            value={form.bankAccountNumber}
            onChange={setField("bankAccountNumber")}
            placeholder="0123456789"
          />

          <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500">Trạng thái</span>
              <span className={`font-semibold ${payoutReady ? "text-emerald-700" : "text-amber-700"}`}>
                {payoutReady ? "Sẵn sàng nhận chi trả" : "Thiếu thông tin"}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-brand-dark disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : "Lưu tài khoản nhận tiền"}
          </button>
        </form>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-gray-900">Lịch sử ví</h2>
              <p className="mt-1 text-sm text-gray-500">{transactions.length} giao dịch gần đây</p>
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {transactions.length ? (
              transactions.map((tx) => (
                <div key={tx.id} className="px-5 py-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-gray-900">{tx.description || tx.referenceCode || "Giao dịch"}</p>
                      <StatusBadge status={tx.status} />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Gross {formatMoney(tx.grossAmount)} · Phí {formatMoney(tx.commissionAmount)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-brand-dark">{formatMoney(tx.amount)}</p>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-center text-sm text-gray-400">Chưa có giao dịch ví</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, tone }) {
  const tones = {
    green: "bg-brand-bg text-brand-dark",
    blue: "bg-blue-50 text-blue-600",
    slate: "bg-gray-50 text-gray-800",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-2 inline-flex rounded-xl px-3 py-2 text-xl font-bold ${tones[tone] || tones.slate}`}>
        {value}
      </p>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
    </label>
  );
}

function StatusBadge({ status }) {
  const labelMap = {
    pending: "Chờ hoàn tất",
    available: "Khả dụng",
    payout_processing: "Đang chi",
    paid_out: "Đã chi",
    failed: "Lỗi",
    cancelled: "Đã hủy",
  };
  const classMap = {
    pending: "bg-amber-50 text-amber-700",
    available: "bg-emerald-50 text-emerald-700",
    payout_processing: "bg-blue-50 text-blue-700",
    paid_out: "bg-gray-100 text-gray-700",
    failed: "bg-red-50 text-red-700",
    cancelled: "bg-amber-50 text-amber-700",
  };

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${classMap[status] || classMap.available}`}>
      {labelMap[status] || status || "Khả dụng"}
    </span>
  );
}
