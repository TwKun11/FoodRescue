"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CountdownTimer from "@/components/customer/CountdownTimer";
import { CART_UPDATED_EVENT, readCart } from "@/lib/cart";
import { isDealExpired } from "@/lib/product-availability";

export default function ProductCardListing({ product, onAddToCart }) {
  const {
    id = "1",
    variantId = null,
    name = "Sản phẩm",
    image = "/images/products/raucai.jpg",
    originalPrice = 0,
    discountPrice = 0,
    discountPercent = 0,
    expiryLabel = "",
    expiryAt = null,
    shelfLifeLabel = "",
    storeName = "",
    address = "",
    province = "",
    distanceLabel = "",
    rating = 0,
    stock = null,
  } = product ?? {};

  const cityLabel = province || address || storeName || "";
  const offerLabel = expiryAt ? "Ưu đãi kết thúc sau" : expiryLabel;
  const isExpired = isDealExpired(expiryAt);
  const isOutOfStock = stock === 0 || isExpired;
  const hasExpiry = !!expiryAt;
  const displayRating = Number(rating) || 0;
  const [cartQuantity, setCartQuantity] = useState(0);

  useEffect(() => {
    if (variantId == null) {
      setCartQuantity(0);
      return;
    }

    const syncCartQuantity = () => {
      const cartItem = readCart().find((item) => item.variantId === Number(variantId));
      setCartQuantity(Number(cartItem?.quantity || 0));
    };

    syncCartQuantity();
    window.addEventListener(CART_UPDATED_EVENT, syncCartQuantity);
    window.addEventListener("storage", syncCartQuantity);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, syncCartQuantity);
      window.removeEventListener("storage", syncCartQuantity);
    };
  }, [variantId]);

  const formatPrice = (n) => `${Number(n).toLocaleString("vi-VN")} đồng`;

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isOutOfStock) return;

    if (typeof onAddToCart === "function") {
      const nextCart = onAddToCart(product);
      if (Array.isArray(nextCart) && variantId != null) {
        const nextItem = nextCart.find((item) => item.variantId === Number(variantId));
        setCartQuantity(Number(nextItem?.quantity || 0));
      }
    } else {
      window.location.href = `/products/${id}`;
    }
  };

  const cardBody = (
    <>
      <div className="relative w-full aspect-square">
        <img
          src={image}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src = "https://placehold.co/400x400/e5f8ec/0faf74?text=Ảnh";
          }}
        />
        <div className="absolute left-3 top-3">
          {isOutOfStock ? (
            <span className="rounded-full bg-slate-600 px-3 py-1 text-[10px] font-bold text-white shadow-lg">
              {isExpired ? "HẾT ƯU ĐÃI" : "HẾT HÀNG"}
            </span>
          ) : discountPercent > 0 ? (
            <span className="inline-flex min-w-16 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-orange-500 to-amber-400 px-3 py-2 text-white shadow-xl shadow-red-900/30 ring-2 ring-white/90">
              <span className="text-[9px] font-black uppercase leading-none tracking-wide">Giảm</span>
              <span className="text-lg font-black leading-none">-{discountPercent}%</span>
            </span>
          ) : null}
        </div>
      </div>
    </>
  );

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 dark:border-slate-700 dark:bg-slate-900">
      {isOutOfStock ? (
        <div className="block w-full overflow-hidden bg-slate-100 opacity-75 dark:bg-slate-800">{cardBody}</div>
      ) : (
        <Link href={`/products/${id}`} className="block w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          {cardBody}
        </Link>
      )}

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">Sản phẩm</span>
          {!isOutOfStock && displayRating > 0 && (
            <div className="flex shrink-0 items-center gap-0.5 text-amber-500">
              <StarIcon className="h-3.5 w-3.5 fill-current" />
              <span className="text-xs font-bold">{displayRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {isOutOfStock ? (
          <h3 className="mb-1 line-clamp-2 text-base font-bold text-slate-500 dark:text-slate-400">{name}</h3>
        ) : (
          <Link href={`/products/${id}`}>
            <h3 className="mb-1 line-clamp-2 text-base font-bold text-slate-800 transition-colors hover:text-emerald-700 dark:text-slate-100 dark:hover:text-emerald-300">
              {name}
            </h3>
          </Link>
        )}

        {offerLabel && !isOutOfStock && <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">{offerLabel}</p>}
        {shelfLifeLabel && !isOutOfStock && <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">{shelfLifeLabel}</p>}
        {hasExpiry && !isOutOfStock && (
          <div className="mb-2">
            <CountdownTimer targetTime={expiryAt} variant="default" />
          </div>
        )}

        <div className="mb-2 flex flex-col gap-0.5">
          {originalPrice > discountPrice && <span className="text-sm font-medium text-red-500 line-through">{formatPrice(originalPrice)}</span>}
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-300">{formatPrice(discountPrice)}</span>
        </div>

        {typeof stock === "number" && !isOutOfStock && (
          <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
            Còn <span className="font-semibold text-slate-700 dark:text-slate-200">{stock}</span> sản phẩm
          </p>
        )}
        {cityLabel && (
          <p className="mb-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <LocationIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="line-clamp-1">{cityLabel}</span>
          </p>
        )}
        {distanceLabel && <p className="mb-3 text-xs font-medium text-emerald-700 dark:text-emerald-300">{distanceLabel}</p>}

        <div className="mt-auto flex items-center justify-end">
          {!isOutOfStock && (
            <button
              type="button"
              onClick={handleAddToCart}
              className="relative flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-900/20 transition-all hover:bg-emerald-700 active:scale-95"
              aria-label="Thêm vào giỏ hàng"
            >
              <CartIcon className="h-5 w-5" />
              {cartQuantity > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-amber-400 px-1 text-[10px] font-black leading-none text-gray-950 shadow-sm">
                  +{cartQuantity > 99 ? "99" : cartQuantity}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StarIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
    </svg>
  );
}

function LocationIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657 13.414 20.9a2 2 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function CartIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9Z" />
    </svg>
  );
}
