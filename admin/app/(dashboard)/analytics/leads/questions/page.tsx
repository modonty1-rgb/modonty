import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getQuestionsReport, type QuestionOrigin } from "../../actions/get-questions-report";

// Questions report — built from the approved mockup
// (documents/mockups/admin-visitor-actions-v1.html, Khalid 2026-07-13).
// Default view = the unanswered ones, because that is the only list that needs a human.

const ORIGIN_LABEL: Record<QuestionOrigin, string> = {
  ARTICLE: "📄 Article",
  CLIENT_PAGE: "🏢 Client page",
};

function fmt(iso: string): string {
  return iso.slice(0, 10);
}

export default async function QuestionsReportPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; client?: string }>;
}) {
  const { view, client } = await searchParams;
  const { rows: allRows, kpi, byClient, byOrigin } = await getQuestionsReport();

  // Unanswered is the default — an answered question needs nothing from anyone.
  const activeView = view ?? "unanswered";
  const rows = allRows.filter((r) => {
    if (activeView === "unanswered" && r.status !== "PENDING") return false;
    if (activeView === "answered" && r.status !== "PUBLISHED") return false;
    if (client && r.clientName !== client) return false;
    return true;
  });

  const tab = (active: boolean) =>
    `rounded-md border px-3 py-1 text-xs transition ${
      active ? "border-foreground bg-foreground font-semibold text-background" : "border-input hover:bg-muted"
    }`;

  const q = (next: { view?: string; client?: string }) => {
    const p = new URLSearchParams();
    if (next.view) p.set("view", next.view);
    if (next.client) p.set("client", next.client);
    const s = p.toString();
    return `/analytics/leads/questions${s ? `?${s}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Questions report</h1>
          <p className="mt-1 text-muted-foreground">
            Last 90 days · questions visitors actually wrote (article FAQ + client page). Asking requires an
            account, so every asker is a registered member.
          </p>
        </div>
        <Link href="/" className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-muted">
          ← Back to dashboard
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="border-t-4 border-t-red-500">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Unanswered</p>
            <p className="text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">{kpi.unanswered}</p>
            <p className="text-[11px] text-muted-foreground">waiting for an answer</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Answered</p>
            <p className="text-2xl font-bold tabular-nums">{kpi.answered}</p>
            <p className="text-[11px] text-muted-foreground">published as an FAQ</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Oldest waiting</p>
            <p className="text-2xl font-bold tabular-nums">
              {kpi.oldestWaitingDays === null ? "—" : `${kpi.oldestWaitingDays}d`}
            </p>
            <p className="text-[11px] text-muted-foreground">the visitor is still waiting</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Clients owing an answer</p>
            <p className="text-2xl font-bold tabular-nums">{kpi.clientsWaiting}</p>
            <p className="text-[11px] text-muted-foreground">nudge them</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By client</CardTitle>
            <p className="text-xs text-muted-foreground">who owes an answer</p>
          </CardHeader>
          <CardContent>
            {byClient.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No visitor questions in the last 90 days</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="py-2 pe-3 text-start font-medium">Client</th>
                    <th className="py-2 pe-3 text-start font-medium">Unanswered</th>
                    <th className="py-2 text-start font-medium">Answered</th>
                  </tr>
                </thead>
                <tbody>
                  {byClient.map((c) => (
                    <tr key={c.name} className="border-b last:border-0">
                      <td className="py-2 pe-3 font-semibold">
                        <Link href={q({ view: activeView, client: c.name })} className="hover:underline">
                          {c.name}
                        </Link>
                      </td>
                      <td className="py-2 pe-3">
                        {c.unanswered > 0 ? (
                          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-semibold text-red-700 dark:text-red-400">
                            {c.unanswered}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2 font-bold tabular-nums">{c.answered}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Where the question came from</CardTitle>
            <p className="text-xs text-muted-foreground">article FAQ vs client page</p>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="py-2 pe-3 text-start font-medium">Origin</th>
                  <th className="py-2 pe-3 text-start font-medium">Unanswered</th>
                  <th className="py-2 text-start font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {byOrigin.map((o) => (
                  <tr key={o.origin} className="border-b last:border-0">
                    <td className="py-2 pe-3">{ORIGIN_LABEL[o.origin]}</td>
                    <td className="py-2 pe-3">
                      {o.unanswered > 0 ? (
                        <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-semibold text-red-700 dark:text-red-400">
                          {o.unanswered}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-2 font-bold tabular-nums">{o.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="pt-3 text-[11px] text-muted-foreground">
              Article questions are answered here in the article editor. Client-page questions belong to the client
              — they answer those in the console.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Questions</CardTitle>
          <div className="flex flex-wrap gap-1.5 pt-2">
            <Link href={q({ view: "unanswered", client })} className={tab(activeView === "unanswered")}>
              Unanswered {kpi.unanswered}
            </Link>
            <Link href={q({ view: "answered", client })} className={tab(activeView === "answered")}>
              Answered {kpi.answered}
            </Link>
            <Link href={q({ view: "all", client })} className={tab(activeView === "all")}>
              All {allRows.length}
            </Link>
            {client && (
              <Link href={q({ view: activeView })} className={tab(true)}>
                Client: {client} ✕
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Nothing here — no question matches this filter</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="py-2 pe-3 text-start font-medium">Question</th>
                    <th className="py-2 pe-3 text-start font-medium">Where</th>
                    <th className="py-2 pe-3 text-start font-medium">Client</th>
                    <th className="py-2 pe-3 text-start font-medium">Asked by</th>
                    <th className="py-2 pe-3 text-start font-medium">Waiting</th>
                    <th className="py-2 pe-3 text-start font-medium">Status</th>
                    <th className="py-2 text-start font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={`${r.origin}-${r.id}`} className="border-b align-top last:border-0">
                      <td className="max-w-[320px] py-2 pe-3 font-semibold">{r.question}</td>
                      <td className="max-w-[200px] py-2 pe-3">
                        <div>{ORIGIN_LABEL[r.origin]}</div>
                        {r.articleTitle && <div className="truncate text-xs text-muted-foreground">{r.articleTitle}</div>}
                      </td>
                      <td className="py-2 pe-3">{r.clientName}</td>
                      <td className="py-2 pe-3">
                        <div>{r.askedByName}</div>
                        {r.askedByEmail && <div className="text-xs text-muted-foreground">{r.askedByEmail}</div>}
                      </td>
                      <td className="whitespace-nowrap py-2 pe-3 tabular-nums">
                        {r.status === "PENDING" ? (
                          <span className={r.waitingDays >= 7 ? "font-bold text-red-600 dark:text-red-400" : ""}>{r.waitingDays}d</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">{fmt(r.createdAt)}</span>
                        )}
                      </td>
                      <td className="py-2 pe-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            r.status === "PENDING"
                              ? "bg-red-500/15 text-red-700 dark:text-red-400"
                              : r.status === "PUBLISHED"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-2">
                        <Link href={r.href} className="text-xs font-semibold text-primary hover:underline">
                          {r.canAnswerHere ? "Answer →" : "Open client →"}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
