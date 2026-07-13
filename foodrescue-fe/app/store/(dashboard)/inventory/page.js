"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ensureAuthSession,
  apiSellerGetBatches,
  apiSellerAddBatch,
  apiSellerGetProducts,
} from "@/lib/api";
function genBatchCode() {
  return `BATCH-${Date.now().toString(36).toUpperCase()}`;
}

const EMPTY_BATCH = {
  variantId: "",
  batchCode: genBatchCode(),
  supplierName: "",
  receivedAt: new Date().toISOString().slice(0, 16),
  manufacturedAt: "",
  expiredAt: "",
  costPrice: "",
  quantityReceived: "",
  note: "",
};

const PAGE_SIZE = 10;

// ── SVG Icons ─────────────────────────────────────────────────────────────
const IconFire = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 2c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm0 2a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H8a1 1 0 110-2h3V7a1 1 0 011-1z" />
  </svg>
);

const IconAlertTriangle = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2L1 21h22L12 2zm0 3.46L19.65 19H4.35L12 5.46zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z" />
  </svg>
);

const IconClock = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const IconCheckCircle = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const IconPackage = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10m0-10l8 4m0 0v10l-8 4m0-10l-8-4"
    />
  </svg>
);

const IconTrendingDown = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13 17H3v-2h10V7l4 4-4 4v-2z"
    />
  </svg>
);

// ── Urgency Calculation ────────────────────────────────────────────────────
function getUrgencyLevel(batch) {
  const daysLeft = daysUntil(batch.expiredAt);
  const available = Number(batch.quantityAvailable) || 0;
  const received = Number(batch.quantityReceived) || 0;

  if (daysLeft === null) return "normal";
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 1) return "urgent";
  if (daysLeft >= 2 && daysLeft <= 3) return "expiring";
  if (daysLeft >= 4 && daysLeft <= 7) return "soon";

  // Slow-moving: >7 days and consumption <50%
  const consumption =
    received > 0 ? ((received - available) / received) * 100 : 0;
  if (daysLeft > 7 && consumption < 50) return "slow";

  return "normal";
}

function calculateConsumption(batch) {
  const available = Number(batch.quantityAvailable) || 0;
  const received = Number(batch.quantityReceived) || 0;
  if (received <= 0) return 0;
  return Math.round(((received - available) / received) * 100);
}

function fmt(n) {
  if (n == null) return "-";
  return Number(n).toLocaleString("vi-VN");
}

function fmtMoney(n) {
  if (n == null) return "-";
  return Number(n).toLocaleString("vi-VN") + "đ";
}

function fmtDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function daysUntil(isoDate) {
  if (!isoDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(isoDate);
  exp.setHours(0, 0, 0, 0);
  return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
}

function getBatchSortTime(batch) {
  return new Date(batch?.receivedAt || batch?.createdAt || 0).getTime();
}

function sortBatchesNewestFirst(items) {
  return [...items].sort(
    (left, right) => getBatchSortTime(right) - getBatchSortTime(left),
  );
}

export default function InventoryPage() {
  const router = useRouter();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Add-batch modal
  const [showModal, setShowModal] = useState(false);
  const [batchForm, setBatchForm] = useState(EMPTY_BATCH);
  const [variants, setVariants] = useState([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Map variantId -> productName
  const [variantMap, setVariantMap] = useState({});

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([apiSellerGetBatches(), apiSellerGetProducts({ size: 500 })])
      .then(([batchRes, productRes]) => {
        // Build variant map
        if (productRes.ok && productRes.data?.data) {
          const products = productRes.data.data.content ?? productRes.data.data;
          const map = {};
          products.forEach((p) => {
            (p.variants || []).forEach((v) => {
              map[v.id] = p.name;
            });
          });
          setVariantMap(map);
        }

        // Set batches
        if (batchRes.ok && batchRes.data?.data) {
          const d = batchRes.data.data;
          const batchList = Array.isArray(d) ? d : d.content || [];
          setBatches(sortBatchesNewestFirst(batchList));
        } else if (batchRes.status === 401) {
          router.replace("/login");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    ensureAuthSession().then((session) => {
      if (cancelled) return;
      if (!session.ok) {
        router.replace("/login");
        return;
      }
      load();
    });

    return () => {
      cancelled = true;
    };
  }, [load, router]);

  const openModal = useCallback(async () => {
    setBatchForm({ ...EMPTY_BATCH, batchCode: genBatchCode() });
    setFormError("");
    setShowModal(true);
    if (variants.length === 0) {
      setVariantsLoading(true);
      const res = await apiSellerGetProducts({ size: 200 });
      if (res.ok && res.data?.data) {
        const products = res.data.data.content ?? res.data.data;
        const flat = [];
        products.forEach((p) => {
          (p.variants || []).forEach((v) => {
            flat.push({
              id: v.id,
              label: `${p.name} - ${v.name || v.variantCode} (${v.unit || ""})`,
            });
          });
        });
        setVariants(flat);
      }
      setVariantsLoading(false);
    }
  }, [variants.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!batchForm.variantId) {
      setFormError("Vui lòng chọn biến thể sản phẩm");
      return;
    }
    if (!batchForm.costPrice || Number(batchForm.costPrice) < 0) {
      setFormError("Nhập giá vốn hợp lý");
      return;
    }
    if (
      !batchForm.quantityReceived ||
      Number(batchForm.quantityReceived) <= 0
    ) {
        setFormError("Số lượng nhập phải > 0");
      return;
    }

    const toDateTime = (v) => (v ? (v.length === 16 ? v + ":00" : v) : null);

    const payload = {
      variantId: Number(batchForm.variantId),
      batchCode: batchForm.batchCode.trim(),
      supplierName: batchForm.supplierName.trim() || null,
      receivedAt: toDateTime(batchForm.receivedAt),
      manufacturedAt: toDateTime(batchForm.manufacturedAt) || null,
      expiredAt: toDateTime(batchForm.expiredAt) || null,
      costPrice: Number(batchForm.costPrice),
      quantityReceived: Number(batchForm.quantityReceived),
      note: batchForm.note.trim() || null,
    };

    setSubmitting(true);
    const res = await apiSellerAddBatch(payload);
    setSubmitting(false);
    if (res.ok) {
      setShowModal(false);
      load();
    } else {
      setFormError(res.data?.message || "Nhập liệu thất bại, vui lòng thử lại");
    }
  };

  // ── Tab Filtering ──
  const filtered = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return batches.filter((batch) => {
      const urgency = getUrgencyLevel(batch);

      if (
        selectedTab === "urgent" &&
        urgency !== "expired" &&
        urgency !== "urgent"
      )
        return false;
      if (
        selectedTab === "normal" &&
        !["normal", "soon", "expiring"].includes(urgency)
      )
        return false;
      if (selectedTab === "depleted" && Number(batch.quantityAvailable) > 0)
        return false;

      if (normalizedKeyword) {
        const productName = variantMap[batch.variantId] || "";
        if (
          !batch.batchCode?.toLowerCase().includes(normalizedKeyword) &&
          !productName.toLowerCase().includes(normalizedKeyword) &&
          !batch.variantName?.toLowerCase().includes(normalizedKeyword) &&
          !batch.supplierName?.toLowerCase().includes(normalizedKeyword)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [batches, keyword, selectedTab, variantMap]);

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedBatches = useMemo(
    () => filtered.slice(pageStart, pageStart + PAGE_SIZE),
    [filtered, pageStart],
  );
  const paginationItems = useMemo(() => {
    if (totalPages <= 1) return [1];

    const pages = [];
    for (let page = 1; page <= totalPages; page += 1) {
      const isEdge = page === 1 || page === totalPages;
      const isNearCurrent = Math.abs(page - safeCurrentPage) <= 1;
      if (isEdge || isNearCurrent) {
        pages.push(page);
      }
    }

    return pages.reduce((acc, page) => {
      if (acc.length > 0 && page - acc[acc.length - 1] > 1) {
        acc.push("ellipsis");
      }
      acc.push(page);
      return acc;
    }, []);
  }, [safeCurrentPage, totalPages]);

  // ── Stats ──
  const stats = {
    total: batches.length,
    urgent: batches.filter((b) => {
      const u = getUrgencyLevel(b);
      return u === "expired" || u === "urgent";
    }).length,
    normal: batches.filter((b) => {
      const u = getUrgencyLevel(b);
      return ["normal", "soon", "expiring"].includes(u);
    }).length,
    depleted: batches.filter((b) => Number(b.quantityAvailable) <= 0).length,
  };

  // ── Tab Config ──
  const tabs = [
    { id: "all", label: "Tất cả", count: stats.total },
    {
      id: "urgent",
      label: "Cần xử lý ngay",
      count: stats.urgent,
      highlight: true,
    },
    { id: "normal", label: "Bình thường", count: stats.normal },
    { id: "depleted", label: "Hết hàng", count: stats.depleted },
  ];

  const setTabAndResetPage = (tab) => {
    setSelectedTab(tab);
    setCurrentPage(1);
  };

  // ── Urgency UI ──
  const getUrgencyUI = (batch) => {
    const urgency = getUrgencyLevel(batch);
    const daysLeft = daysUntil(batch.expiredAt);

    const config = {
      expired: {
        color: "bg-red-50 text-red-700",
        label: "Hết hạn",
        icon: <IconAlertTriangle />,
        rowBg: "bg-red-50/50",
      },
      urgent: {
        color: "bg-orange-50 text-orange-700",
        label: `${daysLeft}d cảnh báo`,
        icon: <IconFire />,
        rowBg: "bg-orange-50/50",
      },
      expiring: {
        color: "bg-yellow-50 text-yellow-700",
        label: `${daysLeft}d sắp hết`,
        icon: <IconClock />,
        rowBg: "bg-yellow-50/50",
      },
      soon: {
        color: "bg-blue-50 text-blue-700",
        label: `${daysLeft}d giám sát`,
        icon: <IconClock />,
        rowBg: "bg-gray-50/30",
      },
      slow: {
        color: "bg-indigo-50 text-indigo-700",
        label: "Tiêu thụ chậm",
        icon: <IconTrendingDown />,
        rowBg: "bg-gray-50/30",
      },
      normal: {
        color: "bg-brand-bg text-brand-dark",
        label: "Bình thường",
        icon: <IconCheckCircle />,
        rowBg: "bg-white",
      },
    };

    return config[urgency] || config.normal;
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* ════ HEADER ════ */}
      <div
        className="flex flex-wrap items-center justify-between gap-4"
        data-guide-title="Trang kho hàng"
        data-guide-text="Quản lý lô hàng, hạn dùng, số lượng còn lại và các sản phẩm cần xử lý gấp."
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Kho hàng
          </h1>
        </div>
        <button
          data-guide-title="Nhập lô hàng"
          data-guide-text="Mở biểu mẫu để thêm tồn kho cho một biến thể sản phẩm, gồm giá vốn, số lượng, nhà cung cấp, ngày nhập và hạn dùng."
          onClick={openModal}
          className="bg-brand hover:bg-brand-secondary text-gray-900 font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Nhập lô hàng
        </button>
      </div>

      {/* ════ STATS CARDS ════ */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        data-guide-title="Tổng quan tồn kho"
        data-guide-text="Các thẻ tóm tắt tổng số lô, lô cần xử lý gấp, lô ổn định và lô đã hết hàng."
      >
        {[
          {
            label: "Tổng lô",
            value: stats.total,
            icon: "📦",
            color: "bg-blue-50 text-blue-700",
          },
          {
            label: "Cấp độ cảnh báo",
            value: stats.urgent,
            icon: "⚠️",
            color: "bg-red-50 text-red-700",
            highlight: true,
          },
          {
            label: "Bình thường",
            value: stats.normal,
            icon: "✅",
            color: "bg-brand-bg text-brand-dark",
          },
          {
            label: "Hết hàng",
            value: stats.depleted,
            icon: "❌",
            color: "bg-gray-100 text-gray-700",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex flex-col gap-1 ${s.highlight ? "ring-2 ring-offset-2 ring-red-300 bg-red-50/30" : "bg-white"}`}
          >
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color.split(" ")[1]}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ════ TABS ════ */}
      <div
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-1 inline-flex gap-1"
        data-guide-title="Lọc mức ưu tiên"
        data-guide-text="Lọc nhanh lô cần xử lý ngay, lô đang ổn định hoặc lô đã hết hàng."
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTabAndResetPage(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 ${
              selectedTab === tab.id
                ? "bg-brand text-gray-900 shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            } ${tab.highlight && selectedTab === tab.id ? "ring-2 ring-red-400 ring-offset-1" : ""}`}
          >
            {tab.label}
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                selectedTab === tab.id
                  ? "bg-gray-900/20 text-gray-900"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ════ FILTERS ════ */}
      <div
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center"
        data-guide-title="Tìm kiếm lô hàng"
        data-guide-text="Tìm theo mã lô, tên sản phẩm, biến thể hoặc nhà cung cấp. Dùng nút làm mới khi cần tải lại dữ liệu mới nhất."
      >
        <div className="flex-1 min-w-56">
          <input
            type="text"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm mã lô, sản phẩm, nhà cung cấp..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
          />
        </div>
        <button
          onClick={load}
          className="bg-brand hover:bg-brand-secondary text-gray-900 font-medium px-4 py-2 rounded-lg transition text-sm"
        >
          Làm mới
        </button>
      </div>

      {/* ════ TABLE ════ */}
      <div
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
        data-guide-title="Bảng lô hàng"
        data-guide-text="Xem mã lô, sản phẩm, nhà cung cấp, số lượng nhập/còn lại, mức tiêu thụ, chi phí, hạn dùng và trạng thái cảnh báo."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                  Mã lô
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                  Sản phẩm
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                  NCC
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                  Nhập/Còn
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                  Tiêu thụ %
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                  Giá vốn
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                  Hạn sử dụng
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400">
                    Đang tải...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400">
                    Không có lô hàng nào
                  </td>
                </tr>
              ) : (
                paginatedBatches.map((b) => {
                  const ui = getUrgencyUI(b);
                  const consumption = calculateConsumption(b);
                  const daysLeft = daysUntil(b.expiredAt);

                  return (
                    <tr
                      key={b.id}
                      className={`hover:bg-gray-50 transition ${ui.rowBg}`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-600 font-semibold">
                        {b.batchCode}
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-900">
                            {variantMap[b.variantId] || "-"}
                          </p>
                          {b.variantName && (
                            <p className="text-xs text-gray-500">
                              {b.variantName}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {b.supplierName || "-"}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 font-medium">
                        {fmt(b.quantityReceived)} / {fmt(b.quantityAvailable)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-20">
                            <div
                              className={`h-full transition ${
                                consumption >= 80
                                  ? "bg-green-500"
                                  : consumption >= 50
                                    ? "bg-yellow-500"
                                    : "bg-gray-300"
                              }`}
                              style={{ width: `${consumption}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-700 w-8 text-right">
                            {consumption}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 font-medium">
                        {fmtMoney(b.costPrice)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="space-y-0.5">
                          <div className="text-gray-600">
                            <span className="text-gray-400">Nhập:</span>{" "}
                            {fmtDate(b.receivedAt)}
                          </div>
                          {b.expiredAt ? (
                            <div
                              className={`font-semibold ${daysLeft && daysLeft < 0 ? "text-red-600" : "text-gray-600"}`}
                            >
                              <span className="text-gray-400">Hết:</span>{" "}
                              {fmtDate(b.expiredAt)}
                              {daysLeft !== null && (
                                <span
                                  className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                                    daysLeft < 0
                                      ? "bg-red-100 text-red-700"
                                      : daysLeft <= 1
                                        ? "bg-orange-100 text-orange-700"
                                        : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {daysLeft < 0 ? "hết hạn" : `${daysLeft} ngày`}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="text-gray-400 text-sm">
                              Chưa có hạn sử dụng
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium text-xs ${ui.color}`}
                        >
                          <span>{ui.icon}</span>
                          {ui.label}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ════ PAGINATION ════ */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              Hiển thị <span className="font-semibold">{pageStart + 1}</span>
              {" - "}
              <span className="font-semibold">
                {Math.min(pageStart + paginatedBatches.length, totalFiltered)}
              </span>
              {" / "}
              <span className="font-semibold">{totalFiltered}</span> lô
              <span className="text-gray-400 ml-2">
                Trang {safeCurrentPage}/{totalPages}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-brand-bg transition disabled:opacity-40 disabled:pointer-events-none"
              >
                ←
              </button>
              {paginationItems.map((item, index) =>
                item === "ellipsis" ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-1 text-sm text-gray-400"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setCurrentPage(item)}
                    className={`min-w-9 h-9 rounded-lg px-2 text-sm font-semibold transition ${
                      item === safeCurrentPage
                        ? "bg-brand text-gray-900 shadow-sm"
                        : "border border-gray-200 text-gray-600 hover:bg-brand-bg"
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}
              <button
                disabled={safeCurrentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-brand-bg transition disabled:opacity-40 disabled:pointer-events-none"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ════ ADD BATCH MODAL ════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            data-guide-title="Biểu mẫu lô hàng"
            data-guide-text="Chọn biến thể, mã lô, chi phí, số lượng, ngày nhập và hạn dùng để tạo tồn kho mới."
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900 text-lg">
                Nhập lô hàng mới
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Variant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Biến thể sản phẩm *
                </label>
                {variantsLoading ? (
                  <p className="text-sm text-gray-400">Đang tải danh sách...</p>
                ) : (
                  <select
                    value={batchForm.variantId}
                    onChange={(e) =>
                      setBatchForm((p) => ({ ...p, variantId: e.target.value }))
                    }
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark bg-white"
                  >
                    <option value="">-- Chọn biến thể --</option>
                    {variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Batch Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mã lô hàng *
                </label>
                <input
                  type="text"
                  value={batchForm.batchCode}
                  onChange={(e) =>
                    setBatchForm((p) => ({ ...p, batchCode: e.target.value }))
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Cost Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Giá vốn (đơn vị) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={batchForm.costPrice}
                    onChange={(e) =>
                      setBatchForm((p) => ({ ...p, costPrice: e.target.value }))
                    }
                    required
                    placeholder="25000"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                  />
                </div>
                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Số lượng nhập *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={batchForm.quantityReceived}
                    onChange={(e) =>
                      setBatchForm((p) => ({
                        ...p,
                        quantityReceived: e.target.value,
                      }))
                    }
                    required
                    placeholder="100"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                  />
                </div>
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nhà cung cấp
                </label>
                <input
                  type="text"
                  value={batchForm.supplierName}
                  onChange={(e) =>
                    setBatchForm((p) => ({
                      ...p,
                      supplierName: e.target.value,
                    }))
                  }
                  placeholder="Tên nhà cung cấp..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Received At */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Ngày nhập kho *
                  </label>
                  <input
                    type="datetime-local"
                    value={batchForm.receivedAt}
                    onChange={(e) =>
                      setBatchForm((p) => ({
                        ...p,
                        receivedAt: e.target.value,
                      }))
                    }
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                  />
                </div>
                {/* Manufactured At */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Ngày sản xuất
                  </label>
                  <input
                    type="datetime-local"
                    value={batchForm.manufacturedAt}
                    onChange={(e) =>
                      setBatchForm((p) => ({
                        ...p,
                        manufacturedAt: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                  />
                </div>
              </div>

              {/* Expired At */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Hạn sử dụng
                </label>
                <input
                  type="datetime-local"
                  value={batchForm.expiredAt}
                  onChange={(e) =>
                    setBatchForm((p) => ({ ...p, expiredAt: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  VD: nhập 24/03/2026, hết hạn 26/03/2026
                </p>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Ghi chú
                </label>
                <textarea
                  rows={2}
                  value={batchForm.note}
                  onChange={(e) =>
                    setBatchForm((p) => ({ ...p, note: e.target.value }))
                  }
                  placeholder="Ghi chú thêm về lô hàng..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark resize-none"
                />
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-semibold bg-brand hover:bg-brand-secondary text-gray-900 rounded-lg transition disabled:opacity-60"
                >
                  {submitting ? "Đang lưu..." : "Nhập kho"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
