"use client";

import { useState, useTransition, useCallback } from "react";
import { Check, Loader2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { messages } from "@/lib/messages";
import { updateAllSettings, type AllSettings } from "../../actions/settings-actions";
import { Section } from "../../_shared/section";
import { Field } from "../../_shared/field";
import { ImageField } from "../../_shared/image-field";
import { StatusBadge } from "../../_shared/status-badge";
import { formatTimeAgo } from "../../_shared/format-time-ago";
import { SEO_HINTS } from "../../_shared/seo-hints";

interface Props {
  initialSettings: AllSettings;
}

// Fields owned by each tab — grouped BY PURPOSE, not by raw schema name.
// Each tab saves ONLY its own fields.
const F = {
  // How the homepage looks in Google + when shared (meta + OG/Twitter image).
  search: ["modontySeoTitle", "modontySeoDescription", "ogImageUrl", "logoUrl", "altImage"],
  // The organization's official details — Organization structured data (Knowledge Panel).
  business: [
    "brandDescription",
    "orgContactEmail", "orgContactTelephone", "orgContactHoursAvailable",
    "orgStreetAddress", "orgAddressLocality", "orgAddressRegion", "orgPostalCode",
    "orgAddressCountry", "orgGeoLatitude", "orgGeoLongitude",
  ],
  // Social profile URLs (sameAs) + X card handles.
  social: [
    "twitterUrl", "linkedInUrl", "facebookUrl", "instagramUrl", "youtubeUrl",
    "tiktokUrl", "pinterestUrl", "snapchatUrl", "whatsappChannelUrl", "telegramChannelUrl",
    "twitterSite", "twitterCreator",
  ],
  // Visible welcome banner at the top of the homepage feed (NOT meta).
  banner: ["platformTagline", "platformDescription"],
} satisfies Record<string, (keyof AllSettings)[]>;

const TABS = [
  { key: "search", label: "SEO & Sharing", fields: F.search },
  { key: "business", label: "Business Info", fields: F.business },
  { key: "social", label: "Social Links", fields: F.social },
  { key: "banner", label: "Homepage Banner", fields: F.banner },
] as const;

const norm = (v: unknown) => (v === undefined || v === null ? "" : v);

export function ModontyForm({ initialSettings }: Props) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AllSettings>(initialSettings);
  // Snapshot of what's persisted — per-tab dirty = fields differ from this.
  const [savedSnapshot, setSavedSnapshot] = useState<AllSettings>(initialSettings);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [savingTab, setSavingTab] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();
  const [isRegenerating, startRegenerating] = useTransition();

  const set = useCallback(<K extends keyof AllSettings>(key: K, value: AllSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const isTabDirty = (fields: readonly (keyof AllSettings)[]) =>
    fields.some((f) => norm(settings[f]) !== norm(savedSnapshot[f]));

  function handleSaveTab(tabKey: string, fields: readonly (keyof AllSettings)[]) {
    startSaving(async () => {
      setSavingTab(tabKey);
      const scoped: Partial<AllSettings> = {};
      for (const f of fields) {
        (scoped as Record<string, unknown>)[f] = (settings as unknown as Record<string, unknown>)[f];
      }
      const r = await updateAllSettings(scoped);
      if (!r.success) {
        toast({ title: messages.error.update_failed, description: r.error || "فشل حفظ الإعدادات", variant: "destructive" });
        setSavingTab(null);
        return;
      }
      setSavedSnapshot((prev) => ({ ...prev, ...scoped }));
      setSavedAt(new Date());
      setSavingTab(null);
      toast({ title: messages.success.saved, description: "يجري تحديث المحتوى في الخلفية.", variant: "success" });
    });
  }

  function handleRegenerate() {
    startRegenerating(async () => {
      try {
        const gen = await import("@/lib/seo/listing-page-seo-generator");
        await gen.regenerateHomePageCache();
        toast({ title: "تم تحديث الكاش", description: "Homepage SEO cache regenerated.", variant: "success" });
      } catch (e) {
        toast({ title: messages.error.operation_failed, description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
      }
    });
  }

  const cacheLabel = formatTimeAgo(settings.jsonLdLastGenerated);

  // Per-tab save footer — bleeds to the Section card edges.
  const tabFooter = (tabKey: string, fields: readonly (keyof AllSettings)[], label: string) => {
    const dirty = isTabDirty(fields);
    const saving = isSaving && savingTab === tabKey;
    return (
      <div className="-mx-5 -mb-5 mt-1 flex items-center justify-between gap-3 border-t bg-muted/20 px-5 py-3.5">
        <StatusBadge isDirty={dirty} isSaving={saving} savedAt={savedAt} />
        <Button onClick={() => handleSaveTab(tabKey, fields)} disabled={isSaving || !dirty} size="sm" className="h-8 gap-1.5">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          {saving ? "Saving..." : `Save ${label}`}
        </Button>
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      {/* Cache strip — homepage-wide, once above the tabs */}
      <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-2.5 text-xs">
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Homepage SEO cache · refreshed <span className="font-medium text-foreground">{cacheLabel}</span>
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={handleRegenerate}
          disabled={isRegenerating || isSaving}
        >
          <RefreshCw className={`h-3 w-3 ${isRegenerating ? "animate-spin" : ""}`} />
          Regenerate cache
        </Button>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b bg-transparent p-0">
          {TABS.map((t) => (
            <TabsTrigger
              key={t.key}
              value={t.key}
              className="gap-1.5 rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              {t.label}
              <span className="text-[10px] tabular-nums text-muted-foreground/60">{t.fields.length}</span>
              {isTabDirty(t.fields) && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ─── SEO & Sharing ─── */}
        <TabsContent value="search" className="mt-4">
          <Section
            title="SEO & Sharing"
            description="How the homepage appears in Google search results and when shared on X, Facebook & LinkedIn."
          >
            <Field
              label="SEO Title"
              hint={SEO_HINTS.title}
              counter={settings.modontySeoTitle?.length ?? 0}
              counterMax={60}
            >
              <Input
                value={settings.modontySeoTitle ?? ""}
                onChange={(e) => set("modontySeoTitle", e.target.value)}
                placeholder="مدونتي | منصة المحتوى العربي"
              />
            </Field>
            <Field
              label="SEO Description"
              hint={SEO_HINTS.description}
              counter={settings.modontySeoDescription?.length ?? 0}
              counterMax={160}
            >
              <Textarea
                value={settings.modontySeoDescription ?? ""}
                onChange={(e) => set("modontySeoDescription", e.target.value)}
                placeholder="تصفح آلاف المقالات من أفضل الكتّاب..."
                className="resize-none min-h-[72px]"
              />
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
              <ImageField
                label="Share Image"
                value={settings.ogImageUrl ?? ""}
                onChange={(v) => set("ogImageUrl", v)}
                hint="1200×630 px — the Open Graph image shown when the page is shared on social media."
                aspect="og"
              />
              <ImageField
                label="Logo"
                value={settings.logoUrl ?? ""}
                onChange={(v) => set("logoUrl", v)}
                hint="Square, min 112×112 px — also used as your Organization logo in Google."
                aspect="square"
              />
            </div>
            <Field label="Image Alt Text" hint="Accessibility text for the logo and share image (also used as the image caption).">
              <Input
                value={settings.altImage ?? ""}
                onChange={(e) => set("altImage", e.target.value)}
                placeholder="مدونتي — منصة المحتوى العربي"
              />
            </Field>
            {tabFooter("search", F.search, "SEO")}
          </Section>
        </TabsContent>

        {/* ─── Business Info ─── */}
        <TabsContent value="business" className="mt-4">
          <Section
            title="Business Info"
            description="Your organization's official details — used in Google's structured data (Knowledge Panel) and reused across the whole site."
          >
            <Field
              label="Brand Description"
              hint="One line about Modonty — feeds the Organization schema (Google Knowledge Panel) and the publisher info on every page. This is NOT the homepage search snippet (see the SEO & Sharing tab)."
            >
              <Textarea
                value={settings.brandDescription ?? ""}
                onChange={(e) => set("brandDescription", e.target.value)}
                placeholder="منصة المحتوى العربي الرائدة..."
                className="resize-none min-h-[64px]"
              />
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-border">
              <Field label="Email">
                <Input type="email" value={settings.orgContactEmail ?? ""} onChange={(e) => set("orgContactEmail", e.target.value)} placeholder="info@modonty.com" />
              </Field>
              <Field label="Phone">
                <Input value={settings.orgContactTelephone ?? ""} onChange={(e) => set("orgContactTelephone", e.target.value)} placeholder="+966500000000" />
              </Field>
              <Field label="Hours">
                <Input value={settings.orgContactHoursAvailable ?? ""} onChange={(e) => set("orgContactHoursAvailable", e.target.value)} placeholder="Su-Th 09:00-18:00" />
              </Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Street">
                <Input value={settings.orgStreetAddress ?? ""} onChange={(e) => set("orgStreetAddress", e.target.value)} />
              </Field>
              <Field label="City">
                <Input value={settings.orgAddressLocality ?? ""} onChange={(e) => set("orgAddressLocality", e.target.value)} />
              </Field>
              <Field label="Region">
                <Input value={settings.orgAddressRegion ?? ""} onChange={(e) => set("orgAddressRegion", e.target.value)} />
              </Field>
              <Field label="Postal Code">
                <Input value={settings.orgPostalCode ?? ""} onChange={(e) => set("orgPostalCode", e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Country" hint="Two-letter code (e.g. SA, EG)">
                <Input value={settings.orgAddressCountry ?? ""} onChange={(e) => set("orgAddressCountry", e.target.value)} placeholder="SA" />
              </Field>
              <Field label="Latitude">
                <Input
                  type="number"
                  step="any"
                  value={settings.orgGeoLatitude ?? ""}
                  onChange={(e) => set("orgGeoLatitude", e.target.value ? parseFloat(e.target.value) : null)}
                />
              </Field>
              <Field label="Longitude">
                <Input
                  type="number"
                  step="any"
                  value={settings.orgGeoLongitude ?? ""}
                  onChange={(e) => set("orgGeoLongitude", e.target.value ? parseFloat(e.target.value) : null)}
                />
              </Field>
            </div>
            {tabFooter("business", F.business, "Business")}
          </Section>
        </TabsContent>

        {/* ─── Social Links ─── */}
        <TabsContent value="social" className="mt-4">
          <Section
            title="Social Links"
            description="Links to your accounts on each network (shown in the footer + Organization sameAs) and your X handles for share cards."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Twitter / X">
                <Input value={settings.twitterUrl ?? ""} onChange={(e) => set("twitterUrl", e.target.value)} placeholder="https://x.com/modonty" />
              </Field>
              <Field label="LinkedIn">
                <Input value={settings.linkedInUrl ?? ""} onChange={(e) => set("linkedInUrl", e.target.value)} placeholder="https://linkedin.com/company/modonty" />
              </Field>
              <Field label="Facebook">
                <Input value={settings.facebookUrl ?? ""} onChange={(e) => set("facebookUrl", e.target.value)} placeholder="https://facebook.com/modonty" />
              </Field>
              <Field label="Instagram">
                <Input value={settings.instagramUrl ?? ""} onChange={(e) => set("instagramUrl", e.target.value)} placeholder="https://instagram.com/modonty" />
              </Field>
              <Field label="YouTube">
                <Input value={settings.youtubeUrl ?? ""} onChange={(e) => set("youtubeUrl", e.target.value)} placeholder="https://youtube.com/@modonty" />
              </Field>
              <Field label="TikTok">
                <Input value={settings.tiktokUrl ?? ""} onChange={(e) => set("tiktokUrl", e.target.value)} placeholder="https://tiktok.com/@modonty" />
              </Field>
              <Field label="Pinterest">
                <Input value={settings.pinterestUrl ?? ""} onChange={(e) => set("pinterestUrl", e.target.value)} placeholder="https://pinterest.com/modonty" />
              </Field>
              <Field label="Snapchat">
                <Input value={settings.snapchatUrl ?? ""} onChange={(e) => set("snapchatUrl", e.target.value)} placeholder="https://snapchat.com/add/modonty" />
              </Field>
              <Field label="WhatsApp Channel">
                <Input value={settings.whatsappChannelUrl ?? ""} onChange={(e) => set("whatsappChannelUrl", e.target.value)} placeholder="https://whatsapp.com/channel/..." />
              </Field>
              <Field label="Telegram Channel">
                <Input value={settings.telegramChannelUrl ?? ""} onChange={(e) => set("telegramChannelUrl", e.target.value)} placeholder="https://t.me/modonty" />
              </Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
              <Field label="X Site Handle" hint="Used in the Twitter Card meta tag.">
                <Input value={settings.twitterSite ?? ""} onChange={(e) => set("twitterSite", e.target.value)} placeholder="@modonty" />
              </Field>
              <Field label="X Creator Handle" hint="Author/creator handle for Twitter Cards.">
                <Input value={settings.twitterCreator ?? ""} onChange={(e) => set("twitterCreator", e.target.value)} placeholder="@modonty" />
              </Field>
            </div>
            {tabFooter("social", F.social, "Social")}
          </Section>
        </TabsContent>

        {/* ─── Homepage Banner ─── */}
        <TabsContent value="banner" className="mt-4">
          <Section
            title="Homepage Banner"
            description="The welcome banner shown at the top of the homepage feed on modonty.com (visible on-page text)."
          >
            <Field label="Tagline">
              <Input
                value={settings.platformTagline ?? ""}
                onChange={(e) => set("platformTagline", e.target.value)}
                placeholder="مرحباً بك في مودونتي"
              />
            </Field>
            <Field label="Description">
              <Textarea
                value={settings.platformDescription ?? ""}
                onChange={(e) => set("platformDescription", e.target.value)}
                placeholder="منصة المحتوى العربي — اكتشف مقالات من خبراء ومتخصصين..."
                className="resize-none min-h-[72px]"
              />
            </Field>
            {tabFooter("banner", F.banner, "Banner")}
          </Section>
        </TabsContent>
      </Tabs>
    </TooltipProvider>
  );
}
