"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ExternalLink, Star, AlertTriangle } from "lucide-react";

import { getStatusLabel } from "../../../articles/helpers/status-utils";
import { setMainArticle } from "../../actions/set-main-article";
import type { ClientSiteArticleRow } from "../helpers/load-client-detail";

function formatDate(value: Date | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(value);
}

interface Props {
  clientId: string;
  articles: ClientSiteArticleRow[];
  /** Below the four-article floor the control is shown but inert, with the reason. */
  canMarkMain: boolean;
}

/**
 * The client's articles, with the main-article control living IN the row (Khalid
 * 2026-08-08: «أبغى أسوي control لكل الـswitches من الجدول»). Marking a hub is a
 * comparison — you look down the list and pick — so the control belongs where the
 * comparison happens, not three clicks away inside each article.
 */
export function ClientArticlesDetailTable({ clientId, articles, canMarkMain }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const mark = (articleId: string) => {
    setError(null);
    setBusyId(articleId);
    startTransition(async () => {
      const result = await setMainArticle(clientId, articleId);
      if (!result.success) setError(result.error ?? "Failed");
      setBusyId(null);
    });
  };

  if (articles.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">No articles for this client&apos;s site yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-destructive">{error}</p>}
      {!canMarkMain && (
        <p className="text-xs text-muted-foreground">
          A main article needs at least 4 articles under it. This client has {articles.length}.
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-start font-medium">Main</th>
              <th className="px-3 py-2 text-start font-medium">Title</th>
              <th className="px-3 py-2 text-start font-medium">Status</th>
              <th className="px-3 py-2 text-start font-medium">Published</th>
              <th className="px-3 py-2 text-start font-medium">Last fetch</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => {
              const neverFetched =
                article.status === "PUBLISHED_ON_CLIENT_SITE" && !article.lastFetchedAt;
              return (
                <tr key={article.id} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      disabled={!canMarkMain || pending || article.isMainArticle}
                      onClick={() => mark(article.id)}
                      className="disabled:cursor-default disabled:opacity-60"
                      aria-label={article.isMainArticle ? "This is the main article" : "Make this the main article"}
                      title={article.isMainArticle ? "Main article" : "Make this the main article"}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          article.isMainArticle
                            ? "fill-amber-400 text-amber-500"
                            : busyId === article.id
                              ? "animate-pulse text-muted-foreground"
                              : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      {/* The article's own view page — the same flow as the main list:
                          view first, edit from there. The only thing that differs on a
                          client-site article is the destination bar at the top. */}
                      <Link href={`/articles/${article.id}`} className="font-medium hover:underline">
                        {article.title}
                      </Link>
                      {article.publicUrl && (
                        <a
                          href={article.publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Open on the client's site"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">{getStatusLabel(article.status)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">{formatDate(article.datePublished)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {neverFetched ? (
                      <span className="inline-flex items-center gap-1 font-medium text-amber-600">
                        <AlertTriangle className="h-3 w-3" />
                        Never
                      </span>
                    ) : (
                      <span className="text-muted-foreground">{formatDate(article.lastFetchedAt)}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
