"use client";

import { useState, useMemo, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Stethoscope,
  CreditCard,
  Calendar,
  FileText,
  Package,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SEOHealthGauge } from "@/components/shared/seo-doctor/seo-health-gauge";
import { createOrganizationSEOConfigFull, organizationSEOConfig } from "../helpers/client-seo-config";
import { SortableValue } from "@/lib/types";
import { SubscriptionStatus, PaymentStatus } from "@prisma/client";
import {
  calculateRevenue,
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
  onSelectionChange?: (selectedIds: string[]) => void;
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
  if (!client.metaTags) {
    return false;
  }

  const metaTags = client.metaTags as Record<string, any>;
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

  if (!client.metaTags || typeof client.metaTags !== "object") {
    items.push("Meta tags missing");
  } else {
    const metaIssues = getMetaTagsIssues(client.metaTags as Record<string, any>);
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

export function ClientTable({ clients, onSelectionChange, search: externalSearch }: ClientTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState(externalSearch || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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

  const allSelected = paginatedData.length > 0 && paginatedData.every((client) => selectedIds.has(client.id));
  const someSelected = paginatedData.some((client) => selectedIds.has(client.id));

  const handleSelectAll = (checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      paginatedData.forEach((client) => newSelected.add(client.id));
    } else {
      paginatedData.forEach((client) => newSelected.delete(client.id));
    }
    setSelectedIds(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  const handleSelectOne = (clientId: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(clientId);
    } else {
      newSelected.delete(clientId);
    }
    setSelectedIds(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </TableHead>
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
              <TableHead className="text-center">SEO Score</TableHead>
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
              <TableHead className="text-center">MetaTags</TableHead>
              <TableHead className="text-center">JSON-LD</TableHead>
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
                  const isActive = client.subscriptionStatus === SubscriptionStatus.ACTIVE;
                  const isPaid = client.paymentStatus === PaymentStatus.PAID;
                  const isOverdue = client.paymentStatus === PaymentStatus.OVERDUE;

                  if (isActive && isPaid) {
                    return <Badge variant="default">Active</Badge>;
                  }
                  if (isActive && isOverdue) {
                    return <Badge variant="destructive">Overdue</Badge>;
                  }
                  if (isActive) {
                    return <Badge variant="secondary">Pending Payment</Badge>;
                  }
                  if (client.subscriptionStatus === SubscriptionStatus.EXPIRED) {
                    return <Badge variant="outline">Expired</Badge>;
                  }
                  if (client.subscriptionStatus === SubscriptionStatus.CANCELLED) {
                    return <Badge variant="outline">Cancelled</Badge>;
                  }
                  return <Badge variant="secondary">Pending</Badge>;
                };

                const criticalItems = getCriticalItems(client);

                return (
                  <Fragment key={client.id}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/clients/${client.id}`)}
                    >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(client.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectOne(client.id, e.target.checked);
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>
                      <HoverCard openDelay={200} closeDelay={100}>
                        <HoverCardTrigger asChild>
                          <Link
                            href={`/clients/${client.id}`}
                            className="font-medium hover:text-primary"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {client.name}
                          </Link>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80" onClick={(e) => e.stopPropagation()}>
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold">{client.name}</h4>
                              {client.email && (
                                <p className="text-xs text-muted-foreground">{client.email}</p>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <FileText className="h-3 w-3" />
                                  <span>Total Articles</span>
                                </div>
                                <p className="text-sm font-semibold">{client._count.articles}</p>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Package className="h-3 w-3" />
                                  <span>This Month</span>
                                </div>
                                <p className="text-sm font-semibold">{client.articles?.length ?? 0}</p>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <TrendingUp className="h-3 w-3" />
                                  <span>Delivery Rate</span>
                                </div>
                                <p className="text-sm font-semibold">
                                  {delivery.promised > 0 ? `${delivery.rate}%` : "-"}
                                </p>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Users className="h-3 w-3" />
                                  <span>Tier</span>
                                </div>
                                <p className="text-sm font-semibold">{tierName}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2 pt-2 border-t">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Status</span>
                                {getStatusBadge()}
                              </div>
                              
                              {delivery.promised > 0 && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">Delivery</span>
                                  <span className={cn(
                                    "font-medium",
                                    delivery.isBehind ? "text-destructive" : "text-foreground"
                                  )}>
                                    {delivery.delivered}/{delivery.promised} articles
                                  </span>
                                </div>
                              )}
                              
                              {daysRemaining !== null && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">Expires</span>
                                  <span className={cn(
                                    "font-medium",
                                    daysRemaining <= 30
                                      ? "text-destructive"
                                      : daysRemaining <= 90
                                        ? "text-orange-500"
                                        : "text-foreground"
                                  )}>
                                    {daysRemaining > 0 ? `In ${daysRemaining} days` : "Expired"}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="pt-2 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                asChild
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Link href={`/clients/${client.id}`}>View Details</Link>
                              </Button>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{tierName}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{client._count.articles}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            seoScore >= 90
                              ? "text-green-600"
                              : seoScore >= 70
                                ? "text-yellow-600"
                                : seoScore >= 50
                                  ? "text-orange-600"
                                  : "text-red-600"
                          )}
                        >
                          {seoScore}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {delivery.promised > 0 ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              delivery.isBehind ? "text-destructive" : "text-foreground"
                            )}
                          >
                            {delivery.delivered}/{delivery.promised}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({delivery.rate}%)
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {daysRemaining !== null ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span
                            className={cn(
                              "text-sm",
                              daysRemaining <= 30
                                ? "text-destructive font-medium"
                                : daysRemaining <= 90
                                  ? "text-orange-500"
                                  : "text-muted-foreground"
                            )}
                          >
                            {daysRemaining > 0 ? `${daysRemaining}d` : "Expired"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            metaScore >= 80
                              ? "text-green-600"
                              : metaScore >= 60
                                ? "text-yellow-600"
                                : "text-red-600",
                          )}
                        >
                          {metaScore}%
                        </span>
                        {metaScore >= 80 ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            jsonLdScore >= 80
                              ? "text-green-600"
                              : jsonLdScore >= 60
                                ? "text-yellow-600"
                                : "text-red-600",
                          )}
                        >
                          {jsonLdScore}%
                        </span>
                        {jsonLdScore >= 80 ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {criticalItems.length > 0 && (
                    <TableRow
                      className="cursor-pointer bg-destructive/5 text-destructive hover:bg-destructive/10"
                      onClick={() => router.push(`/clients/${client.id}`)}
                    >
                      <TableCell colSpan={10} className="text-xs py-2 px-4">
                        <span className="flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          Critical: {criticalItems.join(" · ")} — Configure in client edit → SEO tab.
                        </span>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
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

