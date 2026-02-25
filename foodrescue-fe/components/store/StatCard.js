/**
 * StatCard - Thẻ thống kê trong Store Dashboard
 * @param {string} title - Tiêu đề
 * @param {string|number} value - Giá trị chính
 * @param {string} subtitle - Mô tả phụ
 * @param {string} icon - Emoji icon
 * @param {string} trend - "+12%" | "-5%" | undefined
 * @param {string} color - "orange" | "green" | "blue" | "red"
 */
export default function StatCard({ title, value, subtitle, icon, trend, color = "orange" }) {
  const colors = {
    orange: {
      bg: "bg-orange-50",
      icon: "bg-orange-100 text-orange-600",
      value: "text-orange-600",
    },
    green: {
      bg: "bg-green-50",
      icon: "bg-green-100 text-green-600",
      value: "text-green-600",
    },
    blue: {
      bg: "bg-blue-50",
      icon: "bg-blue-100 text-blue-600",
      value: "text-blue-600",
    },
    red: {
      bg: "bg-red-50",
      icon: "bg-red-100 text-red-600",
      value: "text-red-600",
    },
  };

  const theme = colors[color] ?? colors.orange;
  const trendPositive = trend?.startsWith("+");

  return (
    <div className={`${theme.bg} rounded-2xl p-5 flex items-start gap-4`}>
      {/* Icon */}
      <div className={`${theme.icon} w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0`}>
        {icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{title}</p>
        <p className={`text-2xl font-bold mt-0.5 ${theme.value}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        {trend && (
          <span
            className={`text-xs font-semibold mt-1 inline-block ${trendPositive ? "text-green-600" : "text-red-500"}`}
          >
            {trendPositive ? "▲" : "▼"} {trend} so với hôm qua
          </span>
        )}
      </div>
    </div>
  );
}
