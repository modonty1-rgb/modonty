"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ExternalLink, Loader2, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  fixContentPageSeo,
  fixListingPageSeo,
  type ListingPageAudit,
  type ListingPageKey,
} from "../../actions/listing-pages-seo-audit";

/**
 * One row per modonty listing page: name · score · Fix (Khalid 2026-08-14).
 *
 * The Fix button is enabled ONLY below 100 — a page already perfect has nothing to
 * regenerate, and a live button there would invite pointless writes to Settings plus a
 * cache bust on modonty for no gain. A page below 100 pulses amber (or red under 60) so
 * the eye lands on it without reading a single number.
 */

function scoreTone(score: number) {
  if (score >= 100) return { text: "text-emerald-600 dark:text-emerald-400", ring: "" };
  if (score >= 60) return { text: "text-amber-600 dark:text-amber-400", ring: "ring-1 ring-amber-400/60" };
  return { text: "text-red-600 dark:text-red-400", ring: "ring-1 ring-red-400/70" };
}

export function ListingPagesSeoRows({
  pages,
  kind = "listing",
}: {
  pages: ListingPageAudit[];
  /** Which generator the Fix button reaches — Settings-backed or Modonty-row-backed. */
  kind?: "listing" | "content";
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [, startFixing] = useTransition();

  function handleFix(page: ListingPageAudit) {
    setBusy(page.key);
    startFixing(async () => {
      const r =
        kind === "content"
          ? await fixContentPageSeo(page.key)
          : await fixListingPageSeo(page.key as ListingPageKey);
      setBusy(null);
      if (!r.success) {
        toast({ title: "فشل الإصلاح", description: r.error ?? "خطأ غير معروف", variant: "destructive" });
        return;
      }
      // The scores are server props; without this the row keeps showing the number it
      // had BEFORE the fix, which reads as "the button did nothing".
      router.refresh();
      const reached = r.score ?? 0;
      toast({
        title: reached >= 100 ? `${page.label} — صار ١٠٠٪` : `${page.label} — ${reached}٪`,
        description:
          reached >= 100
            ? "أُعيد التوليد وحُدِّث الكاش على مدونتي."
            : "أُعيد التوليد، لكن باقي نقص يحتاج نصّاً أو صورة من شاشة الإعدادات.",
        variant: reached >= 100 ? "success" : "default",
      });
    });
  }

  return (
    <div className="divide-y rounded-xl border">
      {pages.map((page) => {
        const tone = scoreTone(page.score);
        const needsFix = page.score < 100;
        const isOpen = expanded === page.key;

        return (
          <div key={page.key} className={cn("px-3 py-2.5", needsFix && tone.ring)}>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : page.key)}
                aria-expanded={isOpen}
                className="flex flex-1 items-center gap-2 text-start transition hover:opacity-90"
              >
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
                    isOpen ? "" : "-rotate-90",
                  )}
                />
                <span className="text-sm font-semibold">{page.label}</span>
                <span className="font-mono text-[11px] text-muted-foreground">{page.path}</span>
                {needsFix && (
                  <span
                    className={cn(
                      "inline-flex animate-pulse items-center rounded-full px-1.5 py-0.5 text-[10.5px] font-bold",
                      page.score < 60
                        ? "bg-red-500/15 text-red-600 dark:text-red-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                    )}
                  >
                    {page.problems} مشكلة
                  </span>
                )}
              </button>

              <span className={cn("text-lg font-extrabold tabular-nums", tone.text)}>{page.score}</span>

              <Button
                size="sm"
                variant={needsFix ? "default" : "ghost"}
                disabled={!needsFix || busy !== null}
                onClick={() => handleFix(page)}
                className="h-7 gap-1.5 px-2.5 text-xs"
                title={needsFix ? "أعد توليد الميتا والـ JSON-LD من الإعدادات" : "الصفحة ١٠٠٪ — لا شيء لإصلاحه"}
              >
                {busy === page.key ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Wrench className="h-3.5 w-3.5" />
                )}
                إصلاح
              </Button>

              <a
                href={page.publicUrl}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground transition hover:text-foreground"
                title="افتح الصفحة على مدونتي"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {isOpen && (
              <ul className="mt-2 space-y-1 ps-6">
                {page.checks.map((check) => (
                  <li key={check.key} className="flex items-start gap-2 text-[11.5px]">
                    <span
                      className={cn(
                        "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                        check.status === "good"
                          ? "bg-emerald-500"
                          : check.status === "warning"
                            ? "bg-amber-500"
                            : "bg-red-500",
                      )}
                    />
                    <span className="text-muted-foreground">
                      <span className="font-medium text-foreground">{check.label}</span>
                      {check.hint && <> — {check.hint}</>}
                    </span>
                    <span className="ms-auto shrink-0 font-mono text-[10.5px] text-muted-foreground">
                      {check.earned}/{check.max}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
