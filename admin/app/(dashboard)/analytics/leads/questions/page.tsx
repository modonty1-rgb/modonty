import Link from "next/link";
import { ArrowRight, Building2, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getQuestionsReport, type QuestionOrigin, type QuestionKind } from "../../actions/get-questions-report";

// Questions report — every FAQ a client still owes an action on, split by who created it:
// team-prepared (awaiting the client's approval) vs visitor-asked (awaiting an answer).

const ORIGIN_LABEL: Record<QuestionOrigin, string> = {
  ARTICLE: "مقال",
  CLIENT_PAGE: "صفحة العميل",
};

/** Icons, not emoji (project rule) — one per origin. */
function OriginLabel({ origin }: { origin: QuestionOrigin }) {
  const Icon = origin === "ARTICLE" ? FileText : Building2;
  return (
    <span className="inline-flex items-center gap-1">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      {ORIGIN_LABEL[origin]}
    </span>
  );
}

const KIND_BADGE: Record<QuestionKind, { label: string; cls: string }> = {
  team: { label: "فريق مدونتي · تنتظر الموافقة", cls: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  visitor: { label: "زائر · ينتظر جواب", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
};

export default async function QuestionsReportPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; client?: string }>;
}) {
  const { view, client } = await searchParams;
  const { rows: allRows, kpi, byClient, byOrigin, truncated } = await getQuestionsReport();

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
    <div dir="rtl" className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">أسئلة تنتظر العملاء</h1>
          <p className="mt-1 text-muted-foreground">
            كل سؤال شائع ينتظر تصرّف العميل — اللي <b>جهّزها الفريق</b> تنتظر موافقته أو نشره، واللي
            <b>سألها زائر</b> تنتظر جوابه. بأي عمر. الأدمن يشوف ويذكّر؛ العميل يتصرف من الكونسول.
          </p>
        </div>
        <Link href="/" className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-sm hover:bg-muted">
          <ArrowRight className="size-4" aria-hidden />
          لوحة التحكم
        </Link>
      </div>

      {truncated && (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-400">
          الأسئلة تجاوزت حدّ القراءة، فالأرقام تحت أقل من الحقيقية — العدد الكامل في لوحة التحكم.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="border-t-4 border-t-red-500">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">تنتظر (الإجمالي)</p>
            <p className="text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">{kpi.pending}</p>
            <p className="text-xs text-muted-foreground">العميل ما تصرّف فيها</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-violet-500">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">فريق مدونتي</p>
            <p className="text-2xl font-bold tabular-nums text-violet-600 dark:text-violet-400">{kpi.team}</p>
            <p className="text-xs text-muted-foreground">تنتظر موافقة العميل</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-amber-500">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">زائر</p>
            <p className="text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">{kpi.visitor}</p>
            <p className="text-xs text-muted-foreground">تنتظر جواب العميل</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">عملاء عليهم أسئلة</p>
            <p className="text-2xl font-bold tabular-nums">{kpi.clientsWaiting}</p>
            <p className="text-xs text-muted-foreground">ذكّرهم{kpi.oldestWaitingDays !== null ? ` · أقدمها ${kpi.oldestWaitingDays} يوم` : ""}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">حسب العميل</CardTitle>
            <p className="text-xs text-muted-foreground">مين عليه — ذكّر أعلى القائمة أولاً</p>
          </CardHeader>
          <CardContent>
            {byClient.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">ما في شي ينتظر — كل العملاء خالصين</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="py-2 pe-3 text-start font-medium">العميل</th>
                      <th className="py-2 pe-3 text-start font-medium">فريق</th>
                      <th className="py-2 pe-3 text-start font-medium">زائر</th>
                      <th className="py-2 text-start font-medium">الإجمالي</th>
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
                            <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
                              {c.team}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-2 pe-3">
                          {c.visitor > 0 ? (
                            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
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
            <CardTitle className="text-base">وين السؤال</CardTitle>
            <p className="text-xs text-muted-foreground">أسئلة المقال مقابل صفحة العميل</p>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="py-2 pe-3 text-start font-medium">المكان</th>
                  <th className="py-2 text-start font-medium">تنتظر</th>
                </tr>
              </thead>
              <tbody>
                {byOrigin.map((o) => (
                  <tr key={o.origin} className="border-b last:border-0">
                    <td className="py-2 pe-3"><OriginLabel origin={o.origin} /></td>
                    <td className="py-2 font-bold tabular-nums">{o.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="pt-3 text-xs text-muted-foreground">
              العميل يوافق أو يجاوب على كل واحد منها من الكونسول. هذي الصفحة عشان يعرف الأدمن مين يذكّر.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">الأسئلة</CardTitle>
          <div className="flex flex-wrap gap-1.5 pt-2">
            <Link href={q({ view: "all", client })} className={tab(activeView === "all")}>
              الكل {kpi.pending}
            </Link>
            <Link href={q({ view: "team", client })} className={tab(activeView === "team")}>
              فريق مدونتي {kpi.team}
            </Link>
            <Link href={q({ view: "visitor", client })} className={tab(activeView === "visitor")}>
              زائر {kpi.visitor}
            </Link>
            {client && (
              <Link href={q({ view: activeView })} className={tab(true)}>
                العميل: {client} ✕
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">ما في سؤال بهذا الفلتر.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="py-2 pe-3 text-start font-medium">السؤال</th>
                    <th className="py-2 pe-3 text-start font-medium">النوع</th>
                    <th className="py-2 pe-3 text-start font-medium">المكان</th>
                    <th className="py-2 pe-3 text-start font-medium">العميل</th>
                    <th className="py-2 pe-3 text-start font-medium">ينتظر منذ</th>
                    <th className="py-2 text-start font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={`${r.origin}-${r.id}`} className="border-b align-top last:border-0">
                      <td className="max-w-[320px] py-2 pe-3 font-semibold">
                        {r.question}
                        {r.submittedBy && (
                          <div className="text-xs font-normal text-muted-foreground">سأله {r.submittedBy}</div>
                        )}
                      </td>
                      <td className="py-2 pe-3">
                        <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${KIND_BADGE[r.kind].cls}`}>
                          {KIND_BADGE[r.kind].label}
                        </span>
                      </td>
                      <td className="max-w-[200px] py-2 pe-3">
                        <div><OriginLabel origin={r.origin} /></div>
                        {r.articleTitle && <div className="truncate text-xs text-muted-foreground">{r.articleTitle}</div>}
                      </td>
                      <td className="py-2 pe-3">{r.clientName}</td>
                      <td className="whitespace-nowrap py-2 pe-3 tabular-nums">
                        <span className={r.waitingDays >= 7 ? "font-bold text-red-600 dark:text-red-400" : ""}>{r.waitingDays} يوم</span>
                      </td>
                      <td className="whitespace-nowrap py-2">
                        <Link href={r.href} className="text-xs font-semibold text-primary hover:underline">
                          افتح ←
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
