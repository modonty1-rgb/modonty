"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput, FormTextarea } from "@/components/admin/form-field";
import { CharacterCounter } from "@/components/shared/character-counter";
import { CloudinaryImageInput } from "@/components/shared/cloudinary-image-input";
import { Tag } from "@prisma/client";
import { useTagForm } from "../helpers/hooks/use-tag-form";
import { Save, ArrowLeft } from "lucide-react";

interface TagFormProps {
  initialData?: Partial<Tag>;
  tagId?: string;
}

export function TagForm({ initialData, tagId }: TagFormProps) {
  const router = useRouter();
  const {
    formData,
    loading,
    error,
    updateField,
    updateSEOField,
    updateImageField,
    handleSubmit,
  } = useTagForm({ initialData, tagId });

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
                hint={formData.slug ? `Slug: ${formData.slug}` : "Slug will be generated from name"}
                required
              />
              <input type="hidden" name="slug" value={formData.slug} />
              {!!tagId && (
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border">
                  <span className="text-xs text-muted-foreground">Slug:</span>
                  <code className="text-xs font-mono text-foreground">{formData.slug}</code>
                  <span className="text-xs text-yellow-600 ms-auto">⚠️ Won&apos;t change after publish</span>
                </div>
              )}
              <div>
                <FormTextarea
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={2}
                  hint="Used for context and SEO (50+ chars recommended)"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormInput
                  label="SEO Title"
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={(e) => updateSEOField("seoTitle", e.target.value)}
                  hint="50-60 chars optimal"
                />
                <div>
                  <FormInput
                    label="SEO Description"
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={(e) => updateSEOField("seoDescription", e.target.value)}
                    hint="150-160 chars optimal"
                  />
                  <CharacterCounter current={formData.seoDescription.length} max={160} className="mt-1 ms-1" />
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
              <CloudinaryImageInput
                imageUrl={formData.socialImage}
                altText={formData.socialImageAlt}
                onImageUrlChange={(url) => updateImageField("socialImage", url)}
                onAltTextChange={(alt) => updateImageField("socialImageAlt", alt)}
                onRemove={() => {
                  updateImageField("socialImage", "");
                  updateImageField("socialImageAlt", "");
                }}
              />
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-emerald-500/[0.02]">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col gap-2">
                <Button type="submit" disabled={loading} className="w-full gap-2">
                  <Save className="h-4 w-4" />
                  {loading ? "Saving & Generating SEO…" : tagId ? "Update Tag" : "Create Tag"}
                </Button>
                {tagId && (
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
