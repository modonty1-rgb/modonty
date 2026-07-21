import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { computeClientEntitySeo } from "@modonty/database/lib/seo/client/seo-score";
import { clientToSeoInput } from "@modonty/database/lib/seo/client/from-client";
import type { SeoCheck } from "@modonty/database/lib/seo/client/types";

// The client's SEO guide — same idea as the article technical page: the lamp that shows
// what's wrong and WHY the score is what it is, driven by the ONE shared scorer
// (computeClientEntitySeo). Every number here equals the SEO Client list + client badge.

type SideCheck = SeoCheck & { side: "META" | "JSON-LD" };

// Every field the shared client scorer reads — omit one and the number silently drops.
const CLIENT_SEO_SELECT = {
  name: true,
  slug: true,
  nextjsMetadata: true,
  jsonLdStructuredData: true,
  jsonLdValidationReport: true,
  url: true,
  logoMediaId: true,
  heroImageMediaId: true,
  description: true,
  alternateName: true,
  slogan: true,
  phone: true,
  email: true,
  contactType: true,
  addressStreet: true,
  addressCity: true,
  addressRegion: true,
  addressPostalCode: true,
  addressCountry: true,
  sameAs: true,
  legalName: true,
  foundingDate: true,
  vatID: true,
  taxID: true,
  commercialRegistrationNumber: true,
  businessActivityCode: true,
  numberOfEmployees: true,
  addressLatitude: true,
  addressLongitude: true,
  openingHoursSpecification: true,
  priceRange: true,
  gbpPlaceId: true,
  organizationType: true,
} as const;

function tone(score: number): "good" | "warn" | "bad" {
  if (score >= 80) return "good";
  if (score >= 60) return "warn";
  return "bad";
}

function prettyJson(value: unknown): string | null {
  if (value == null) return null;
  try {
    if (typeof value === "string") return JSON.stringify(JSON.parse(value), null, 2);
    return JSON.stringify(value, null, 2);
  } catch {
    return typeof value === "string" ? value : null;
  }
}

export default async function ClientSeoTechnicalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const row = await db.client.findUnique({ where: { id }, select: CLIENT_SEO_SELECT });
  if (!row) redirect("/clients");

  const { meta, jsonLd, overall } = computeClientEntitySeo(clientToSeoInput(row as Record<string, unknown>));

  const metaJson = prettyJson(row.nextjsMetadata);
  const jsonLdText = prettyJson(row.jsonLdStructuredData);

  const checks: SideCheck[] = [
    ...meta.checks.map((c) => ({ ...c, side: "META" as const })),
    ...jsonLd.checks.map((c) => ({ ...c, side: "JSON-LD" as const })),
  ];

  const rank = (c: SideCheck) => (c.status === "error" ? 0 : 1);
  const gaps = checks
    .filter((c) => c.status !== "good")
    .sort((a, b) => rank(a) - rank(b) || (b.max - b.earned) - (a.max - a.earned));
  const passed = checks.filter((c) => c.status === "good");

  // Each side is 0–100; overall is their average, so closing (max−earned) in one side lifts
  // the OVERALL by half that — exactly "how far to 100%".
  const gain = (c: SideCheck) => (c.max - c.earned) / 2;
  const fmtGain = (g: number) => (Number.isInteger(g) ? `${g}` : g.toFixed(1));

  const overallTone = tone(overall);
  const ringColor =
    overallTone === "good" ? "stroke-emerald-500" : overallTone === "warn" ? "stroke-amber-500" : "stroke-red-500";
  const numColor =
    overallTone === "good" ? "text-emerald-600 dark:text-emerald-400" : overallTone === "warn" ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";

  const CIRC = 2 * Math.PI * 58;
  const dash = (overall / 100) * CIRC;

  return (
    <div dir="rtl" className="mx-auto max-w-4xl px-4 sm:px-6 pt-4 sm:pt-6 pb-24 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/clients/seo">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </Link>
        <div className="min-w-0">
          <h1 className="text-lg font-bold">دليل السيو — مراجعة العميل</h1>
          <p className="text-sm text-muted-foreground truncate">{row.name}</p>
        </div>
      </div>

      {/* Score head */}
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex flex-wrap items-center gap-5">
          <div className="relative h-[132px] w-[132px] shrink-0">
            <svg width="132" height="132" viewBox="0 0 132 132" className="-rotate-90">
              <circle cx="66" cy="66" r="58" fill="none" strokeWidth="12" className="stroke-slate-200 dark:stroke-slate-800" />
              <circle cx="66" cy="66" r="58" fill="none" strokeWidth="12" strokeLinecap="round" className={ringColor} strokeDasharray={`${dash} ${CIRC}`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <b className={`text-3xl font-extrabold leading-none ${numColor}`}>{overall}%</b>
              <span className="mt-1 text-[11px] text-muted-foreground">درجة السيو</span>
            </div>
          </div>
          <div className="min-w-[220px] flex-1">
            <p className="text-xs font-bold text-muted-foreground">النور اللي يوريك وين الخلل</p>
            <p className="mt-1 text-sm text-muted-foreground">
              هذا الرقم <b className="text-foreground">نفسه</b> اللي في قائمة SEO Client وشارة العميل — مصدر واحد.
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            <ScoreBar label="META (وسوم البحث)" score={meta.score} />
            <ScoreBar label="JSON-LD (البيانات المنظّمة)" score={jsonLd.score} />
          </div>
        </div>
      </div>

      {/* Roadmap */}
      {gaps.length > 0 ? (
        <div className="rounded-2xl border bg-blue-50 p-5 dark:bg-blue-950/30">
          <h3 className="text-[15px] font-extrabold">الطريق من {overall}% إلى 100%</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            <b className="text-foreground">{gaps.length} بند</b> ناقص. العنوان والوصف تكتبهما من قسم SEO Client؛ باقي بيانات الهوية يدخلها العميل من الكونسول، والباقي يتولّد عند الحفظ.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
          <h3 className="flex items-center gap-2 text-[15px] font-extrabold text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="h-4 w-4" /> مكتمل 100% — لا نواقص
          </h3>
        </div>
      )}

      {/* Gaps */}
      {gaps.length > 0 && (
        <section>
          <div className="mx-1 mb-3 mt-6 flex items-center gap-2.5">
            <h2 className="text-base font-extrabold">النواقص وسبب نقص الدرجة</h2>
            <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              {gaps.length} بند
            </span>
          </div>
          <div className="space-y-3">
            {gaps.map((c) => (
              <GapCard key={`${c.side}-${c.key}`} check={c} gain={fmtGain(gain(c))} />
            ))}
          </div>
        </section>
      )}

      {/* Passed */}
      {passed.length > 0 && (
        <section>
          <div className="mx-1 mb-3 mt-6 flex items-center gap-2.5">
            <h2 className="text-base font-extrabold">مكتمل</h2>
            <span className="rounded-full border bg-card px-2.5 py-0.5 text-xs font-bold text-muted-foreground">{passed.length} بنود</span>
          </div>
          <details className="rounded-xl border bg-card">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 text-sm font-extrabold">
              <span>✅ {passed.length} بنود سليمة — اضغط للعرض</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">لا تحتاج عمل</span>
            </summary>
            {passed.map((c) => (
              <div key={`${c.side}-${c.key}`} className="flex items-center justify-between border-t px-4 py-2.5 text-sm">
                <span className="flex items-center gap-2.5">
                  <span className="font-black text-emerald-600 dark:text-emerald-400">✓</span>
                  {c.label}
                </span>
                <span className="text-xs font-bold text-muted-foreground">{c.earned} / {c.max} · {c.side}</span>
              </div>
            ))}
          </details>
        </section>
      )}

      {/* Raw data */}
      <div className="mx-1 mb-3 mt-6 flex items-center gap-2.5">
        <h2 className="text-base font-extrabold">البيانات الفعلية للصفحة</h2>
        <span className="rounded-full border bg-card px-2.5 py-0.5 text-xs font-bold text-muted-foreground">اللي يشوفه قوقل فعلاً</span>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <details open>
          <summary className="flex cursor-pointer list-none items-center justify-between text-[15px] font-extrabold">
            <span>🏷️ META JSON <span className="text-[13px] font-semibold text-muted-foreground">— وسوم البحث والمشاركة</span></span>
            <ScorePill score={meta.score} />
          </summary>
          <CodeBlock text={metaJson} empty="لا يوجد ميتا مخزّن — احفظ سيو العميل لتوليده." />
        </details>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <details open>
          <summary className="flex cursor-pointer list-none items-center justify-between text-[15px] font-extrabold">
            <span>🧩 JSON-LD <span className="text-[13px] font-semibold text-muted-foreground">— البيانات المنظّمة (النتائج الغنية)</span></span>
            <ScorePill score={jsonLd.score} />
          </summary>
          <CodeBlock text={jsonLdText} empty="لا يوجد JSON-LD مخزّن — احفظ سيو العميل لتوليده." />
        </details>
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ScoreBar({ label, score }: { label: string; score: number }) {
  const t = tone(score);
  const color = t === "good" ? "bg-emerald-500" : t === "warn" ? "bg-amber-500" : "bg-red-500";
  const text = t === "good" ? "text-emerald-600 dark:text-emerald-400" : t === "warn" ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";
  return (
    <div className="rounded-xl border p-3.5">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[13px] font-bold">{label}</span>
        <span className={`text-lg font-extrabold ${text}`}>{score}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function ScorePill({ score }: { score: number }) {
  const t = tone(score);
  if (t === "good") {
    return <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400">{score}% · سليم</span>;
  }
  const cls = t === "warn"
    ? "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400"
    : "border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400";
  return <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${cls}`}>{score}%</span>;
}

function GapCard({ check, gain }: { check: SideCheck; gain: string }) {
  const isErr = check.status === "error";
  const wrap = isErr
    ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
    : "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30";
  const ico = isErr ? "bg-red-500" : "bg-amber-500";
  return (
    <div className={`flex gap-3.5 rounded-2xl border p-4 ${wrap}`}>
      <div className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-lg font-black text-white ${ico}`}>
        {isErr ? "✕" : "!"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className="text-[15px] font-extrabold">{check.label}</span>
          <span className="rounded-full border px-2 py-0.5 text-[11px] font-bold text-muted-foreground">{check.side}</span>
        </div>
        {check.hint && <p className="my-1.5 text-sm">{check.hint}</p>}
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg border px-2.5 py-0.5 text-xs font-bold text-muted-foreground">{check.earned} من {check.max} نقطة</span>
          {check.max - check.earned > 0 && (
            <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400">+{gain} على الإجمالي</span>
          )}
        </div>
      </div>
    </div>
  );
}

function CodeBlock({ text, empty }: { text: string | null; empty: string }) {
  if (!text) return <p className="mt-3 text-sm text-muted-foreground">{empty}</p>;
  return (
    <pre dir="ltr" className="mt-3 max-h-[420px] overflow-auto rounded-xl border bg-slate-950 p-3.5 text-left font-mono text-[12.5px] leading-relaxed text-slate-200">
      {text}
    </pre>
  );
}
