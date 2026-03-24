"use client";

export const CART_STORAGE_KEY = "cart";
export const CHECKOUT_STORAGE_KEY = "checkoutCart";
export const CART_UPDATED_EVENT = "foodrescue:cart-updated";

function isBrowser() {
  return typeof window !== "undefined";
}

function dispatchCartUpdated(items) {
  if (!isBrowser()) return;
  window.dispatchEvent(
    new CustomEvent(CART_UPDATED_EVENT, {
      detail: {
        items,
        count: getCartQuantityCount(items),
      },
    }),
  );
}

export function normalizeCartItem(item) {
  if (!item || item.variantId == null) return null;

  const price = Number(item.price ?? item.discountPrice ?? item.originalPrice ?? 0);
  const originalPrice = Number(item.originalPrice ?? item.price ?? price);
  const quantity = Math.max(1, Number(item.quantity ?? 1));

  return {
    id: String(item.variantId),
    variantId: Number(item.variantId),
    productId: item.productId != null ? Number(item.productId) : null,
    name: item.name || "San pham",
    variantName: item.variantName || "",
    image: item.image || "/images/products/raucai.jpg",
    price,
    originalPrice,
    unit: item.unit || "",
    storeName: item.storeName || "FoodRescue Store",
    quantity,
    maxQty: item.maxQty != null ? Number(item.maxQty) : null,
    selected: item.selected !== false,
  };
}

export function readCart() {
  if (!isBrowser()) return [];
  try {
    const raw = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.map(normalizeCartItem).filter(Boolean);
  } catch {
    return [];
  }
}

export function writeCart(items) {
  if (!isBrowser()) return [];
  const normalized = items.map(normalizeCartItem).filter(Boolean);
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalized));
  dispatchCartUpdated(normalized);
  return normalized;
}

export function clearCart() {
  return writeCart([]);
}

export function addItemToCart(item) {
  const nextItem = normalizeCartItem({ ...item, selected: true });
  if (!nextItem) return readCart();

  const cart = readCart();
  const existing = cart.find((cartItem) => cartItem.variantId === nextItem.variantId);

  if (existing) {
    const nextQty = existing.maxQty != null
      ? Math.min(existing.maxQty, existing.quantity + nextItem.quantity)
      : existing.quantity + nextItem.quantity;
    existing.quantity = nextQty;
    existing.price = nextItem.price;
    existing.originalPrice = nextItem.originalPrice;
    existing.image = nextItem.image;
    existing.name = nextItem.name;
    existing.variantName = nextItem.variantName;
    existing.unit = nextItem.unit;
    existing.storeName = nextItem.storeName;
    existing.maxQty = nextItem.maxQty;
    existing.selected = true;
    return writeCart(cart);
  }

  cart.push(nextItem);
  return writeCart(cart);
}

export function updateCartItem(variantId, updater) {
  const cart = readCart();
  const next = cart.map((item) => {
    if (item.variantId !== Number(variantId)) return item;
    const patch = typeof updater === "function" ? updater(item) : updater;
    return normalizeCartItem({ ...item, ...patch });
  });
  return writeCart(next);
}

export function removeCartItem(variantId) {
  const next = readCart().filter((item) => item.variantId !== Number(variantId));
  return writeCart(next);
}

export function removeCartItems(variantIds) {
  const idSet = new Set(variantIds.map((value) => Number(value)));
  const next = readCart().filter((item) => !idSet.has(item.variantId));
  return writeCart(next);
}

export function getCartQuantityCount(items = readCart()) {
  return items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

export function groupCartItemsByStore(items = readCart()) {
  const groups = new Map();
  items.forEach((item) => {
    const key = item.storeName || "FoodRescue Store";
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(item);
  });
  return Array.from(groups.entries()).map(([storeName, storeItems]) => ({
    storeName,
    items: storeItems,
  }));
}

export function getSelectedCartItems(items = readCart()) {
  return items.filter((item) => item.selected);
}

export function writeCheckoutCart(items) {
  if (!isBrowser()) return [];
  const normalized = items.map(normalizeCartItem).filter(Boolean);
  localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function startDirectCheckout(item) {
  if (!isBrowser()) return [];
  const normalized = normalizeCartItem({ ...item, selected: true });
  if (!normalized) return [];
  localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify([normalized]));
  return [normalized];
}

export function readCheckoutCart() {
  if (!isBrowser()) return [];
  try {
    const raw = JSON.parse(localStorage.getItem(CHECKOUT_STORAGE_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.map(normalizeCartItem).filter(Boolean);
  } catch {
    return [];
  }
}

export function clearCheckoutCart() {
  if (!isBrowser()) return;
  localStorage.removeItem(CHECKOUT_STORAGE_KEY);
}

export function getCheckoutItems() {
  const checkoutItems = readCheckoutCart();
  if (checkoutItems.length > 0) {
    return checkoutItems;
  }
  return getSelectedCartItems(readCart());
}

export function removeCheckoutItemsFromCart(items) {
  const variantIds = items.map((item) => item.variantId);
  removeCartItems(variantIds);
  clearCheckoutCart();
}
