"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "foodrescue-theme";

function applyTheme(theme) {
  const resolved = theme === "dark" ? "dark" : "light";
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.dataset.theme = resolved;
}

function SunIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function ThemeToggle({ compact = false }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initial = saved || systemTheme;
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const isDark = theme === "dark";
  const nextTheme = isDark ? "light" : "dark";
  const label = isDark ? "Tối" : "Sáng";
  const title = `Đang ở chế độ ${label.toLowerCase()}. Bấm để chuyển sang ${isDark ? "sáng" : "tối"}.`;

  return (
    <button
      type="button"
      onClick={() => {
        setTheme(nextTheme);
        localStorage.setItem(STORAGE_KEY, nextTheme);
        applyTheme(nextTheme);
      }}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border border-emerald-100 bg-white/95 text-sm font-bold leading-none text-emerald-900 shadow-sm shadow-emerald-950/5 ring-1 ring-white/70 transition hover:border-emerald-200 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-100 dark:ring-slate-700/60 dark:hover:bg-slate-800 ${
        compact ? "px-3.5" : "px-4"
      }`}
      aria-label={title}
      title={title}
    >
      {isDark ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
      <span className="text-xs font-black">{label}</span>
    </button>
  );
}
