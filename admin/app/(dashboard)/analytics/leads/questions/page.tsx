import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getQuestionsReport, type QuestionOrigin, type QuestionKind } from "../../actions/get-questions-report";

// Questions report — every FAQ a client still owes an action on, split by who created it:
// team-prepared (awaiting the client's approval) vs visitor-asked (awaiting an answer).

const ORIGIN_LABEL: Record<QuestionOrigin, string> = {
  ARTICLE: "📄 Article",
  CLIENT_PAGE: "🏢 Client page",
};

const KIND_BADGE: Record<QuestionKind, { label: string; cls: string }> = {
  team: { label: "فريق مودونتي · awaiting approval", cls: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  visitor: { label: "زائر · awaiting answer", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
};

export default async function QuestionsReportPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; client?: string }>;
}) {
  const { view, client } = await searchParams;
  const { rows: allRows, kpi, byClient, byOrigin } = await getQuestionsReport();

  // Default = all pending. Tabs narrow to one kind.
  const activeView = view === "team" || view === "visitor" ? view : "all";
  const rows = allRows.filter((r) => {
    if (activeView !== "all" && r.kind !== activeView) return false;
    if (client && r.clientName !== client) return false;
    return true;
  });

  const tab = (active: boolean) =>
    `rounded-md border px-3 py-1 text-xs transition ${
      active ? "border-foreground bg-foreground font-semibold text-background" : "border-input hover:bg-muted"
    }`;

  const q = (next: { view?: string; client?: string }) => {
    const p = new URLSearchParams();
    if (next.view && next.view !== "all") p.set("view", next.view);
    if (next.client) p.set("client", next.client);
    const s = p.toString();
    return `/analytics/leads/questions${s ? `?${s}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Questions waiting on your clients</h1>
          <p className="mt-1 text-muted-foreground">
            Every pending FAQ the client still owes an action on — <b>team-prepared</b> ones waiting for the
            client to approve/publish, and <b>visitor-asked</b> ones waiting for an answer. Any age. The admin
            sees and nudges; the client acts from their console.
          </p>
        </div>
        <Link href="/" className="shrink-0 rounded-md border border-input px-3 py-1.5 text-sm hover:bg-muted">
          ← Back to dashboard
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="border-t-4 border-t-red-500">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Pending (total)</p>
            <p className="text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">{kpi.pending}</p>
            <p className="text-[11px] text-muted-foreground">the client hasn&apos;t acted on</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-violet-500">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">فريق مودونتي</p>
            <p className="text-2xl font-bold tabular-nums text-violet-600 dark:text-violet-400">{kpi.team}</p>
            <p className="text-[11px] text-muted-foreground">awaiting the client&apos;s approval</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-amber-500">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">زائر</p>
            <p className="text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">{kpi.visitor}</p>
            <p className="text-[11px] text-muted-foreground">awaiting the client&apos;s answer</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Clients waiting</p>
            <p className="text-2xl font-bold tabular-nums">{kpi.clientsWaiting}</p>
            <p className="text-[11px] text-muted-foreground">nudge them{kpi.oldestWaitingDays !== null ? ` · oldest ${kpi.oldestWaitingDays}d` : ""}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By client</CardTitle>
            <p className="text-xs text-muted-foreground">who owes — nudge the top of the list first</p>
          </CardHeader>
          <CardContent>
            {byClient.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Nothing pending — every client is clear</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="py-2 pe-3 text-start font-medium">Client</th>
                      <th className="py-2 pe-3 text-start font-medium">فريق</th>
                      <th className="py-2 pe-3 text-start font-medium">زائر</th>
                      <th className="py-2 text-start font-medium">Total</th>
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
                          {c.team > 0 ? (
                            <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[11px] font-semibold text-violet-700 dark:text-violet-300">
                              {c.team}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-2 pe-3">
                          {c.visitor > 0 ? (
                            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                              {c.visitor}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-2 font-bold tabular-nums">{c.team + c.visitor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Where it lives</CardTitle>
            <p className="text-xs text-muted-foreground">article FAQ vs client page</p>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="py-2 pe-3 text-start font-medium">Origin</th>
                  <th className="py-2 text-start font-medium">Pending</th>
                </tr>
              </thead>
              <tbody>
                {byOrigin.map((o) => (
                  <tr key={o.origin} className="border-b last:border-0">
                    <td className="py-2 pe-3">{ORIGIN_LABEL[o.origin]}</td>
                    <td className="py-2 font-bold tabular-nums">{o.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="pt-3 text-[11px] text-muted-foreground">
              The client approves/answers every one of these from their console. This page is the admin&apos;s
              view to know who to nudge.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Questions</CardTitle>
          <div className="flex flex-wrap gap-1.5 pt-2">
            <Link href={q({ view: "all", client })} className={tab(activeView === "all")}>
              All {kpi.pending}
            </Link>
            <Link href={q({ view: "team", client })} className={tab(activeView === "team")}>
              فريق مودونتي {kpi.team}
            </Link>
            <Link href={q({ view: "visitor", client })} className={tab(activeView === "visitor")}>
              زائر {kpi.visitor}
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
                    <th className="py-2 pe-3 text-start font-medium">Kind</th>
                    <th className="py-2 pe-3 text-start font-medium">Where</th>
                    <th className="py-2 pe-3 text-start font-medium">Client</th>
                    <th className="py-2 pe-3 text-start font-medium">Waiting</th>
                    <th className="py-2 text-start font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={`${r.origin}-${r.id}`} className="border-b align-top last:border-0">
                      <td className="max-w-[320px] py-2 pe-3 font-semibold">
                        {r.question}
                        {r.submittedBy && (
                          <div className="text-xs font-normal text-muted-foreground">asked by {r.submittedBy}</div>
                        )}
                      </td>
                      <td className="py-2 pe-3">
                        <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${KIND_BADGE[r.kind].cls}`}>
                          {KIND_BADGE[r.kind].label}
                        </span>
                      </td>
                      <td className="max-w-[200px] py-2 pe-3">
                        <div>{ORIGIN_LABEL[r.origin]}</div>
                        {r.articleTitle && <div className="truncate text-xs text-muted-foreground">{r.articleTitle}</div>}
                      </td>
                      <td className="py-2 pe-3">{r.clientName}</td>
                      <td className="whitespace-nowrap py-2 pe-3 tabular-nums">
                        <span className={r.waitingDays >= 7 ? "font-bold text-red-600 dark:text-red-400" : ""}>{r.waitingDays}d</span>
                      </td>
                      <td className="whitespace-nowrap py-2">
                        <Link href={r.href} className="text-xs font-semibold text-primary hover:underline">
                          Open →
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
