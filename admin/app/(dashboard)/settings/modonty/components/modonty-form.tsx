"use client";

import { useState, useTransition, useCallback } from "react";
import { Check, Loader2 } from "lucide-react";
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
import { SeoPreview } from "./seo-preview";

interface Props {
  initialSettings: AllSettings;
}

// Small grouping sub-header used inside the SEO tab to chunk fields by purpose.
function GroupHeader({ icon, title, note, tone }: { icon: string; title: string; note?: string; tone: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`grid h-6 w-6 place-items-center rounded-md text-xs ${tone}`}>{icon}</span>
      <h3 className="text-sm font-semibold text-foreground/80">{title}</h3>
      {note && <span className="text-[11px] text-muted-foreground">— {note}</span>}
    </div>
  );
}

// Fields owned by each tab — grouped BY PURPOSE, not by raw schema name.
// Each tab saves ONLY its own fields.
const F = {
  // How the homepage looks in Google + when shared (meta + OG/Twitter image) + the brand description used in structured data.
  search: ["modontySeoTitle", "modontySeoDescription", "brandDescription", "ogImageUrl", "logoUrl", "logoIconUrl", "altImage"],
  // The organization's factual details — contact, address, social profiles (Organization structured data).
  business: [
    "orgContactEmail", "orgContactTelephone",
    "orgStreetAddress", "orgAddressLocality", "orgAddressRegion", "orgPostalCode",
    "orgAddressCountry", "orgGeoLatitude", "orgGeoLongitude",
    "googleBusinessProfileUrl",
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
        <span className="text-[11px] text-muted-foreground/70">Updates automatically on Save</span>
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
            description="How the homepage appears in Google search results and when shared on social media."
          >
            {/* 2-column: field groups (left) + sticky live preview (right) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
              <div className="min-w-0 space-y-6">
            {/* Group 1 — Search appearance */}
            <div className="space-y-3">
              <GroupHeader icon="🔍" title="Search appearance" note="the snippet shown in Google" tone="bg-primary/10 text-primary" />
              <Field
                label="SEO Title"
                hint={SEO_HINTS.title}
                counter={settings.modontySeoTitle?.length ?? 0}
                counterMax={60}
                counterMin={30}
              >
                <Input
                  value={settings.modontySeoTitle ?? ""}
                  onChange={(e) => set("modontySeoTitle", e.target.value)}
                  placeholder="مدونتي | منصة المحتوى العربي"
                  maxLength={60}
                />
              </Field>
              <Field
                label="SEO Description"
                hint={SEO_HINTS.description}
                counter={settings.modontySeoDescription?.length ?? 0}
                counterMax={160}
                counterMin={120}
              >
                <Textarea
                  value={settings.modontySeoDescription ?? ""}
                  onChange={(e) => set("modontySeoDescription", e.target.value)}
                  placeholder="تصفح آلاف المقالات من أفضل الكتّاب..."
                  className="resize-none min-h-[72px]"
                  maxLength={160}
                />
              </Field>
            </div>

            {/* Group 2 — Brand identity */}
            <div className="space-y-3 border-t border-border pt-4">
              <GroupHeader
                icon="🏷️"
                title="Brand identity"
                note="Organization description — Knowledge Panel + every page"
                tone="bg-amber-500/15 text-amber-600"
              />
              <Field
                label="Brand Description"
                hint="Modonty's identity in one or two evergreen sentences. Different from the SEO Description above (which is only the homepage search snippet)."
                counter={settings.brandDescription?.length ?? 0}
                counterMax={250}
                counterMin={40}
              >
                <Textarea
                  value={settings.brandDescription ?? ""}
                  onChange={(e) => set("brandDescription", e.target.value)}
                  placeholder="منصة المحتوى العربي الرائدة التي تمنح كل نشاط صفحة موثّقة ومحتوى احترافي..."
                  className="resize-none min-h-[64px]"
                  maxLength={250}
                />
                <div dir="rtl" className="mt-2 flex items-start gap-2 rounded-md border-s-4 border-primary bg-primary/10 px-3 py-2 text-[12px] leading-relaxed text-foreground/90">
                  <span aria-hidden className="mt-0.5 text-sm leading-none">✍️</span>
                  <div className="space-y-1">
                    <p>
                      <span className="font-semibold text-primary">إيش تكتب؟</span> عرّف مدوّنتي بجملة وحدة واضحة — معلومة ثابتة، مش عرض مؤقّت.
                    </p>
                    <p>
                      <span className="font-semibold text-primary">وين تظهر؟</span> في البطاقة التعريفية بجوجل + كسطر الناشر تحت{" "}
                      <span className="font-semibold text-foreground">كل مقال وكل صفحة كاتب</span> — مش بس الصفحة الرئيسية.
                    </p>
                  </div>
                </div>
              </Field>
            </div>

            {/* Group 3 — Images & alt */}
            <div className="space-y-3 border-t border-border pt-4">
              <GroupHeader icon="🖼️" title="Images & alt text" tone="bg-emerald-500/15 text-emerald-600" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageField
                  label="Share Image"
                  value={settings.ogImageUrl ?? ""}
                  onChange={(v) => set("ogImageUrl", v)}
                  hint="1200×630 px — the Open Graph image shown when the page is shared on social media."
                  aspect="og"
                />
                <ImageField
                  label="Logo (Desktop)"
                  value={settings.logoUrl ?? ""}
                  onChange={(v) => set("logoUrl", v)}
                  hint="Wide wordmark — desktop navbar. Also your Organization logo in Google."
                  aspect="square"
                />
                <ImageField
                  label="Logo (Mobile Icon)"
                  value={settings.logoIconUrl ?? ""}
                  onChange={(v) => set("logoIconUrl", v)}
                  hint="Small square mark for the mobile navbar. Falls back to the desktop logo if empty."
                  aspect="square"
                />
              </div>
              <Field
                label="Image Alt Text"
                hint="Accessibility text for the logo and share image (also used as the image caption)."
                counter={settings.altImage?.length ?? 0}
                counterMax={125}
              >
                <Input
                  value={settings.altImage ?? ""}
                  onChange={(e) => set("altImage", e.target.value)}
                  placeholder="مدونتي — منصة المحتوى العربي"
                  maxLength={125}
                />
              </Field>
            </div>
              </div>

              {/* RIGHT: sticky live preview */}
              <div className="min-w-0">
                <div className="lg:sticky lg:top-4">
                  <SeoPreview
                    siteName={settings.siteName?.trim() || "مدوّنتي"}
                    siteUrl={settings.siteUrl?.trim() || "https://www.modonty.com"}
                    title={settings.modontySeoTitle?.trim() || settings.siteName?.trim() || "مدوّنتي"}
                    description={settings.modontySeoDescription?.trim() || settings.brandDescription?.trim() || ""}
                    imageUrl={settings.ogImageUrl?.trim() || settings.logoUrl?.trim() || undefined}
                    logoUrl={settings.logoUrl?.trim() || settings.ogImageUrl?.trim() || undefined}
                  />
                </div>
              </div>
            </div>

            {tabFooter("search", F.search, "SEO")}
          </Section>
        </TabsContent>

        {/* ─── Business Info ─── */}
        <TabsContent value="business" className="mt-4">
          <Section
            title="Business Info"
            description="Your organization's factual details — contact, address & location. Used in Google's structured data (Knowledge Panel)."
          >
            {/* Contact */}
            <div className="space-y-3">
              <GroupHeader icon="📞" title="Contact" note="Organization contactPoint" tone="bg-primary/10 text-primary" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Email">
                  <Input type="email" value={settings.orgContactEmail ?? ""} onChange={(e) => set("orgContactEmail", e.target.value)} placeholder="info@modonty.com" />
                </Field>
                <Field label="Phone">
                  <Input value={settings.orgContactTelephone ?? ""} onChange={(e) => set("orgContactTelephone", e.target.value)} placeholder="+966500000000" />
                </Field>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Hours: always 24/7 (online platform) — emitted automatically as round-the-clock structured data.
              </p>
            </div>

            {/* Address */}
            <div className="space-y-3 border-t border-border pt-4">
              <GroupHeader icon="📍" title="Address" tone="bg-amber-500/15 text-amber-600" />
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
                <Field label="Country" hint="Two-letter code (e.g. SA, EG)">
                  <Input value={settings.orgAddressCountry ?? ""} onChange={(e) => set("orgAddressCountry", e.target.value)} placeholder="SA" />
                </Field>
              </div>
            </div>

            {/* Location & Google */}
            <div className="space-y-3 border-t border-border pt-4">
              <GroupHeader icon="🗺️" title="Location & Google" note="map pin + verified business link" tone="bg-emerald-500/15 text-emerald-600" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Field
                label="Google Business Profile URL"
                hint="Paste the Google Maps / Business Profile link after the team creates & verifies it — feeds the Organization sameAs (proves you're a real, verified business)."
              >
                <Input
                  value={settings.googleBusinessProfileUrl ?? ""}
                  onChange={(e) => set("googleBusinessProfileUrl", e.target.value)}
                  placeholder="https://g.co/kgs/… أو https://maps.google.com/?cid=…"
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
            {/* Social profiles */}
            <div className="space-y-3">
              <GroupHeader icon="🔗" title="Social profiles" note="footer links + Organization sameAs" tone="bg-primary/10 text-primary" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            </div>

            {/* X / Twitter card handles */}
            <div className="space-y-3 border-t border-border pt-4">
              <GroupHeader icon="🐦" title="X / Twitter card handles" note="used in the Twitter Card meta" tone="bg-sky-500/15 text-sky-600" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="X Site Handle" hint="Used in the Twitter Card meta tag.">
                  <Input value={settings.twitterSite ?? ""} onChange={(e) => set("twitterSite", e.target.value)} placeholder="@modonty" />
                </Field>
                <Field label="X Creator Handle" hint="Author/creator handle for Twitter Cards.">
                  <Input value={settings.twitterCreator ?? ""} onChange={(e) => set("twitterCreator", e.target.value)} placeholder="@modonty" />
                </Field>
              </div>
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
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Fields */}
              <div className="space-y-4">
                <Field
                  label="Tagline"
                  counter={settings.platformTagline?.length ?? 0}
                  counterMax={80}
                  counterMin={10}
                >
                  <Input
                    value={settings.platformTagline ?? ""}
                    onChange={(e) => set("platformTagline", e.target.value)}
                    placeholder="مرحباً بك في مودونتي"
                  />
                </Field>
                <Field
                  label="Description"
                  counter={settings.platformDescription?.length ?? 0}
                  counterMax={200}
                  counterMin={30}
                >
                  <Textarea
                    value={settings.platformDescription ?? ""}
                    onChange={(e) => set("platformDescription", e.target.value)}
                    placeholder="منصة المحتوى العربي — اكتشف مقالات من خبراء ومتخصصين..."
                    className="resize-none min-h-[72px]"
                  />
                </Field>
              </div>

              {/* Live preview of the on-page banner */}
              <div className="min-w-0">
                <p className="mb-2 text-[11px] font-semibold text-muted-foreground">Preview on the homepage</p>
                <div
                  dir="rtl"
                  className="flex min-h-[150px] flex-col items-center justify-center rounded-lg border bg-gradient-to-br from-primary/10 via-card to-background p-6 text-center"
                >
                  <h3 className="text-xl font-bold text-foreground">
                    {settings.platformTagline?.trim() || "مرحباً بك في مدوّنتي"}
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    {settings.platformDescription?.trim() || "منصة المحتوى العربي — اكتشف مقالات من خبراء ومتخصصين."}
                  </p>
                </div>
              </div>
            </div>
            {tabFooter("banner", F.banner, "Banner")}
          </Section>
        </TabsContent>
      </Tabs>
    </TooltipProvider>
  );
}
