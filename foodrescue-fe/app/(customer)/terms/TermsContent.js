"use client";

import { useEffect, useState } from "react";

function renderTermContent(content) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line, index) => {
    const numbered = line.match(/^(\d+)\.\s+(.+)/);
    const lettered = line.match(/^([a-z])\.\s+(.+)/i);
    const dashed = line.match(/^[-•]\s+(.+)/);
    const isIntroTitle = index === 0 && !numbered && line.length <= 120;

    if (isIntroTitle) {
      return (
        <div
          key={`${index}-${line}`}
          className="rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-lime-50 px-4 py-3 text-base font-extrabold uppercase text-emerald-900 dark:border-emerald-900/60 dark:from-emerald-950/50 dark:via-slate-900 dark:to-slate-900 dark:text-emerald-100"
        >
          {line}
        </div>
      );
    }

    if (numbered) {
      return (
        <div key={`${index}-${line}`} className="mt-6 flex items-start gap-3 first:mt-0">
          <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-emerald-600 px-2 text-xs font-extrabold text-white shadow-sm dark:bg-emerald-500 dark:shadow-none">
            {numbered[1]}
          </span>
          <h3 className="pt-0.5 text-base font-bold text-gray-950 dark:text-slate-100">{numbered[2]}</h3>
        </div>
      );
    }

    if (lettered) {
      return (
        <div
          key={`${index}-${line}`}
          className="ml-1 flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-sm leading-7 text-gray-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200"
        >
          <span className="mt-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-extrabold uppercase text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-200">
            {lettered[1]}
          </span>
          <p>{lettered[2]}</p>
        </div>
      );
    }

    if (dashed) {
      return (
        <div key={`${index}-${line}`} className="flex items-start gap-3 pl-2 text-sm leading-7 text-gray-700 dark:text-slate-300">
          <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 dark:bg-emerald-300" />
          <p>{dashed[1]}</p>
        </div>
      );
    }

    return (
      <p key={`${index}-${line}`} className="text-sm leading-7 text-gray-700 dark:text-slate-300">
        {line}
      </p>
    );
  });
}

export default function TermsContent({ terms }) {
  const [activeId, setActiveId] = useState(terms[0]?.id || "");

  useEffect(() => {
    const syncFromHash = () => {
      const id = decodeURIComponent(window.location.hash.replace("#", ""));
      if (id && terms.some((term) => term.id === id)) {
        setActiveId(id);
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [terms]);

  const handleSelect = (termId) => {
    setActiveId(termId);
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[280px_1fr] lg:py-10">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <nav className="rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-none">
          <p className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Danh mục điều khoản
          </p>
          <ul className="mt-1 space-y-1">
            {terms.map((term) => {
              const active = activeId === term.id;

              return (
                <li key={term.id}>
                  <a
                    href={`#${term.id}`}
                    aria-current={active ? "true" : undefined}
                    onClick={() => handleSelect(term.id)}
                    className={[
                      "block rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                      active
                        ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-lime-400 text-white shadow-md shadow-emerald-200 dark:from-emerald-700 dark:via-teal-700 dark:to-emerald-600 dark:shadow-none"
                        : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-emerald-200",
                    ].join(" ")}
                  >
                    {term.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <main className="space-y-5">
        {terms.map((term, index) => {
          const content = term.content?.trim();
          const active = activeId === term.id;

          return (
            <section
              key={term.id}
              id={term.id}
              className={[
                "scroll-mt-24 overflow-hidden rounded-2xl border bg-white shadow-sm transition dark:bg-slate-900/95 dark:shadow-none",
                active
                  ? "border-emerald-300 shadow-emerald-100 dark:border-emerald-700"
                  : "border-emerald-100 dark:border-slate-700",
              ].join(" ")}
            >
              <div className="border-b border-emerald-100 bg-gradient-to-r from-white via-emerald-50/70 to-lime-50 px-5 py-5 sm:px-6 dark:border-slate-700 dark:from-slate-900 dark:via-emerald-950/35 dark:to-slate-900">
                <div className="flex items-start gap-4">
                  <span
                    className={[
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold transition",
                      active
                        ? "bg-gradient-to-br from-emerald-500 to-lime-400 text-white dark:from-emerald-700 dark:to-teal-700"
                        : "bg-emerald-100 text-emerald-800 dark:bg-slate-800 dark:text-emerald-200",
                    ].join(" ")}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-300">FoodRescue Policy</p>
                    <h2 className="mt-1 text-xl font-bold text-gray-950 dark:text-slate-50">{term.name}</h2>
                  </div>
                </div>
              </div>

              <div className="px-5 py-5 sm:px-6 sm:py-6">
                {content ? (
                  <div className="mx-auto max-w-3xl space-y-3.5 rounded-2xl border border-slate-100 bg-white/80 p-4 sm:p-5 dark:border-slate-700 dark:bg-slate-950/40">
                    {renderTermContent(content)}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100">
                    Nội dung đang được cập nhật.
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
