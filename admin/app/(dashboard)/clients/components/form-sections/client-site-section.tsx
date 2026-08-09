"use client";

/**
 * Client Site Publishing — ADMIN.
 *
 * Some clients get their articles delivered to their OWN website instead of
 * modonty.com. Two things make that work, and both live here:
 *
 *   1. The articles address on their site. Every canonical URL, og:url and internal
 *      link of that client's articles is baked from it, so it is mandatory before
 *      the permission can be switched on — and changing it later rebakes them all.
 *   2. The address their website pulls from. It carries this client's id and nothing
 *      secret, because everything it returns is already printed on their public pages
 *      (Khalid 2026-08-09) — so there is no key to mint, install, or rotate, and no
 *      client has to involve a developer to paste a credential.
 *
 * The «Suspend service» tick is the one control that stops delivery, and it does not
 * invalidate the address — the client's website keeps the same URL and starts working
 * again the moment the tick comes off.
 */

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Globe, Copy, Check, X, Minus, Loader2 } from "lucide-react";

import { FormInput } from "@/components/admin/form-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { probeArticlesBaseUrl, type ProbeResult } from "../../actions/clients-actions/probe-articles-base-url";

import type { ClientFormSchemaType } from "../../helpers/client-form-schema";

export interface ClientSiteKeyInfo {
  apiKeyLastUsedAt: Date | string | null;
}

interface ClientSiteSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
  /** Server-owned pull stats. Absent on the create screen — nothing has pulled yet. */
  keyInfo?: ClientSiteKeyInfo | null;
  clientId?: string;
}

/**
 * The PUBLIC address we hand to clients — deliberately its own name, not the console's.
 *
 * The endpoint is served by the console app (the admin gets redeployed and paused too
 * often for a client's website to depend on it). But the string below goes into an env
 * var on the CLIENT's server, so it must outlive whichever app happens to serve it: if
 * this ever moves, `api.modonty.com` follows it and not one client has to change a
 * line. Pointing them at `console.modonty.com/api/…` would weld every integration to
 * today's deployment layout.
 *
 * Env-driven so the value is decided in one place, not in this file.
 */
const ARTICLES_API_BASE = process.env.NEXT_PUBLIC_ARTICLES_API_BASE || "https://api.modonty.com/v1";

/**
 * One row of the domain check.
 *
 * Structured on purpose (Khalid 2026-08-08): the first version wrote Arabic sentences
 * with the URLs inline, and a URL inside an Arabic sentence flips the text direction
 * mid-line — the punctuation jumps and the eye loses the thread. So the URL never sits
 * inside a sentence: it gets its own cell with `dir="ltr"`, and the explanation next to
 * it never contains one. Icons carry pass/fail too, so colour is not the only signal.
 */
function CheckRow({
  state,
  label,
  value,
  note,
}: {
  state: "pass" | "fail" | "info";
  label: string;
  value?: string;
  note?: string;
}) {
  const icon =
    state === "pass" ? (
      <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
    ) : state === "fail" ? (
      <X className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />
    ) : (
      <Minus className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
    );

  return (
    <div className="flex items-start gap-2 p-2">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="w-24 shrink-0 font-medium text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 space-y-0.5">
        {value && (
          <code dir="ltr" className="block truncate font-mono text-[11px]">
            {value}
          </code>
        )}
        {note && (
          <span className={`block ${state === "fail" ? "text-destructive" : "text-muted-foreground"}`}>{note}</span>
        )}
      </span>
    </div>
  );
}

/** One line the admin can hand over as-is: label, the exact string, and a copy button. */
function CopyRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-0.5">
      <span className="block text-[11px] font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <code className={`flex-1 truncate rounded bg-background px-2 py-1 text-[11px] ${mono ? "font-mono" : ""}`}>
          {value}
        </code>
        <Button type="button" variant="ghost" size="sm" onClick={copy} aria-label={`Copy ${label}`}>
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
}

/** Adds `www` when it is missing. Anything unparseable is left exactly as typed. */
function addWww(raw: string): string {
  try {
    const url = new URL(raw);
    if (url.hostname.startsWith("www.")) return raw;
    url.hostname = `www.${url.hostname}`;
    return url.toString().replace(/\/+$/, "");
  } catch {
    return raw;
  }
}

function formatMoment(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function ClientSiteSection({ form, keyInfo, clientId }: ClientSiteSectionProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = form;

  const canPublish = watch("canPublishToOwnSite") ?? false;
  const articlesBaseUrl = watch("articlesBaseUrl") ?? "";
  const suspended = watch("apiKeySuspended") ?? false;

  const [probe, setProbe] = useState<ProbeResult | null>(null);
  const [probing, setProbing] = useState(false);
  /** Set when the check rewrote the address itself (www) — announced, never silent. */
  const [corrected, setCorrected] = useState<string | null>(null);

  const runProbe = async () => {
    setProbing(true);
    setProbe(null);
    setCorrected(null);

    // `www` goes in by default, before anything is checked (Khalid 2026-08-08). Almost
    // every client types the bare domain and almost every host serves on `www`, so the
    // check starts from the spelling most likely to be the real one — and the field
    // shows it, because the field is what gets saved.
    let target = articlesBaseUrl.trim();
    const withWww = addWww(target);
    if (withWww !== target) {
      target = withWww;
      setValue("articlesBaseUrl", target, { shouldDirty: true, shouldValidate: true });
      setCorrected(target);
    }

    let result = await probeArticlesBaseUrl(target);

    // The `www` spelling is the one difference the admin should never have to hunt for:
    // if the typed address fails and its counterpart is the real page, the field is
    // rewritten on the spot and re-checked, so what passes is what is in the box. The
    // correction is announced below — a value that changes itself in silence is worse
    // than the error it replaced.
    if (!result.ok && result.suggestedUrl) {
      const fixed = result.suggestedUrl;
      setValue("articlesBaseUrl", fixed, { shouldDirty: true, shouldValidate: true });
      setCorrected(fixed);
      result = await probeArticlesBaseUrl(fixed);
    }

    setProbe(result);
    setProbing(false);
  };

  // The client's own pull address. It exists the moment the client row does — there is
  // nothing to generate and nothing to wait for. On the create screen there is no id
  // yet, so the block says so instead of printing a broken URL.
  const pullBase = clientId ? `${ARTICLES_API_BASE}/sites/${clientId}` : null;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Globe className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          Client Site Publishing
        </h2>
        <p className="text-xs text-muted-foreground">
          Deliver this client&apos;s articles to their own website instead of modonty.com.
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border bg-muted/30 p-3">
        <Checkbox
          checked={canPublish}
          onCheckedChange={(checked) => {
            // Switching publishing off drops the check result with it — a pass that was
            // earned while the client was in a different state must not linger and
            // unlock the key button when it comes back on.
            if (checked !== true) setProbe(null);
            setValue("canPublishToOwnSite", checked === true, { shouldDirty: true, shouldValidate: true });
          }}
          aria-label="Publish to the client's own website"
        />
        <span className="space-y-0.5">
          <span className="block text-sm font-medium">Publish to the client&apos;s own website</span>
          <span className="block text-xs text-muted-foreground">
            Check the domain below, then hand them the pull address.
          </span>
        </span>
      </label>

      <div className="space-y-2">
        <FormInput
          label="Articles address on their site"
          name="articlesBaseUrl"
          value={articlesBaseUrl || ""}
          onChange={(e) => {
            // Editing the address invalidates the previous check — otherwise a 200 from
            // the OLD domain would keep the key button unlocked for the new one.
            setProbe(null);
            setValue("articlesBaseUrl", e.target.value || "", { shouldDirty: true, shouldValidate: true });
          }}
          error={errors.articlesBaseUrl?.message}
          placeholder="https://example.com/articles"
          hint="Canonical URLs are built from this. Changing it rebakes every article of this client."
          maxLength={500}
        />
        <div className="flex items-center gap-2">
          {/* The check costs a real request to someone else's server, so it is gated on
              both things that make it meaningful: publishing is actually switched on for
              this client, and an address has been typed. `probing` also holds the button
              down while a call is in flight, so an impatient double-click cannot fire
              two requests at the same domain. */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={probing || !canPublish || !articlesBaseUrl.trim()}
            onClick={runProbe}
          >
            {probing && <Loader2 className="me-2 h-3.5 w-3.5 animate-spin" />}
            Check domain
          </Button>
          {!canPublish && (
            <span className="text-xs text-muted-foreground">
              Switch publishing on first — there is nothing to check otherwise.
            </span>
          )}
        </div>

        {corrected && (
          <p className="text-xs text-muted-foreground">
            Checked as <code dir="ltr" className="font-mono">{corrected}</code> — the address in
            the field was adjusted to match.
          </p>
        )}

        {probe && (
          <div className="divide-y rounded-lg border bg-muted/30 text-xs">
            {/* 1 · Structure */}
            <CheckRow
              state={probe.structureError ? "fail" : "pass"}
              label="Format"
              value={probe.normalizedUrl}
              note={probe.structureError}
            />

            {/* 2 · The articles page itself — the only row that decides anything */}
            {!probe.structureError && (
              <CheckRow
                state={probe.ok ? "pass" : "fail"}
                label="Articles page"
                value={probe.redirected ? `${probe.normalizedUrl} → ${probe.finalUrl}` : probe.finalUrl}
                note={
                  probe.articlesError ??
                  (probe.status === 200
                    ? "Answers at this exact address, no redirect."
                    : `Answers ${probe.status} — no index page here, which is fine. Article pages are what we build.`)
                }
              />
            )}

            {/* 3 · The bare domain — only tells the site down apart from the page missing */}
            {!probe.structureError && !probe.ok && (
              <CheckRow
                state="info"
                label="Their site"
                value={probe.domainStatus ? String(probe.domainStatus) : "no answer"}
                note={
                  probe.domainStatus && probe.domainStatus < 400
                    ? "The site is up — it is this page that is missing."
                    : probe.domainError ?? "The site itself did not answer."
                }
              />
            )}
          </div>
        )}
      </div>

      {canPublish && (
        <div className="space-y-3 rounded-lg border bg-card p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Pull address</span>
            {pullBase ? (
              <span className={suspended ? "text-xs font-medium text-destructive" : "text-xs font-medium text-emerald-600"}>
                {suspended ? "Suspended" : "Active"}
              </span>
            ) : null}
          </div>

          {pullBase ? (
            <>
              {/* The whole handover, copyable line by line: two addresses and one command
                  their developer can paste to see real data. Nothing secret is printed
                  here, so this block can be read aloud over the phone. */}
              <div className="space-y-2 rounded-md border bg-muted/30 p-2.5">
                <CopyRow label="List endpoint" value={`${pullBase}/articles`} />
                <CopyRow label="Single article" value={`${pullBase}/articles/{slug}`} />
                <CopyRow label="Test it now" value={`curl ${pullBase}/articles`} mono />
                {/* The client's entire obligation, in one copyable line. */}
                <CopyRow label="Their robots.txt line" value={`Sitemap: ${pullBase}/sitemap.xml`} mono />
              </div>

              <dl className="text-xs">
                <dt className="text-muted-foreground">Last pulled by their site</dt>
                <dd className="font-medium">{formatMoment(keyInfo?.apiKeyLastUsedAt ?? null)}</dd>
              </dl>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              Save the client first — the address is built from their id.
            </p>
          )}

          <label className="flex cursor-pointer items-start gap-2.5 border-t pt-3">
            <Checkbox
              checked={suspended}
              onCheckedChange={(checked) => setValue("apiKeySuspended", checked === true, { shouldDirty: true })}
              aria-label="Suspend service"
            />
            <span className="space-y-0.5">
              <span className="block text-sm font-medium">Suspend service</span>
              <span className="block text-xs text-muted-foreground">
                Their site stops receiving articles. The address survives — unticking this resumes it.
              </span>
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
