import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { visitorActionsSummary } from "@/lib/dashboard/cached";

import { getGA4Activity } from "./actions/get-ga4-activity";
import { getClients } from "./actions/get-clients";
import { getArticles } from "./actions/get-articles";
import { FullActivityClient } from "./components/full-activity-client";

// Traffic analytics lives here, not on the dashboard home (Khalid 2026-07-13:
// «الداشبورد تنكمش لا تكبر»). The home is a triage screen — only what needs a
// decision today. Anything you browse rather than act on gets its own route, so
// it loads its own data and nothing else.
//
// This reverses the 2026-07-08 merge, which folded this block into the dashboard
// and left /analytics as a bare redirect.
export default async function AnalyticsPage() {
  const [activity, clients, articles, va] = await Promise.all([
    getGA4Activity(),
    getClients(),
    getArticles(),
    visitorActionsSummary(),
  ]);
  const n = (v: number) => v.toLocaleString("en-US");

  return (
    <div dir="rtl" className="mx-auto max-w-[1280px] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">تحاليل الزيارات</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            كل ما شافه جوجل — المشاهدات والمصادر والجغرافيا والزمن
          </p>
        </div>
        <Link href="/" className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-sm hover:bg-muted">
          <ArrowRight className="size-4" aria-hidden />
          لوحة التحكم
        </Link>
      </div>

      {/* The numbers the dashboard's «الزوار · 90 يوم» card shows — the same cached call — so
          the page it opens starts with the figure that was clicked (1 Oct 2026). */}
      <p className="rounded-lg border bg-card px-4 py-3 text-sm">
        <b>آخر 90 يوم · GA4:</b> {n(va.visitors.users)} شخص · {n(va.visitors.sessions)} جلسة ·{" "}
        {Math.round(va.visitors.actionRate ?? 0)}٪ تفاعلوا · {n(va.visitors.aiSessions)} من إجابات الذكاء
      </p>

      <FullActivityClient initialData={activity} clients={clients} articles={articles} />
    </div>
  );
}
