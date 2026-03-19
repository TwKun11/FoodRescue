"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { apiGetMyShop, apiSellerUploadShopImage, apiUpdateMyShop } from "@/lib/api";

const STATUS_META = {
  pending: {
    label: "Cho duyet",
    className: "bg-amber-50 text-amber-800 border-amber-200",
    description: "Ho so cua hang dang cho admin kiem tra. Ban co the cap nhat them thong tin neu can.",
  },
  active: {
    label: "Dang hoat dong",
    className: "bg-green-50 text-green-800 border-green-200",
    description: "Cua hang da duoc duyet va co the dang san pham, xu ly don hang.",
  },
  suspended: {
    label: "Tam khoa",
    className: "bg-red-50 text-red-700 border-red-200",
    description: "Cua hang dang tam khoa. Hay lien he admin neu can ho tro.",
  },
  closed: {
    label: "Da dong",
    className: "bg-gray-100 text-gray-700 border-gray-200",
    description: "Ho so seller dang o trang thai da dong.",
  },
};

const IMAGE_FIELDS = [
  {
    key: "avatarUrl",
    label: "Logo cua hang",
    hint: "Anh dai dien xuat hien tren shop va san pham.",
  },
  {
    key: "coverUrl",
    label: "Banner cua hang",
    hint: "Anh ngang de lam hero cho trang shop.",
  },
  {
    key: "storefrontImageUrl",
    label: "Anh mat tien / quay ban",
    hint: "Dung de admin doi chieu diem ban thuc te.",
  },
  {
    key: "businessLicenseImageUrl",
    label: "Anh giay phep kinh doanh",
    hint: "Ban scan/chup ro thong tin doanh nghiep hoac ho kinh doanh.",
  },
  {
    key: "identityCardImageUrl",
    label: "Anh CCCD/CMND dai dien",
    hint: "Giay to cua nguoi dai dien dang ky seller.",
  },
];

const EMPTY_SHOP = {
  shopName: "",
  shopSlug: "",
  legalName: "",
  businessType: "",
  contactName: "",
  phone: "",
  pickupAddress: "",
  description: "",
  taxCode: "",
  businessLicenseNumber: "",
  identityNumber: "",
  bankName: "",
  bankAccountName: "",
  bankAccountNumber: "",
  avatarUrl: "",
  coverUrl: "",
  storefrontImageUrl: "",
  businessLicenseImageUrl: "",
  identityCardImageUrl: "",
  email: "",
  status: "",
  isVerified: false,
  code: "",
  termsVersion: "",
  termsAcceptedAt: "",
  reviewedAt: "",
  adminNote: "",
  ratingAvg: null,
  commissionRate: null,
  createdAt: "",
  updatedAt: "",
};

function sanitizeDigits(value, max = 30) {
  return (value || "").replace(/[^\d]/g, "").slice(0, max);
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("vi-VN");
}

function mapShopResponse(data) {
  return {
    shopName: data?.shopName || "",
    shopSlug: data?.shopSlug || "",
    legalName: data?.legalName || "",
    businessType: data?.businessType || "",
    contactName: data?.contactName || "",
    phone: data?.phone || "",
    pickupAddress: data?.pickupAddress || "",
    description: data?.description || "",
    taxCode: data?.taxCode || "",
    businessLicenseNumber: data?.businessLicenseNumber || "",
    identityNumber: data?.identityNumber || "",
    bankName: data?.bankName || "",
    bankAccountName: data?.bankAccountName || "",
    bankAccountNumber: data?.bankAccountNumber || "",
    avatarUrl: data?.avatarUrl || "",
    coverUrl: data?.coverUrl || "",
    storefrontImageUrl: data?.storefrontImageUrl || "",
    businessLicenseImageUrl: data?.businessLicenseImageUrl || "",
    identityCardImageUrl: data?.identityCardImageUrl || "",
    email: data?.email || "",
    status: data?.status || "",
    isVerified: Boolean(data?.isVerified),
    code: data?.code || "",
    termsVersion: data?.termsVersion || "",
    termsAcceptedAt: data?.termsAcceptedAt || "",
    reviewedAt: data?.reviewedAt || "",
    adminNote: data?.adminNote || "",
    ratingAvg: data?.ratingAvg ?? null,
    commissionRate: data?.commissionRate ?? null,
    createdAt: data?.createdAt || "",
    updatedAt: data?.updatedAt || "",
  };
}

export default function ShopPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState("");
  const [message, setMessage] = useState({ type: null, text: "" });
  const [shop, setShop] = useState(EMPTY_SHOP);
  const [form, setForm] = useState(EMPTY_SHOP);

  const statusMeta = useMemo(() => {
    return STATUS_META[shop.status] || STATUS_META.pending;
  }, [shop.status]);

  useEffect(() => {
    let cancelled = false;

    async function loadShop() {
      setLoading(true);
      const res = await apiGetMyShop();
      if (!cancelled) {
        if (res.ok && res.data?.data) {
          const mapped = mapShopResponse(res.data.data);
          setShop(mapped);
          setForm(mapped);
        } else {
          setMessage({ type: "error", text: res.data?.message || "Khong tai duoc thong tin cua hang." });
        }
        setLoading(false);
      }
    }

    loadShop();
    return () => {
      cancelled = true;
    };
  }, []);

  const setField = (field) => (e) => {
    const raw = e.target.value;
    setMessage({ type: null, text: "" });
    setForm((prev) => ({
      ...prev,
      [field]:
        field === "phone"
          ? sanitizeDigits(raw, 11)
          : field === "taxCode"
            ? sanitizeDigits(raw, 20)
            : field === "identityNumber"
              ? sanitizeDigits(raw, 20)
              : field === "bankAccountNumber"
                ? sanitizeDigits(raw, 30)
                : raw,
    }));
  };

  const handleUpload = (field) => async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(field);
    setMessage({ type: null, text: "" });
    try {
      const res = await apiSellerUploadShopImage(file);
      if (!res.ok) {
        setMessage({ type: "error", text: res.data?.message || "Tai anh that bai." });
        return;
      }
      const url = res.data?.data || "";
      setForm((prev) => ({ ...prev, [field]: url }));
      setMessage({ type: "success", text: "Da tai anh len thanh cong." });
    } finally {
      setUploadingField("");
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: null, text: "" });
    try {
      const res = await apiUpdateMyShop({
        shopName: form.shopName,
        legalName: form.legalName || null,
        businessType: form.businessType || null,
        contactName: form.contactName || null,
        phone: form.phone || null,
        pickupAddress: form.pickupAddress || null,
        description: form.description || null,
        taxCode: form.taxCode || null,
        businessLicenseNumber: form.businessLicenseNumber || null,
        identityNumber: form.identityNumber || null,
        bankName: form.bankName || null,
        bankAccountName: form.bankAccountName || null,
        bankAccountNumber: form.bankAccountNumber || null,
        avatarUrl: form.avatarUrl || null,
        coverUrl: form.coverUrl || null,
        storefrontImageUrl: form.storefrontImageUrl || null,
        businessLicenseImageUrl: form.businessLicenseImageUrl || null,
        identityCardImageUrl: form.identityCardImageUrl || null,
      });

      if (!res.ok) {
        const text =
          typeof res.data?.data === "object" && res.data?.data
            ? Object.values(res.data.data)[0]
            : res.data?.message || "Cap nhat cua hang that bai.";
        setMessage({ type: "error", text });
        return;
      }

      const mapped = mapShopResponse(res.data?.data);
      setShop(mapped);
      setForm(mapped);
      setMessage({ type: "success", text: "Da cap nhat ho so cua hang thanh cong." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="relative h-44 bg-gradient-to-r from-emerald-500 via-green-500 to-lime-400">
          {shop.coverUrl && <img src={shop.coverUrl} alt="Banner cua hang" className="h-full w-full object-cover opacity-40" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md">
                {shop.avatarUrl ? (
                  <img src={shop.avatarUrl} alt={shop.shopName || "Logo cua hang"} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-brand text-2xl font-bold text-gray-900">
                    {(shop.shopName?.charAt(0) || "S").toUpperCase()}
                  </div>
                )}
              </div>
              <div className="pb-1 text-white">
                <h1 className="text-2xl font-bold">{shop.shopName || "Cua hang cua ban"}</h1>
                <p className="mt-1 text-sm text-white/80">
                  @{shop.shopSlug || "chua-co-slug"} {shop.code ? `· ${shop.code}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}>
                    {statusMeta.label}
                  </span>
                  {shop.isVerified && (
                    <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      Da xac minh
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid min-w-[220px] grid-cols-2 gap-3">
              <StatCard label="Danh gia TB" value={shop.ratingAvg != null ? Number(shop.ratingAvg).toFixed(1) : "—"} />
              <StatCard
                label="Hoa hong nen tang"
                value={shop.commissionRate != null ? `${Number(shop.commissionRate).toFixed(1)}%` : "—"}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-t border-gray-100 bg-gray-50/70 p-5 md:grid-cols-4">
          <MetaItem label="Email tai khoan" value={shop.email || "—"} />
          <MetaItem label="Dieu khoan da chap nhan" value={shop.termsVersion || "seller-terms-v1"} />
          <MetaItem label="Ngay gui ho so" value={formatDateTime(shop.termsAcceptedAt || shop.createdAt)} />
          <MetaItem label="Lan duyet gan nhat" value={formatDateTime(shop.reviewedAt)} />
        </div>
      </section>

      {message.text && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {shop.adminNote && (
        <section className="rounded-3xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-sm font-semibold text-red-800">Ghi chu tu admin</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-red-700">{shop.adminNote}</p>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Thong tin van hanh</h2>
            <p className="mt-1 text-sm text-gray-500">Cap nhat ten shop, thong tin lien he va dia chi giao nhan.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Ten cua hang *" value={form.shopName} onChange={setField("shopName")} />
              <ReadOnlyField label="Slug cua hang" value={form.shopSlug || "—"} />
              <Field label="Ten phap ly / ho kinh doanh *" value={form.legalName} onChange={setField("legalName")} />
              <Field label="Loai hinh kinh doanh *" value={form.businessType} onChange={setField("businessType")} />
              <Field label="Nguoi lien he *" value={form.contactName} onChange={setField("contactName")} />
              <Field label="So dien thoai *" value={form.phone} onChange={setField("phone")} inputMode="numeric" />
            </div>
            <div className="mt-4">
              <TextArea label="Dia chi lay hang / giao nhan *" value={form.pickupAddress} onChange={setField("pickupAddress")} rows={3} />
            </div>
            <div className="mt-4">
              <TextArea label="Mo ta cua hang" value={form.description} onChange={setField("description")} rows={5} />
            </div>
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Thong tin phap ly</h2>
            <p className="mt-1 text-sm text-gray-500">Nhung truong nay can khop voi ho so da nop de admin doi chieu khi can.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Field label="Ma so thue" value={form.taxCode} onChange={setField("taxCode")} inputMode="numeric" />
              <Field
                label="So giay phep kinh doanh *"
                value={form.businessLicenseNumber}
                onChange={setField("businessLicenseNumber")}
              />
              <Field label="So CCCD/CMND dai dien *" value={form.identityNumber} onChange={setField("identityNumber")} inputMode="numeric" />
            </div>
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Thong tin ngan hang</h2>
            <p className="mt-1 text-sm text-gray-500">Thong tin doi soat doanh thu va thanh toan cho cua hang.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Field label="Ngan hang *" value={form.bankName} onChange={setField("bankName")} />
              <Field label="Chu tai khoan *" value={form.bankAccountName} onChange={setField("bankAccountName")} />
              <Field
                label="So tai khoan *"
                value={form.bankAccountNumber}
                onChange={setField("bankAccountNumber")}
                inputMode="numeric"
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Anh xac minh va nhan dien</h2>
            <p className="mt-1 text-sm text-gray-500">Tai lai anh moi bat ky luc nao neu can cap nhat ho so.</p>
            <div className="mt-5 space-y-4">
              {IMAGE_FIELDS.map((item) => (
                <UploadCard
                  key={item.key}
                  label={item.label}
                  hint={item.hint}
                  value={form[item.key]}
                  uploading={uploadingField === item.key}
                  onFileChange={handleUpload(item.key)}
                />
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Luu y van hanh</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <p>• Ten shop, dia chi va thong tin lien he nen giong voi du lieu cong khai tren san.</p>
              <p>• Neu doi giay phep hoac CCCD, hay cap nhat lai anh tai day de tranh bi tre duyet san pham.</p>
              <p>• Tai khoan ngan hang nen trung voi nguoi dai dien hoac phap nhan da dang ky.</p>
              <p>• Sau khi luu, admin co the doi chieu lai ho so neu cua hang co thay doi lon.</p>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Thong tin cap nhat</h2>
            <div className="mt-4 space-y-3 text-sm">
              <MetaStack label="Trang thai hien tai" value={statusMeta.description} />
              <MetaStack label="Tao ho so luc" value={formatDateTime(shop.createdAt)} />
              <MetaStack label="Cap nhat lan cuoi" value={formatDateTime(shop.updatedAt)} />
            </div>
          </section>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 rounded-3xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">Luu lai toan bo ho so seller sau khi da cap nhat thong tin va anh xac minh.</p>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || uploadingField !== ""}
            className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-brand-dark disabled:opacity-50"
          >
            {saving ? "Dang luu..." : "Luu ho so cua hang"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/15 px-4 py-3 text-white backdrop-blur-sm">
      <p className="text-xs uppercase tracking-wide text-white/75">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

function MetaStack({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-sm text-gray-800">{value}</p>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <input
        {...props}
        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand/40"
      />
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">{value}</div>
    </div>
  );
}

function TextArea({ label, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <textarea
        {...props}
        className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand/40"
      />
    </div>
  );
}

function UploadCard({ label, hint, value, uploading, onFileChange }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-800">{label}</p>
          <p className="mt-1 text-xs text-gray-500">{hint}</p>
        </div>
        <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
          <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          {uploading ? "Dang tai..." : "Tai anh"}
        </label>
      </div>

      {value ? (
        <div className="mt-4 space-y-2">
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
            <img src={value} alt={label} className="h-40 w-full object-cover" />
          </div>
          <a href={value} target="_blank" rel="noreferrer" className="inline-block text-xs font-medium text-brand-dark hover:underline">
            Xem anh goc
          </a>
        </div>
      ) : (
        <p className="mt-4 text-xs text-gray-400">Chua co anh.</p>
      )}
    </div>
  );
}
