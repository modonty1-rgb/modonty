"use client";

import { useState, useTransition, useCallback, type ComponentType, type SVGProps } from "react";
import { AtSign, Check, Copy, ExternalLink, Link2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { messages } from "@/lib/messages";
import { cn } from "@/lib/utils";
import { SocialFacebookOutline } from "@modonty/shared/components/icons/facebook";
import { Instagram } from "@modonty/shared/components/icons/instagram";
import { Linkedin } from "@modonty/shared/components/icons/linkedin";
import { RoundSnapchat } from "@modonty/shared/components/icons/snapchat";
import { Telegram } from "@modonty/shared/components/icons/telegram";
import { TiktokLogoLight } from "@modonty/shared/components/icons/tiktok";
import { Twitter } from "@modonty/shared/components/icons/twitter";
import { Whatsapp } from "@modonty/shared/components/icons/whatsapp";
import { Youtube } from "@modonty/shared/components/icons/youtube";
import { updateAllSettings, type AllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { Section } from "@/app/(dashboard)/settings/_shared/section";
import { Field } from "@/app/(dashboard)/settings/_shared/field";
import { StatusBadge } from "@/app/(dashboard)/settings/_shared/status-badge";

interface Props {
  initialSettings: AllSettings;
}

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * Our accounts, in the order /accounts lists them. `utm` is the `utm_source` the bio link on
 * that network carries — lowercase, one spelling per network (GA4 treats `Instagram` and
 * `instagram` as two sources). `null` = a channel people join, not a profile with a bio.
 */
const NETWORKS: { field: keyof AllSettings; label: string; icon: Icon; example: string; utm: string | null }[] = [
  { field: "instagramUrl", label: "Instagram", icon: Instagram, example: "instagram.com/modonty.sa", utm: "instagram" },
  { field: "tiktokUrl", label: "TikTok", icon: TiktokLogoLight, example: "tiktok.com/@modonty.ksa", utm: "tiktok" },
  { field: "twitterUrl", label: "X", icon: Twitter, example: "x.com/modonty", utm: "x" },
  { field: "linkedInUrl", label: "LinkedIn", icon: Linkedin, example: "linkedin.com/company/modonty0", utm: "linkedin" },
  { field: "facebookUrl", label: "Facebook", icon: SocialFacebookOutline, example: "facebook.com/modonty", utm: "facebook" },
  { field: "youtubeUrl", label: "YouTube", icon: Youtube, example: "youtube.com/@modonty", utm: "youtube" },
  { field: "snapchatUrl", label: "Snapchat", icon: RoundSnapchat, example: "snapchat.com/add/modonty", utm: "snapchat" },
  { field: "pinterestUrl", label: "Pinterest", icon: Link2, example: "pinterest.com/modonty", utm: "pinterest" },
  { field: "whatsappChannelUrl", label: "WhatsApp Channel", icon: Whatsapp, example: "whatsapp.com/channel/…", utm: null },
  { field: "telegramChannelUrl", label: "Telegram Channel", icon: Telegram, example: "t.me/modonty", utm: null },
];

// Saves ONLY these fields — the rest of the Settings row belongs to other forms.
const SOCIAL_FIELDS = [
  ...NETWORKS.map((n) => n.field),
  "twitterSite",
  "twitterCreator",
] as const satisfies readonly (keyof AllSettings)[];

const norm = (v: unknown) => (v === undefined || v === null ? "" : v);
const filled = (v: unknown) => typeof v === "string" && v.trim() !== "";

/**
 * The /accounts page's accounts. They lived at /settings/social; they moved here because this
 * page IS the list of them (Khalid, 2026-09-23: «كل ما يخص السوشيال ميديا انقلوا على الصفحة
 * هذه»). The values stay on the Settings row — the footer, the author page and every
 * Organization `sameAs` read them there.
 *
 * Three things the old form did not say, and the team needed:
 * - whether each account is SHOWN on /accounts (a placeholder looked like a value);
 * - how many are live;
 * - the bio link to paste on each network, already tagged for GA4.
 */
export function SocialLinksForm({ initialSettings }: Props) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AllSettings>(initialSettings);
  const [savedSnapshot, setSavedSnapshot] = useState<AllSettings>(initialSettings);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [isSaving, startSaving] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);

  const set = useCallback(<K extends keyof AllSettings>(key: K, value: AllSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const dirty = SOCIAL_FIELDS.some((f) => norm(settings[f]) !== norm(savedSnapshot[f]));
  const liveCount = NETWORKS.filter((n) => filled(savedSnapshot[n.field])).length;
  const siteUrl = (settings.siteUrl || "https://www.modonty.com").replace(/\/$/, "");
  const bioNetworks = NETWORKS.filter((n) => n.utm && filled(savedSnapshot[n.field]));
  const bioLink = (utm: string) => `${siteUrl}/accounts?utm_source=${utm}&utm_medium=social&utm_campaign=link_in_bio`;

  function handleSave() {
    startSaving(async () => {
      const scoped: Partial<AllSettings> = {};
      for (const f of SOCIAL_FIELDS) {
        (scoped as Record<string, unknown>)[f] = (settings as unknown as Record<string, unknown>)[f];
      }
      const r = await updateAllSettings(scoped);
      if (!r.success) {
        toast({ title: messages.error.update_failed, description: r.error || "فشل حفظ الإعدادات", variant: "destructive" });
        return;
      }
      setSavedSnapshot((prev) => ({ ...prev, ...scoped }));
      setSavedAt(new Date());
      toast({ title: messages.success.saved, description: "صفحة /accounts تتحدّث الآن.", variant: "success" });
    });
  }

  async function copy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 1600);
    } catch {
      toast({ title: "تعذّر النسخ", description: text, variant: "destructive" });
    }
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Section
        title="Accounts"
        description="Every account listed on /accounts — also the footer links and the Organization sameAs Google reads. Empty = hidden."
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm">
            <span className="font-bold tabular-nums">{liveCount}</span>
            <span className="text-muted-foreground"> of {NETWORKS.length} shown on the page</span>
          </p>
          <a
            href={`${siteUrl}/accounts`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Open /accounts <ExternalLink className="size-3.5" aria-hidden />
          </a>
        </div>

        <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {NETWORKS.map(({ field, label, icon: I, example }) => {
            const value = (settings[field] as string | null | undefined) ?? "";
            const live = filled(savedSnapshot[field]);
            const changed = norm(settings[field]) !== norm(savedSnapshot[field]);
            return (
              <li
                key={field}
                className={cn(
                  "rounded-lg border p-3 transition-colors",
                  live ? "border-emerald-500/30 bg-emerald-500/[0.04]" : "border-dashed",
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  <I className={cn("size-4 shrink-0", !live && "opacity-50")} aria-hidden />
                  <span className="text-sm font-semibold">{label}</span>
                  <span
                    className={cn(
                      "ms-auto rounded-full px-2 py-0.5 text-[10px] font-bold",
                      changed
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : live
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {changed ? "Unsaved" : live ? "Shown" : "Hidden"}
                  </span>
                </div>
                <Input
                  dir="ltr"
                  inputMode="url"
                  value={value}
                  onChange={(e) => set(field, e.target.value as AllSettings[typeof field])}
                  placeholder={`e.g. ${example}`}
                  aria-label={`${label} URL`}
                  className="h-9 text-sm placeholder:text-muted-foreground/40 placeholder:italic"
                />
              </li>
            );
          })}
        </ul>

        {/* The link each network's bio should carry — tagged so GA4 files the visit under
            Organic Social / <network>. Built from the SAVED values: a link for an account
            that is not on the page yet would send people to a page that does not list it. */}
        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <Link2 className="size-4 text-primary" aria-hidden />
            <h3 className="text-sm font-semibold">Bio links</h3>
            <span className="text-[11px] text-muted-foreground">— paste one in each network&apos;s bio to see which one brings visitors</span>
          </div>
          {bioNetworks.length === 0 ? (
            <p className="rounded-md border border-dashed px-3 py-3 text-xs text-muted-foreground">Save at least one account to get its bio link.</p>
          ) : (
            <ul className="divide-y rounded-md border">
              {bioNetworks.map(({ field, label, icon: I, utm }) => {
                const link = bioLink(utm!);
                return (
                  <li key={field} className="flex items-center gap-2 px-3 py-2">
                    <I className="size-4 shrink-0" aria-hidden />
                    <span className="w-24 shrink-0 text-xs font-semibold">{label}</span>
                    <code dir="ltr" className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground" title={link}>
                      {link}
                    </code>
                    <Button type="button" size="sm" variant="outline" className="h-7 gap-1 px-2 text-xs" onClick={() => copy(field, link)}>
                      {copied === field ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
                      {copied === field ? "Copied" : "Copy"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* X / Twitter card handles */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <AtSign className="size-4 text-sky-600" aria-hidden />
            <h3 className="text-sm font-semibold">X card handles</h3>
            <span className="text-[11px] text-muted-foreground">— used in the Twitter Card meta when a link is shared on X</span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="X Site Handle" hint="Used in the Twitter Card meta tag.">
              <Input dir="ltr" value={settings.twitterSite ?? ""} onChange={(e) => set("twitterSite", e.target.value)} placeholder="@modonty" />
            </Field>
            <Field label="X Creator Handle" hint="Author/creator handle for Twitter Cards.">
              <Input dir="ltr" value={settings.twitterCreator ?? ""} onChange={(e) => set("twitterCreator", e.target.value)} placeholder="@modonty" />
            </Field>
          </div>
        </div>

        {/* Save footer — sticks to the bottom while editing a long list, so it is never
            scrolled out of reach when there is something to save. */}
        <div className="sticky bottom-0 -mx-5 -mb-5 mt-1 flex items-center justify-between gap-3 border-t bg-card/95 px-5 py-3.5 backdrop-blur">
          <StatusBadge isDirty={dirty} isSaving={isSaving} savedAt={savedAt} />
          <Button onClick={handleSave} disabled={isSaving || !dirty} size="sm" className="h-8 gap-1.5">
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            {isSaving ? "Saving..." : "Save accounts"}
          </Button>
        </div>
      </Section>
    </TooltipProvider>
  );
}
