import { Stethoscope } from "lucide-react";

import { db } from "@/lib/db";
import { HealthRunner } from "./components/health-runner";

export const dynamic = "force-dynamic";

/**
 * Article health — lives under Articles, NOT under the database maintenance page.
 *
 * Khalid's call (2026-08-04): "تكون الصيانة هذه تحت الـ articles عشان الـ content يعرفوا
 * مشاكلهم". The audience is the content team, and a writer will never open a database
 * screen to discover that their cover image died. Putting it on their daily path is what
 * makes the discovery automatic.
 */
export default async function ArticleHealthPage() {
  const total = await db.article.count();

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Stethoscope className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Article Health</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Knocks on every image and link of every article to see if it still answers.
            Read-only — it reports, it never repairs.
          </p>
        </div>
      </div>

      <HealthRunner total={total} />
    </div>
  );
}
