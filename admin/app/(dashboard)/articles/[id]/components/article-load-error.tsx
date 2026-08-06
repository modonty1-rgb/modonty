"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, ChevronDown, Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

import type { ArticleLoadProblem } from "../../actions/articles-actions/queries/article-load-problem";

interface ArticleLoadErrorProps {
  articleId: string;
  problem: ArticleLoadProblem;
}

/**
 * Shown in place of the article when the row exists but cannot be read.
 *
 * The writer is not the person who can fix this, so the page has exactly one job: make the
 * fault visible and hand over everything the admin team needs to act on it in one copy.
 * The driver message is kept, but folded away — it answers "what exactly" for whoever
 * fixes it without being the first thing a writer reads.
 */
export function ArticleLoadError({ articleId, problem }: ArticleLoadErrorProps) {
  const [copied, setCopied] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const report = `Article ID: ${articleId}\nProblem: ${problem.summary}\nTechnical detail: ${problem.detail}`;

  async function handleCopyReport() {
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-2xl py-10">
      <Card className="border-destructive/40">
        <CardContent className="space-y-5 p-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </span>
            <div className="min-w-0 space-y-1">
              <h1 className="text-lg font-semibold leading-tight">This article can&apos;t be opened</h1>
              <p className="text-sm text-muted-foreground">
                Nothing you did caused this, and nothing you write is lost — the article&apos;s
                own data is incomplete, so the page cannot be built.
              </p>
            </div>
          </div>

          <div className="rounded-md border bg-muted/40 p-4">
            <p className="text-sm leading-relaxed">{problem.summary}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Send this to the admin team so they can fix it</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-muted px-2 py-1.5 font-mono text-xs" dir="ltr">
                {articleId}
              </code>
              <Button variant="outline" size="sm" onClick={handleCopyReport}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy report"}
              </Button>
            </div>
          </div>

          <Collapsible open={showDetail} onOpenChange={setShowDetail}>
            <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showDetail && "rotate-180")} />
              Technical details
            </CollapsibleTrigger>
            <CollapsibleContent>
              <pre
                className="mt-2 overflow-x-auto rounded border bg-muted/60 p-3 font-mono text-[11px] leading-relaxed"
                dir="ltr"
              >
                {problem.detail}
              </pre>
            </CollapsibleContent>
          </Collapsible>

          <Button asChild variant="ghost" size="sm" className="px-0">
            <Link href="/articles">
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              Back to articles
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
