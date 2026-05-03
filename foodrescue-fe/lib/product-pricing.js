export function resolveVariantPricing(variant = {}) {
  const rawListPrice = Number(variant?.listPrice ?? 0);
  const rawSalePrice = Number(variant?.salePrice ?? 0);

  const hasListPrice = Number.isFinite(rawListPrice) && rawListPrice > 0;
  const hasSalePrice = Number.isFinite(rawSalePrice) && rawSalePrice > 0;

  const discountPrice = hasSalePrice ? rawSalePrice : hasListPrice ? rawListPrice : 0;
  const originalPrice = hasListPrice ? rawListPrice : discountPrice;
  const hasDiscount = originalPrice > 0 && discountPrice > 0 && discountPrice < originalPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
    : 0;

  return {
    originalPrice,
    discountPrice,
    discountPercent,
  };
}
