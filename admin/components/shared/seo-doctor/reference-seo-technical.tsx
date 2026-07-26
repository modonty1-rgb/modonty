import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { computeReferenceSeoScore } from "@modonty/database/lib/seo/reference/seo-score";
import type { SeoCheck, JsonLdValidationReport } from "@modonty/database/lib/seo/client/types";

// Shared SEO technical view for reference entities (category · tag · author · industry).
// Driven by computeReferenceSeoScore — the ONE source of truth (same family as article/
// client). Reads the STORED metadata + JSON-LD (real output), so canonical is scored from
// what the page actually emits. Entity-standard #5.

// Content the admin fills; everything else the system generates (canonical, JSON-LD) —
// the editor must not be alarmed by those (ownership).
const WRITER_KEYS = new Set(["title", "description", "ogImage"]);

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

interface ReferenceSeoTechnicalProps {
  /** Back link to the entity's detail page. */
  backHref: string;
  /** Singular Arabic label — التصنيف · الوسم · الكاتب · الصناعة. */
  entityLabel: string;
  name: string;
  nextjsMetadata: unknown;
  jsonLdStructuredData: string | null;
  jsonLdValidationReport: unknown;
}

export function ReferenceSeoTechnical({
  backHref,
  entityLabel,
  name,
  nextjsMetadata,
  jsonLdStructuredData,
  jsonLdValidationReport,
}: ReferenceSeoTechnicalProps) {
  const { score, checks } = computeReferenceSeoScore({
    name,
    nextjsMetadata,
    jsonLdStructuredData,
    jsonLdValidationReport: (jsonLdValidationReport ?? null) as JsonLdValidationReport | null,
  });

  const gaps = checks
    .filter((c) => c.status !== "good")
    .sort((a, b) => (a.status === "error" ? 0 : 1) - (b.status === "error" ? 0 : 1));
  const passed = checks.filter((c) => c.status === "good");
  const writerGaps = gaps.filter((c) => WRITER_KEYS.has(c.key));
  const systemGaps = gaps.filter((c) => !WRITER_KEYS.has(c.key));

  const metaJson = prettyJson(nextjsMetadata);
  const jsonLdText = prettyJson(jsonLdStructuredData);

  const t = tone(score);
  const ringColor = t === "good" ? "stroke-emerald-500" : t === "warn" ? "stroke-amber-500" : "stroke-red-500";
  const numColor =
    t === "good"
      ? "text-emerald-600 dark:text-emerald-400"
      : t === "warn"
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";
  const CIRC = 2 * Math.PI * 58;
  const dash = (score / 100) * CIRC;

  return (
    <div dir="rtl" className="mx-auto max-w-4xl px-4 sm:px-6 pt-4 sm:pt-6 pb-24 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={backHref}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </Link>
        <div className="min-w-0">
          <h1 className="text-lg font-bold">دليل السيو — مراجعة {entityLabel}</h1>
          <p className="text-sm text-muted-foreground truncate">{name}</p>
        </div>
      </div>

      {/* Score head */}
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex flex-wrap items-center gap-5">
          <div className="relative h-[132px] w-[132px] shrink-0">
            <svg width="132" height="132" viewBox="0 0 132 132" className="-rotate-90">
              <circle cx="66" cy="66" r="58" fill="none" strokeWidth="12" className="stroke-slate-200 dark:stroke-slate-800" />
              <circle
                cx="66" cy="66" r="58" fill="none" strokeWidth="12" strokeLinecap="round"
                className={ringColor}
                strokeDasharray={`${dash} ${CIRC}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <b className={`text-3xl font-extrabold leading-none ${numColor}`}>{score}%</b>
              <span className="mt-1 text-[11px] text-muted-foreground">درجة السيو</span>
            </div>
          </div>
          <div className="min-w-[220px] flex-1">
            <p className="text-xs font-bold text-muted-foreground">النور اللي يوريك وين الخلل</p>
            <p className="mt-1 text-sm text-muted-foreground">
              هذا الرقم <b className="text-foreground">نفسه</b> اللي في القوائم واللوحة — مصدر واحد.
            </p>
          </div>
        </div>
      </div>

      {/* Roadmap + ownership */}
      {gaps.length > 0 ? (
        <div className="rounded-2xl border bg-blue-50 p-5 dark:bg-blue-950/30">
          <h3 className="text-[15px] font-extrabold">الطريق من {score}% إلى 100%</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {writerGaps.length > 0 ? (
              <>
                يحتاج <b className="text-foreground">عملك أنت</b>: <b className="text-foreground">{writerGaps.length} بند</b>
                {systemGaps.length > 0 && <> · والباقي ({systemGaps.length}) النظام يتكفّل به عند النشر</>}.
              </>
            ) : (
              <>
                ما فيه شي يحتاج منك ✍️ — <b className="text-foreground">{systemGaps.length} نواقص</b> كلها يصلحها النظام تلقائياً عند الحفظ/النشر.
              </>
            )}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] px-5 py-4 text-sm font-bold text-emerald-700 dark:text-emerald-400">
          ✅ مكتمل 100% — لا نواقص.
        </div>
      )}

      {/* Writer gaps */}
      {writerGaps.length > 0 && (
        <section>
          <div className="mx-1 mb-3 mt-6 flex items-center gap-2.5">
            <h2 className="text-base font-extrabold">✍️ يحتاج عملك</h2>
            <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              {writerGaps.length} بند
            </span>
          </div>
          <div className="space-y-3">
            {writerGaps.map((c) => (
              <GapCard key={c.key} check={c} />
            ))}
          </div>
        </section>
      )}

      {/* System gaps */}
      {systemGaps.length > 0 && (
        <section>
          <div className="mx-1 mb-3 mt-6 flex items-center gap-2.5">
            <h2 className="flex items-center gap-1.5 text-base font-extrabold text-muted-foreground">
              <ShieldCheck className="h-4 w-4" /> النظام يتكفّل بها
            </h2>
            <span className="rounded-full border bg-card px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
              لا تحتاج تدخّلك
            </span>
          </div>
          <div className="space-y-3">
            {systemGaps.map((c) => (
              <GapCard key={c.key} check={c} muted />
            ))}
          </div>
        </section>
      )}

      {/* Passed */}
      {passed.length > 0 && (
        <section>
          <div className="mx-1 mb-3 mt-6 flex items-center gap-2.5">
            <h2 className="text-base font-extrabold">مكتمل</h2>
            <span className="rounded-full border bg-card px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
              {passed.length} بنود
            </span>
          </div>
          <details className="rounded-xl border bg-card">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 text-sm font-extrabold">
              <span>✅ {passed.length} بنود سليمة — اضغط للعرض</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">لا تحتاج عمل</span>
            </summary>
            {passed.map((c) => (
              <div key={c.key} className="flex items-center justify-between border-t px-4 py-2.5 text-sm">
                <span className="flex items-center gap-2.5">
                  <span className="font-black text-emerald-600 dark:text-emerald-400">✓</span>
                  {c.label}
                </span>
                <span className="text-xs font-bold text-muted-foreground">{c.earned} / {c.max}</span>
              </div>
            ))}
          </details>
        </section>
      )}

      {/* Raw page data — what Google actually sees (entity-standard #5, section 8) */}
      <div className="mx-1 mb-3 mt-6 flex items-center gap-2.5">
        <h2 className="text-base font-extrabold">البيانات الفعلية للصفحة</h2>
        <span className="rounded-full border bg-card px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
          اللي يشوفه قوقل فعلاً
        </span>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <details open>
          <summary className="cursor-pointer list-none text-[15px] font-extrabold">
            🏷️ META JSON <span className="text-[13px] font-semibold text-muted-foreground">— وسوم البحث والمشاركة</span>
          </summary>
          <CodeBlock text={metaJson} empty={`لا يوجد ميتا مخزّن — احفظ ${entityLabel} لتوليده.`} />
        </details>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <details open>
          <summary className="cursor-pointer list-none text-[15px] font-extrabold">
            🧩 JSON-LD <span className="text-[13px] font-semibold text-muted-foreground">— البيانات المنظّمة (النتائج الغنية)</span>
          </summary>
          <CodeBlock text={jsonLdText} empty={`لا يوجد JSON-LD مخزّن — احفظ ${entityLabel} لتوليده.`} />
        </details>
      </div>
    </div>
  );
}

function GapCard({ check, muted }: { check: SeoCheck; muted?: boolean }) {
  const isErr = check.status === "error";
  const wrap = muted
    ? "border-border bg-card opacity-80"
    : isErr
      ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
      : "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30";
  const ico = isErr ? "bg-red-500" : "bg-amber-500";
  const gain = check.max - check.earned;
  return (
    <div className={`flex gap-3.5 rounded-2xl border p-4 ${wrap}`}>
      <div className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-lg font-black text-white ${ico}`}>
        {isErr ? "✕" : "!"}
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[15px] font-extrabold">{check.label}</span>
        {check.hint && <p className="my-1.5 text-sm">{check.hint}</p>}
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg border px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
            {check.earned} من {check.max} نقطة
          </span>
          {gain > 0 && (
            <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400">
              +{gain} على الإجمالي
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function CodeBlock({ text, empty }: { text: string | null; empty: string }) {
  if (!text) return <p className="mt-3 text-sm text-muted-foreground">{empty}</p>;
  return (
    <pre
      dir="ltr"
      className="mt-3 max-h-[420px] overflow-auto rounded-xl border bg-slate-950 p-3.5 text-left font-mono text-[12.5px] leading-relaxed text-slate-200"
    >
      {text}
    </pre>
  );
}
