"use client";

import { useEffect, useState } from "react";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function SellerTutorialGuide() {
  const [enabled, setEnabled] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    document.documentElement.dataset.sellerGuide = enabled ? "on" : "off";
    if (!enabled) setTooltip(null);

    return () => {
      document.documentElement.dataset.sellerGuide = "off";
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;

    const updateTooltip = (event) => {
      const target = event.target.closest?.("[data-guide-title]");
      if (!target) {
        setTooltip(null);
        return;
      }

      const rect = target.getBoundingClientRect();
      const width = 320;
      const height = 150;
      const preferRight = rect.right + width + 16 < window.innerWidth;
      const preferLeft = rect.left - width - 16 > 0;
      const x = preferRight
        ? rect.right + 12
        : preferLeft
          ? rect.left - width - 12
          : event.clientX + 18;
      const y = clamp(rect.top + rect.height / 2 - 52, 12, window.innerHeight - height);

      setTooltip({
        title: target.dataset.guideTitle,
        body: target.dataset.guideText || "Khu vực này là một phần thao tác của người bán trong bảng điều khiển.",
        x: clamp(x, 12, window.innerWidth - width - 12),
        y,
      });
    };

    const clearTooltip = (event) => {
      if (!event.target.closest?.("[data-guide-title]")) {
        setTooltip(null);
      }
    };

    document.addEventListener("mousemove", updateTooltip, true);
    document.addEventListener("focusin", updateTooltip, true);
    document.addEventListener("scroll", clearTooltip, true);

    return () => {
      document.removeEventListener("mousemove", updateTooltip, true);
      document.removeEventListener("focusin", updateTooltip, true);
      document.removeEventListener("scroll", clearTooltip, true);
    };
  }, [enabled]);

  return (
    <>
      <button
        type="button"
        onClick={() => setEnabled((value) => !value)}
        className={`fixed bottom-5 right-5 z-[80] inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-bold shadow-xl transition ${
          enabled
            ? "bg-brand-dark text-white hover:bg-emerald-800"
            : "bg-white text-gray-800 ring-1 ring-gray-200 hover:bg-gray-50"
        }`}
        data-guide-title="Chế độ hướng dẫn"
        data-guide-text="Bật chế độ này rồi hover vào các nút, thẻ số liệu và khu vực chính để xem giải thích nhanh cho người bán."
      >
        <GuideIcon className="h-4 w-4" />
        {enabled ? "Tắt hướng dẫn" : "Bật hướng dẫn"}
      </button>

      {enabled && (
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex justify-center px-4 sm:hidden">
          <div className="rounded-2xl bg-gray-950 px-4 py-3 text-xs font-medium text-white shadow-xl">
            Hover hoặc chạm vào khu vực được viền để xem giải thích.
          </div>
        </div>
      )}

      {enabled && tooltip && (
        <div
          className="pointer-events-none fixed z-[90] w-80 rounded-2xl border border-emerald-200 bg-white p-4 text-left shadow-2xl shadow-emerald-950/20"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Hướng dẫn người bán</p>
          <h3 className="mt-1 text-sm font-bold text-gray-950">{tooltip.title}</h3>
          <p className="mt-2 text-sm leading-6 text-gray-600">{tooltip.body}</p>
        </div>
      )}

      <style jsx global>{`
        html[data-seller-guide="on"] [data-guide-title] {
          outline: 2px solid rgba(16, 185, 129, 0.42);
          outline-offset: 3px;
          cursor: help;
        }

        html[data-seller-guide="on"] [data-guide-title]:hover,
        html[data-seller-guide="on"] [data-guide-title]:focus-visible {
          outline-color: rgba(16, 185, 129, 0.95);
          box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.12);
        }
      `}</style>
    </>
  );
}

function GuideIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H7a3 3 0 0 0-3 3V5.5z" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M8 7h8" />
      <path d="M8 11h6" />
    </svg>
  );
}