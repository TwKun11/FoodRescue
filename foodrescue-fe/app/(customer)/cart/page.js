"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CartItem from "@/components/customer/CartItem";
import {
  CART_UPDATED_EVENT,
  clearCart,
  clearCheckoutCart,
  getSelectedCartItems,
  groupCartItemsByStore,
  readCart,
  removeCartItem,
  removeCartItems,
  updateCartItem,
  writeCart,
  writeCheckoutCart,
} from "@/lib/cart";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN") + " đồng";
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const syncCart = () => {
      setItems(readCart());
    };

    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener(CART_UPDATED_EVENT, syncCart);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener(CART_UPDATED_EVENT, syncCart);
    };
  }, []);

  const groupedItems = groupCartItemsByStore(items);
  const selectedItems = getSelectedCartItems(items);
  const totalItems = items.length;
  const selectedLineCount = selectedItems.length;
  const selectedQtyCount = selectedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const allSelected = totalItems > 0 && selectedLineCount === totalItems;
  const subtotal = selectedItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  const originalTotal = selectedItems.reduce(
    (sum, item) => sum + Number(item.originalPrice || item.price || 0) * Number(item.quantity || 0),
    0,
  );
  const savings = Math.max(0, originalTotal - subtotal);

  const syncState = (nextItems) => {
    setItems(nextItems);
  };

  const handleToggleItem = (variantId) => {
    syncState(
      updateCartItem(variantId, (item) => ({
        selected: !item.selected,
      })),
    );
  };

  const handleToggleStore = (storeName) => {
    const storeItems = items.filter((item) => item.storeName === storeName);
    const shouldSelect = storeItems.some((item) => !item.selected);
    const nextItems = items.map((item) =>
      item.storeName === storeName
        ? {
            ...item,
            selected: shouldSelect,
          }
        : item,
    );
    syncState(writeCart(nextItems));
  };

  const handleToggleAll = () => {
    const shouldSelect = !allSelected;
    syncState(
      writeCart(
        items.map((item) => ({
          ...item,
          selected: shouldSelect,
        })),
      ),
    );
  };

  const handleQtyChange = (variantId, quantity, maxQty) => {
    syncState(
      updateCartItem(variantId, {
        quantity,
        maxQty,
      }),
    );
  };

  const handleRemoveItem = (variantId) => {
    syncState(removeCartItem(variantId));
  };

  const handleRemoveSelected = () => {
    if (selectedItems.length === 0) return;
    syncState(removeCartItems(selectedItems.map((item) => item.variantId)));
    clearCheckoutCart();
  };

  const handleClearAll = () => {
    syncState(clearCart());
    clearCheckoutCart();
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      window.alert("Chọn ít nhất 1 sản phẩm để thanh toán.");
      return;
    }
    writeCheckoutCart(selectedItems);
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Giỏ hàng</h1>
            <p className="mt-1 text-sm text-gray-500">
              Chọn sản phẩm theo từng shop, gom đơn và thanh toán phần muốn mua.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-white px-3 py-1.5 text-gray-600 shadow-sm">
              {totalItems} dòng sản phẩm
            </span>
            <span className="rounded-full bg-brand/20 px-3 py-1.5 font-medium text-brand-dark">
              {selectedLineCount} dòng đang chọn
            </span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand/20">
              <svg className="h-10 w-10 text-brand-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293A1 1 0 005.414 17H17m0 0a2 2 0 110 4 2 2 0 010-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-800">Giỏ hàng đang trống</p>
            <p className="mt-2 text-sm text-gray-500">
              Thêm vài món sắp hết hạn để tạo đơn và giảm lãng phí thực phẩm.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-brand px-5 py-3 text-sm font-medium text-gray-900 transition hover:bg-brand-dark"
            >
              Đi sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-3 text-sm font-medium text-gray-800">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleToggleAll}
                    className="h-4 w-4 rounded accent-brand-dark"
                  />
                  Chọn tất cả ({totalItems})
                </label>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <button
                    type="button"
                    onClick={handleRemoveSelected}
                    className="font-medium text-red-500 transition hover:text-red-600"
                  >
                    Xóa đã chọn
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="font-medium text-gray-500 transition hover:text-gray-700"
                  >
                    Xóa tất cả
                  </button>
                </div>
              </div>

              {groupedItems.map((group) => {
                const storeSelected = group.items.every((item) => item.selected);
                const storeQty = group.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
                const storeTotal = group.items.reduce(
                  (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
                  0,
                );

                return (
                  <section
                    key={group.storeName}
                    className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                  >
                    <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <label className="flex items-center gap-3 text-sm font-semibold text-gray-800">
                        <input
                          type="checkbox"
                          checked={storeSelected}
                          onChange={() => handleToggleStore(group.storeName)}
                          className="h-4 w-4 rounded accent-brand-dark"
                        />
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand/20 text-brand-dark">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 7h18M5 7l1 11a2 2 0 002 2h8a2 2 0 002-2l1-11M9 7V5a3 3 0 016 0v2"
                            />
                          </svg>
                        </span>
                        {group.storeName}
                      </label>

                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <span>{group.items.length} sản phẩm</span>
                        <span>{storeQty} số lượng</span>
                        <span>{formatCurrency(storeTotal)}</span>
                      </div>
                    </div>

                    <div className="space-y-3 p-4">
                      {group.items.map((item) => (
                        <CartItem
                          key={item.variantId}
                          item={item}
                          onToggle={handleToggleItem}
                          onRemove={handleRemoveItem}
                          onQtyChange={handleQtyChange}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>

            <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-sm xl:sticky xl:top-24">
              <h2 className="border-b border-gray-100 pb-3 text-lg font-bold text-gray-800">Tóm tắt đơn hàng</h2>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Sản phẩm đã chọn</span>
                  <span className="font-medium text-gray-800">
                    {selectedLineCount} dòng / {selectedQtyCount} số lượng
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-medium text-gray-800">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-brand-dark">
                  <span>Tiết kiệm</span>
                  <span className="font-medium">-{formatCurrency(savings)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-bold text-gray-900">
                  <span>Tổng thanh toán</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={selectedItems.length === 0}
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                Mua hàng ({selectedLineCount})
              </button>

              <Link
                href="/products"
                className="mt-3 flex items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Thêm sản phẩm
              </Link>

              <div className="mt-5 rounded-2xl bg-brand-bg p-4 text-xs text-gray-500">
                <p className="font-semibold text-gray-700">Cách dùng nhanh</p>
                <p className="mt-2">
                  Chọn theo từng shop để checkout như marketplace. Các món không chọn sẽ được giữ lại trong giỏ.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
