"use client";

import Link from "next/link";
import NextImage from "next/image";
import { ShieldCheck, ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Pencil } from "lucide-react";

import type { SeoCheck } from "@modonty/database/lib/seo/client/types";

interface EditLeftPanelProps {
  name: string;
  logoUrl: string | null;
  heroUrl: string | null;
  industryName?: string | null;
  countryName?: string | null;
  isVerified: boolean;
  articleCount: number;
  seoScore: number;
  seoChecks: SeoCheck[];
  subscriptionLabel: string;
  subscriptionStatus?: string | null;
  clientId?: string;
  /** The preview IS the visual-identity editor — cover + logo are click-to-change. */
  onOpenLogo: () => void;
  onOpenHero: () => void;
  /** Anchor zones rendered on the right, for the jump-nav. */
  zones: Array<{ id: string; label: string }>;
}

// Ring stroke color follows the same thresholds as the header SEO chip
// (single source of truth): emerald ≥ 80, amber ≥ 50, red below.
function ringTone(score: number) {
  if (score >= 80) return { stroke: "#10b981", text: "text-emerald-500" };
  if (score >= 50) return { stroke: "#f59e0b", text: "text-amber-500" };
  return { stroke: "#ef4444", text: "text-red-500" };
}

function statusTone(status?: string | null) {
  switch (status) {
    case "ACTIVE":
      return "text-emerald-600 dark:text-emerald-400";
    case "EXPIRED":
    case "CANCELLED":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-amber-600 dark:text-amber-400";
  }
}

function CheckIcon({ status }: { status: SeoCheck["status"] }) {
  if (status === "good") return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />;
  if (status === "warning") return <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
  return <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />;
}

export function EditLeftPanel({
  name,
  logoUrl,
  heroUrl,
  industryName,
  countryName,
  isVerified,
  articleCount,
  seoScore,
  seoChecks,
  subscriptionLabel,
  subscriptionStatus,
  clientId,
  onOpenLogo,
  onOpenHero,
  zones,
}: EditLeftPanelProps) {
  const tone = ringTone(seoScore);
  const pendingChecks = seoChecks.filter((c) => c.status !== "good");
  const metaLine = [industryName, countryName].filter(Boolean).join(" · ");

  return (
    <aside className="lg:sticky lg:top-4 space-y-4 self-start">
      {/* Live preview card — IS the visual-identity editor: cover + logo are
          click-to-change (open the same hero/logo modals). Mirrors the real
          client page (cover behind, logo overlapping). */}
      <div className="rounded-2xl border bg-gradient-to-b from-muted/40 to-background overflow-hidden">
        {/* Cover = hero image, click to change */}
        <button
          type="button"
          onClick={onOpenHero}
          className="group relative block h-20 w-full overflow-hidden"
          aria-label={heroUrl ? "تغيير صورة الغلاف" : "إضافة صورة الغلاف"}
        >
          {heroUrl ? (
            <NextImage src={heroUrl} alt="cover" fill className="object-cover" sizes="340px" />
          ) : (
            <span className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-background" />
          )}
          <span className="absolute top-2 start-2 text-[10px] text-muted-foreground bg-background/70 rounded px-1.5 py-0.5 pointer-events-none">
            معاينة · صفحة العميل
          </span>
          <span className="absolute inset-0 grid place-items-center bg-black/45 opacity-0 group-hover:opacity-100 transition text-[11px] text-white pointer-events-none">
            {heroUrl ? "تغيير الغلاف" : "إضافة غلاف"}
          </span>
          {/* Always-visible edit affordance */}
          <span className="absolute top-2 end-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm pointer-events-none">
            <Pencil className="h-3 w-3" />
          </span>
        </button>
        <div className="px-4 pb-4 -mt-8">
          <div className="flex items-end gap-3">
            {/* Logo, click to change — overlaps the cover like the client page */}
            <button
              type="button"
              onClick={onOpenLogo}
              className="group relative h-14 w-14 shrink-0"
              aria-label={logoUrl ? "تغيير الشعار" : "إضافة الشعار"}
            >
              <span className="absolute inset-0 grid place-items-center overflow-hidden rounded-xl border-2 border-background bg-muted shadow-sm">
                {logoUrl ? (
                  <NextImage src={logoUrl} alt={name} width={56} height={56} className="object-contain p-1" />
                ) : (
                  <span className="text-[9px] text-muted-foreground">شعار</span>
                )}
                <span className="absolute inset-0 grid place-items-center bg-black/55 opacity-0 group-hover:opacity-100 transition text-[9px] text-white">
                  تغيير
                </span>
              </span>
              {/* Always-visible edit affordance */}
              <span className="absolute -bottom-1 -end-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground border-2 border-background shadow">
                <Pencil className="h-2.5 w-2.5" />
              </span>
            </button>
            {isVerified && (
              <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3 w-3" /> موثّق
              </span>
            )}
          </div>
          <h2 className="mt-2 text-base font-bold truncate">{name || "—"}</h2>
          {metaLine && <p className="text-xs text-muted-foreground mt-0.5 truncate">{metaLine}</p>}
          <div className="mt-3">
            <p className="text-sm font-bold tabular-nums">{articleCount}</p>
            <p className="text-[10px] text-muted-foreground">مقال منشور</p>
          </div>
        </div>
      </div>

      {/* SEO readiness ring + real checks (reflects saved state — same as header chip) */}
      <div className="rounded-2xl border bg-card p-4">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0">
            <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" className="text-muted" strokeWidth="3.2" />
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke={tone.stroke}
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeDasharray={`${seoScore} ${100 - seoScore}`}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <span className={`text-base font-bold tabular-nums ${tone.text}`}>
                {seoScore}
                <span className="text-[9px]">%</span>
              </span>
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold">جاهزية SEO</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">من البيانات المحفوظة</p>
            {pendingChecks.length > 0 && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 font-medium">
                {pendingChecks.length} بند يحتاج عناية
              </p>
            )}
          </div>
        </div>
        {seoChecks.length > 0 && (
          <div className="mt-3 space-y-1.5 border-t pt-3 max-h-56 overflow-auto scrollbar-thin">
            {seoChecks.map((c) => (
              <div key={c.key} className="flex items-start gap-2 text-xs">
                <CheckIcon status={c.status} />
                <span className={c.status === "good" ? "text-muted-foreground" : "text-foreground"}>{c.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscription — read-only; owned by the invoice workflow (Accounts) */}
      <div className="rounded-2xl border bg-card p-3.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground">
            Subscription <span className="opacity-70">· from invoices</span>
          </p>
          <p className="text-sm font-bold mt-0.5 truncate">
            {subscriptionLabel}
            {subscriptionStatus && (
              <span className={`font-semibold ${statusTone(subscriptionStatus)}`}> · {subscriptionStatus}</span>
            )}
          </p>
        </div>
        {clientId && (
          <Link
            href={`/accounts/${clientId}`}
            className="text-xs font-medium text-primary hover:underline whitespace-nowrap inline-flex items-center gap-1 shrink-0"
          >
            Accounts <ArrowLeft className="h-3 w-3 rtl:rotate-180" />
          </Link>
        )}
      </div>

      {/* Jump nav */}
      <nav className="rounded-2xl border bg-card p-2 hidden lg:block">
        {zones.map((z, i) => (
          <a
            key={z.id}
            href={`#${z.id}`}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
          >
            <span className="text-xs font-bold text-primary tabular-nums">{i + 1}</span>
            <span>{z.label}</span>
          </a>
        ))}
      </nav>

      <p className="px-2 text-[10px] text-muted-foreground leading-relaxed">
        بيانات البروفايل (العنوان · السجل · الوصف) يدخلها العميل من الكونسول — تظهر في المعاينة فوق، ولا تُعدّل من هنا.
      </p>
    </aside>
  );
}
