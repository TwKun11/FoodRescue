/**
 * Reusable Badge component
 * variant: "discount" | "expiry" | "status" | "category"
 */
export default function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    discount: "bg-red-500 text-white",
    expiry: "bg-yellow-400 text-yellow-900",
    new: "bg-green-500 text-white",
    status_pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    status_confirmed: "bg-blue-100 text-blue-700 border border-blue-300",
    status_done: "bg-green-100 text-green-700 border border-green-300",
    status_cancelled: "bg-red-100 text-red-700 border border-red-300",
    category: "bg-orange-100 text-orange-700",
    default: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${variants[variant] ?? variants.default} ${className}`}
    >
      {children}
    </span>
  );
}
