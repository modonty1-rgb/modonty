"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
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
  ImageIcon,
  FileText,
  Truck,
  CalendarClock,
  SearchCheck,
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
import { ClientHeroModal } from "./client-hero-modal";
import { ClientLogoModal } from "./client-logo-modal";

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

export function ClientTable({ clients, search: externalSearch }: ClientTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState(externalSearch || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedHeroUrl, setSelectedHeroUrl] = useState<string | null>(null);
  const [selectedLogoUrl, setSelectedLogoUrl] = useState<string | null>(null);
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

  const clientComputedMap = useMemo(() => {
    const map = new Map<string, {
      seoScore: number;
      metaScore: number;
      jsonLdScore: number;
      daysRemaining: number | null;
      delivery: ReturnType<typeof calculateDeliveryRate>;
    }>();
    for (const client of paginatedData) {
      const seoDataForScoring = buildClientSeoData(client);
      const seoScoreResult = calculateSEOScore(seoDataForScoring, organizationSEOConfig);
      const groupScores = computeGroupScores(seoDataForScoring);
      map.set(client.id, {
        seoScore: seoScoreResult.percentage,
        metaScore: groupScores.meta.percentage,
        jsonLdScore: groupScores.jsonLd.percentage,
        daysRemaining: getSubscriptionDaysRemaining(client),
        delivery: calculateDeliveryRate(client, client.articles?.length ?? 0),
      });
    }
    return map;
  }, [paginatedData]);

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table className="table-fixed w-full">
          <colgroup>{/* Name */}<col className="w-[220px]" />{/* Tier */}<col className="w-[80px]" />{/* Status */}<col className="w-[80px]" />{/* Articles */}<col className="w-[44px]" />{/* Delivery */}<col className="w-[44px]" />{/* Expires */}<col className="w-[44px]" />{/* GBP */}<col className="w-[36px]" />{/* Analytics */}<col className="w-[36px]" />{/* SEO */}<col className="w-[36px]" />{/* Actions */}<col className="w-[110px]" /></colgroup>
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
                className="cursor-pointer hover:bg-muted/50 text-center"
                onClick={() => handleSort("tier")}
              >
                <div className="flex items-center justify-center">
                  Plan
                  {getSortIcon("tier")}
                </div>
              </TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 text-center px-2"
                onClick={() => handleSort("articles")}
                title="Articles"
              >
                <div className="flex items-center justify-center gap-0.5">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  {getSortIcon("articles")}
                </div>
              </TableHead>
              <TableHead className="text-center px-2" title="Delivery rate">
                <div className="flex justify-center">
                  <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 text-center px-2"
                onClick={() => handleSort("expires")}
                title="Subscription expires"
              >
                <div className="flex items-center justify-center gap-0.5">
                  <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                  {getSortIcon("expires")}
                </div>
              </TableHead>
              <TableHead className="text-center px-1" title="Google Business Profile">
                <div className="flex justify-center">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead className="text-center px-1" title="Analytics">
                <div className="flex justify-center">
                  <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead className="text-center px-1" title="SEO Score">
                <div className="flex justify-center">
                  <SearchCheck className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead className="text-right px-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-medium">No clients found</p>
                    <p className="text-xs">Try adjusting your search or filters</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((client) => {
                const computed = clientComputedMap.get(client.id);
                const daysRemaining = computed?.daysRemaining ?? null;
                const delivery = computed?.delivery ?? { delivered: 0, promised: 0 };
                const seoScore = computed?.seoScore ?? 0;
                const tierName = client.subscriptionTier
                  ? client.subscriptionTier.charAt(0) + client.subscriptionTier.slice(1).toLowerCase()
                  : "N/A";
                const gbpPlaceId = (client as { gbpPlaceId?: string | null }).gbpPlaceId;
                const ga4PropertyId = (client as { ga4PropertyId?: string | null }).ga4PropertyId;
                const isActive = client.subscriptionStatus === SubscriptionStatus.ACTIVE;
                const isPaid = client.paymentStatus === PaymentStatus.PAID;
                const isOverdue = client.paymentStatus === PaymentStatus.OVERDUE;

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
                        Overdue
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
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          title={client.logoMedia?.url ? "Change logo" : "Add logo"}
                          className="relative h-8 w-8 shrink-0 rounded-full overflow-hidden bg-muted border border-border hover:ring-2 hover:ring-primary transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClientId(client.id);
                            setSelectedLogoUrl(client.logoMedia?.url ?? null);
                            setLogoModalOpen(true);
                          }}
                        >
                          {client.logoMedia?.url ? (
                            <Image
                              src={client.logoMedia.url}
                              alt={client.logoMedia.altText || client.name}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                              {client.name.charAt(0)}
                            </div>
                          )}
                        </button>
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
                    <TableCell className="text-center">
                      {(() => {
                        const tier = client.subscriptionTier;
                        const style = tier === "PREMIUM"
                          ? "bg-purple-500/10 text-purple-400"
                          : tier === "STANDARD"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-muted text-muted-foreground";
                        return (
                          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", style)}>
                            {tierName}
                          </span>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge()}</TableCell>
                    <TableCell className="text-center px-2">
                      <span className={cn("text-sm font-medium", client._count.articles === 0 ? "text-muted-foreground/50" : "text-foreground")}>
                        {client._count.articles}
                      </span>
                    </TableCell>
                    <TableCell className="text-center px-2">
                      {delivery.promised > 0 ? (
                        (() => {
                          const ratio = delivery.delivered / delivery.promised;
                          const color = ratio >= 0.75
                            ? "text-emerald-500"
                            : ratio >= 0.25
                              ? "text-amber-500"
                              : "text-red-500";
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
                    <TableCell className="text-center px-2">
                      {daysRemaining !== null ? (
                        <span className={cn(
                          "text-xs font-medium",
                          daysRemaining <= 0
                            ? "text-muted-foreground"
                            : daysRemaining <= 14
                              ? "text-red-500"
                              : daysRemaining <= 30
                                ? "text-amber-500"
                                : "text-emerald-500"
                        )}>
                          {daysRemaining > 0 ? `${daysRemaining}d` : "Expired"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center px-1">
                      {gbpPlaceId ? (
                        <div title="Business profile connected" className="flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-green-500" />
                        </div>
                      ) : (
                        <div title="Business profile not connected" className="flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-muted-foreground/40" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center px-1">
                      {ga4PropertyId ? (
                        <div title="Analytics enabled" className="flex items-center justify-center">
                          <BarChart2 className="h-4 w-4 text-green-500" />
                        </div>
                      ) : (
                        <div title="Analytics disabled" className="flex items-center justify-center">
                          <BarChart2 className="h-4 w-4 text-muted-foreground/40" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      {seoScore ? (
                        <div className="flex items-center justify-center">
                          {(() => {
                            const r = 11;
                            const circ = 2 * Math.PI * r;
                            const filled = (seoScore / 100) * circ;
                            const color = seoScore >= 80 ? "#22c55e" : seoScore >= 60 ? "#eab308" : "#ef4444";
                            return (
                              <svg width="28" height="28" viewBox="0 0 28 28">
                                <circle cx="14" cy="14" r={r} fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted" />
                                <circle
                                  cx="14" cy="14" r={r} fill="none"
                                  stroke={color} strokeWidth="2.5"
                                  strokeDasharray={`${filled} ${circ - filled}`}
                                  strokeLinecap="round"
                                  transform="rotate(-90 14 14)"
                                />
                                <text x="14" y="14" textAnchor="middle" dominantBaseline="central" fontSize="7" fontWeight="600" fill={color}>
                                  {seoScore}%
                                </text>
                              </svg>
                            );
                          })()}
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
                          aria-label="Edit client"
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
                          aria-label="SEO settings"
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClientId(client.id);
                            setSelectedHeroUrl(client.heroImageMedia?.url ?? null);
                            setHeroModalOpen(true);
                          }}
                          aria-label="Edit media"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          asChild
                          aria-label="View client details"
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

      {/* Hero Modal */}
      {selectedClientId && (
        <ClientHeroModal
          open={heroModalOpen}
          onOpenChange={setHeroModalOpen}
          clientId={selectedClientId}
          initialHeroUrl={selectedHeroUrl}
        />
      )}

      {/* Logo Modal */}
      {selectedClientId && (
        <ClientLogoModal
          open={logoModalOpen}
          onOpenChange={setLogoModalOpen}
          clientId={selectedClientId}
          initialLogoUrl={selectedLogoUrl}
        />
      )}
    </div>
  );
}

