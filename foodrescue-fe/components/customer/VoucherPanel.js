"use client";

export default function VoucherPanel({
  voucherCode,
  setVoucherCode,
  voucherCodeTrimmed,
  voucherPreview,
  voucherDiscount,
  voucherOptionsLoading,
  myVouchers,
  eligibleVouchers,
  voucherLoadHint,
  formatCurrency,
}) {
  return (
    <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-brand-dark">
        Voucher áp dụng
      </label>

      <div className="flex gap-2">
        <input
          type="text"
          value={voucherCode}
          onChange={(event) => setVoucherCode(event.target.value.toUpperCase())}
          placeholder="Nhập mã voucher"
          className={`flex-1 rounded-xl border px-3 py-2 text-sm uppercase transition focus:outline-none focus:ring-2 ${
            voucherPreview.error
              ? "border-red-300 bg-red-50 text-red-700 focus:border-red-400 focus:ring-red-200"
              : voucherDiscount > 0
                ? "border-emerald-300 bg-emerald-50 text-emerald-800 focus:border-emerald-400 focus:ring-emerald-200"
                : "border-gray-200 focus:border-brand focus:ring-brand/30"
          }`}
        />
        <button
          type="button"
          onClick={() => setVoucherCode("")}
          disabled={!voucherCodeTrimmed && !voucherPreview.loading}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Xóa
        </button>
      </div>

      {voucherCodeTrimmed ? (
        <div
          className={`mt-2 rounded-xl border px-3 py-2 text-xs ${
            voucherPreview.loading
              ? "border-slate-200 bg-slate-50 text-slate-600"
              : voucherPreview.error
                ? "border-red-200 bg-red-50 text-red-700"
                : voucherDiscount > 0
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-50 text-slate-600"
          }`}
        >
          {voucherPreview.loading
            ? `Đang kiểm tra mã ${voucherCodeTrimmed}...`
            : voucherPreview.error
              ? voucherPreview.error
              : voucherDiscount > 0
                ? `Áp dụng thành công. Giảm ${formatCurrency(voucherDiscount)}`
                : "Mã voucher không hợp lệ hoặc không áp dụng được cho đơn hàng này."}
        </div>
      ) : null}

      <p className="mt-2 text-xs text-gray-500">
        {voucherOptionsLoading
          ? "Đang tìm voucher phù hợp với sản phẩm và địa chỉ đã chọn..."
          : myVouchers.length > 0
            ? `Đã nhận ${myVouchers.length} voucher, có ${eligibleVouchers.length} voucher đủ điều kiện.`
            : "Bạn chưa nhận voucher nào."}
      </p>

      {voucherLoadHint ? (
        <p className="mt-1 text-xs text-amber-700">{voucherLoadHint}</p>
      ) : null}

      {eligibleVouchers.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {eligibleVouchers.map((voucher) => {
            const active =
              String(voucher.code).toUpperCase() ===
              voucherCodeTrimmed.toUpperCase();

            return (
              <button
                key={voucher.code}
                type="button"
                onClick={() =>
                  setVoucherCode(String(voucher.code || "").toUpperCase())
                }
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                    : "border-gray-200 bg-white text-gray-700 hover:border-emerald-200 hover:bg-emerald-50"
                }`}
              >
                {voucher.code} - giảm {formatCurrency(voucher.discountAmount)}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}