"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Square, Copy, Check, ExternalLink, Pencil, ShieldCheck, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { runArticleHealthBatch } from "../actions/run-health-check";
import { CriteriaDialog } from "./criteria-dialog";
// Types + labels only — importing the engine itself would drag server-only modules
// (the Bunny client, the site-url loader) into the browser bundle.
import {
  HEALTH_CHECK_LABEL,
  SEVERITY_LABEL,
  type HealthIssue,
} from "@/lib/health/article-health-types";

/**
 * Drives the sweep batch by batch and renders the result GROUPED BY ARTICLE.
 *
 * Grouping is deliberate: a writer thinks in articles, not in our check names. Showing
 * "8 issues on this article" with one edit link beats eight rows scattered across a table
 * sorted by check type.
 */

const SEVERITY_ORDER = { critical: 0, high: 1, low: 2 } as const;

const SEVERITY_STYLE: Record<string, string> = {
  critical: "bg-red-50 text-red-700 ring-red-200",
  high: "bg-amber-50 text-amber-700 ring-amber-200",
  low: "bg-slate-50 text-slate-600 ring-slate-200",
};

interface Props {
  total: number;
}

export function HealthRunner({ total }: Props) {
  const [running, setRunning] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [scanned, setScanned] = useState(0);
  const [requests, setRequests] = useState(0);
  const [issues, setIssues] = useState<HealthIssue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [copied, setCopied] = useState(false);

  async function run() {
    setRunning(true);
    setStopped(false);
    setFinished(false);
    setError(null);
    setIssues([]);
    setScanned(0);
    setRequests(0);

    let skip = 0;
    let stop = false;
    // A ref would be cleaner, but the stop button flips a module-scoped flag through
    // state here for simplicity — the loop re-reads it via the closure below.
    stopRef.stop = false;

    while (!stop) {
      const res = await runArticleHealthBatch({ skip });
      if (!res.ok) {
        setError(res.error);
        break;
      }
      setIssues((prev) => [...prev, ...res.issues]);
      setScanned(res.cursor);
      setRequests((prev) => prev + res.requests);
      skip = res.cursor;

      if (res.done) {
        setFinished(true);
        break;
      }
      if (stopRef.stop) {
        setStopped(true);
        stop = true;
      }
    }
    setRunning(false);
  }

  function copyReport() {
    const lines = [`تقرير صحّة المقالات — ${issues.length} ملاحظة على ${groups.length} مقالاً`, ""];
    for (const g of groups) {
      lines.push(
        `• ${g.title} — ${g.client ?? "بلا عميل"}${g.editor ? ` · المحرّر: ${g.editor}` : ""} [${g.status}]`
      );
      for (const i of g.issues) {
        lines.push(`   - ${HEALTH_CHECK_LABEL[i.check]}: ${i.detail}`);
        for (const t of i.targets) {
          lines.push(`       ${t.httpStatus === 0 ? "لا رد" : (t.httpStatus ?? "—")}  ${t.url}`);
        }
      }
    }
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Group by article, most severe first.
  const byArticle = new Map<string, HealthIssue[]>();
  for (const i of issues) {
    const list = byArticle.get(i.articleId) ?? [];
    list.push(i);
    byArticle.set(i.articleId, list);
  }
  const groups = [...byArticle.entries()]
    .map(([id, list]) => ({
      id,
      title: list[0].articleTitle,
      slug: list[0].articleSlug,
      status: list[0].articleStatus,
      client: list[0].clientName,
      editor: list[0].editorName,
      issues: [...list].sort(
        (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
      ),
      worst: Math.min(...list.map((i) => SEVERITY_ORDER[i.severity])),
    }))
    .sort((a, b) => a.worst - b.worst || b.issues.length - a.issues.length);

  const critical = issues.filter((i) => i.severity === "critical").length;
  const high = issues.filter((i) => i.severity === "high").length;
  const low = issues.filter((i) => i.severity === "low").length;
  const pct = total > 0 ? Math.round((scanned / total) * 100) : 0;

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 py-5">
          <Button onClick={run} disabled={running} className="gap-2">
            <Play className="h-4 w-4" />
            {running ? "Scanning…" : "Run health check"}
          </Button>
          {/* The rulebook, one click from the findings — a reader should never have to ask
              what a severity means or how sure the checker had to be. */}
          <CriteriaDialog />
          {running && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                stopRef.stop = true;
              }}
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
          )}
          {issues.length > 0 && !running && (
            <Button variant="outline" className="gap-2" onClick={copyReport}>
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy report"}
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            {scanned}/{total} articles · {requests} requests
          </span>
        </CardContent>
      </Card>

      {(running || scanned > 0) && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      {(finished || stopped) && issues.length === 0 && !error && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="flex items-center gap-3 py-6">
            <ShieldCheck className="h-6 w-6 shrink-0 text-emerald-600" />
            <div className="text-sm text-emerald-800">
              <p className="font-semibold">كل شي سليم — ولا ملاحظة واحدة.</p>
              <p className="mt-0.5 text-emerald-700">
                فُحص {scanned} مقالاً، وكل صورة ورابط استجاب كما ينبغي.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {issues.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge tone="critical">{critical} حرج</Badge>
            <Badge tone="high">{high} عالٍ</Badge>
            <Badge tone="low">{low} منخفض</Badge>
            <span className="ms-1 self-center text-muted-foreground">
              على {groups.length} مقالاً
              {stopped && " · أُوقف الفحص قبل النهاية"}
            </span>
          </div>

          <div className="space-y-3">
            {groups.map((g) => (
              <Card key={g.id}>
                <CardContent className="py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{g.title}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        {g.client && (
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
                            {g.client}
                          </span>
                        )}
                        {/* The client's assigned staff editor. Rendered only when set —
                            an empty badge beats a wrong name on a report like this. */}
                        {g.editor && (
                          <span
                            className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-medium"
                            title="المحرّر المسؤول عن هذا العميل"
                          >
                            <UserRound className="h-3 w-3" />
                            المحرّر: {g.editor}
                          </span>
                        )}
                        <span>{g.status}</span>
                        <span>·</span>
                        <span className="truncate">{g.slug}</span>
                      </p>
                    </div>
                    <Link
                      href={`/articles/${g.id}/edit`}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                  </div>

                  <ul className="mt-3 space-y-2">
                    {g.issues.map((i, idx) => (
                      <li key={idx} className="rounded-md border bg-muted/30 p-2.5 text-sm">
                        <div className="flex flex-wrap items-start gap-2">
                          <Badge tone={i.severity}>{SEVERITY_LABEL[i.severity]}</Badge>
                          <span className="rounded bg-background px-2 py-0.5 text-xs font-medium ring-1 ring-border">
                            {HEALTH_CHECK_LABEL[i.check]}
                          </span>
                          <span className="min-w-0 flex-1 text-muted-foreground">{i.detail}</span>
                        </div>
                        {/* Every failing URL, listed in full — the writer must be able to
                            check each one without guessing which was hidden. */}
                        {i.targets.length > 0 && (
                          <ul className="mt-2 space-y-1 border-t pt-2">
                            {i.targets.map((t, k) => (
                              <li key={k} className="flex items-start gap-2">
                                <span className="shrink-0 rounded bg-background px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ring-1 ring-border">
                                  {t.httpStatus === undefined
                                    ? "—"
                                    : t.httpStatus === 0
                                      ? "لا رد"
                                      : t.httpStatus}
                                </span>
                                <a
                                  href={t.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  dir="ltr"
                                  className="min-w-0 flex-1 break-all text-start text-xs text-primary hover:underline"
                                >
                                  {t.url}
                                </a>
                                <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span
      className={`rounded px-2 py-0.5 text-xs font-semibold ring-1 ${SEVERITY_STYLE[tone] ?? SEVERITY_STYLE.low}`}
    >
      {children}
    </span>
  );
}

/** Module-scoped stop flag — the loop reads it each iteration without a re-render. */
const stopRef = { stop: false };
