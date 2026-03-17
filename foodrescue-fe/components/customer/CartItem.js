"use client";

import { useState } from "react";
import { apiGetVariantStock } from "@/lib/api";

export default function CartItem({ item, onToggle, onRemove, onQtyChange }) {
  const [stockLoading, setStockLoading] = useState(false);
  const [atLimit, setAtLimit] = useState(false);

  const quantity = Number(item?.quantity ?? 1);
  const price = Number(item?.price ?? item?.discountPrice ?? 0);
  const originalPrice = Number(item?.originalPrice ?? price);
  const lineTotal = price * quantity;
  const variantLabel = item?.variantName || item?.unit || "";
  const placeholder =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect fill='%23f6fffb' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%230faf74' font-size='24'%3E?%3C/text%3E%3C/svg%3E";

  const updateQuantity = async (delta) => {
    if (!onQtyChange) return;

    if (delta < 0) {
      onQtyChange(item.variantId, Math.max(1, quantity - 1), item.maxQty);
      return;
    }

    setStockLoading(true);
    setAtLimit(false);
    try {
      const res = await apiGetVariantStock(item.variantId);
      const liveStock =
        res.ok && res.data?.data != null ? Number(res.data.data) : Number(item.maxQty ?? Number.MAX_SAFE_INTEGER);
      const maxQty = Number.isFinite(liveStock) ? liveStock : Number.MAX_SAFE_INTEGER;
      const nextQty = Math.min(maxQty, quantity + 1);

      if (nextQty === quantity) {
        setAtLimit(true);
        setTimeout(() => setAtLimit(false), 2000);
        return;
      }

      onQtyChange(item.variantId, nextQty, maxQty);
    } catch {
      const fallbackMax = Number(item.maxQty ?? Number.MAX_SAFE_INTEGER);
      const nextQty = Math.min(fallbackMax, quantity + 1);
      if (nextQty === quantity) {
        setAtLimit(true);
        setTimeout(() => setAtLimit(false), 2000);
        return;
      }
      onQtyChange(item.variantId, nextQty, fallbackMax);
    } finally {
      setStockLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-3 sm:gap-4">
        <label className="pt-1">
          <input
            type="checkbox"
            checked={Boolean(item?.selected)}
            onChange={() => onToggle?.(item.variantId)}
            className="h-4 w-4 rounded accent-brand-dark"
            aria-label={`Chọn ${item?.name || "sản phẩm"}`}
          />
        </label>

        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-brand-bg sm:h-28 sm:w-28">
          <img
            src={item?.image || placeholder}
            alt={item?.name || "Sản phẩm"}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.src = placeholder;
            }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="line-clamp-2 font-semibold text-gray-800">{item?.name || "Sản phẩm"}</p>
              {variantLabel ? <p className="mt-1 text-xs text-gray-500">Phân loại: {variantLabel}</p> : null}
              <p className="mt-1 text-xs text-gray-500">{item?.storeName || "FoodRescue Store"}</p>
              {item?.maxQty != null ? <p className="mt-1 text-xs text-gray-400">Còn tối đa {item.maxQty} sản phẩm</p> : null}
            </div>

            <div className="text-left lg:text-right">
              <p className="text-base font-bold text-brand-dark">{price.toLocaleString("vi-VN")} đồng</p>
              {originalPrice > price ? (
                <p className="text-xs text-gray-400 line-through">{originalPrice.toLocaleString("vi-VN")} đồng</p>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50/60">
                <button
                  type="button"
                  onClick={() => updateQuantity(-1)}
                  disabled={quantity <= 1}
                  className="flex h-10 w-10 items-center justify-center text-gray-600 transition hover:bg-brand/20 hover:text-brand-dark disabled:opacity-40"
                  aria-label="Giảm số lượng"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="w-10 text-center text-sm font-semibold text-gray-800">{quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(1)}
                  disabled={stockLoading}
                  className="flex h-10 w-10 items-center justify-center text-gray-600 transition hover:bg-brand/20 hover:text-brand-dark disabled:opacity-40"
                  aria-label="Tăng số lượng"
                >
                  {stockLoading ? (
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </button>
              </div>
              {atLimit ? <p className="mt-1 text-xs font-medium text-red-500">Đã đạt giới hạn tồn kho</p> : null}
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <button
                type="button"
                onClick={() => onRemove?.(item.variantId)}
                className="text-sm font-medium text-red-500 transition hover:text-red-600"
              >
                Xóa
              </button>
              <p className="text-sm font-bold text-gray-900 sm:min-w-28 sm:text-right">{lineTotal.toLocaleString("vi-VN")} đồng</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
