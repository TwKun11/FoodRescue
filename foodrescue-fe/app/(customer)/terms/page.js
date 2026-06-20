import TermsContent from "./TermsContent";
import { TERMS } from "./terms";

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

      <TermsContent terms={TERMS} />
    </div>
  );
}