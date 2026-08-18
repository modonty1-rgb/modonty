"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { normalizeSubdomain, validateSubdomain, type SubdomainError } from "@modonty/shared/lib/partner-site";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SITE_HOST = "modonty.com";

/** In the partner's words — no character classes, no DNS talk (Khalid 2026-08-17). */
const ERROR_TEXT: Record<SubdomainError, string> = {
  empty: "",
  "too-short": "قصير — خلّه ثلاثة أحرف أو أكثر",
  "too-long": "طويل — اختصره",
  "invalid-chars": "بالإنجليزي فقط، بلا مسافات ولا رموز — مثل: clinic-name",
  "hyphen-edge": "ما يبدأ ولا ينتهي بشرطة",
  reserved: "هذا الاسم مستخدم — جرّب غيره",
};

interface SiteAddressSettingsProps {
  slug: string;
  subdomain: string | null;
  onSubdomainChange: (label: string) => void;
}

/** The address he has now (copy) + an optional subdomain, validated live (shared rules). */
export function SiteAddressSettings({ slug, subdomain, onSubdomainChange }: SiteAddressSettingsProps) {
  const [copied, setCopied] = useState(false);
  const [raw, setRaw] = useState(subdomain ?? "");
  const label = normalizeSubdomain(raw);
  const error = validateSubdomain(label);
  const currentUrl = `https://www.${SITE_HOST}/clients/${slug}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the text is still selectable */
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* card 1 — the address he has today (title sits ABOVE the card, nothing inside repeats it) */}
      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">عنوانك على مدونتي</h2>
        <div className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3">
          <p dir="ltr" className="min-w-0 truncate text-end text-sm">{currentUrl}</p>
          <Button type="button" variant="ghost" size="icon" onClick={copy} aria-label="نسخ العنوان" className="h-11 w-11 shrink-0">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </section>

      {/* card 2 — optional subdomain: field · one hint line under it */}
      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">نطاق فرعي (اختياري)</h2>
        <div className="rounded-lg border bg-card px-4 py-3">
          <div className="flex items-center gap-2" dir="ltr">
            <Input
              value={raw}
              onChange={(e) => {
                setRaw(e.target.value);
                onSubdomainChange(normalizeSubdomain(e.target.value));
              }}
              placeholder="name"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={label.length > 0 && error !== null}
              aria-describedby="subdomain-hint"
              className={cn("h-9 w-44 font-mono text-sm", label.length > 0 && error && "border-destructive focus-visible:ring-destructive")}
            />
            <span className="text-sm text-muted-foreground">.{SITE_HOST}</span>
          </div>
          {/* aria-live: inline validation is announced as he types, not on submit */}
          <p id="subdomain-hint" aria-live="polite" className={cn("mt-2 text-xs", label.length > 0 && error ? "text-destructive" : "text-muted-foreground")}>
            {label.length > 0 && error
              ? ERROR_TEXT[error]
              : label.length > 0
                ? `تمام — موقعك بيفتح من ${label}.${SITE_HOST}`
                : "اسم قصير بالإنجليزي لموقعك، مثل: clinic-name — بلا مسافات ولا رموز."}
          </p>
        </div>
      </section>
    </div>
  );
}
