import { getArticleActions } from "@modonty/shared/lib/analytics/get-article-actions";
import { ConversionsTable } from "./components/conversions-table";

export const metadata = { title: "Article Conversions" };

/**
 * **Article Conversions** — under «Articles» (Khalid, 6–7 Oct 2026, Tarek's task): the leads each
 * client got from its articles. One row per client · «+» its converting articles · an article
 * opens what happened in it. «من الحاجات المهمّة اللي بتساعد فريق المحتوى يعرف نوعية الارتكل
 * اللي بتجيب شغل».
 *
 * Counting happens in Mongo (`getArticleActions`, shared with the console — the team's number is
 * the client's number), one read for the period.
 */
const PERIODS = [7, 30, 90] as const;

export default async function ArticleConversionsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const sp = await searchParams;
  const days = PERIODS.find((p) => String(p) === sp.days) ?? 30;
  const { rows, byClient } = await getArticleActions({ days });

  return (
    <div className="space-y-3 px-4 pb-6 sm:px-5">
      <ConversionsTable rows={rows} byClient={byClient} days={days} />
    </div>
  );
}
