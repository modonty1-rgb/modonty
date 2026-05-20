"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Trash2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { OrphanStats } from "../actions/orphan-cleaner";
import type { TTLIndexStatus } from "../actions/index-health";
import type { SlugIssue } from "../actions/slug-integrity";
import type { BrokenRefsResult } from "../actions/broken-references";
import type { SessionCleanerStats } from "../actions/session-cleaner";
import type { StaleVersionsStats } from "../actions/stale-versions";
import type { CollectionSize } from "../actions/collection-sizes";
import type { DuplicateSlugStats } from "../actions/duplicate-slugs";
import type { JsonLdIntegrityStats } from "../actions/jsonld-integrity";
import type { LegalFormSanitizerStats } from "../actions/legalform-sanitizer";
import { cleanExpiredOtps } from "../actions/orphan-cleaner";
import { cleanExpiredSessions } from "../actions/session-cleaner";
import { cleanStaleVersions } from "../actions/stale-versions";
import { createTTLIndex } from "../actions/index-health";
import { regenerateAllStaleJsonLd } from "../actions/jsonld-integrity";
import { sanitizeAllLegalForms } from "../actions/legalform-sanitizer";

interface Props {
  orphans: OrphanStats;
  indexHealth: TTLIndexStatus[];
  slugIssues: SlugIssue[];
  brokenRefs: BrokenRefsResult;
  sessionStats: SessionCleanerStats;
  staleVersions: StaleVersionsStats;
  collectionSizes: CollectionSize[];
  duplicateSlugs: DuplicateSlugStats;
  jsonLdIntegrity: JsonLdIntegrityStats;
  legalFormSanitizer: LegalFormSanitizerStats;
}

export function DbToolsSection({
  orphans,
  indexHealth,
  slugIssues,
  brokenRefs,
  sessionStats,
  staleVersions,
  collectionSizes,
  duplicateSlugs,
  jsonLdIntegrity,
  legalFormSanitizer,
}: Props) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [currentOrphans, setCurrentOrphans] = useState(orphans);
  const [currentSessions, setCurrentSessions] = useState(sessionStats);
  const [currentVersions, setCurrentVersions] = useState(staleVersions);
  const [currentIndexHealth, setCurrentIndexHealth] = useState(indexHealth);
  const [currentJsonLd, setCurrentJsonLd] = useState(jsonLdIntegrity);
  const [currentLegalForm, setCurrentLegalForm] = useState(legalFormSanitizer);
  const [cleaningAction, setCleaningAction] = useState<string | null>(null);

  const run = (key: string, fn: () => Promise<void>) => {
    setCleaningAction(key);
    startTransition(async () => {
      await fn();
      setCleaningAction(null);
    });
  };

  const slugTotal = slugIssues.reduce((s, i) => s + i.emptySlugs, 0);
  const ttlMissing = currentIndexHealth.filter((i) => !i.exists).length;
  const maxSizeMB = Math.max(...collectionSizes.map((c) => c.sizeMB), 0.01);

  return (
    <div className="space-y-6">
      {/* ── DB-2 Orphan Cleaner ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Orphan Cleaner
          </h2>
          <Badge variant={currentOrphans.total === 0 ? "secondary" : "destructive"} className="text-xs font-normal">
            {currentOrphans.total === 0 ? "Clean" : `${currentOrphans.total} issues`}
          </Badge>
        </div>
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {currentOrphans.expiredOtps === 0
                  ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  : <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />}
                <div>
                  <p className="text-sm font-medium">Expired OTPs</p>
                  <p className="text-xs text-muted-foreground">Slug change codes past expiry</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{currentOrphans.expiredOtps}</span>
                {currentOrphans.expiredOtps > 0 && (
                  <Button size="sm" variant="outline" disabled={isPending}
                    onClick={() => run("otps", async () => {
                      const r = await cleanExpiredOtps();
                      toast({ title: `Deleted ${r.deleted} expired OTPs` });
                      setCurrentOrphans(p => ({ ...p, expiredOtps: 0, total: p.total - p.expiredOtps }));
                    })}
                    className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10">
                    {cleaningAction === "otps" ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Trash2 className="h-3 w-3 me-1" />Clean</>}
                  </Button>
                )}
              </div>
            </div>
            <div className="border-t" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {currentOrphans.unusedMedia === 0
                  ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  : <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />}
                <div>
                  <p className="text-sm font-medium">Unused Media</p>
                  <p className="text-xs text-muted-foreground">Files not linked to any article or client</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{currentOrphans.unusedMedia}</span>
                <a href="/media" target="_blank" rel="noreferrer">
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
                    Review <ExternalLink className="h-3 w-3" />
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Session Cleaner ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Session Cleaner
          </h2>
          <Badge variant={currentSessions.total === 0 ? "secondary" : "destructive"} className="text-xs font-normal">
            {currentSessions.total === 0 ? "Clean" : `${currentSessions.total} expired`}
          </Badge>
        </div>
        <Card>
          <CardContent className="pt-4 space-y-3">
            {[
              { key: "sessions", label: "Auth Sessions", desc: "NextAuth login sessions past expiry", count: currentSessions.expiredSessions },
              { key: "vtokens", label: "Verification Tokens", desc: "Email verification tokens past expiry", count: currentSessions.expiredVerificationTokens },
            ].map((row, i) => (
              <div key={row.key}>
                {i > 0 && <div className="border-t mb-3" />}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {row.count === 0
                      ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      : <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />}
                    <div>
                      <p className="text-sm font-medium">{row.label}</p>
                      <p className="text-xs text-muted-foreground">{row.desc}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">{row.count}</span>
                </div>
              </div>
            ))}
            {currentSessions.total > 0 && (
              <Button size="sm" variant="outline" disabled={isPending} className="w-full h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => run("sessions", async () => {
                  const r = await cleanExpiredSessions();
                  toast({ title: `Deleted ${r.deleted} expired session records` });
                  setCurrentSessions({ expiredSessions: 0, expiredVerificationTokens: 0, total: 0 });
                })}>
                {cleaningAction === "sessions" ? <Loader2 className="h-3 w-3 animate-spin me-1" /> : <Trash2 className="h-3 w-3 me-1" />}
                Clean All Expired Sessions
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Stale Versions Cleaner ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Article Version History
          </h2>
          <Badge variant={currentVersions.stale90Days === 0 ? "secondary" : "destructive"} className="text-xs font-normal">
            {currentVersions.stale90Days === 0 ? "Clean" : `${currentVersions.stale90Days} stale`}
          </Badge>
        </div>
        <Card>
          <CardContent className="pt-4 space-y-3">
            {[
              { key: "v30", label: "Older than 30 days", count: currentVersions.stale30Days, days: 30 },
              { key: "v90", label: "Older than 90 days", count: currentVersions.stale90Days, days: 90 },
            ].map((row, i) => (
              <div key={row.key}>
                {i > 0 && <div className="border-t mb-3" />}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {row.count === 0
                      ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      : <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />}
                    <p className="text-sm font-medium">{row.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{row.count}</span>
                    {row.count > 0 && (
                      <Button size="sm" variant="outline" disabled={isPending}
                        onClick={() => run(row.key, async () => {
                          const r = await cleanStaleVersions(row.days);
                          toast({ title: `Deleted ${r.deleted} old versions` });
                          setCurrentVersions({ stale30Days: 0, stale90Days: 0 });
                        })}
                        className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10">
                        {cleaningAction === row.key ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Trash2 className="h-3 w-3 me-1" />Clean</>}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Collection Sizes ── */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Collection Sizes
        </h2>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-start px-4 py-2 font-medium text-muted-foreground">Collection</th>
                <th className="text-end px-4 py-2 font-medium text-muted-foreground w-20">Records</th>
                <th className="text-end px-4 py-2 font-medium text-muted-foreground w-20">MB</th>
                <th className="px-4 py-2 w-32"></th>
              </tr>
            </thead>
            <tbody>
              {collectionSizes.map((col, i) => (
                <tr key={col.collection} className={i < collectionSizes.length - 1 ? "border-b" : ""}>
                  <td className="px-4 py-2.5 font-medium">{col.label}</td>
                  <td className="px-4 py-2.5 text-end text-muted-foreground">{col.count.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-end font-mono text-xs">{col.sizeMB > 0 ? col.sizeMB : "—"}</td>
                  <td className="px-4 py-2.5">
                    {col.sizeMB > 0 && (
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/60"
                          style={{ width: `${Math.max((col.sizeMB / maxSizeMB) * 100, 2)}%` }}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Duplicate Slugs ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Duplicate Slug Scanner
          </h2>
          <Badge variant={duplicateSlugs.crossClientSlugs === 0 ? "secondary" : "destructive"} className="text-xs font-normal">
            {duplicateSlugs.crossClientSlugs === 0 ? "No duplicates" : `${duplicateSlugs.crossClientSlugs} slugs shared`}
          </Badge>
        </div>
        {duplicateSlugs.crossClientSlugs === 0 ? (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <p className="text-sm">No article slug is shared across multiple clients.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-start px-4 py-2 font-medium text-muted-foreground">Slug</th>
                  <th className="text-end px-4 py-2 font-medium text-muted-foreground">Clients Using It</th>
                  <th className="text-end px-4 py-2 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {duplicateSlugs.topDuplicates.map((d, i) => (
                  <tr key={d.slug} className={i < duplicateSlugs.topDuplicates.length - 1 ? "border-b" : ""}>
                    <td className="px-4 py-2.5 font-mono text-xs">{d.slug}</td>
                    <td className="px-4 py-2.5 text-end">{d.clientCount}</td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center justify-end gap-1 text-yellow-600 dark:text-yellow-400 text-xs">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Shared
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── DB-3 TTL Index Health ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            TTL Index Health
          </h2>
          <Badge variant={ttlMissing === 0 ? "secondary" : "destructive"} className="text-xs font-normal">
            {ttlMissing === 0 ? "All indexes present" : `${ttlMissing} missing`}
          </Badge>
        </div>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-start px-4 py-2 font-medium text-muted-foreground">Collection</th>
                <th className="text-start px-4 py-2 font-medium text-muted-foreground">TTL Field</th>
                <th className="text-end px-4 py-2 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentIndexHealth.map((idx, i) => (
                <tr key={idx.collection} className={i < currentIndexHealth.length - 1 ? "border-b" : ""}>
                  <td className="px-4 py-2.5 font-medium">{idx.label}</td>
                  <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">{idx.field}</td>
                  <td className="px-4 py-2.5">
                    {idx.exists ? (
                      <span className="flex items-center justify-end gap-1 text-green-600 dark:text-green-400 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5" />Found
                      </span>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <span className="flex items-center gap-1 text-destructive text-xs">
                          <XCircle className="h-3.5 w-3.5" />Missing
                        </span>
                        <Button size="sm" variant="outline" disabled={isPending}
                          onClick={() => run(`ttl-${idx.collection}`, async () => {
                            const r = await createTTLIndex(idx.collection, idx.field);
                            if (r.success) {
                              toast({ title: `Index created on ${idx.label}` });
                              setCurrentIndexHealth(prev =>
                                prev.map(x => x.collection === idx.collection ? { ...x, exists: true } : x)
                              );
                            } else {
                              toast({ title: "Failed", description: r.message, variant: "destructive" });
                            }
                          })}
                          className="h-6 text-xs px-2">
                          {cleaningAction === `ttl-${idx.collection}`
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : "Create"}
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── DB-4 Slug Integrity ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Slug Integrity
          </h2>
          <Badge variant={slugTotal === 0 ? "secondary" : "destructive"} className="text-xs font-normal">
            {slugTotal === 0 ? "All slugs valid" : `${slugTotal} empty slugs`}
          </Badge>
        </div>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-start px-4 py-2 font-medium text-muted-foreground">Entity</th>
                <th className="text-end px-4 py-2 font-medium text-muted-foreground">Empty Slugs</th>
                <th className="text-end px-4 py-2 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {slugIssues.map((issue, i) => (
                <tr key={issue.entity} className={i < slugIssues.length - 1 ? "border-b" : ""}>
                  <td className="px-4 py-2.5 font-medium">{issue.label}</td>
                  <td className="px-4 py-2.5 text-end">{issue.emptySlugs}</td>
                  <td className="px-4 py-2.5">
                    {issue.emptySlugs === 0 ? (
                      <span className="flex items-center justify-end gap-1 text-green-600 dark:text-green-400 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5" />OK
                      </span>
                    ) : (
                      <span className="flex items-center justify-end gap-1 text-destructive text-xs">
                        <XCircle className="h-3.5 w-3.5" />Fix required
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── JSON-LD Cache Integrity ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            JSON-LD Cache Integrity
          </h2>
          <Badge
            variant={currentJsonLd.staleCount === 0 ? "secondary" : "destructive"}
            className="text-xs font-normal"
          >
            {currentJsonLd.staleCount === 0
              ? "Clean"
              : `${currentJsonLd.staleCount} stale`}
          </Badge>
        </div>
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {currentJsonLd.staleCount === 0 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    Cached JSON-LD with non-canonical URLs
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Articles whose stored JSON-LD points to localhost or a host other than{" "}
                    <span className="font-mono">
                      {currentJsonLd.expectedSiteUrl ?? "(no Settings.siteUrl)"}
                    </span>
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold">
                {currentJsonLd.staleCount} / {currentJsonLd.withCache}
              </span>
            </div>

            {currentJsonLd.detectedBadHosts.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground mb-1.5">Detected bad hosts:</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentJsonLd.detectedBadHosts.map((host) => (
                    <code
                      key={host}
                      className="text-[11px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded"
                    >
                      {host}
                    </code>
                  ))}
                </div>
              </div>
            )}

            {currentJsonLd.sample.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground mb-1.5">Sample affected articles:</p>
                <ul className="space-y-1">
                  {currentJsonLd.sample.map((a) => (
                    <li key={a.id} className="text-xs flex items-center gap-2">
                      <span className="text-muted-foreground truncate max-w-[400px]">
                        {a.title}
                      </span>
                      <a
                        href={`/articles/${a.id}/edit`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {currentJsonLd.staleCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                disabled={isPending}
                className="w-full h-8 text-xs"
                onClick={() =>
                  run("jsonld", async () => {
                    const r = await regenerateAllStaleJsonLd();
                    toast({
                      title: `Regenerated ${r.successful} of ${r.attempted} articles`,
                      description: r.failed > 0 ? `${r.failed} failed` : undefined,
                      variant: r.failed > 0 ? "destructive" : "default",
                    });
                    setCurrentJsonLd({
                      ...currentJsonLd,
                      staleCount: r.failed,
                      sample: [],
                      detectedBadHosts: [],
                    });
                  })
                }
              >
                {cleaningAction === "jsonld" ? (
                  <Loader2 className="h-3 w-3 animate-spin me-1" />
                ) : (
                  <RefreshCw className="h-3 w-3 me-1" />
                )}
                Regenerate All Stale JSON-LD
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Legal Form Sanitizer ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Legal Form Sanitizer
          </h2>
          <Badge
            variant={
              currentLegalForm.mappableCount === 0 && currentLegalForm.unmappedCount === 0
                ? "secondary"
                : "destructive"
            }
            className="text-xs font-normal"
          >
            {currentLegalForm.mappableCount === 0 && currentLegalForm.unmappedCount === 0
              ? "Clean"
              : `${currentLegalForm.mappableCount + currentLegalForm.unmappedCount} non-canonical`}
          </Badge>
        </div>
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {currentLegalForm.mappableCount === 0 && currentLegalForm.unmappedCount === 0 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    Clients with non-canonical <code className="text-xs">legalForm</code> values
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Free-text or Arabic legal forms (e.g. <span className="font-mono">شركة شخص واحد</span>)
                    block all form saves on the affected client — including password updates. Canonical
                    values: LLC · JSC · Sole Proprietorship · Partnership · Limited Partnership ·
                    Simplified Joint Stock Company · One-Person Company.
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold whitespace-nowrap">
                {currentLegalForm.mappableCount + currentLegalForm.unmappedCount} / {currentLegalForm.totalClients}
              </span>
            </div>

            {currentLegalForm.mappable.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground mb-1.5">
                  Will be auto-converted ({currentLegalForm.mappable.length}):
                </p>
                <ul className="space-y-1">
                  {currentLegalForm.mappable.slice(0, 10).map((m) => (
                    <li key={m.id} className="text-xs flex items-center gap-2">
                      <span className="text-muted-foreground truncate max-w-[260px]" title={m.name ?? ""}>
                        {m.name ?? "(no name)"}
                      </span>
                      <code className="text-[11px] bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 px-1.5 py-0.5 rounded">
                        {m.before}
                      </code>
                      <span className="text-muted-foreground">→</span>
                      <code className="text-[11px] bg-green-500/10 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">
                        {m.after}
                      </code>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {currentLegalForm.unmapped.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-xs text-destructive mb-1.5">
                  Manual review required — no mapping rule matched ({currentLegalForm.unmapped.length}):
                </p>
                <ul className="space-y-1">
                  {currentLegalForm.unmapped.slice(0, 10).map((m) => (
                    <li key={m.id} className="text-xs flex items-center gap-2">
                      <span className="text-muted-foreground truncate max-w-[260px]" title={m.name ?? ""}>
                        {m.name ?? "(no name)"}
                      </span>
                      <code className="text-[11px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                        {m.before}
                      </code>
                      <a
                        href={`/clients/${m.id}/edit`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {currentLegalForm.mappable.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                disabled={isPending}
                className="w-full h-8 text-xs"
                onClick={() =>
                  run("legalform", async () => {
                    const r = await sanitizeAllLegalForms();
                    toast({
                      title: `Sanitized ${r.successful} of ${r.attempted} clients`,
                      description: r.failed > 0 ? `${r.failed} failed — check logs` : undefined,
                      variant: r.failed > 0 ? "destructive" : "default",
                    });
                    setCurrentLegalForm({
                      ...currentLegalForm,
                      mappableCount: r.failed,
                      mappable: currentLegalForm.mappable.filter((m) =>
                        r.errors.some((e) => e.id === m.id),
                      ),
                      canonicalOrNull: currentLegalForm.canonicalOrNull + r.successful,
                    });
                  })
                }
              >
                {cleaningAction === "legalform" ? (
                  <Loader2 className="h-3 w-3 animate-spin me-1" />
                ) : (
                  <RefreshCw className="h-3 w-3 me-1" />
                )}
                Sanitize {currentLegalForm.mappable.length} Auto-Mappable Client{currentLegalForm.mappable.length === 1 ? "" : "s"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── DB-5 Broken References ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Broken References
          </h2>
          <Badge variant={brokenRefs.total === 0 ? "secondary" : "destructive"} className="text-xs font-normal">
            {brokenRefs.total === 0 ? "No broken refs" : `${brokenRefs.total} articles affected`}
          </Badge>
        </div>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-start px-4 py-2 font-medium text-muted-foreground">Issue</th>
                <th className="text-end px-4 py-2 font-medium text-muted-foreground">Articles</th>
                <th className="text-end px-4 py-2 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Missing Author", count: brokenRefs.articlesWithMissingAuthor },
                { label: "Missing Category", count: brokenRefs.articlesWithMissingCategory },
                { label: "Missing Featured Image", count: brokenRefs.articlesWithMissingFeaturedImage },
              ].map((row, i) => (
                <tr key={row.label} className={i < 2 ? "border-b" : ""}>
                  <td className="px-4 py-2.5 font-medium">{row.label}</td>
                  <td className="px-4 py-2.5 text-end">{row.count}</td>
                  <td className="px-4 py-2.5">
                    {row.count === 0 ? (
                      <span className="flex items-center justify-end gap-1 text-green-600 dark:text-green-400 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5" />OK
                      </span>
                    ) : (
                      <span className="flex items-center justify-end gap-1 text-yellow-600 dark:text-yellow-400 text-xs">
                        <AlertTriangle className="h-3.5 w-3.5" />Review
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
