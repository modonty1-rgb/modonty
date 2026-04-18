"use client";

import { messages } from "@/lib/messages";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput, FormTextarea } from "@/components/admin/form-field";
import { CharacterCounter } from "@/components/shared/character-counter";
import { MediaImageField } from "@/components/shared/media-image-field";
import { Industry } from "@prisma/client";
import { useIndustryForm } from "../helpers/hooks/use-industry-form";
import { Save, ArrowLeft } from "lucide-react";

interface IndustryFormProps {
  initialData?: Partial<Industry>;
  industryId?: string;
}

export function IndustryForm({ initialData, industryId }: IndustryFormProps) {
  const router = useRouter();
  const {
    formData,
    loading,
    error,
    updateField,
    updateSEOField,
    updateImageField,
    handleSubmit,
  } = useIndustryForm({ initialData, industryId });

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column — Main Info */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <CardTitle className="text-base">Basic Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <FormInput
                label="Name"
                name="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
              <input type="hidden" name="slug" value={formData.slug} />
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border">
                <span className="text-xs text-muted-foreground">Slug:</span>
                <code className="text-xs font-mono text-foreground">{formData.slug || "—"}</code>
                {industryId && (
                  <span className="text-xs text-yellow-600 ms-auto">⚠️ Won&apos;t change after publish</span>
                )}
              </div>
              <div>
                <FormTextarea
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={2}
                  hint={messages.hints.industry.description}
                />
                <CharacterCounter current={formData.description.length} min={0} className="mt-1 ms-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-blue-500/[0.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <CardTitle className="text-base text-blue-400">SEO</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div>
                  <FormInput
                    label="SEO Title"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={(e) => updateSEOField("seoTitle", e.target.value)}
                    hint={messages.hints.industry.metaTitle}
                    maxLength={60}
                  />
                  <CharacterCounter current={formData.seoTitle.length} min={50} max={60} className="mt-1 ms-1" />
                </div>
                <div>
                  <FormTextarea
                    label="SEO Description"
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={(e) => updateSEOField("seoDescription", e.target.value)}
                    hint={messages.hints.industry.metaDescription}
                    rows={3}
                  />
                  <CharacterCounter current={formData.seoDescription.length} min={120} max={160} className="mt-1 ms-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column — Image + Actions */}
        <div className="lg:sticky lg:top-4 lg:self-start space-y-4">
          <Card className="border-violet-500/20 bg-violet-500/[0.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-violet-500" />
                <CardTitle className="text-base text-violet-400">Social Image</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <MediaImageField
                label="Social Image"
                imageUrl={formData.socialImage}
                altText={formData.socialImageAlt}
                onImageChange={(url, alt) => {
                  updateImageField("socialImage", url);
                  updateImageField("socialImageAlt", alt);
                }}
                onRemove={() => {
                  updateImageField("socialImage", "");
                  updateImageField("socialImageAlt", "");
                }}
                scope="PLATFORM"
              />
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-emerald-500/[0.02]">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col gap-2">
                <Button type="submit" disabled={loading} className="w-full gap-2">
                  <Save className="h-4 w-4" />
                  {loading ? "Saving & Generating SEO…" : industryId ? "Update Industry" : "Create Industry"}
                </Button>
                {industryId && (
                  <Button type="button" variant="outline" className="w-full gap-2" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
