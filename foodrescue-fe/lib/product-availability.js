"use client";

const DEAL_END_FIELDS = [
  "dealEndsAt",
  "dealEndAt",
  "dealEndTime",
  "discountEndsAt",
  "discountEndAt",
  "promotionEndsAt",
  "promotionEndAt",
  "offerEndsAt",
  "offerEndAt",
  "saleEndsAt",
  "saleEndAt",
  "expiryAt",
];

export function resolveDealEndsAt(product) {
  if (!product) return null;
  for (const field of DEAL_END_FIELDS) {
    if (product[field]) return product[field];
  }
  return null;
}

export function getDealEndTime(value) {
  if (!value) return null;
  const normalized = typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value)
    ? `${value}+07:00`
    : value;
  const time = new Date(normalized).getTime();
  return Number.isNaN(time) ? null : time;
}

export function isDealExpired(value, now = Date.now()) {
  const time = getDealEndTime(value);
  return time != null && time <= now;
}

function hasPurchasableStock(product) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  if (variants.length === 0) return false;

  return variants.some((variant) => {
    const status = String(variant.status || "active").toLowerCase();
    const stock = Number(variant.stockAvailable ?? variant.stockQuantity ?? 0);
    return status !== "inactive" && status !== "out_of_stock" && stock > 0;
  });
}

export function isProductPurchasable(product, now = Date.now()) {
  if (!product?.id) return false;

  const status = String(product.status || "").toLowerCase();
  if (status && status !== "active") return false;

  return !isDealExpired(resolveDealEndsAt(product), now) && hasPurchasableStock(product);
}

export function isMappedProductPurchasable(product, now = Date.now()) {
  if (!product?.id) return false;
  const stock = Number(product.stock ?? product.remaining ?? product.quantity ?? 0);
  return !isDealExpired(resolveDealEndsAt(product), now) && stock > 0;
}
