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
      render: (i) => (
        <Badge
          variant={i._count.clients > 0 ? "default" : "secondary"}
          className={`text-xs tabular-nums ${i._count.clients === 0 ? "opacity-50" : ""}`}
        >
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
          <IndustryRowActions industryId={i.id} />
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
