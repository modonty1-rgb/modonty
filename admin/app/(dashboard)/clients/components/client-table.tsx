"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
} from "lucide-react";
import { GoogleIcon } from "@/components/admin/icons/google-icon";
import { cn } from "@/lib/utils";
import { SortableValue } from "@/lib/types";
import { SubscriptionStatus } from "@prisma/client";
import { calculateDeliveryRate } from "../helpers/business-metrics";
import type { ClientForList } from "../actions/clients-actions/types";
import { computeClientSeoScore } from "@modonty/database/lib/seo/client/seo-score";
import { clientToSeoInput } from "@modonty/database/lib/seo/client/from-client";
import { ClientAvatar } from "./client-avatar";

type ListValidationError = { message?: string } | string;

interface ListValidationSection {
  valid?: boolean;
  errors?: ListValidationError[];
  warnings?: ListValidationError[];
}

interface ListValidationReport {
  adobe?: ListValidationSection;
  ajv?: {
    errors?: string[];
    warnings?: string[];
  };
  custom?: {
    errors?: string[];
    warnings?: string[];
  };
}

export type StatusFilterKey = SubscriptionStatus | "ALL";

interface ClientTableProps {
  clients: ClientForList[];
  search?: string;
  defaultLogoUrl?: string | null;
  // Status filter is owned by the parent (ClientsTabs) so its toggle pills can sit
  // on the same row as the top tabs. The table just applies it.
  statusFilter?: StatusFilterKey;
}

type SortDirection = "asc" | "desc" | null;

/**
 * Extract a normalized validation report from the client (list-safe)
 */
function getValidationReport(client: ClientForList): ListValidationReport | null {
  if (!client.jsonLdValidationReport || typeof client.jsonLdValidationReport !== "object") {
    return null;
  }

  return client.jsonLdValidationReport as ListValidationReport;
}

/**
 * Collect JSON-LD issues based on stored validation report
 */
function getJsonLdIssues(client: ClientForList): string[] {
  const issues: string[] = [];
  const report = getValidationReport(client);

  if (!report) {
    return issues;
  }

  const adobeErrors = Array.isArray(report.adobe?.errors) ? report.adobe?.errors ?? [] : [];
  const ajvErrors = Array.isArray(report.ajv?.errors) ? report.ajv.errors ?? [] : [];
  const customErrors = Array.isArray(report.custom?.errors) ? report.custom.errors ?? [] : [];

  const totalErrors = adobeErrors.length + ajvErrors.length + customErrors.length;

  if (report.adobe && report.adobe.valid === false) {
    issues.push("SEO data has issues");
  }

  if (totalErrors > 0) {
    issues.push(`SEO data needs fixing (${totalErrors} errors)`);
  }

  return issues;
}

/**
 * Checks if metaTags are valid/correct using critical SEO rules
 */
function isMetaTagsValid(client: ClientForList): boolean {
  if (!client.nextjsMetadata) {
    return false;
  }

  const metaTags = client.nextjsMetadata as Record<string, unknown>;
  if (typeof metaTags !== "object" || metaTags === null) {
    return false;
  }

  const issues = getMetaTagsIssues(metaTags);
  return issues.length === 0;
}

/**
 * Derive detailed meta tag issues, mirroring form SEO critical notes
 */
function getMetaTagsIssues(metaTags: Record<string, unknown>): string[] {
  const issues: string[] = [];

  const title = typeof metaTags.title === "string" ? metaTags.title.trim() : "";
  const description = typeof metaTags.description === "string" ? metaTags.description.trim() : "";

  if (!title) {
    issues.push("SEO title is missing");
  }
  if (!description) {
    issues.push("SEO description is missing");
  }

  const openGraph = metaTags.openGraph as { images?: Array<{ url?: string | null }> } | undefined;
  const ogImage = openGraph?.images && openGraph.images.length > 0 ? openGraph.images[0] : undefined;
  const hasOgOrLogo = !!ogImage?.url;

  if (!hasOgOrLogo) {
    issues.push("Social sharing image is missing");
  }

  const twitter = metaTags.twitter as {
    card?: string | null;
    image?: string | null;
  } | undefined;

  const card = (twitter?.card ?? (hasOgOrLogo ? "summary_large_image" : "summary")) as string;
  const hasTwitterImage = typeof twitter?.image === "string" && twitter.image.trim() !== "";

  if (card === "summary_large_image" && !hasTwitterImage && !hasOgOrLogo) {
    issues.push("Twitter image is missing");
  }

  return issues;
}

/**
 * Checks if JSON-LD is valid/correct
 */
function isJsonLdValid(client: ClientForList): boolean {
  const report = getValidationReport(client);
  if (!report) {
    return false;
  }

  const issues = getJsonLdIssues(client);
  return issues.length === 0;
}

function getCriticalItems(client: ClientForList): string[] {
  const items: string[] = [];

  if (!client.nextjsMetadata || typeof client.nextjsMetadata !== "object") {
    items.push("Search appearance data is incomplete");
  } else {
    const metaIssues = getMetaTagsIssues(client.nextjsMetadata as Record<string, unknown>);
    items.push(...metaIssues);
  }

  const report = getValidationReport(client);
  if (!report) {
    items.push("Search engine data is missing");
  } else {
    const jsonLdIssues = getJsonLdIssues(client);
    items.push(...jsonLdIssues);
  }

  return items;
}

export function ClientTable({ clients, search: externalSearch, defaultLogoUrl, statusFilter = "ALL" }: ClientTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState(externalSearch || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const pageSize = 10;

  // Sync external search prop with internal state
  useEffect(() => {
    if (externalSearch !== undefined) {
      setSearch(externalSearch);
      setCurrentPage(1);
    }
  }, [externalSearch]);

  // Reset to page 1 whenever the parent-owned status filter changes.
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const filteredData = useMemo(() => {
    const searchTerm = search.toLowerCase();
    let result = clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchTerm) ||
        client.slug.toLowerCase().includes(searchTerm) ||
        (client.email && client.email.toLowerCase().includes(searchTerm)) ||
        (client.phone && client.phone.toLowerCase().includes(searchTerm));
      const matchesStatus = statusFilter === "ALL" || client.subscriptionStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortKey && sortDirection) {
      result = [...result].sort((a, b) => {
        let aValue: SortableValue;
        let bValue: SortableValue;

        if (sortKey === "name") {
          aValue = a.name;
          bValue = b.name;
        } else if (sortKey === "slug") {
          aValue = a.slug;
          bValue = b.slug;
        } else if (sortKey === "email") {
          aValue = a.email || "";
          bValue = b.email || "";
        } else if (sortKey === "articlesTotal") {
          aValue = a.articleStats.total;
          bValue = b.articleStats.total;
        } else if (sortKey === "articlesPublished") {
          aValue = a.articleStats.published;
          bValue = b.articleStats.published;
        } else if (sortKey === "articlesAwaiting") {
          aValue = a.articleStats.awaitingApproval;
          bValue = b.articleStats.awaitingApproval;
        } else if (sortKey === "createdAt") {
          aValue = a.createdAt;
          bValue = b.createdAt;
        }

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return aValue.localeCompare(bValue, "ar");
        }
        if (typeof aValue === "number" && typeof bValue === "number") {
          return aValue - bValue;
        }
        if (aValue instanceof Date && bValue instanceof Date) {
          return aValue.getTime() - bValue.getTime();
        }
        return String(aValue).localeCompare(String(bValue), "ar");
      });

      if (sortDirection === "desc") {
        result.reverse();
      }
    }

    return result;
  }, [clients, search, statusFilter, sortKey, sortDirection]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const getSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="ml-2 h-4 w-4 text-primary" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4 text-primary" />;
  };

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const clientComputedMap = useMemo(() => {
    const map = new Map<string, {
      seoScore: number;
      delivery: ReturnType<typeof calculateDeliveryRate>;
    }>();
    for (const client of paginatedData) {
      // SHARED scorer — same number as the client SEO page, detail banner + console.
      const { score: seoScore } = computeClientSeoScore(
        clientToSeoInput(client as unknown as Record<string, unknown>),
      );
      map.set(client.id, {
        seoScore,
        delivery: calculateDeliveryRate(client, client.articles?.length ?? 0),
      });
    }
    return map;
  }, [paginatedData]);

  return (
    <div className="space-y-4">
      <div className="border rounded-lg bg-card">
        <Table className="table-fixed w-full">
          <colgroup>{/* Name */}<col className="w-[260px]" />{/* Status */}<col className="w-[110px]" />{/* Received */}<col className="w-[90px]" />{/* Published */}<col className="w-[96px]" />{/* Awaiting */}<col className="w-[96px]" />{/* This month */}<col className="w-[96px]" />{/* SEO */}<col className="w-[70px]" />{/* Actions */}<col className="w-[80px]" /></colgroup>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  Name
                  {getSortIcon("name")}
                </div>
              </TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 text-center px-1"
                onClick={() => handleSort("articlesTotal")}
                title="Received — all articles created for this client (any status)"
              >
                <div className="flex items-center justify-center gap-0.5 text-xs font-semibold">
                  Received
                  {getSortIcon("articlesTotal")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 text-center px-1"
                onClick={() => handleSort("articlesPublished")}
                title="Published — live on modonty.com"
              >
                <div className="flex items-center justify-center gap-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Published
                  {getSortIcon("articlesPublished")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 text-center px-1"
                onClick={() => handleSort("articlesAwaiting")}
                title="Awaiting approval — waiting on the client to review"
              >
                <div className="flex items-center justify-center gap-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  Awaiting
                  {getSortIcon("articlesAwaiting")}
                </div>
              </TableHead>
              <TableHead
                className="text-center px-1"
                title="This month — articles published this calendar month ÷ monthly quota"
              >
                <div className="flex items-center justify-center text-xs font-semibold text-muted-foreground">
                  This Month
                </div>
              </TableHead>
              <TableHead className="text-center px-1" title="SEO Score">
                <div className="flex justify-center">
                  <GoogleIcon className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-right px-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-medium">No clients found</p>
                    <p className="text-xs">Try adjusting your search or filters</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((client) => {
                const computed = clientComputedMap.get(client.id);
                const delivery = computed?.delivery ?? { delivered: 0, promised: 0 };
                const seoScore = computed?.seoScore ?? 0;

                // Status = subscription state only. Payment (Paid/Overdue) lives in the
                // billing views — it's noise for content prep.
                const getStatusBadge = () => {
                  switch (client.subscriptionStatus) {
                    case SubscriptionStatus.ACTIVE:
                      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-500">Active</span>;
                    case SubscriptionStatus.EXPIRED:
                      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-600 dark:text-amber-500">Expired</span>;
                    case SubscriptionStatus.CANCELLED:
                      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/15 text-red-500">Cancelled</span>;
                    default:
                      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-500/15 text-slate-500">Pending</span>;
                  }
                };

                return (
                    <TableRow
                      key={client.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/clients/${client.id}`)}
                    >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <ClientAvatar
                          url={client.logoMedia?.url}
                          fallbackUrl={defaultLogoUrl}
                          name={client.name}
                        />
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <Link
                            href={`/clients/${client.id}`}
                            className="font-medium text-sm truncate"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {client.name}
                          </Link>
                          {client.email && (
                            <span className="text-xs text-muted-foreground block truncate max-w-[150px]">
                              {client.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge()}</TableCell>
                    <TableCell className="text-center px-1">
                      <span className={cn("text-sm font-bold tabular-nums", client.articleStats.total === 0 ? "text-muted-foreground/40" : "text-foreground")}>
                        {client.articleStats.total}
                      </span>
                    </TableCell>
                    <TableCell className="text-center px-1">
                      <span className={cn("text-sm font-semibold tabular-nums", client.articleStats.published > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/40")}>
                        {client.articleStats.published}
                      </span>
                    </TableCell>
                    <TableCell className="text-center px-1">
                      <span className={cn("text-sm font-semibold tabular-nums", client.articleStats.awaitingApproval > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground/40")}>
                        {client.articleStats.awaitingApproval}
                      </span>
                    </TableCell>
                    <TableCell className="text-center px-2">
                      {delivery.promised > 0 ? (
                        (() => {
                          const ratio = delivery.delivered / delivery.promised;
                          const color = ratio >= 0.75
                            ? "text-emerald-500"
                            : ratio >= 0.25
                              ? "text-amber-600 dark:text-amber-500"
                              : "text-red-600 dark:text-red-500";
                          return (
                            <span className={cn("text-sm font-medium", color)}>
                              {delivery.delivered}/{delivery.promised}
                            </span>
                          );
                        })()
                      ) : (
                        <span className="text-muted-foreground/40 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      {seoScore ? (
                        <span
                          className={cn(
                            "inline-flex items-center justify-center min-w-[3rem] px-2 py-0.5 rounded-md text-sm font-bold tabular-nums",
                            seoScore >= 80
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : seoScore >= 50
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-500"
                                : "bg-red-500/15 text-red-600 dark:text-red-400",
                          )}
                        >
                          {seoScore}%
                        </span>
                      ) : (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/clients/${client.id}/seo`}>Setup SEO</Link>
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-right px-2" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          asChild
                          aria-label="Edit client"
                        >
                          <Link href={`/clients/${client.id}/edit`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of{" "}
            {filteredData.length} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}

