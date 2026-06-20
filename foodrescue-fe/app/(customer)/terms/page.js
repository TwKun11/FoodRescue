import { TERMS } from "./terms-data";

export const metadata = {
  title: "Trung tâm hỗ trợ FoodRescue",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-emerald-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-12">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
            FoodRescue Support
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-gray-950 sm:text-4xl">
            Trung tâm hỗ trợ FoodRescue
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600">
            Nơi tổng hợp các điều khoản, chính sách và hướng dẫn hỗ trợ người dùng.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[280px_1fr] lg:py-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav className="rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm">
            <p className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-500">
              Danh mục điều khoản
            </p>
            <ul className="mt-1 space-y-1">
              {TERMS.map((term) => (
                <li key={term.id}>
                  <a
                    href={`#${term.id}`}
                    className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    {term.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="space-y-5">
          {TERMS.map((term, index) => {
            const content = term.content?.trim();

            return (
              <section
                key={term.id}
                id={term.id}
                className="scroll-mt-24 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-sm font-extrabold text-emerald-800">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold text-gray-950">{term.name}</h2>
                    {content ? (
                      <div className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
                        {content}
                      </div>
                    ) : (
                      <div className="mt-5 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-800">
                        Nội dung đang được cập nhật.
                      </div>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}