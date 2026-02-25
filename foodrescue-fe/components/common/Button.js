"use client";
/**
 * Reusable Button component
 * variant: "primary" | "secondary" | "danger" | "ghost"
 * size: "sm" | "md" | "lg"
 */
export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  fullWidth = false,
}) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-400",
    secondary: "bg-white text-orange-500 border border-orange-500 hover:bg-orange-50 focus:ring-orange-300",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-300",
    green: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-400",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 gap-1",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-6 py-3 gap-2",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {children}
    </button>
  );
}
