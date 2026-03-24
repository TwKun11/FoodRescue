"use client";
import { useState, useEffect } from "react";

/**
 * CountdownTimer - Đếm ngược đến thời điểm hết hạn
 * @param {string} targetTime - ISO string hoặc Date string của thời điểm hết hạn
 * @param {string} variant - "default" | "onRed" | "boxes" (4 ô NGÀY GIỜ PHÚT GIÂY, dùng trên nền đỏ)
 * @param {boolean} onRedBackground - khi variant="boxes", ô số dùng viền trắng + chữ trắng
 */
const SECONDS_PER_DAY = 86400;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;

export default function CountdownTimer({ targetTime, variant = "default", onRedBackground = false }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    if (!targetTime) return;
    const target = new Date(targetTime).getTime();
    if (Number.isNaN(target)) return;

    const tick = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / SECONDS_PER_DAY);
      const hours = Math.floor((totalSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR);
      const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
      const seconds = totalSeconds % SECONDS_PER_MINUTE;
      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    };

    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [targetTime]);

  if (timeLeft.expired) {
    if (variant === "boxes") {
      return (
        <div className="text-white/90 text-sm font-semibold">Đã hết hạn</div>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 text-sm font-semibold ${variant === "onRed" ? "text-white/90" : "text-gray-400"}`}>
        ⛔ Đã hết hạn
      </span>
    );
  }

  const pad = (n) => String(n).padStart(2, "0");
  const totalHours = timeLeft.days * 24 + timeLeft.hours;
  const isurgent = totalHours < 2;

  const parts = [];
  if (timeLeft.days > 0) parts.push({ value: String(timeLeft.days), label: "ngày" });
  parts.push({ value: pad(timeLeft.hours), label: "giờ" });
  parts.push({ value: pad(timeLeft.minutes), label: "phút" });
  parts.push({ value: pad(timeLeft.seconds), label: "giây" });

  if (variant === "boxes") {
    const boxes = [
      { value: String(timeLeft.days).padStart(2, "0"), label: "Ngày" },
      { value: pad(timeLeft.hours), label: "Giờ" },
      { value: pad(timeLeft.minutes), label: "Phút" },
      { value: pad(timeLeft.seconds), label: "Giây" },
    ];
    const boxClass = onRedBackground
      ? "bg-white rounded-lg w-10 h-10 flex items-center justify-center text-lg font-bold text-red-600 tabular-nums border border-white/50 shadow-sm"
      : "bg-white rounded-lg w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-bold text-slate-800 tabular-nums";
    const labelClass = onRedBackground ? "text-[9px] font-semibold mt-0.5 text-white/95 uppercase tracking-wide" : "text-[10px] font-semibold mt-1 text-white/90 uppercase tracking-wider";
    return (
      <div className="flex gap-2 sm:gap-2.5 flex-nowrap items-center shrink-0">
        {boxes.map((b) => (
          <div key={b.label} className="flex flex-col items-center shrink-0">
            <div className={boxClass}>
              {b.value}
            </div>
            <span className={labelClass}>{b.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 flex-nowrap shrink-0 min-w-0 ${variant === "onRed" ? "text-white" : isurgent ? "text-red-600" : "text-orange-600"}`}
    >
      <span className="text-sm shrink-0">⏰</span>
      <span className="text-xs font-semibold shrink-0 whitespace-nowrap">Còn lại:</span>
      <div className="inline-flex items-center gap-1 flex-nowrap min-w-0">
        {parts.map((p, i) => (
          <span key={p.label} className="inline-flex items-baseline gap-0.5 flex-nowrap">
            <TimeUnitInline value={p.value} label={p.label} urgent={isurgent} variant={variant} />
            {i < parts.length - 1 && <span className="text-[10px] opacity-70 mx-0.5">·</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

function TimeUnitInline({ value, label, urgent, variant }) {
  const isOnRed = variant === "onRed";
  return (
    <span className="inline-flex items-baseline gap-0.5 flex-nowrap">
      <span
        className={`text-xs font-bold tabular-nums px-1 py-0.5 rounded ${isOnRed ? "bg-white/25 text-white" : urgent ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}
      >
        {value}
      </span>
      <span className={`text-[10px] ${isOnRed ? "text-white/90" : "text-gray-600"}`}>{label}</span>
    </span>
  );
}
