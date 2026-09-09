import type { Metadata } from "next";
import { notFound } from "next/navigation";

// The country segment is intentionally request-time routing input. Rendering a
// tiny confirmation screen after the proxy chooses it is preferable to showing
// a shell with the wrong market while it streams.
export const instant = false;

const MARKETS = {
  sa: { country: "السعودية", message: "تم توجيهك إلى السوق السعودي." },
  eg: { country: "مصر", message: "تم توجيهك إلى السوق المصري." },
} as const;

type Market = keyof typeof MARKETS;

export async function generateMetadata({ params }: { params: Promise<{ market: string }> }): Promise<Metadata> {
  const { market } = await params;
  const config = MARKETS[market as Market];
  return { title: config ? `اختبار السوق — ${config.country}` : "اختبار السوق", robots: { index: false, follow: false } };
}

/** Temporary Geo-IP routing test. No pricing, forms, or payment UI belongs here yet. */
export default async function MarketPayPage({ params }: { params: Promise<{ market: string }> }) {
  const { market } = await params;
  const config = MARKETS[market as Market];
  if (!config) notFound();

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-center text-white" dir="rtl">
      <section className="w-full max-w-xl rounded-3xl border border-white/15 bg-white/5 px-6 py-12 shadow-2xl backdrop-blur sm:px-12">
        <p className="text-sm font-semibold text-sky-300">اختبار توجيه السوق عبر IP</p>
        <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-7xl">{config.country}</h1>
        <p className="mt-5 text-base text-slate-300">{config.message}</p>
        <p className="mt-8 font-mono text-xs text-slate-500" dir="ltr">/pay/{market}</p>
      </section>
    </main>
  );
}
