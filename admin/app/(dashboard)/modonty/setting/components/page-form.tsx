"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormInput, FormTextarea } from "@/components/admin/form-field";
import { CharacterCounter } from "@/components/shared/character-counter";
import { CloudinaryImageInput } from "@/components/shared/cloudinary-image-input";
import { RichTextEditor } from "@/app/(dashboard)/articles/components/rich-text-editor";
import { Save, Loader2, RefreshCw, Eye, FileText, Clock } from "lucide-react";
import { useState } from "react";
import { usePageForm, type PageInitialData } from "../helpers/hooks/use-page-form";

export interface SettingsDefaults {
  siteUrl: string;
  twitterSite: string;
  twitterCreator: string;
  logoUrl: string;
  defaultMetaRobots: string;
  defaultGooglebot: string;
  defaultOgType: string;
  defaultOgLocale: string;
  defaultOgDeterminer: string;
  defaultTwitterCard: string;
  defaultSitemapPriority: number;
  defaultSitemapChangeFreq: string;
}

interface PageFormProps {
  slug: string;
  pageLabel: string;
  pageDescription: string;
  onRegenerated?: () => void;
  settingsDefaults: SettingsDefaults;
  initialData?: PageInitialData;
}

export function PageForm({ slug, pageLabel, pageDescription, initialData, onRegenerated, settingsDefaults }: PageFormProps) {
  const {
    formData,
    loading,
    error,
    seoGenerating,
    updateField,
    handleSubmit,
    handleRegenerate,
  } = usePageForm({ slug, initialData, settingsDefaults, onRegenerated });

  const [contentStats, setContentStats] = useState({ wordCount: 0, characterCount: 0 });
  const readingTimeMin = Math.max(1, Math.ceil(contentStats.wordCount / 200));

  const seoTitle = formData.seoTitle || formData.title || "Page title";
  const seoDesc = formData.seoDescription || "Page description";
  const canonicalUrl = formData.canonicalUrl || `${settingsDefaults.siteUrl}/${slug}`;
  const displayUrl = canonicalUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const previewImage = formData.socialImage || formData.ogImage || formData.heroImage || "";

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      {/* Page header with actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">{pageLabel}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{pageDescription}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Preview Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Search & Social Preview</DialogTitle>
              <p className="text-sm text-muted-foreground">
                How your page appears on search engines and social media
              </p>
            </DialogHeader>
            <Tabs defaultValue="google" className="mt-2">
              <TabsList className="w-full">
                <TabsTrigger value="google" className="flex-1">Google</TabsTrigger>
                <TabsTrigger value="facebook" className="flex-1">Facebook</TabsTrigger>
                <TabsTrigger value="twitter" className="flex-1">Twitter</TabsTrigger>
              </TabsList>

              {/* Google */}
              <TabsContent value="google" className="mt-4">
                <div className="rounded-lg border bg-white dark:bg-background p-5 shadow-sm">
                  <p className="text-[20px] leading-[1.3] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                    {seoTitle}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-0.5">{displayUrl}</p>
                  <p className="text-sm text-[#4d5156] dark:text-muted-foreground mt-1 line-clamp-2 leading-[1.58]">
                    {seoDesc}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  This is an approximate preview of how Google displays your page
                </p>
              </TabsContent>

              {/* Facebook */}
              <TabsContent value="facebook" className="mt-4">
                <div className="rounded-lg border bg-white dark:bg-background overflow-hidden shadow-sm max-w-lg mx-auto">
                  {previewImage ? (
                    <div className="aspect-[1.91/1] bg-muted relative">
                      <Image src={previewImage} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 600px" />
                    </div>
                  ) : (
                    <div className="aspect-[1.91/1] bg-muted flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">No image</span>
                    </div>
                  )}
                  <div className="p-3 border-t bg-[#f2f3f5] dark:bg-muted/50">
                    <p className="text-[#606770] dark:text-muted-foreground text-xs uppercase tracking-wide">
                      {displayUrl}
                    </p>
                    <p className="font-semibold text-[#1d2129] dark:text-foreground mt-0.5 truncate leading-5">
                      {seoTitle}
                    </p>
                    <p className="text-[#606770] dark:text-muted-foreground text-sm line-clamp-2 mt-0.5 leading-5">
                      {seoDesc}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Approximate preview when shared on Facebook
                </p>
              </TabsContent>

              {/* Twitter */}
              <TabsContent value="twitter" className="mt-4">
                <div className="rounded-2xl border bg-white dark:bg-background overflow-hidden shadow-sm max-w-lg mx-auto">
                  {previewImage ? (
                    <div className="aspect-[2/1] bg-muted relative">
                      <Image src={previewImage} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 600px" />
                    </div>
                  ) : (
                    <div className="aspect-[2/1] bg-muted flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">No image</span>
                    </div>
                  )}
                  <div className="p-3">
                    <p className="font-bold text-[15px] text-[#0f1419] dark:text-foreground truncate">
                      {seoTitle}
                    </p>
                    <p className="text-[#536471] dark:text-muted-foreground text-sm line-clamp-2 mt-0.5">
                      {seoDesc}
                    </p>
                    <p className="text-[#536471] dark:text-muted-foreground text-sm mt-1 flex items-center gap-1">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
                        <path d="M11.96 14.945a.833.833 0 01-.56-.21 11.89 11.89 0 01-3.12-4.414.826.826 0 01.36-1.06.84.84 0 011.06.36 10.28 10.28 0 002.67 3.79c.18.15.27.39.24.63a.838.838 0 01-.41.56.79.79 0 01-.24.07v.274zm1.21-.84c.08-.64.68-1.11 1.33-1.03 3.71.47 6.43-1.65 6.45-1.67a.843.843 0 011.17.12.84.84 0 01-.12 1.17c-.14.12-3.39 2.65-7.86 2.09a1.18 1.18 0 01-1.03-1.33l.06.65zM3.48 12.296a1.19 1.19 0 01-.24-2.35c3.68-.73 5.46-3.54 5.48-3.57a1.19 1.19 0 012.04 1.22c-.09.15-2.29 3.61-6.87 4.48-.14.02-.28.04-.41.04v.18z" />
                      </svg>
                      {displayUrl}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Approximate preview when shared on Twitter/X
                </p>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

          {/* Regenerate SEO */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={handleRegenerate}
            disabled={seoGenerating}
          >
            {seoGenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {seoGenerating ? "Regenerating..." : "Regenerate SEO"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column — Content + SEO */}
        <div className="lg:col-span-2 space-y-4">
          {/* Content Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <CardTitle className="text-base">Content</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <FormInput
                label="Title"
                name="title"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Enter page title"
                required
                hint="Main heading shown on the page"
              />
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  Content <span className="text-destructive">*</span>
                </label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(value) => updateField("content", value)}
                  onStatsChange={setContentStats}
                  placeholder="Start writing content..."
                />
                {contentStats.wordCount > 0 && (
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {contentStats.wordCount} words
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ~{readingTimeMin} min read
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO Card */}
          <Card className="border-blue-500/20 bg-blue-500/[0.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <CardTitle className="text-base text-blue-400">Search Engine Optimization</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <FormInput
                  label="SEO Title"
                  name="seoTitle"
                  value={formData.seoTitle || ""}
                  onChange={(e) => updateField("seoTitle", e.target.value)}
                  placeholder="e.g., About Us - Modonty"
                  hint='Max 51 chars — "- Modonty" is appended automatically (final Google title: 60 chars)'
                  maxLength={51}
                />
                <CharacterCounter current={(formData.seoTitle || "").length} min={30} max={51} className="mt-1 ms-1" />
              </div>
              <div>
                <FormTextarea
                  label="SEO Description"
                  name="seoDescription"
                  value={formData.seoDescription || ""}
                  onChange={(e) => updateField("seoDescription", e.target.value)}
                  placeholder="Brief description for search engines..."
                  rows={3}
                  hint="Description shown below the title in search results (120-160 characters)"
                />
                <CharacterCounter current={(formData.seoDescription || "").length} min={120} max={160} className="mt-1 ms-1" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column — Image + Actions (sticky) */}
        <div className="lg:sticky lg:top-4 lg:self-start space-y-4">
          {/* Image Card */}
          <Card className="border-violet-500/20 bg-violet-500/[0.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-violet-500" />
                <CardTitle className="text-base text-violet-400">Hero & Social Image</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CloudinaryImageInput
                imageUrl={formData.heroImage || ""}
                altText={formData.heroImageAlt || ""}
                onImageUrlChange={(url) => {
                  updateField("heroImage", url);
                  updateField("socialImage", url);
                  updateField("ogImage", url);
                }}
                onAltTextChange={(alt) => {
                  updateField("heroImageAlt", alt);
                  updateField("socialImageAlt", alt);
                }}
                onRemove={() => {
                  updateField("heroImage", "");
                  updateField("heroImageAlt", "");
                  updateField("socialImage", "");
                  updateField("socialImageAlt", "");
                  updateField("ogImage", "");
                }}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Used as hero image and shared on social media
              </p>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card className="border-emerald-500/20 bg-emerald-500/[0.02]">
            <CardContent className="pt-4 pb-4">
              <Button type="submit" disabled={loading} className="w-full gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving & Generating SEO...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Page
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
