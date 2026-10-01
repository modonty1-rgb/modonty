import Link from "next/link";

import { GoogleIcon } from "@/components/admin/icons/google-icon";
import { getModontyGoogleSummary } from "../../helpers/get-modonty-google-summary";
import { GoogleSearchWindows } from "../google-search-windows";

/**
 * «جوجل — مدونتي»: impressions, clicks, CTR and position for modonty.com, 7 / 28 / 90 days,
 * each against the period before it (Khalid, 1 Oct 2026: «الإمبريشن والسي تي آر والمعلومات
 * المهمة بس… في الداشبورد»). The numbers only — the detail lives on /search-console.
 */
export async function GoogleSearchCard() {
  const summary = await getModontyGoogleSummary();

  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-sm" aria-label="جوجل — مدونتي">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <h2 className="flex items-center gap-2 text-[15px] font-extrabold">
          <GoogleIcon className="size-4" />
          جوجل — مدونتي
          {summary && (
            <span className="text-xs font-normal text-muted-foreground">
              حتى {formatDay(summary.lastFinalDay)} · بيانات جوجل النهائية
            </span>
          )}
        </h2>
        <div className="flex items-center gap-4">
          {/* Impressions in AI Overviews / AI Mode: Google shows them in Search Console only —
              the API's appearance types for modonty are VIDEO and FORUMS (queried 1 Oct 2026). */}
          <a
            href="https://search.google.com/search-console?resource_id=sc-domain%3Amodonty.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-primary hover:underline"
          >
            الظهور في الذكاء الاصطناعي ↗
          </a>
          <Link href="/search-console" className="text-xs font-semibold text-primary hover:underline">
            التفاصيل ←
          </Link>
        </div>
      </div>
      {summary ? (
        <GoogleSearchWindows windows={summary.windows} />
      ) : (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">تعذّر جلب أرقام جوجل الآن — جرّب بعد قليل.</p>
      )}
    </section>
  );
}

function formatDay(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("ar-SA-u-ca-gregory-nu-latn", { day: "numeric", month: "long", timeZone: "UTC" });
}
