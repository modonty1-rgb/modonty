"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Eye, FolderOpen, Workflow, PenLine } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/data-table";
import { CountTab } from "@/components/admin/count-tab";
import { getStatusLabel, getStatusVariant } from "../helpers/status-utils";
import { getArticleSeoScore } from "@/lib/seo/article-seo-score";
import { GoogleIcon } from "@/components/admin/icons/google-icon";
import { SeoScoreBadge } from "@/components/shared/seo-score-badge";
import type { Article as ArticleViewType } from "../[id]/helpers/article-view-types";

type Article = ArticleViewType & {
  views: number;
};

interface ArticleTableProps {
  articles: Article[];
  search?: string;
}

const NO_EDITOR = "__none__";

export function ArticleTable({ articles, search: externalSearch }: ArticleTableProps) {
  const router = useRouter();
  const [editorFilter, setEditorFilter] = useState<string | null>(null);

  // Shared dataLayer scorer — the same number the article badge + segment tables show.
  const seoScores = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of articles) map.set(a.id, getArticleSeoScore(a));
    return map;
  }, [articles]);

  // Distinct editors present across the current set (via each article's client), with
  // the article count each is responsible for. Drives the CountTab filter pills.
  const editorOptions = useMemo(() => {
    const byId = new Map<string, { id: string; name: string; count: number }>();
    let noneCount = 0;
    for (const a of articles) {
      const ed = a.client?.editor;
      if (ed?.id) {
        const prev = byId.get(ed.id);
        if (prev) prev.count += 1;
        else byId.set(ed.id, { id: ed.id, name: ed.name ?? "—", count: 1 });
      } else {
        noneCount += 1;
      }
    }
    return { list: Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name)), noneCount };
  }, [articles]);

  // External header search + editor filter are applied here; DataTable owns sort + pagination.
  const filtered = useMemo(() => {
    const term = (externalSearch || "").toLowerCase();
    return articles.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(term) ||
        a.client?.name.toLowerCase().includes(term) ||
        a.category?.name.toLowerCase().includes(term) ||
        a.client?.editor?.name?.toLowerCase().includes(term) ||
        "modonty".includes(term);
      if (!matchesSearch) return false;
      if (editorFilter === NO_EDITOR) return !a.client?.editor?.id;
      if (editorFilter) return a.client?.editor?.id === editorFilter;
      return true;
    });
  }, [articles, externalSearch, editorFilter]);

  const columns: Column<Article>[] = [
    {
      key: "client",
      header: "",
      sortFn: (a, b) => (a.client?.name ?? "").localeCompare(b.client?.name ?? ""),
      render: (a) => (
        <div
          className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center bg-muted border border-border cursor-pointer"
          title={a.client?.name ?? "No client"}
          onClick={(e) => {
            e.stopPropagation();
            if (a.client?.id) router.push(`/clients/${a.client.id}`);
          }}
        >
          {a.client?.logoMedia?.url ? (
            <Image
              src={a.client.logoMedia.url}
              alt={a.client.logoMedia.altText || a.client.name}
              width={32}
              height={32}
              className="object-contain w-full h-full"
            />
          ) : (
            <span className="text-xs font-semibold text-muted-foreground">
              {a.client?.name?.charAt(0).toUpperCase() ?? "?"}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "title",
      header: "Article",
      sortFn: (a, b) => a.title.localeCompare(b.title),
      render: (a) => (
        <div className="space-y-0.5 whitespace-normal">
          <Link
            href={`/articles/${a.id}`}
            className="font-medium hover:text-primary line-clamp-1"
            onClick={(e) => e.stopPropagation()}
          >
            {a.title}
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {a.client?.name && <span>{a.client.name}</span>}
            {a.client?.name && a.category?.name && <span>·</span>}
            {a.category?.name && (
              <span className="flex items-center gap-0.5">
                <FolderOpen className="h-3 w-3" />
                {a.category.name}
              </span>
            )}
            {a.views > 0 && (
              <>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <Eye className="h-3 w-3" />
                  {a.views.toLocaleString()}
                </span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "seo",
      header: <GoogleIcon className="h-4 w-4" />,
      sortFn: (a, b) => (seoScores.get(a.id) ?? 0) - (seoScores.get(b.id) ?? 0),
      render: (a) => (
        <span onClick={(e) => e.stopPropagation()}>
          <SeoScoreBadge score={seoScores.get(a.id) ?? 0} size="sm" />
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortFn: (a, b) => a.status.localeCompare(b.status),
      render: (a) => <Badge variant={getStatusVariant(a.status)}>{getStatusLabel(a.status)}</Badge>,
    },
    {
      key: "editor",
      header: (
        <span className="inline-flex items-center gap-1">
          <PenLine className="h-3.5 w-3.5 text-muted-foreground" />
          Editor
        </span>
      ),
      sortable: false,
      render: (a) =>
        a.client?.editor?.name ? (
          <span className="inline-flex items-center gap-1 text-xs text-foreground/80">
            <PenLine className="h-3 w-3 text-muted-foreground" />
            <span className="line-clamp-1">{a.client.editor.name}</span>
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/40">—</span>
        ),
    },
    {
      key: "date",
      header: "Date",
      sortFn: (a, b) =>
        new Date(a.datePublished || a.scheduledAt || a.createdAt).getTime() -
        new Date(b.datePublished || b.scheduledAt || b.createdAt).getTime(),
      render: (a) => (
        <span className="text-xs tabular-nums text-muted-foreground">
          {format(new Date(a.datePublished || a.createdAt), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      key: "pipeline",
      header: "Pipeline",
      sortable: false,
      render: (a) => (
        <span onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/articles/pipeline/${a.id}`}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 text-xs font-medium transition-colors"
            title="Open SEO pipeline"
          >
            <Workflow className="h-3.5 w-3.5" />
            Pipeline
          </Link>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Editor filter — CountTab pills (entity-standard #1), built from the editors
          linked to each article's client. Client-side, combined with the header search. */}
      {editorOptions.list.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="me-1 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <PenLine className="h-3.5 w-3.5" /> Editor:
          </span>
          <CountTab label="All" count={articles.length} active={editorFilter === null} onClick={() => setEditorFilter(null)} />
          {editorOptions.list.map((ed) => (
            <CountTab
              key={ed.id}
              label={ed.name}
              count={ed.count}
              active={editorFilter === ed.id}
              onClick={() => setEditorFilter(editorFilter === ed.id ? null : ed.id)}
            />
          ))}
          {editorOptions.noneCount > 0 && (
            <CountTab
              label="No editor"
              count={editorOptions.noneCount}
              active={editorFilter === NO_EDITOR}
              onClick={() => setEditorFilter(editorFilter === NO_EDITOR ? null : NO_EDITOR)}
            />
          )}
        </div>
      )}

      <DataTable
        data={filtered}
        columns={columns}
        onRowClick={(a) => router.push(`/articles/${a.id}`)}
      />
    </div>
  );
}
