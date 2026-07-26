"use client";

import { useRouter } from "next/navigation";

import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/admin/data-table";
import { SeoScoreBadge } from "@/components/shared/seo-score-badge";
import { GoogleIcon } from "@/components/admin/icons/google-icon";
import { IndustryRowActions } from "./industry-row-actions";

// A slug segment of exactly "test" flags an item accidentally created during development.
const isTestSlug = (slug: string) => slug.toLowerCase().split("-").includes("test");

interface Industry {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  _count: { clients: number };
  seoScore: number;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" });

// Shared DataTable (entity-standard #3) + SEO column from the reference scorer (#2).
export function IndustryTable({ industries }: { industries: Industry[] }) {
  const router = useRouter();

  // Lightweight list every row's merge dialog uses as its target candidates.
  const candidates = industries.map((i) => ({ id: i.id, name: i.name, slug: i.slug, count: i._count.clients }));

  const columns: Column<Industry>[] = [
    {
      key: "name",
      header: "Name",
      sortFn: (a, b) => a.name.localeCompare(b.name),
      render: (i) => (
        <span className="flex items-center gap-1.5">
          <span className="text-sm font-medium">{i.name}</span>
          {isTestSlug(i.slug) && (
            <span title={`Slug «${i.slug}» — likely a dev artifact, review`} className="inline-flex">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-label="Test slug" />
            </span>
          )}
        </span>
      ),
    },
    {
      key: "clients",
      header: "Clients",
      sortFn: (a, b) => a._count.clients - b._count.clients,
      render: (i) =>
        i._count.clients === 0 ? (
          // Empty industry — amber (entity standard: "no clients yet") + ready to delete.
          <Badge className="border-amber-500/30 bg-amber-500/15 text-xs tabular-nums text-amber-600 hover:bg-amber-500/15 dark:text-amber-400">
            0 · Empty
          </Badge>
        ) : (
          <Badge variant="default" className="text-xs tabular-nums">
            {i._count.clients}
          </Badge>
        ),
    },
    {
      key: "seo",
      header: <GoogleIcon className="h-4 w-4" />,
      sortFn: (a, b) => a.seoScore - b.seoScore,
      render: (i) => (
        <span onClick={(e) => e.stopPropagation()}>
          <SeoScoreBadge score={i.seoScore} size="sm" href={`/industries/${i.id}/technical`} />
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortFn: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (i) => (
        <span className="text-xs tabular-nums text-muted-foreground">
          {dateFormatter.format(new Date(i.createdAt))}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (i) => (
        <span onClick={(e) => e.stopPropagation()}>
          <IndustryRowActions
            industry={{ id: i.id, name: i.name, slug: i.slug, count: i._count.clients }}
            candidates={candidates}
          />
        </span>
      ),
    },
  ];

  return (
    <DataTable
      data={industries}
      columns={columns}
      searchKey="name"
      searchPlaceholder="Search industries..."
      onRowClick={(i) => router.push(`/industries/${i.id}`)}
    />
  );
}
