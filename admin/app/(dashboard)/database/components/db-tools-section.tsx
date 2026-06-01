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
import type { DuplicateSlugStats } from "../actions/duplicate-slugs";
import type { LegalFormSanitizerStats } from "../actions/legalform-sanitizer";
import type { CanonicalSanitizerStats } from "../actions/canonical-sanitizer";
import { cleanExpiredOtps } from "../actions/orphan-cleaner";
import { cleanExpiredSessions } from "../actions/session-cleaner";
import { createTTLIndex } from "../actions/index-health";
import { sanitizeAllLegalForms } from "../actions/legalform-sanitizer";
import { sanitizeAllCanonicals } from "../actions/canonical-sanitizer";

interface Props {
  orphans: OrphanStats;
  indexHealth: TTLIndexStatus[];
  slugIssues: SlugIssue[];
  brokenRefs: BrokenRefsResult;
  sessionStats: SessionCleanerStats;
  duplicateSlugs: DuplicateSlugStats;
  legalFormSanitizer: LegalFormSanitizerStats;
  canonicalSanitizer: CanonicalSanitizerStats;
}

export function DbToolsSection({
  orphans,
  indexHealth,
  slugIssues,
  brokenRefs,
  sessionStats,
  duplicateSlugs,
  legalFormSanitizer,
  canonicalSanitizer,
}: Props) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [currentOrphans, setCurrentOrphans] = useState(orphans);
  const [currentSessions, setCurrentSessions] = useState(sessionStats);
  const [currentIndexHealth, setCurrentIndexHealth] = useState(indexHealth);
  const [currentLegalForm, setCurrentLegalForm] = useState(legalFormSanitizer);
  const [currentCanonical, setCurrentCanonical] = useState(canonicalSanitizer);
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

  const hasOrphans = currentOrphans.expiredOtps > 0;
  const hasSessions = currentSessions.total > 0;
  const hasDuplicateSlugs = duplicateSlugs.crossClientSlugs > 0;
  const hasTtlMissing = ttlMissing > 0;
  const hasSlugIssues = slugTotal > 0;
  const hasLegalForm = currentLegalForm.mappableCount + currentLegalForm.unmappedCount > 0;
  const hasCanonical = currentCanonical.issueCount > 0;
  const hasBrokenRefs = brokenRefs.total > 0;
  const showAttentionEmpty =
    !hasOrphans && !hasSessions && !hasDuplicateSlugs &&
    !hasTtlMissing && !hasSlugIssues && !hasLegalForm && !hasCanonical && !hasBrokenRefs;

  return (
    <div className="space-y-6">
      {showAttentionEmpty && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            All maintenance tools are healthy
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Nothing needs attention right now.
          </p>
        </div>
      )}

      {/* ── DB-2 Orphan Cleaner ── */}
      {hasOrphans && (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Orphan Cleaner
          </h2>
          <Badge variant="destructive" className="text-xs font-normal">
            {currentOrphans.expiredOtps} expired
          </Badge>
        </div>
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Expired OTPs</p>
                  <p className="text-xs text-muted-foreground">Slug change codes past expiry</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{currentOrphans.expiredOtps}</span>
                <Button size="sm" variant="outline" disabled={isPending}
                  onClick={() => run("otps", async () => {
                    const r = await cleanExpiredOtps();
                    toast({ title: `Deleted ${r.deleted} expired OTPs` });
                    setCurrentOrphans(p => ({ ...p, expiredOtps: 0, total: p.total - p.expiredOtps }));
                  })}
                  className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10">
                  {cleaningAction === "otps" ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Trash2 className="h-3 w-3 me-1" />Clean</>}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* ── Session Cleaner ── */}
      {hasSessions && (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Session Cleaner
          </h2>
          <Badge variant="destructive" className="text-xs font-normal">
            {currentSessions.total} expired
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
      )}

      {/* ── Duplicate Slugs ── */}
      {hasDuplicateSlugs && (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Duplicate Slug Scanner
          </h2>
          <Badge variant="destructive" className="text-xs font-normal">
            {duplicateSlugs.crossClientSlugs} slugs shared
          </Badge>
        </div>
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
      </div>
      )}

      {/* ── DB-3 TTL Index Health ── */}
      {hasTtlMissing && (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            TTL Index Health
          </h2>
          <Badge variant="destructive" className="text-xs font-normal">
            {ttlMissing} missing
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
              {currentIndexHealth.filter((idx) => !idx.exists).map((idx, i, arr) => (
                <tr key={idx.collection} className={i < arr.length - 1 ? "border-b" : ""}>
                  <td className="px-4 py-2.5 font-medium">{idx.label}</td>
                  <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">{idx.field}</td>
                  <td className="px-4 py-2.5">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* ── DB-4 Slug Integrity ── */}
      {hasSlugIssues && (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Slug Integrity
          </h2>
          <Badge variant="destructive" className="text-xs font-normal">
            {slugTotal} empty slugs
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
              {slugIssues.filter((i) => i.emptySlugs > 0).map((issue, i, arr) => (
                <tr key={issue.entity} className={i < arr.length - 1 ? "border-b" : ""}>
                  <td className="px-4 py-2.5 font-medium">{issue.label}</td>
                  <td className="px-4 py-2.5 text-end">{issue.emptySlugs}</td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center justify-end gap-1 text-destructive text-xs">
                      <XCircle className="h-3.5 w-3.5" />Fix required
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* ── Legal Form Sanitizer ── */}
      {hasLegalForm && (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Legal Form Sanitizer
          </h2>
          <Badge variant="destructive" className="text-xs font-normal">
            {currentLegalForm.mappableCount + currentLegalForm.unmappedCount} non-canonical
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
      )}

      {/* ── Canonical URL Sanitizer ── */}
      {hasCanonical && (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Canonical URL Sanitizer
          </h2>
          <Badge variant="destructive" className="text-xs font-normal">
            {currentCanonical.issueCount} need fixing
          </Badge>
        </div>
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Wrong-host or double-encoded canonical URLs</p>
                  <p className="text-xs text-muted-foreground">
                    Every canonical must point to{" "}
                    <code className="text-[11px]">{currentCanonical.expectedOrigin || "—"}</code>.
                    Legacy data had non-www hosts or double-encoded Arabic slugs
                    (<span className="font-mono">%25…</span>), which split Google&apos;s ranking signals.
                    Fix corrects the stored URL <em>and</em> regenerates the page SEO so the live page updates.
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold whitespace-nowrap">
                {currentCanonical.issueCount} / {currentCanonical.totalChecked}
              </span>
            </div>

            {currentCanonical.issues.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground mb-1.5">
                  Will be corrected ({currentCanonical.issues.length}):
                </p>
                <ul className="space-y-2">
                  {currentCanonical.issues.slice(0, 10).map((it) => (
                    <li key={`${it.kind}-${it.id}`} className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="uppercase text-[10px] font-semibold bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                          {it.kind}
                        </span>
                        <span className="text-muted-foreground truncate max-w-[220px]" title={it.slug}>{it.slug}</span>
                      </div>
                      <div className="ps-1 space-y-0.5">
                        <code className="block text-[11px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded break-all">
                          {it.before || "(empty)"}
                        </code>
                        <code className="block text-[11px] bg-green-500/10 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded break-all">
                          {it.after}
                        </code>
                      </div>
                    </li>
                  ))}
                </ul>
                {currentCanonical.issues.length > 10 && (
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    +{currentCanonical.issues.length - 10} more…
                  </p>
                )}
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              className="w-full h-8 text-xs"
              onClick={() =>
                run("canonical", async () => {
                  const r = await sanitizeAllCanonicals();
                  toast({
                    title: `Fixed ${r.successful} of ${r.attempted} canonical URLs`,
                    description: r.failed > 0 ? `${r.failed} failed — check logs` : undefined,
                    variant: r.failed > 0 ? "destructive" : "default",
                  });
                  setCurrentCanonical({
                    ...currentCanonical,
                    issueCount: r.failed,
                    issues: currentCanonical.issues.filter((it) => r.errors.some((e) => e.id === it.id)),
                  });
                })
              }
            >
              {cleaningAction === "canonical" ? (
                <Loader2 className="h-3 w-3 animate-spin me-1" />
              ) : (
                <RefreshCw className="h-3 w-3 me-1" />
              )}
              Fix {currentCanonical.issues.length} Canonical URL{currentCanonical.issues.length === 1 ? "" : "s"}
            </Button>
          </CardContent>
        </Card>
      </div>
      )}

      {/* ── DB-5 Broken References ── */}
      {hasBrokenRefs && (() => {
        const brokenRows = [
          { label: "Missing Author", count: brokenRefs.articlesWithMissingAuthor },
          { label: "Missing Category", count: brokenRefs.articlesWithMissingCategory },
          { label: "Missing Featured Image", count: brokenRefs.articlesWithMissingFeaturedImage },
        ].filter((r) => r.count > 0);
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Broken References
              </h2>
              <Badge variant="destructive" className="text-xs font-normal">
                {brokenRefs.total} articles affected
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
                  {brokenRows.map((row, i) => (
                    <tr key={row.label} className={i < brokenRows.length - 1 ? "border-b" : ""}>
                      <td className="px-4 py-2.5 font-medium">{row.label}</td>
                      <td className="px-4 py-2.5 text-end">{row.count}</td>
                      <td className="px-4 py-2.5">
                        <span className="flex items-center justify-end gap-1 text-yellow-600 dark:text-yellow-400 text-xs">
                          <AlertTriangle className="h-3.5 w-3.5" />Review
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
