"use client";

import { useRouter } from "next/navigation";

import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/admin/data-table";
import { SeoScoreBadge } from "@/components/shared/seo-score-badge";
import { GoogleIcon } from "@/components/admin/icons/google-icon";
import { CategoryRowActions } from "./category-row-actions";

// A slug segment of exactly "test" flags an item accidentally created during development.
const isTestSlug = (slug: string) => slug.toLowerCase().split("-").includes("test");

interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  parent: { name: string } | null;
  _count: { articles: number };
  seoScore: number;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" });

// Uses the shared DataTable (entity-standard #3: one density, search, sort, pagination)
// with the SEO column showing SeoScoreBadge from the reference scorer (#2).
export function CategoryTable({ categories }: { categories: Category[] }) {
  const router = useRouter();

  const columns: Column<Category>[] = [
    {
      key: "name",
      header: "Name",
      sortFn: (a, b) => a.name.localeCompare(b.name),
      render: (c) => (
        <span className="flex items-center gap-1.5">
          <span className="text-sm font-medium">{c.name}</span>
          {isTestSlug(c.slug) && (
            <span title={`Slug «${c.slug}» — likely a dev artifact, review`} className="inline-flex">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-label="Test slug" />
            </span>
          )}
        </span>
      ),
    },
    {
      key: "parent",
      header: "Parent",
      sortFn: (a, b) => (a.parent?.name || "").localeCompare(b.parent?.name || ""),
      render: (c) =>
        c.parent?.name ? (
          <span className="text-sm">{c.parent.name}</span>
        ) : (
          <span className="text-xs text-muted-foreground/40">—</span>
        ),
    },
    {
      key: "articles",
      header: "Articles",
      sortFn: (a, b) => a._count.articles - b._count.articles,
      render: (c) => (
        <Badge
          variant={c._count.articles > 0 ? "default" : "secondary"}
          className={`text-xs tabular-nums ${c._count.articles === 0 ? "opacity-50" : ""}`}
        >
          {c._count.articles}
        </Badge>
      ),
    },
    {
      key: "seo",
      header: <GoogleIcon className="h-4 w-4" />,
      sortFn: (a, b) => a.seoScore - b.seoScore,
      render: (c) => (
        <span onClick={(e) => e.stopPropagation()}>
          <SeoScoreBadge score={c.seoScore} size="sm" href={`/categories/${c.id}/technical`} />
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortFn: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (c) => (
        <span className="text-xs tabular-nums text-muted-foreground">
          {dateFormatter.format(new Date(c.createdAt))}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (c) => (
        <span onClick={(e) => e.stopPropagation()}>
          <CategoryRowActions categoryId={c.id} />
        </span>
      ),
    },
  ];

  return (
    <DataTable
      data={categories}
      columns={columns}
      searchKey="name"
      searchPlaceholder="Search categories..."
      onRowClick={(c) => router.push(`/categories/${c.id}`)}
    />
  );
}
