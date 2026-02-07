"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  getAllSettings,
  seedSiteOrgFromEnv,
  saveSEOSettings,
  saveSiteSettings,
  saveOrganizationSettings,
  saveTrackingSettings,
  saveSocialMediaSettings,
  saveMediaSettings,
  saveModontySettings,
  type AllSettings,
} from "../actions/settings-actions";
import { GenerateMJSection, type GeneratedSeoData } from "../../modonty/setting/components/sections/generate-mj-section";
import { LICENSE_OPTIONS } from "@/lib/constants/licenses";
import {
  Search,
  Globe,
  Building2,
  Activity,
  Share2,
  Image,
  Settings,
  ChevronDown,
  X,
  FileCode,
  Sparkles,
} from "lucide-react";

// Language / hreflang options (BCP‑47-compliant; Arabic + English only)
// Global inLanguage / hreflang should use full BCP‑47 tags like "ar-SA", "en-US".
const IN_LANGUAGE_OPTIONS = ["ar-SA", "en-US"] as const;

const TECHNICAL_HREFLANG_OPTIONS = [
  // Google‑documented special default + BCP‑47 Arabic / English tags
  "x-default",
  "ar-SA",
  "en-US",
] as const;

const TECHNICAL_OG_LOCALE_OPTIONS = [
  "ar_SA",
  "ar_AE",
  "ar_EG",
  "en_US",
  "en_GB",
  "en_SA",
  "fr_FR",
  "de_DE",
  "es_ES",
  "tr_TR",
  "zh_CN",
  "pt_BR",
  "ja_JP",
  "ko_KR",
  "hi_IN",
  "it_IT",
  "nl_NL",
  "pl_PL",
  "ru_RU",
] as const;

function parseInLanguage(value: string | null): string[] {
  if (!value || !value.trim()) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

function generatedSeoFromSettings(settings: AllSettings): GeneratedSeoData {
  const s = settings as unknown as Record<string, unknown>;
  return {
    homeMetaTags: s.homeMetaTags,
    jsonLdStructuredData: (s.jsonLdStructuredData as string | null) ?? null,
    jsonLdLastGenerated: (s.jsonLdLastGenerated as Date | string | null) ?? null,
    jsonLdValidationReport: s.jsonLdValidationReport,
    clientsPageMetaTags: s.clientsPageMetaTags,
    clientsPageJsonLdStructuredData: (s.clientsPageJsonLdStructuredData as string | null) ?? null,
    clientsPageJsonLdLastGenerated: (s.clientsPageJsonLdLastGenerated as Date | string | null) ?? null,
    clientsPageJsonLdValidationReport: s.clientsPageJsonLdValidationReport,
    categoriesPageMetaTags: s.categoriesPageMetaTags,
    categoriesPageJsonLdStructuredData: (s.categoriesPageJsonLdStructuredData as string | null) ?? null,
    categoriesPageJsonLdLastGenerated: (s.categoriesPageJsonLdLastGenerated as Date | string | null) ?? null,
    categoriesPageJsonLdValidationReport: s.categoriesPageJsonLdValidationReport,
    trendingPageMetaTags: s.trendingPageMetaTags,
    trendingPageJsonLdStructuredData: (s.trendingPageJsonLdStructuredData as string | null) ?? null,
    trendingPageJsonLdLastGenerated: (s.trendingPageJsonLdLastGenerated as Date | string | null) ?? null,
    trendingPageJsonLdValidationReport: s.trendingPageJsonLdValidationReport,
  };
}

function InLanguageMultiSelect({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = parseInLanguage(value);

  const handleToggle = (code: string, checked: boolean) => {
    const next = checked
      ? [...selected, code]
      : selected.filter((c) => c !== code);
    onChange(next.length > 0 ? next.join(", ") : null);
  };

  const handleRemove = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    const next = selected.filter((c) => c !== code);
    onChange(next.length > 0 ? next.join(", ") : null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10"
        >
          <div className="flex flex-1 flex-wrap gap-1 items-center">
            {selected.length > 0 ? (
              selected.map((code) => (
                <Badge
                  key={code}
                  variant="secondary"
                  className="gap-1 pr-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {code}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleRemove(e, code)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleRemove(e as unknown as React.MouseEvent, code);
                      }
                    }}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 cursor-pointer inline-flex items-center justify-center"
                    aria-label={`Remove ${code}`}
                  >
                    <X className="h-3 w-3" />
                  </span>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">Select languages</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="max-h-[280px] overflow-y-auto p-2">
          <div className="space-y-1">
            {IN_LANGUAGE_OPTIONS.map((code) => {
              const isSelected = selected.includes(code);
              return (
                <div
                  key={code}
                  className="flex items-center gap-2 rounded-sm p-2 hover:bg-accent cursor-pointer"
                  onClick={() => handleToggle(code, !isSelected)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleToggle(code, !!checked)}
                    id={`inLanguage-${code}`}
                  />
                  <Label htmlFor={`inLanguage-${code}`} className="flex-1 cursor-pointer font-normal">
                    {code}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const VALID_TABS = ["seo", "site", "organization", "tracking", "social", "media", "technical", "modonty-meta-jsonld", "generate-mj"] as const;

export function SettingsForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const initialTab = tabFromUrl && VALID_TABS.includes(tabFromUrl as (typeof VALID_TABS)[number]) ? tabFromUrl : "seo";
  const [settings, setSettings] = useState<AllSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [isSeedingFromEnv, setIsSeedingFromEnv] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getAllSettings();
        setSettings(data);
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  const handleSave = async (
    section: "SEO" | "Site" | "Organization" | "Tracking" | "Social Media" | "Media" | "Technical" | "Modonty META/JSON-LD",
  ) => {
    if (!settings) return;

    setIsSaving(section);
    try {
      let result: { success: boolean; error?: string };
      switch (section) {
        case "SEO":
          result = await saveSEOSettings(settings);
          break;
        case "Site":
          result = await saveSiteSettings(settings);
          break;
        case "Organization":
          result = await saveOrganizationSettings(settings);
          break;
        case "Tracking":
          result = await saveTrackingSettings(settings);
          break;
        case "Social Media":
          result = await saveSocialMediaSettings(settings);
          break;
        case "Media":
          result = await saveMediaSettings(settings);
          break;
        case "Technical":
          result = await saveSiteSettings(settings);
          break;
        case "Modonty META/JSON-LD":
          result = await saveModontySettings(settings);
          break;
        default:
          result = { success: false, error: "Unknown section" };
      }
      if (result.success) {
        toast({
          title: "Settings saved",
          description: `${section} settings have been updated successfully.`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  if (!settings) {
    return <div className="text-center py-8">Failed to load settings</div>;
  }

  return (
    <Tabs defaultValue={initialTab} key={initialTab} orientation="vertical" className="flex flex-row-reverse gap-6">
      {/* Right column: Vertical tabs navigation (sticky) */}
      <TabsList className="flex flex-col h-auto w-52 min-w-52 gap-1.5 bg-muted/50 p-2 rounded-lg shrink-0 sticky top-4 self-start">
        <TabsTrigger value="seo" className="w-full min-w-0 justify-start gap-2 px-3 py-2 whitespace-normal text-left">
          <Search className="h-4 w-4 shrink-0" />
          SEO Settings
        </TabsTrigger>
        <TabsTrigger value="site" className="w-full min-w-0 justify-start gap-2 px-3 py-2 whitespace-normal text-left">
          <Globe className="h-4 w-4 shrink-0" />
          Site
        </TabsTrigger>
        <TabsTrigger value="organization" className="w-full min-w-0 justify-start gap-2 px-3 py-2 whitespace-normal text-left">
          <Building2 className="h-4 w-4 shrink-0" />
          Organization
        </TabsTrigger>
        <TabsTrigger value="tracking" className="w-full min-w-0 justify-start gap-2 px-3 py-2 whitespace-normal text-left">
          <Activity className="h-4 w-4 shrink-0" />
          Tracking
        </TabsTrigger>
        <TabsTrigger value="social" className="w-full min-w-0 justify-start gap-2 px-3 py-2 whitespace-normal text-left">
          <Share2 className="h-4 w-4 shrink-0" />
          Social Media
        </TabsTrigger>
        <TabsTrigger value="media" className="w-full min-w-0 justify-start gap-2 px-3 py-2 whitespace-normal text-left">
          <Image className="h-4 w-4 shrink-0" />
          Media
        </TabsTrigger>
        <TabsTrigger value="technical" className="w-full min-w-0 justify-start gap-2 px-3 py-2 whitespace-normal text-left">
          <Settings className="h-4 w-4 shrink-0" />
          Technical
        </TabsTrigger>
        <TabsTrigger value="modonty-meta-jsonld" className="w-full min-w-0 justify-start gap-2 px-3 py-2 whitespace-normal text-left">
          <FileCode className="h-4 w-4 shrink-0" />
          META/JSON-LD Defaults
        </TabsTrigger>
        <TabsTrigger value="generate-mj" className="w-full min-w-0 justify-start gap-2 px-3 py-2 whitespace-normal text-left">
          <Sparkles className="h-4 w-4 shrink-0" />
          Generate M/J
        </TabsTrigger>
      </TabsList>

      {/* Left column: Tab content */}
      <div className="flex-1">
        {/* SEO Settings Tab */}
        <TabsContent value="seo" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Configure SEO field length limits for titles, descriptions, and social cards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* SEO Title Settings */}
              <div>
                <h4 className="text-sm font-medium mb-2">SEO Title</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Google recommends 50-60 characters (optimal), but can display up to ~70 characters.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="seoTitleMin">Minimum Length</Label>
                    <Input
                      id="seoTitleMin"
                      type="number"
                      min="1"
                      value={settings.seoTitleMin}
                      onChange={(e) =>
                        setSettings({ ...settings, seoTitleMin: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seoTitleMax">Maximum Length</Label>
                    <Input
                      id="seoTitleMax"
                      type="number"
                      min="1"
                      value={settings.seoTitleMax}
                      onChange={(e) =>
                        setSettings({ ...settings, seoTitleMax: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2 flex flex-col justify-end">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="seoTitleRestrict"
                        checked={settings.seoTitleRestrict}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, seoTitleRestrict: checked === true })
                        }
                      />
                      <Label htmlFor="seoTitleRestrict" className="cursor-pointer text-sm">
                        Restrict (hard block)
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* SEO Description Settings */}
              <div>
                <h4 className="text-sm font-medium mb-2">SEO Description</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Google recommends 150-160 characters (optimal), but can display up to ~320 characters.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="seoDescriptionMin">Minimum Length</Label>
                    <Input
                      id="seoDescriptionMin"
                      type="number"
                      min="1"
                      value={settings.seoDescriptionMin}
                      onChange={(e) =>
                        setSettings({ ...settings, seoDescriptionMin: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seoDescriptionMax">Maximum Length</Label>
                    <Input
                      id="seoDescriptionMax"
                      type="number"
                      min="1"
                      value={settings.seoDescriptionMax}
                      onChange={(e) =>
                        setSettings({ ...settings, seoDescriptionMax: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2 flex flex-col justify-end">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="seoDescriptionRestrict"
                        checked={settings.seoDescriptionRestrict}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, seoDescriptionRestrict: checked === true })
                        }
                      />
                      <Label htmlFor="seoDescriptionRestrict" className="cursor-pointer text-sm">
                        Restrict (hard block)
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Twitter Settings */}
              <div>
                <h4 className="text-sm font-medium mb-2">Twitter/X Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twitterTitleMax">Title Max Length</Label>
                    <Input
                      id="twitterTitleMax"
                      type="number"
                      min="1"
                      value={settings.twitterTitleMax}
                      onChange={(e) =>
                        setSettings({ ...settings, twitterTitleMax: parseInt(e.target.value) || 0 })
                      }
                    />
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox
                        id="twitterTitleRestrict"
                        checked={settings.twitterTitleRestrict}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, twitterTitleRestrict: checked === true })
                        }
                      />
                      <Label htmlFor="twitterTitleRestrict" className="cursor-pointer text-xs">
                        Restrict
                      </Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitterDescriptionMax">Description Max Length</Label>
                    <Input
                      id="twitterDescriptionMax"
                      type="number"
                      min="1"
                      value={settings.twitterDescriptionMax}
                      onChange={(e) =>
                        setSettings({ ...settings, twitterDescriptionMax: parseInt(e.target.value) || 0 })
                      }
                    />
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox
                        id="twitterDescriptionRestrict"
                        checked={settings.twitterDescriptionRestrict}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, twitterDescriptionRestrict: checked === true })
                        }
                      />
                      <Label htmlFor="twitterDescriptionRestrict" className="cursor-pointer text-xs">
                        Restrict
                      </Label>
                    </div>
                  </div>
                  <div />
                </div>
              </div>

              <Separator />

              {/* OG Settings */}
              <div>
                <h4 className="text-sm font-medium mb-2">Open Graph Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ogTitleMax">Title Max Length</Label>
                    <Input
                      id="ogTitleMax"
                      type="number"
                      min="1"
                      value={settings.ogTitleMax}
                      onChange={(e) =>
                        setSettings({ ...settings, ogTitleMax: parseInt(e.target.value) || 0 })
                      }
                    />
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox
                        id="ogTitleRestrict"
                        checked={settings.ogTitleRestrict}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, ogTitleRestrict: checked === true })
                        }
                      />
                      <Label htmlFor="ogTitleRestrict" className="cursor-pointer text-xs">
                        Restrict
                      </Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ogDescriptionMax">Description Max Length</Label>
                    <Input
                      id="ogDescriptionMax"
                      type="number"
                      min="1"
                      value={settings.ogDescriptionMax}
                      onChange={(e) =>
                        setSettings({ ...settings, ogDescriptionMax: parseInt(e.target.value) || 0 })
                      }
                    />
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox
                        id="ogDescriptionRestrict"
                        checked={settings.ogDescriptionRestrict}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, ogDescriptionRestrict: checked === true })
                        }
                      />
                      <Label htmlFor="ogDescriptionRestrict" className="cursor-pointer text-xs">
                        Restrict
                      </Label>
                    </div>
                  </div>
                  <div />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSave("SEO")} disabled={isSaving === "SEO"}>
                  {isSaving === "SEO" ? "Saving..." : "Save SEO Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Site Tab */}
        <TabsContent value="site" className="mt-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Site Settings</CardTitle>
                  <CardDescription>
                    Site URL, name, brand, author, and Twitter meta configuration
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSeedingFromEnv}
                  onClick={async () => {
                    setIsSeedingFromEnv(true);
                    try {
                      const result = await seedSiteOrgFromEnv();
                      if (result.success) {
                        const data = await getAllSettings();
                        setSettings(data);
                        toast({ title: "Loaded from .env", description: "Site & organization fields updated from .env." });
                      } else {
                        toast({ title: "Error", description: result.error, variant: "destructive" });
                      }
                    } finally {
                      setIsSeedingFromEnv(false);
                    }
                  }}
                >
                  {isSeedingFromEnv ? "Loading..." : "Load from .env"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    type="url"
                    placeholder="https://modonty.com"
                    value={settings.siteUrl || ""}
                    onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    type="text"
                    placeholder="Modonty"
                    value={settings.siteName || ""}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value || null })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="brandDescription">Brand Description</Label>
                  <Input
                    id="brandDescription"
                    type="text"
                    placeholder="Organization/WebSite description"
                    value={settings.brandDescription || ""}
                    onChange={(e) => setSettings({ ...settings, brandDescription: e.target.value || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteAuthor">Site Author</Label>
                  <Input
                    id="siteAuthor"
                    type="text"
                    placeholder="Default author"
                    value={settings.siteAuthor || ""}
                    onChange={(e) => setSettings({ ...settings, siteAuthor: e.target.value || null })}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-3">Twitter / X (meta)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twitterSite">twitter:site</Label>
                    <Input
                      id="twitterSite"
                      type="text"
                      placeholder="@modonty"
                      value={settings.twitterSite || ""}
                      onChange={(e) => setSettings({ ...settings, twitterSite: e.target.value || null })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitterCreator">twitter:creator</Label>
                    <Input
                      id="twitterCreator"
                      type="text"
                      placeholder="@modonty"
                      value={settings.twitterCreator || ""}
                      onChange={(e) => setSettings({ ...settings, twitterCreator: e.target.value || null })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitterSiteId">twitter:site:id</Label>
                    <Input
                      id="twitterSiteId"
                      type="text"
                      placeholder="123456789"
                      value={settings.twitterSiteId || ""}
                      onChange={(e) => setSettings({ ...settings, twitterSiteId: e.target.value || null })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitterCreatorId">twitter:creator:id</Label>
                    <Input
                      id="twitterCreatorId"
                      type="text"
                      placeholder="987654321"
                      value={settings.twitterCreatorId || ""}
                      onChange={(e) => setSettings({ ...settings, twitterCreatorId: e.target.value || null })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSave("Site")} disabled={isSaving === "Site"}>
                  {isSaving === "Site" ? "Saving..." : "Save Site Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>
                Contact point, postal address, geo coordinates, and JSON-LD organization data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-3">ContactPoint</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgContactType">Contact Type</Label>
                    <Input
                      id="orgContactType"
                      type="text"
                      placeholder="customer service"
                      value={settings.orgContactType || ""}
                      onChange={(e) => setSettings({ ...settings, orgContactType: e.target.value || null })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgContactEmail">Email</Label>
                    <Input
                      id="orgContactEmail"
                      type="email"
                      placeholder="support@modonty.com"
                      value={settings.orgContactEmail || ""}
                      onChange={(e) => setSettings({ ...settings, orgContactEmail: e.target.value || null })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgContactTelephone">Telephone</Label>
                    <Input
                      id="orgContactTelephone"
                      type="text"
                      placeholder="+966500000001"
                      value={settings.orgContactTelephone || ""}
                      onChange={(e) => setSettings({ ...settings, orgContactTelephone: e.target.value || null })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgContactAvailableLanguage">Available Language</Label>
                    <Input
                      id="orgContactAvailableLanguage"
                      type="text"
                      placeholder="ar (falls back to inLanguage)"
                      value={settings.orgContactAvailableLanguage || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, orgContactAvailableLanguage: e.target.value || null })
                      }
                    />
                    <p className="text-xs text-muted-foreground">ContactPoint.availableLanguage</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgContactOption">Contact Option</Label>
                    <Input
                      id="orgContactOption"
                      type="text"
                      placeholder="toll-free, HearingImpairedSupported"
                      value={settings.orgContactOption || ""}
                      onChange={(e) => setSettings({ ...settings, orgContactOption: e.target.value || null })}
                    />
                    <p className="text-xs text-muted-foreground">ContactPoint.contactOption</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgContactHoursAvailable">Hours Available</Label>
                    <Input
                      id="orgContactHoursAvailable"
                      type="text"
                      placeholder="Mo-Fr 09:00-17:00"
                      value={settings.orgContactHoursAvailable || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, orgContactHoursAvailable: e.target.value || null })
                      }
                    />
                    <p className="text-xs text-muted-foreground">ContactPoint.hoursAvailable</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgAreaServed">Area Served</Label>
                    <Input
                      id="orgAreaServed"
                      type="text"
                      placeholder="SA, AE, KW, BH, OM, QA, EG"
                      value={settings.orgAreaServed || ""}
                      onChange={(e) => setSettings({ ...settings, orgAreaServed: e.target.value || null })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-3">PostalAddress</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="orgStreetAddress">Street Address</Label>
                    <Input
                      id="orgStreetAddress"
                      type="text"
                      placeholder="123 Example St"
                      value={settings.orgStreetAddress || ""}
                      onChange={(e) => setSettings({ ...settings, orgStreetAddress: e.target.value || null })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgAddressLocality">Locality</Label>
                    <Input
                      id="orgAddressLocality"
                      type="text"
                      placeholder="Jeddah"
                      value={settings.orgAddressLocality || ""}
                      onChange={(e) => setSettings({ ...settings, orgAddressLocality: e.target.value || null })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgAddressRegion">Region</Label>
                    <Input
                      id="orgAddressRegion"
                      type="text"
                      placeholder="Makkah"
                      value={settings.orgAddressRegion || ""}
                      onChange={(e) => setSettings({ ...settings, orgAddressRegion: e.target.value || null })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgAddressCountry">Country</Label>
                    <Input
                      id="orgAddressCountry"
                      type="text"
                      placeholder="SA"
                      value={settings.orgAddressCountry || ""}
                      onChange={(e) => setSettings({ ...settings, orgAddressCountry: e.target.value || null })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgPostalCode">Postal Code</Label>
                    <Input
                      id="orgPostalCode"
                      type="text"
                      placeholder="123456"
                      value={settings.orgPostalCode || ""}
                      onChange={(e) => setSettings({ ...settings, orgPostalCode: e.target.value || null })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-3">GeoCoordinates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgGeoLatitude">Latitude</Label>
                    <Input
                      id="orgGeoLatitude"
                      type="number"
                      step="any"
                      placeholder="21.5433"
                      value={settings.orgGeoLatitude ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSettings({ ...settings, orgGeoLatitude: v === "" ? null : Number(v) });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgGeoLongitude">Longitude</Label>
                    <Input
                      id="orgGeoLongitude"
                      type="number"
                      step="any"
                      placeholder="39.1728"
                      value={settings.orgGeoLongitude ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSettings({ ...settings, orgGeoLongitude: v === "" ? null : Number(v) });
                      }}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgSearchUrlTemplate">WebSite Search URL Template</Label>
                  <Input
                    id="orgSearchUrlTemplate"
                    type="url"
                    placeholder="https://modonty.com/search?q={search_term_string}"
                    value={settings.orgSearchUrlTemplate || ""}
                    onChange={(e) => setSettings({ ...settings, orgSearchUrlTemplate: e.target.value || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgLogoUrl">Organization Logo URL</Label>
                  <Input
                    id="orgLogoUrl"
                    type="url"
                    placeholder="https://res.cloudinary.com/your-cloud/image/upload/v123/org-logo.png"
                    value={settings.orgLogoUrl || ""}
                    onChange={(e) => setSettings({ ...settings, orgLogoUrl: e.target.value || null })}
                  />
                  <p className="text-xs text-muted-foreground">
                    URL for JSON-LD organization logo (e.g. Cloudinary)
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSave("Organization")} disabled={isSaving === "Organization"}>
                  {isSaving === "Organization" ? "Saving..." : "Save Organization Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tracking Tab (GTM + Hotjar) */}
        <TabsContent value="tracking" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Tracking Settings</CardTitle>
              <CardDescription>
                Configure Google Tag Manager and Hotjar for analytics and tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Google Tag Manager (GTM)</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gtmContainerId">GTM Container ID</Label>
                    <Input
                      id="gtmContainerId"
                      type="text"
                      placeholder="GTM-XXXXXXX"
                      value={settings.gtmContainerId || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, gtmContainerId: e.target.value || null })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter your Google Tag Manager container ID (format: GTM-XXXXXXX)
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="gtmEnabled"
                      checked={settings.gtmEnabled}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, gtmEnabled: checked === true })
                      }
                    />
                    <Label htmlFor="gtmEnabled" className="cursor-pointer">
                      Enable GTM - When enabled, GTM script will be loaded on all pages
                    </Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-3">Hotjar</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hotjarSiteId">Hotjar Site ID</Label>
                    <Input
                      id="hotjarSiteId"
                      type="text"
                      placeholder="1234567"
                      value={settings.hotjarSiteId || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, hotjarSiteId: e.target.value || null })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter your Hotjar site ID (numeric ID from your Hotjar dashboard)
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hotjarEnabled"
                      checked={settings.hotjarEnabled}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, hotjarEnabled: checked === true })
                      }
                    />
                    <Label htmlFor="hotjarEnabled" className="cursor-pointer">
                      Enable Hotjar - When enabled, Hotjar script will be loaded on all pages
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSave("Tracking")} disabled={isSaving === "Tracking"}>
                  {isSaving === "Tracking" ? "Saving..." : "Save Tracking Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>
                Configure platform-wide social media profile links
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebookUrl">Facebook URL</Label>
                  <Input
                    id="facebookUrl"
                    type="url"
                    placeholder="https://facebook.com/yourpage"
                    value={settings.facebookUrl || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, facebookUrl: e.target.value || null })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitterUrl">Twitter/X URL</Label>
                  <Input
                    id="twitterUrl"
                    type="url"
                    placeholder="https://twitter.com/yourhandle"
                    value={settings.twitterUrl || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, twitterUrl: e.target.value || null })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedInUrl">LinkedIn URL</Label>
                  <Input
                    id="linkedInUrl"
                    type="url"
                    placeholder="https://linkedin.com/company/yourcompany"
                    value={settings.linkedInUrl || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, linkedInUrl: e.target.value || null })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagramUrl">Instagram URL</Label>
                  <Input
                    id="instagramUrl"
                    type="url"
                    placeholder="https://instagram.com/yourhandle"
                    value={settings.instagramUrl || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, instagramUrl: e.target.value || null })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtubeUrl">YouTube URL</Label>
                  <Input
                    id="youtubeUrl"
                    type="url"
                    placeholder="https://youtube.com/@yourchannel"
                    value={settings.youtubeUrl || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, youtubeUrl: e.target.value || null })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktokUrl">TikTok URL</Label>
                  <Input
                    id="tiktokUrl"
                    type="url"
                    placeholder="https://tiktok.com/@yourhandle"
                    value={settings.tiktokUrl || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, tiktokUrl: e.target.value || null })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pinterestUrl">Pinterest URL</Label>
                  <Input
                    id="pinterestUrl"
                    type="url"
                    placeholder="https://pinterest.com/yourprofile"
                    value={settings.pinterestUrl || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, pinterestUrl: e.target.value || null })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="snapchatUrl">Snapchat URL</Label>
                  <Input
                    id="snapchatUrl"
                    type="url"
                    placeholder="https://snapchat.com/add/yourhandle"
                    value={settings.snapchatUrl || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, snapchatUrl: e.target.value || null })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSave("Social Media")} disabled={isSaving === "Social Media"}>
                  {isSaving === "Social Media" ? "Saving..." : "Save Social Media Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Media Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL (Cloudinary)</Label>
                  <Textarea
                    id="logoUrl"
                    placeholder="https://res.cloudinary.com/your-cloud/image/upload/v123/logo.png"
                    value={settings.logoUrl || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, logoUrl: e.target.value?.trim() || null })
                    }
                    className="font-mono text-xs min-h-[4.5rem] resize-y"
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide your Cloudinary URL for the site logo
                  </p>
                  {settings.logoUrl && (
                    <div className="mt-3 rounded-lg border bg-muted/30 p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Preview</p>
                      <div className="relative aspect-square w-24 overflow-hidden rounded-md border bg-background flex items-center justify-center">
                        <NextImage
                          src={settings.logoUrl}
                          alt="Logo preview"
                          fill
                          className="object-contain p-1"
                          sizes="96px"
                          unoptimized={settings.logoUrl?.toLowerCase().endsWith(".svg")}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ogImageUrl">Default OG Image URL (Cloudinary)</Label>
                  <Textarea
                    id="ogImageUrl"
                    placeholder="https://res.cloudinary.com/your-cloud/image/upload/v123/og-image.png"
                    value={settings.ogImageUrl || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, ogImageUrl: e.target.value?.trim() || null })
                    }
                    className="font-mono text-xs min-h-[4.5rem] resize-y"
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    Default Open Graph image for social sharing (fallback when page has no image)
                  </p>
                  {settings.ogImageUrl && (
                    <div className="mt-3 rounded-lg border bg-muted/30 p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Preview (1200×630)</p>
                      <div className="relative w-full aspect-[1200/630] overflow-hidden rounded-md border bg-background">
                        <NextImage
                          src={settings.ogImageUrl}
                          alt="OG image preview"
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          unoptimized={settings.ogImageUrl?.toLowerCase().endsWith(".svg")}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        OG images are typically 1200×630px for best social display.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="altImage">Default image alt text</Label>
                  <Input
                    id="altImage"
                    placeholder="e.g. Site logo, Default share image"
                    value={settings.altImage ?? ""}
                    onChange={(e) =>
                      setSettings({ ...settings, altImage: e.target.value?.trim() || null })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Default alt text for logo and OG image when none is set per page
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSave("Media")} disabled={isSaving === "Media"}>
                  {isSaving === "Media" ? "Saving..." : "Save Media Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technical Tab */}
        <TabsContent value="technical" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Technical Settings</CardTitle>
              <CardDescription>Site-wide and article fallbacks for meta, OG, sitemap, and document.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1.5 mb-2">Global (site default)</h3>
                <p className="text-xs text-muted-foreground mb-2">Site-wide; used for clients when unset.</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Document</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <Label>Charset</Label>
                    <Select
                      value={settings.defaultCharset ?? "__none__"}
                      onValueChange={(v) =>
                        setSettings({ ...settings, defaultCharset: v === "__none__" ? null : v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Not set" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not set</SelectItem>
                        <SelectItem value="UTF-8">UTF-8 (recommended)</SelectItem>
                        <SelectItem value="utf-8">utf-8</SelectItem>
                        <SelectItem value="ISO-8859-1">ISO-8859-1 (Latin-1)</SelectItem>
                        <SelectItem value="ISO-8859-15">ISO-8859-15</SelectItem>
                        <SelectItem value="Windows-1252">Windows-1252</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="defaultPathname">Default pathname</Label>
                    <Input
                      id="defaultPathname"
                      type="text"
                      placeholder="/"
                      value={settings.defaultPathname || ""}
                      onChange={(e) => setSettings({ ...settings, defaultPathname: e.target.value || null })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="defaultTruncationSuffix">Truncation suffix</Label>
                    <Input
                      id="defaultTruncationSuffix"
                      type="text"
                      placeholder="..."
                      value={settings.defaultTruncationSuffix ?? ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          defaultTruncationSuffix: e.target.value === "" ? null : e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="defaultReferrerPolicy">Referrer policy</Label>
                    <Select
                      value={settings.defaultReferrerPolicy ?? "__none__"}
                      onValueChange={(v) =>
                        setSettings({ ...settings, defaultReferrerPolicy: v === "__none__" ? null : v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Not set" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not set</SelectItem>
                        <SelectItem value="no-referrer">no-referrer</SelectItem>
                        <SelectItem value="no-referrer-when-downgrade">no-referrer-when-downgrade</SelectItem>
                        <SelectItem value="origin">origin</SelectItem>
                        <SelectItem value="origin-when-cross-origin">origin-when-cross-origin</SelectItem>
                        <SelectItem value="same-origin">same-origin</SelectItem>
                        <SelectItem value="strict-origin">strict-origin</SelectItem>
                        <SelectItem value="strict-origin-when-cross-origin">strict-origin-when-cross-origin</SelectItem>
                        <SelectItem value="unsafe-url">unsafe-url</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="defaultNotranslate">No translate (Arabic)</Label>
                    <Select
                      value={settings.defaultNotranslate === true ? "true" : settings.defaultNotranslate === false ? "false" : "__none__"}
                      onValueChange={(v) =>
                        setSettings({ ...settings, defaultNotranslate: v === "__none__" ? null : v === "true" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Auto (Arabic = true)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Auto (Arabic = true)</SelectItem>
                        <SelectItem value="true">Yes (notranslate)</SelectItem>
                        <SelectItem value="false">No (allow translate)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator className="my-3" />

              <div>
                <h4 className="text-sm font-medium mb-2">Meta / Crawling</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Meta robots</Label>
                    <Select
                      value={settings.defaultMetaRobots ?? "__none__"}
                      onValueChange={(v) =>
                        setSettings({ ...settings, defaultMetaRobots: v === "__none__" ? null : v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Not set" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not set</SelectItem>
                        <SelectItem value="index, follow">index, follow</SelectItem>
                        <SelectItem value="noindex, follow">noindex, follow</SelectItem>
                        <SelectItem value="index, nofollow">index, nofollow</SelectItem>
                        <SelectItem value="noindex, nofollow">noindex, nofollow</SelectItem>
                        <SelectItem value="all">all</SelectItem>
                        <SelectItem value="none">none</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Googlebot</Label>
                    <Select
                      value={settings.defaultGooglebot ?? "__none__"}
                      onValueChange={(v) =>
                        setSettings({ ...settings, defaultGooglebot: v === "__none__" ? null : v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Not set" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not set</SelectItem>
                        <SelectItem value="index, follow">index, follow</SelectItem>
                        <SelectItem value="noindex, follow">noindex, follow</SelectItem>
                        <SelectItem value="index, nofollow">index, nofollow</SelectItem>
                        <SelectItem value="noindex, nofollow">noindex, nofollow</SelectItem>
                        <SelectItem value="all">all</SelectItem>
                        <SelectItem value="none">none</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator className="my-3" />

              <div>
                <h4 className="text-sm font-medium mb-2">Language</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5 min-w-0">
                    <Label>Language (hreflang)</Label>
                    <InLanguageMultiSelect
                      value={settings.inLanguage}
                      onChange={(value) => setSettings({ ...settings, inLanguage: value })}
                    />
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <Label>Open Graph locale</Label>
                    <Select
                      value={
                        settings.defaultOgLocale &&
                        (TECHNICAL_OG_LOCALE_OPTIONS as readonly string[]).includes(settings.defaultOgLocale)
                          ? settings.defaultOgLocale
                          : "__none__"
                      }
                      onValueChange={(v) =>
                        setSettings({ ...settings, defaultOgLocale: v === "__none__" ? null : v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Not set" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not set</SelectItem>
                        {TECHNICAL_OG_LOCALE_OPTIONS.map((locale) => (
                          <SelectItem key={locale} value={locale}>
                            {locale}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <Label>Hreflang default</Label>
                    <Select
                      value={
                        settings.defaultHreflang &&
                        (TECHNICAL_HREFLANG_OPTIONS as readonly string[]).includes(settings.defaultHreflang)
                          ? settings.defaultHreflang
                          : "__none__"
                      }
                      onValueChange={(v) =>
                        setSettings({ ...settings, defaultHreflang: v === "__none__" ? null : v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Not set" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not set</SelectItem>
                        {TECHNICAL_HREFLANG_OPTIONS.map((code) => (
                          <SelectItem key={code} value={code}>
                            {code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator className="my-3" />

              <div>
                <h4 className="text-sm font-medium mb-2">Open Graph & Twitter / X</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-[1fr_1fr_1fr_1fr_1fr_2fr] gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <Label>OG type</Label>
                    <Select
                      value={settings.defaultOgType ?? "__none__"}
                      onValueChange={(v) =>
                        setSettings({ ...settings, defaultOgType: v === "__none__" ? null : v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Not set" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not set</SelectItem>
                        <SelectItem value="website">website</SelectItem>
                        <SelectItem value="article">article</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <Label>OG determiner</Label>
                    <Select
                      value={
                        settings.defaultOgDeterminer === ""
                          ? "__blank__"
                          : (settings.defaultOgDeterminer ?? "__none__")
                      }
                      onValueChange={(v) =>
                        setSettings({
                          ...settings,
                          defaultOgDeterminer: v === "__none__" ? null : v === "__blank__" ? "" : v,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Not set" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not set</SelectItem>
                        <SelectItem value="auto">auto</SelectItem>
                        <SelectItem value="a">a</SelectItem>
                        <SelectItem value="an">an</SelectItem>
                        <SelectItem value="the">the</SelectItem>
                        <SelectItem value="__blank__">(blank)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 min-w-0 md:min-w-[8rem]">
                    <Label>Image type</Label>
                    <Select
                      value={settings.defaultOgImageType ?? "__none__"}
                      onValueChange={(v) =>
                        setSettings({ ...settings, defaultOgImageType: v === "__none__" ? null : v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Not set" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not set</SelectItem>
                        <SelectItem value="image/jpeg">image/jpeg</SelectItem>
                        <SelectItem value="image/png">image/png</SelectItem>
                        <SelectItem value="image/webp">image/webp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 min-w-0 max-w-20">
                    <Label htmlFor="defaultOgImageWidth">Width</Label>
                    <Input
                      id="defaultOgImageWidth"
                      type="number"
                      min={1}
                      step={1}
                      placeholder="1200"
                      value={settings.defaultOgImageWidth ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "") {
                          setSettings({ ...settings, defaultOgImageWidth: null });
                          return;
                        }
                        const n = parseInt(v, 10);
                        const clamped = Number.isFinite(n) && n >= 1 ? Math.min(4096, n) : null;
                        setSettings({ ...settings, defaultOgImageWidth: clamped });
                      }}
                    />
                  </div>
                  <div className="space-y-1.5 min-w-0 max-w-24">
                    <Label htmlFor="defaultOgImageHeight">Height</Label>
                    <Input
                      id="defaultOgImageHeight"
                      type="number"
                      min={1}
                      step={1}
                      placeholder="630"
                      value={settings.defaultOgImageHeight ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "") {
                          setSettings({ ...settings, defaultOgImageHeight: null });
                          return;
                        }
                        const n = parseInt(v, 10);
                        const clamped = Number.isFinite(n) && n >= 1 ? Math.min(4096, n) : null;
                        setSettings({ ...settings, defaultOgImageHeight: clamped });
                      }}
                    />
                  </div>
                  <div className="space-y-1.5 min-w-0 md:min-w-[11rem]">
                    <Label>Twitter card</Label>
                    <Select
                      value={settings.defaultTwitterCard ?? "__none__"}
                      onValueChange={(v) =>
                        setSettings({ ...settings, defaultTwitterCard: v === "__none__" ? null : v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Not set" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not set</SelectItem>
                        <SelectItem value="summary">summary</SelectItem>
                        <SelectItem value="summary_large_image">summary_large_image</SelectItem>
                        <SelectItem value="app">app</SelectItem>
                        <SelectItem value="player">player</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator className="my-3" />

              <div>
                <h4 className="text-sm font-medium mb-2">Sitemap</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Sitemap priority</Label>
                    <Select
                      value={
                        settings.defaultSitemapPriority != null
                          ? String(settings.defaultSitemapPriority)
                          : "__none__"
                      }
                      onValueChange={(v) =>
                        setSettings({
                          ...settings,
                          defaultSitemapPriority: v === "__none__" ? null : parseFloat(v),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Not set" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not set</SelectItem>
                        <SelectItem value="0.5">0.5 (default)</SelectItem>
                        <SelectItem value="1.0">1.0</SelectItem>
                        <SelectItem value="0.9">0.9</SelectItem>
                        <SelectItem value="0.8">0.8</SelectItem>
                        <SelectItem value="0.7">0.7</SelectItem>
                        <SelectItem value="0.6">0.6</SelectItem>
                        <SelectItem value="0.4">0.4</SelectItem>
                        <SelectItem value="0.3">0.3</SelectItem>
                        <SelectItem value="0.2">0.2</SelectItem>
                        <SelectItem value="0.1">0.1</SelectItem>
                        <SelectItem value="0">0</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Sitemap change frequency</Label>
                    <Select
                      value={settings.defaultSitemapChangeFreq ?? "__none__"}
                      onValueChange={(v) =>
                        setSettings({ ...settings, defaultSitemapChangeFreq: v === "__none__" ? null : v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Not set" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not set</SelectItem>
                        <SelectItem value="always">always</SelectItem>
                        <SelectItem value="hourly">hourly</SelectItem>
                        <SelectItem value="daily">daily</SelectItem>
                        <SelectItem value="weekly">weekly</SelectItem>
                        <SelectItem value="monthly">monthly</SelectItem>
                        <SelectItem value="yearly">yearly</SelectItem>
                        <SelectItem value="never">never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              </div>

              <Separator className="my-3" />

              <div className="rounded-lg border border-border bg-primary/5 p-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1.5 mb-2">Article defaults</h3>
                <p className="text-xs text-muted-foreground mb-2">Fallback when an article has no value.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Sitemap change frequency</Label>
                    <Select
                      value={settings.articleDefaultSitemapChangeFreq ?? "__none__"}
                      onValueChange={(v) =>
                        setSettings({ ...settings, articleDefaultSitemapChangeFreq: v === "__none__" ? null : v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Not set" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not set</SelectItem>
                        <SelectItem value="always">always</SelectItem>
                        <SelectItem value="hourly">hourly</SelectItem>
                        <SelectItem value="daily">daily</SelectItem>
                        <SelectItem value="weekly">weekly</SelectItem>
                        <SelectItem value="monthly">monthly</SelectItem>
                        <SelectItem value="yearly">yearly</SelectItem>
                        <SelectItem value="never">never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Sitemap priority</Label>
                    <Select
                      value={
                        settings.articleDefaultSitemapPriority != null
                          ? String(settings.articleDefaultSitemapPriority)
                          : "__none__"
                      }
                      onValueChange={(v) =>
                        setSettings({
                          ...settings,
                          articleDefaultSitemapPriority: v === "__none__" ? null : parseFloat(v),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Not set" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not set</SelectItem>
                        <SelectItem value="0.5">0.5 (default)</SelectItem>
                        <SelectItem value="1.0">1.0</SelectItem>
                        <SelectItem value="0.9">0.9</SelectItem>
                        <SelectItem value="0.8">0.8</SelectItem>
                        <SelectItem value="0.7">0.7</SelectItem>
                        <SelectItem value="0.6">0.6</SelectItem>
                        <SelectItem value="0.4">0.4</SelectItem>
                        <SelectItem value="0.3">0.3</SelectItem>
                        <SelectItem value="0.2">0.2</SelectItem>
                        <SelectItem value="0.1">0.1</SelectItem>
                        <SelectItem value="0">0</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label>Default license (articles)</Label>
                    <Select
                      value={settings.defaultLicense ?? "__none__"}
                      onValueChange={(v) =>
                        setSettings({
                          ...settings,
                          defaultLicense: v === "__none__" || v === "__arr__" ? null : v,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Not set" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not set</SelectItem>
                        {LICENSE_OPTIONS.filter((l) => l.url).map((l) => (
                          <SelectItem key={l.url!} value={l.url!}>
                            {l.label}
                          </SelectItem>
                        ))}
                        <SelectItem value="__arr__">All Rights Reserved</SelectItem>
                        {settings.defaultLicense &&
                          !LICENSE_OPTIONS.some((l) => l.url === settings.defaultLicense) && (
                            <SelectItem value={settings.defaultLicense}>
                              Custom: {settings.defaultLicense}
                            </SelectItem>
                          )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              </div>

              <div className="flex justify-end pt-3">
                <Button onClick={() => handleSave("Technical")} disabled={isSaving === "Technical"}>
                  {isSaving === "Technical" ? "Saving..." : "Save Technical Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* META/JSON-LD Defaults tab */}
        <TabsContent value="modonty-meta-jsonld" className="mt-0 space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-1">META/JSON-LD Defaults</h3>
            <p className="text-sm text-muted-foreground mb-4">Default SEO title and description per page. Used when generating meta and JSON-LD.</p>
          </div>

          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base">Home</CardTitle>
              <CardDescription>Fallback when a Modonty page has no SEO title/description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modontySeoTitle">Modonty default SEO title</Label>
                <Input
                  id="modontySeoTitle"
                  placeholder="e.g. Modonty – About Us"
                  value={settings.modontySeoTitle ?? ""}
                  onChange={(e) =>
                    setSettings({ ...settings, modontySeoTitle: e.target.value?.trim() || null })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modontySeoDescription">Modonty default SEO description</Label>
                <Textarea
                  id="modontySeoDescription"
                  placeholder="e.g. Learn about Modonty and our mission."
                  value={settings.modontySeoDescription ?? ""}
                  onChange={(e) =>
                    setSettings({ ...settings, modontySeoDescription: e.target.value?.trim() || null })
                  }
                  className="min-h-[4rem] resize-y"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base">Clients</CardTitle>
              <CardDescription>Fallback for /clients list page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientsSeoTitle">Clients default SEO title</Label>
                <Input
                  id="clientsSeoTitle"
                  placeholder="e.g. العملاء - دليل الشركات والمؤسسات"
                  value={settings.clientsSeoTitle ?? ""}
                  onChange={(e) =>
                    setSettings({ ...settings, clientsSeoTitle: e.target.value?.trim() || null })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientsSeoDescription">Clients default SEO description</Label>
                <Textarea
                  id="clientsSeoDescription"
                  placeholder="e.g. استكشف دليل شامل للشركات والمؤسسات الرائدة."
                  value={settings.clientsSeoDescription ?? ""}
                  onChange={(e) =>
                    setSettings({ ...settings, clientsSeoDescription: e.target.value?.trim() || null })
                  }
                  className="min-h-[4rem] resize-y"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base">Categories</CardTitle>
              <CardDescription>Fallback for /categories list page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoriesSeoTitle">Categories default SEO title</Label>
                <Input
                  id="categoriesSeoTitle"
                  placeholder="e.g. الفئات"
                  value={settings.categoriesSeoTitle ?? ""}
                  onChange={(e) =>
                    setSettings({ ...settings, categoriesSeoTitle: e.target.value?.trim() || null })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoriesSeoDescription">Categories default SEO description</Label>
                <Textarea
                  id="categoriesSeoDescription"
                  placeholder="e.g. استكشف المقالات حسب الفئة - تصفح جميع فئات المحتوى المتاحة"
                  value={settings.categoriesSeoDescription ?? ""}
                  onChange={(e) =>
                    setSettings({ ...settings, categoriesSeoDescription: e.target.value?.trim() || null })
                  }
                  className="min-h-[4rem] resize-y"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base">Trending</CardTitle>
              <CardDescription>Fallback for /trending list page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trendingSeoTitle">Trending default SEO title</Label>
                <Input
                  id="trendingSeoTitle"
                  placeholder="e.g. الأكثر رواجاً"
                  value={settings.trendingSeoTitle ?? ""}
                  onChange={(e) =>
                    setSettings({ ...settings, trendingSeoTitle: e.target.value?.trim() || null })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trendingSeoDescription">Trending default SEO description</Label>
                <Textarea
                  id="trendingSeoDescription"
                  placeholder="e.g. استكشف المقالات الأكثر رواجاً - محتوى يتابعه القراء الآن"
                  value={settings.trendingSeoDescription ?? ""}
                  onChange={(e) =>
                    setSettings({ ...settings, trendingSeoDescription: e.target.value?.trim() || null })
                  }
                  className="min-h-[4rem] resize-y"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => handleSave("Modonty META/JSON-LD")}
              disabled={isSaving === "Modonty META/JSON-LD"}
            >
              {isSaving === "Modonty META/JSON-LD" ? "Saving..." : "Save"}
            </Button>
          </div>
        </TabsContent>

        {/* Generate M/J tab */}
        <TabsContent value="generate-mj" className="mt-0">
          <GenerateMJSection
            generatedSeo={generatedSeoFromSettings(settings)}
            onRegenerated={async () => {
              const data = await getAllSettings();
              setSettings(data);
            }}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}
