"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Link2, ShieldAlert, Smartphone, AlertCircle, ExternalLink } from "lucide-react";

export type TechHealthKind = "canonical" | "robots" | "mobile" | "soft404";

export interface TechHealthIssue {
  url: string;
  /** Declared canonical (what we set on the page) — only for kind="canonical". */
  userCanonical?: string | null;
  /** Google's chosen canonical — only for kind="canonical". */
  googleCanonical?: string | null;
  /** Robots state — only for kind="robots". */
  robotsTxtState?: string | null;
  /** Mobile verdict — only for kind="mobile". */
  mobileVerdict?: string | null;
  /** Mobile-specific issues from GSC — only for kind="mobile". */
  mobileIssues?: string[];
  /** Page fetch state — only for kind="soft404". */
  pageFetchState?: string | null;
  /** Coverage state from GSC. */
  coverageState?: string | null;
}

interface Props {
  kind: TechHealthKind;
  count: number;
  issues: TechHealthIssue[];
  /** Custom trigger renderer — receives onClick. The parent decides how the trigger looks. */
  children: (props: { onClick: () => void; disabled: boolean }) => React.ReactNode;
}

const KIND_META: Record<
  TechHealthKind,
  { title: string; description: string; icon: React.ReactNode; emptyHint: string }
> = {
  canonical: {
    title: "Canonical Issues",
    description: "Pages where Google's chosen canonical differs from what your page declared.",
    icon: <Link2 className="h-5 w-5 text-amber-500" />,
    emptyHint: "What this means: when you say one URL is master but Google picks a different one, your declared URL may not appear in search.",
  },
  robots: {
    title: "Blocked by robots.txt",
    description: "Pages your robots.txt is blocking Google from crawling.",
    icon: <ShieldAlert className="h-5 w-5 text-red-500" />,
    emptyHint: "What to fix: edit `app/robots.ts` to allow these paths, or accept that these pages should stay blocked.",
  },
  mobile: {
    title: "Mobile Issues",
    description: "Pages that failed Google's mobile-friendliness check.",
    icon: <Smartphone className="h-5 w-5 text-red-500" />,
    emptyHint: "What to fix: text too small, tap targets too close, viewport not set, etc.",
  },
  soft404: {
    title: "Soft 404",
    description: "Pages that return HTTP 200 but Google thinks the content is missing/empty.",
    icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
    emptyHint: "What to fix: thin content, redirects to home, or a 'not found' message in a 200 page. Add real content or return real 404.",
  },
};

export function TechHealthDialog({ kind, count, issues, children }: Props) {
  const [open, setOpen] = useState(false);
  const meta = KIND_META[kind];
  const disabled = count === 0;

  return (
    <>
      {children({ onClick: () => setOpen(true), disabled })}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {meta.icon}
              {meta.title}
              <span className="text-sm font-normal text-muted-foreground">
                · {count} URL{count === 1 ? "" : "s"}
              </span>
            </DialogTitle>
            <DialogDescription>{meta.description}</DialogDescription>
          </DialogHeader>

          {issues.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No issues — all clear.
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground p-3 rounded-md bg-muted/40 border">
                💡 {meta.emptyHint}
              </p>
              {issues.map((issue, i) => (
                <IssueRow key={`${issue.url}-${i}`} kind={kind} issue={issue} index={i + 1} />
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function IssueRow({
  kind,
  issue,
  index,
}: {
  kind: TechHealthKind;
  issue: TechHealthIssue;
  index: number;
}) {
  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="flex items-start gap-2">
        <span className="text-xs text-muted-foreground tabular-nums shrink-0 mt-0.5">
          {index}.
        </span>
        <a
          href={issue.url}
          target="_blank"
          rel="noopener noreferrer"
          dir="ltr"
          className="font-mono text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 break-all"
        >
          {decodePath(issue.url)}
          <ExternalLink className="h-3 w-3 opacity-60 shrink-0" />
        </a>
      </div>

      {kind === "canonical" && (
        <div className="ms-5 space-y-1.5 text-xs">
          <Field label="Your declared canonical" value={issue.userCanonical} tone="amber" />
          <Field label="Google's chosen canonical" value={issue.googleCanonical} tone="emerald" />
          <p className="text-muted-foreground italic mt-1">
            Google ignored your declaration and chose a different URL as the master. Update your{" "}
            <code className="bg-muted px-1 rounded">canonical</code> tag to match Google's choice — or
            strengthen the signals (sitemap, internal links) toward your preferred URL.
          </p>
        </div>
      )}

      {kind === "robots" && (
        <div className="ms-5 text-xs space-y-1">
          <Field label="Robots state" value={issue.robotsTxtState} tone="red" />
          <p className="text-muted-foreground italic">
            Edit <code className="bg-muted px-1 rounded">app/robots.ts</code> to allow this path, or
            accept that this page should stay blocked.
          </p>
        </div>
      )}

      {kind === "mobile" && (
        <div className="ms-5 text-xs space-y-1">
          <Field label="Verdict" value={issue.mobileVerdict} tone="red" />
          {issue.mobileIssues && issue.mobileIssues.length > 0 && (
            <div>
              <span className="text-muted-foreground">Specific issues:</span>
              <ul className="list-disc ms-5 mt-1 space-y-0.5 text-muted-foreground">
                {issue.mobileIssues.map((iss, i) => (
                  <li key={i}>{iss}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {kind === "soft404" && (
        <div className="ms-5 text-xs space-y-1">
          <Field label="Page fetch state" value={issue.pageFetchState} tone="amber" />
          <Field label="Coverage" value={issue.coverageState} tone="amber" />
          <p className="text-muted-foreground italic">
            The page returns HTTP 200 but Google thinks it has no real content. Add real content, or
            make the page return a proper 404/410 if it's truly missing.
          </p>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | null | undefined;
  tone: "amber" | "emerald" | "red";
}) {
  const toneCls = {
    amber: "text-amber-700 dark:text-amber-400",
    emerald: "text-emerald-700 dark:text-emerald-400",
    red: "text-red-700 dark:text-red-400",
  }[tone];
  return (
    <div className="flex gap-2 items-baseline">
      <span className="text-muted-foreground shrink-0">{label}:</span>
      <span className={`font-mono text-[11px] break-all ${toneCls}`}>{value ?? "—"}</span>
    </div>
  );
}

function decodePath(url: string): string {
  try {
    const u = new URL(url);
    return decodeURIComponent(u.pathname);
  } catch {
    return url;
  }
}
