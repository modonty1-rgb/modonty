import { HealthSummary } from "@/app/(dashboard)/database/components/health-summary";
import { DbToolsSection } from "@/app/(dashboard)/database/components/db-tools-section";
import { AutoMaintenancePanel } from "@/app/(dashboard)/database/components/auto-maintenance-panel";
import type { OrphanStats } from "@/app/(dashboard)/database/actions/orphan-cleaner";
import type { TTLIndexStatus } from "@/app/(dashboard)/database/actions/index-health";
import type { SlugIssue } from "@/app/(dashboard)/database/actions/slug-integrity";
import type { BrokenRefsResult } from "@/app/(dashboard)/database/actions/broken-references";
import type { SessionCleanerStats } from "@/app/(dashboard)/database/actions/session-cleaner";
import type { StaleVersionsStats } from "@/app/(dashboard)/database/actions/stale-versions";
import type { DuplicateSlugStats } from "@/app/(dashboard)/database/actions/duplicate-slugs";
import type { JsonLdIntegrityStats } from "@/app/(dashboard)/database/actions/jsonld-integrity";
import type { CanonicalSanitizerStats } from "@/app/(dashboard)/database/actions/canonical-url-sanitizer";
import type { LegalFormSanitizerStats } from "@/app/(dashboard)/database/actions/legalform-sanitizer";
import type { SiteUrlDriftStatus } from "@/lib/seo/site-url";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface Props {
  orphans: OrphanStats;
  indexHealth: TTLIndexStatus[];
  slugIssues: SlugIssue[];
  brokenRefs: BrokenRefsResult;
  sessionStats: SessionCleanerStats;
  staleVersions: StaleVersionsStats;
  duplicateSlugs: DuplicateSlugStats;
  jsonLdIntegrity: JsonLdIntegrityStats;
  canonicalSanitizer: CanonicalSanitizerStats;
  legalFormSanitizer: LegalFormSanitizerStats;
  siteUrlDrift: SiteUrlDriftStatus;
}

function computeToolStatuses(props: Props) {
  const statuses = {
    orphan: props.orphans.expiredOtps > 0,
    session: props.sessionStats.total > 0,
    duplicateSlugs: props.duplicateSlugs.crossClientSlugs > 0,
    ttlIndex: props.indexHealth.filter((i) => !i.exists).length > 0,
    slugIntegrity: props.slugIssues.reduce((s, i) => s + i.emptySlugs, 0) > 0,
    jsonLd: props.jsonLdIntegrity.staleCount > 0,
    canonical: props.canonicalSanitizer.staleCount > 0,
    legalForm: props.legalFormSanitizer.mappableCount > 0,
    brokenRefs: props.brokenRefs.total > 0,
  };
  const attention = Object.values(statuses).filter(Boolean).length;
  const healthy = Object.values(statuses).filter((s) => !s).length;
  return { attention, healthy };
}

function computeAutoFixableCount(props: Props) {
  let n = 0;
  if (props.orphans.expiredOtps > 0) n++;
  if (props.sessionStats.total > 0) n++;
  if (props.staleVersions.stale30Days > 0) n++;
  if (props.indexHealth.some((i) => !i.exists)) n++;
  if (props.jsonLdIntegrity.staleCount > 0) n++;
  if (props.canonicalSanitizer.staleCount > 0) n++;
  if (props.legalFormSanitizer.mappableCount > 0) n++;
  return n;
}

export function MaintenancePageShell(props: Props) {
  const { attention, healthy } = computeToolStatuses(props);
  const autoFixable = computeAutoFixableCount(props);

  return (
    <div className="max-w-[1200px] mx-auto space-y-4">
      <div className="rounded-xl border bg-card p-4">
        <h1 className="text-xl font-semibold leading-tight">Maintenance</h1>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Run automated clean-ups, review individual tools, or restore from a backup.
        </p>
      </div>

      <HealthSummary
        attentionCount={attention}
        healthyCount={healthy}
        tableGroupsCount={0}
        hideGroups
      />

      <AutoMaintenancePanel attentionCount={autoFixable} />

      {/* Site URL Drift Detection — manual-fix banner (env mismatch requires Vercel redeploy) */}
      <SiteUrlDriftCard status={props.siteUrlDrift} />

      <DbToolsSection
        orphans={props.orphans}
        indexHealth={props.indexHealth}
        slugIssues={props.slugIssues}
        brokenRefs={props.brokenRefs}
        sessionStats={props.sessionStats}
        duplicateSlugs={props.duplicateSlugs}
        jsonLdIntegrity={props.jsonLdIntegrity}
        canonicalSanitizer={props.canonicalSanitizer}
        legalFormSanitizer={props.legalFormSanitizer}
      />
    </div>
  );
}

function SiteUrlDriftCard({ status }: { status: SiteUrlDriftStatus }) {
  // When in sync: subtle green card. When drift: bold amber/red card.
  if (status.hasDrift) {
    return (
      <div className="rounded-lg border-2 border-amber-500/40 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1.5 min-w-0">
            <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400">
              ⚠️ Site URL drift — DB ≠ Vercel env
            </h3>
            <p className="text-xs text-foreground/80">{status.message}</p>
            <dl className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <dt className="text-muted-foreground font-medium uppercase tracking-wide">DB (Settings.siteUrl)</dt>
                <dd className="font-mono text-emerald-700 dark:text-emerald-400 break-all">{status.dbValue ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground font-medium uppercase tracking-wide">env (NEXT_PUBLIC_SITE_URL)</dt>
                <dd className="font-mono text-red-600 dark:text-red-400 break-all">{status.envValue ?? "—"}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    );
  }
  // No drift — compact confirmation
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2 text-xs">
        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
        <span className="font-medium">Site URL sync:</span>
        <span className="text-muted-foreground">DB + env match</span>
        <code className="ms-auto font-mono text-[10px] text-emerald-700 dark:text-emerald-400 truncate">
          {status.dbValue || status.envValue || "—"}
        </code>
      </div>
    </div>
  );
}
