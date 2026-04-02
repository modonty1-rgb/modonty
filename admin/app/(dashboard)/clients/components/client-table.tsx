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
  MapPin,
  BarChart2,
  Pencil,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createOrganizationSEOConfigFull, organizationSEOConfig } from "../helpers/client-seo-config";
import { SortableValue } from "@/lib/types";
import { SubscriptionStatus, PaymentStatus } from "@prisma/client";
import {
  getSubscriptionDaysRemaining,
  calculateDeliveryRate,
} from "../helpers/business-metrics";
import { calculateSEOScore } from "@/helpers/utils/seo-score-calculator";
import type { ClientForList } from "../actions/clients-actions/types";
import { buildClientSeoData } from "../helpers/build-client-seo-data";
import { createClientSEOGroupScores } from "../helpers/client-seo-group-scores";

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

interface ClientTableProps {
  clients: ClientForList[];
  search?: string;
}

type SortDirection = "asc" | "desc" | null;

// Precompute full config and group scorers once for the list
const organizationSEOConfigFull = createOrganizationSEOConfigFull();
const computeGroupScores = createClientSEOGroupScores(organizationSEOConfigFull);

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
    issues.push("Schema.org validator reported errors");
  }

  if (totalErrors > 0) {
    issues.push(`JSON-LD: ${totalErrors} critical error(s)`);
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

  const metaTags = client.nextjsMetadata as Record<string, any>;
  if (typeof metaTags !== "object" || metaTags === null) {
    return false;
  }

  const issues = getMetaTagsIssues(metaTags);
  return issues.length === 0;
}

/**
 * Derive detailed meta tag issues, mirroring form SEO critical notes
 */
function getMetaTagsIssues(metaTags: Record<string, any>): string[] {
  const issues: string[] = [];

  const title = typeof metaTags.title === "string" ? metaTags.title.trim() : "";
  const description = typeof metaTags.description === "string" ? metaTags.description.trim() : "";

  if (!title) {
    issues.push("Missing meta title");
  }
  if (!description) {
    issues.push("Missing meta description");
  }

  const openGraph = metaTags.openGraph as { images?: Array<{ url?: string | null }> } | undefined;
  const ogImage = openGraph?.images && openGraph.images.length > 0 ? openGraph.images[0] : undefined;
  const hasOgOrLogo = !!ogImage?.url;

  if (!hasOgOrLogo) {
    issues.push("No OG image or logo for social shares");
  }

  const twitter = metaTags.twitter as {
    card?: string | null;
    image?: string | null;
  } | undefined;

  const card = (twitter?.card ?? (hasOgOrLogo ? "summary_large_image" : "summary")) as string;
  const hasTwitterImage = typeof twitter?.image === "string" && twitter.image.trim() !== "";

  if (card === "summary_large_image" && !hasTwitterImage && !hasOgOrLogo) {
    issues.push("No Twitter image (Cards will have no image)");
  }

  return issues;
}

/**
 * Checks if JSON-LD is valid/correct
 */
function isJsonLdValid(client: ClientForList): boolean {
  if (!client.jsonLdStructuredData) {
    return false;
  }
  try {
    const jsonLd = JSON.parse(client.jsonLdStructuredData);

    if (typeof jsonLd !== "object" || jsonLd === null) {
      return false;
    }

    const hasContext = "@context" in (jsonLd as Record<string, unknown>);
    const hasGraph = "@graph" in (jsonLd as Record<string, unknown>);

    if (!hasContext || !hasGraph) {
      return false;
    }

    const issues = getJsonLdIssues(client);
    if (issues.length > 0) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

function getCriticalItems(client: ClientForList): string[] {
  const items: string[] = [];

  if (!client.nextjsMetadata || typeof client.nextjsMetadata !== "object") {
    items.push("Meta tags missing");
  } else {
    const metaIssues = getMetaTagsIssues(client.nextjsMetadata as Record<string, any>);
    items.push(...metaIssues);
  }

  if (!client.jsonLdStructuredData) {
    items.push("JSON-LD missing");
  } else {
    try {
      const parsed = JSON.parse(client.jsonLdStructuredData);
      if (typeof parsed !== "object" || parsed === null) {
        items.push("JSON-LD invalid (cannot parse)");
      }
    } catch {
      items.push("JSON-LD invalid (cannot parse)");
    }

    const jsonLdIssues = getJsonLdIssues(client);
    items.push(...jsonLdIssues);
  }

  return items;
}

export function ClientTable({ clients, search: externalSearch }: ClientTableProps) {
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

  const filteredData = useMemo(() => {
    let result = clients.filter((client) => {
      const searchTerm = search.toLowerCase();
      return (
        client.name.toLowerCase().includes(searchTerm) ||
        client.slug.toLowerCase().includes(searchTerm) ||
        (client.email && client.email.toLowerCase().includes(searchTerm)) ||
        (client.phone && client.phone.toLowerCase().includes(searchTerm))
      );
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
        } else if (sortKey === "articles") {
          aValue = a._count.articles;
          bValue = b._count.articles;
        } else if (sortKey === "createdAt") {
          aValue = a.createdAt;
          bValue = b.createdAt;
        } else if (sortKey === "tier") {
          aValue = a.subscriptionTier || "";
          bValue = b.subscriptionTier || "";
        } else if (sortKey === "expires") {
          const aDays = getSubscriptionDaysRemaining(a);
          const bDays = getSubscriptionDaysRemaining(b);
          aValue = aDays ?? Infinity;
          bValue = bDays ?? Infinity;
        }

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return aValue.localeCompare(bValue);
        }
        if (typeof aValue === "number" && typeof bValue === "number") {
          return aValue - bValue;
        }
        if (aValue instanceof Date && bValue instanceof Date) {
          return aValue.getTime() - bValue.getTime();
        }
        return String(aValue).localeCompare(String(bValue));
      });

      if (sortDirection === "desc") {
        result.reverse();
      }
    }

    return result;
  }, [clients, search, sortKey, sortDirection]);

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

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table className="table-fixed w-full">
          <colgroup>{/* Name */}<col className="w-[200px]" />{/* Tier */}<col className="w-[90px]" />{/* Status */}<col className="w-[90px]" />{/* Articles */}<col className="w-[70px]" />{/* Delivery */}<col className="w-[80px]" />{/* Expires */}<col className="w-[80px]" />{/* GBP */}<col className="w-[40px]" />{/* Analytics */}<col className="w-[40px]" />{/* SEO */}<col className="w-[130px]" />{/* Actions */}<col className="w-[110px]" /></colgroup>
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
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("tier")}
              >
                <div className="flex items-center">
                  Tier
                  {getSortIcon("tier")}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("articles")}
              >
                <div className="flex items-center">
                  Articles
                  {getSortIcon("articles")}
                </div>
              </TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("expires")}
              >
                <div className="flex items-center">
                  Expires
                  {getSortIcon("expires")}
                </div>
              </TableHead>
              <TableHead className="text-center px-1">
                <div className="flex justify-center" title="Google Business Profile">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead className="text-center px-1">
                <div className="flex justify-center" title="GA4 Analytics">
                  <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead className="text-center">SEO</TableHead>
              <TableHead className="text-right px-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-medium">No clients found</p>
                    <p className="text-xs">Try adjusting your filters or search terms</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((client) => {
                const daysRemaining = getSubscriptionDaysRemaining(client);
                const delivery = calculateDeliveryRate(client, client.articles?.length ?? 0);
                const tierName = client.subscriptionTier
                  ? client.subscriptionTier.charAt(0) + client.subscriptionTier.slice(1).toLowerCase()
                  : "N/A";
                const gbpPlaceId = (client as { gbpPlaceId?: string | null }).gbpPlaceId;
                const ga4PropertyId = (client as { ga4PropertyId?: string | null }).ga4PropertyId;
                const isActive = client.subscriptionStatus === SubscriptionStatus.ACTIVE;
                const isPaid = client.paymentStatus === PaymentStatus.PAID;
                const isOverdue = client.paymentStatus === PaymentStatus.OVERDUE;

                // Build normalized SEO data once for all scorers (core + Meta + JSON-LD)
                const seoDataForScoring = buildClientSeoData(client);

                // Calculate SEO Score for marketing insights (core SEO Doctor config)
                const seoScoreResult = calculateSEOScore(seoDataForScoring, organizationSEOConfig);
                const seoScore = seoScoreResult.percentage;

                // Calculate Meta / JSON-LD group scores from the same source of truth
                const groupScores = computeGroupScores(seoDataForScoring);
                const metaScore = groupScores.meta.percentage;
                const jsonLdScore = groupScores.jsonLd.percentage;

                const getStatusBadge = () => {
                  if (isActive && isPaid) {
                    return (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-500">
                        Active
                      </span>
                    );
                  }
                  if (isActive && isOverdue) {
                    return (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/15 text-red-500">
                        Suspended
                      </span>
                    );
                  }
                  if (isActive) {
                    return (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/15 text-yellow-500">
                        Pending
                      </span>
                    );
                  }
                  if (client.subscriptionStatus === SubscriptionStatus.EXPIRED) {
                    return <span className="text-sm text-muted-foreground">Expired</span>;
                  }
                  if (client.subscriptionStatus === SubscriptionStatus.CANCELLED) {
                    return <span className="text-sm text-muted-foreground">Cancelled</span>;
                  }
                  return <span className="text-sm text-muted-foreground">Pending</span>;
                };

                return (
                    <TableRow
                      key={client.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/clients/${client.id}`)}
                    >
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <Link
                          href={`/clients/${client.id}`}
                          className="font-medium text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {client.name}
                        </Link>
                        {client.email && (
                          <span className="text-xs text-muted-foreground block truncate max-w-[160px]">
                            {client.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{tierName}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge()}</TableCell>
                    <TableCell>
                      <span className="text-sm">{client._count.articles}</span>
                    </TableCell>
                    <TableCell>
                      {delivery.promised > 0 ? (
                        <span className={cn(
                          "text-sm",
                          isActive && isPaid && delivery.delivered === 0
                            ? "text-destructive"
                            : "text-muted-foreground"
                        )}>
                          {delivery.delivered}/{delivery.promised}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {daysRemaining !== null ? (
                        <span className={cn(
                          "text-sm",
                          daysRemaining <= 0
                            ? "text-muted-foreground"
                            : daysRemaining <= 30
                              ? "text-amber-500"
                              : "text-muted-foreground"
                        )}>
                          {daysRemaining > 0 ? `${daysRemaining}d` : "Expired"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">No sub</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center px-1">
                      {gbpPlaceId ? (
                        <div title="GBP Connected" className="flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-green-500" />
                        </div>
                      ) : (
                        <div title="GBP Not connected" className="flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-muted-foreground/40" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center px-1">
                      {ga4PropertyId ? (
                        <div title="GA4 Active" className="flex items-center justify-center">
                          <BarChart2 className="h-4 w-4 text-green-500" />
                        </div>
                      ) : (
                        <div title="GA4 Not connected" className="flex items-center justify-center">
                          <BarChart2 className="h-4 w-4 text-muted-foreground/40" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      {seoScore ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-[60px] bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                seoScore >= 80
                                  ? "bg-green-500"
                                  : seoScore >= 60
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              )}
                              style={{ width: `${Math.max(0, Math.min(100, seoScore))}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-9 text-right">
                            {seoScore}%
                          </span>
                        </div>
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
                        >
                          <Link href={`/clients/${client.id}/edit`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-primary/10 rounded-md transition-colors"
                          asChild
                        >
                          <Link href={`/clients/${client.id}/seo`}>
                            <span className="text-[9px] font-bold leading-none w-3.5 h-3.5 rounded-sm bg-primary/20 text-primary flex items-center justify-center">
                              S
                            </span>
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          asChild
                        >
                          <Link href={`/clients/${client.id}`}>
                            <Eye className="h-3.5 w-3.5" />
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
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

