"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { apiCreateViolationReport } from "@/lib/api";

const TYPE_OPTIONS = [
  { value: "SPOILED_FOOD", label: "Thuc pham hong" },
  { value: "MISDESCRIPTION", label: "Sai mo ta" },
];

export default function ViolationReportForm({
  productId,
  reviewId = null,
  triggerLabel = "Bao cao vi pham",
  compact = false,
  onSuccess,
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("SPOILED_FOOD");
  const [description, setDescription] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setType("SPOILED_FOOD");
    setDescription("");
    setEvidenceUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId) {
      toast.error("Khong xac dinh duoc san pham de bao cao.");
      return;
    }
    if (!description.trim()) {
      toast.error("Vui long nhap noi dung bao cao.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiCreateViolationReport({
        productId,
        reviewId,
        type,
        description: description.trim(),
        evidenceUrl: evidenceUrl.trim() || null,
      });

      if (!res.ok) {
        toast.error(res.data?.message || "Gui bao cao that bai.");
        return;
      }

      toast.success("Da gui bao cao. Admin se xu ly som.");
      setOpen(false);
      reset();
      if (typeof onSuccess === "function") onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={compact
          ? "px-2.5 py-1 rounded-md border border-red-200 text-red-700 text-xs hover:bg-red-50"
          : "inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-700 text-sm hover:bg-red-50"}
      >
        {triggerLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center" onClick={() => setOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Gui bao cao vi pham</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
              >
                x
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Loai bao cao</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  {TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Noi dung</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Mo ta van de ban gap phai..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Link bang chung (tuy chon)</label>
                <input
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Huy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60"
                >
                  {loading ? "Dang gui..." : "Gui bao cao"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
