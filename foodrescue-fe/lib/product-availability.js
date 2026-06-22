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

export function isProductPurchasable(product, now = Date.now()) {
  if (!product?.id) return false;

  const status = String(product.status || "").toLowerCase();
  if (status && status !== "active") return false;

  return !isDealExpired(resolveDealEndsAt(product), now);
}

export function isMappedProductPurchasable(product, now = Date.now()) {
  if (!product?.id) return false;
  return !isDealExpired(resolveDealEndsAt(product), now);
}
