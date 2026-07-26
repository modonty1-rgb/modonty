"use client";

import { useRouter } from "next/navigation";

import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/admin/data-table";
import { SeoScoreBadge } from "@/components/shared/seo-score-badge";
import { GoogleIcon } from "@/components/admin/icons/google-icon";
import { TagRowActions } from "./tag-row-actions";

// A slug segment of exactly "test" flags an item accidentally created during development.
const isTestSlug = (slug: string) => slug.toLowerCase().split("-").includes("test");

interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  _count: { articles: number };
  seoScore: number;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" });

// Shared DataTable (entity-standard #3) + SEO column from the reference scorer (#2).
export function TagTable({ tags }: { tags: Tag[] }) {
  const router = useRouter();

  const columns: Column<Tag>[] = [
    {
      key: "name",
      header: "Name",
      sortFn: (a, b) => a.name.localeCompare(b.name),
      render: (t) => (
        <span className="flex items-center gap-1.5">
          <span className="text-sm font-medium">{t.name}</span>
          {isTestSlug(t.slug) && (
            <span title={`Slug «${t.slug}» — likely a dev artifact, review`} className="inline-flex">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-label="Test slug" />
            </span>
          )}
        </span>
      ),
    },
    {
      key: "articles",
      header: "Articles",
      sortFn: (a, b) => a._count.articles - b._count.articles,
      render: (t) => (
        <Badge
          variant={t._count.articles > 0 ? "default" : "secondary"}
          className={`text-xs tabular-nums ${t._count.articles === 0 ? "opacity-50" : ""}`}
        >
          {t._count.articles}
        </Badge>
      ),
    },
    {
      key: "seo",
      header: <GoogleIcon className="h-4 w-4" />,
      sortFn: (a, b) => a.seoScore - b.seoScore,
      render: (t) => (
        <span onClick={(e) => e.stopPropagation()}>
          <SeoScoreBadge score={t.seoScore} size="sm" href={`/tags/${t.id}/technical`} />
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortFn: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (t) => (
        <span className="text-xs tabular-nums text-muted-foreground">
          {dateFormatter.format(new Date(t.createdAt))}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (t) => (
        <span onClick={(e) => e.stopPropagation()}>
          <TagRowActions tagId={t.id} />
        </span>
      ),
    },
  ];

  return (
    <DataTable
      data={tags}
      columns={columns}
      searchKey="name"
      searchPlaceholder="Search tags..."
      onRowClick={(t) => router.push(`/tags/${t.id}`)}
    />
  );
}
