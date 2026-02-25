"use client";
import { useState, useEffect } from "react";

/**
 * CountdownTimer - Đếm ngược đến thời điểm hết hạn
 * @param {string} targetTime - ISO string hoặc Date string của thời điểm hết hạn
 * @param {string} variant - "default" | "onRed" (nền đỏ, chữ trắng)
 */
export default function CountdownTimer({ targetTime, variant = "default" }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const target = new Date(targetTime).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setTimeLeft({ hours, minutes, seconds, expired: false });
    };

    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [targetTime]);

  if (timeLeft.expired) {
    return (
      <span className={`inline-flex items-center gap-1 text-sm font-semibold ${variant === "onRed" ? "text-white/90" : "text-gray-400"}`}>
        ⛔ Đã hết hạn
      </span>
    );
  }

  const pad = (n) => String(n).padStart(2, "0");
  const isurgent = timeLeft.hours < 2;

  return (
    <div className={`inline-flex items-center gap-1.5 ${variant === "onRed" ? "text-white" : isurgent ? "text-red-600" : "text-orange-600"}`}>
      <span className="text-base">⏰</span>
      <span className="text-sm font-semibold">Còn lại:</span>
      <div className="flex items-center gap-1">
        {timeLeft.hours > 0 && (
          <>
            <TimeUnit value={pad(timeLeft.hours)} label="giờ" urgent={isurgent} variant={variant} />
            <span className="font-bold pb-2">:</span>
          </>
        )}
        <TimeUnit value={pad(timeLeft.minutes)} label="phút" urgent={isurgent} variant={variant} />
        <span className="font-bold pb-2">:</span>
        <TimeUnit value={pad(timeLeft.seconds)} label="giây" urgent={isurgent} variant={variant} />
      </div>
    </div>
  );
}

function TimeUnit({ value, label, urgent, variant }) {
  const isOnRed = variant === "onRed";
  return (
    <div className="flex flex-col items-center">
      <span
        className={`text-lg font-bold tabular-nums px-1.5 py-0.5 rounded ${
          isOnRed ? "bg-white/25 text-white" : urgent ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
        }`}
      >
        {value}
      </span>
      <span className={`text-[10px] mt-0.5 ${isOnRed ? "text-white/80" : "text-gray-500"}`}>{label}</span>
    </div>
  );
}
