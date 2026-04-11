"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { messages } from "@/lib/messages";
import { Button } from "@/components/ui/button";
import { FormInput, FormTextarea } from "@/components/admin/form-field";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SEODoctor } from "@/components/shared/seo-doctor";
import { createAuthorSEOConfig } from "../helpers/author-seo-config";
import { CharacterCounter } from "@/components/shared/character-counter";
import { DeferredImageUpload } from "@/components/shared/deferred-image-upload";
import { useAuthorForm } from "../helpers/hooks/use-author-form";
import { Save, Zap } from "lucide-react";
import type { AuthorWithRelations } from "@/lib/types";
import type { SEOSettings } from "@/app/(dashboard)/settings/actions/settings-actions";

interface AuthorFormProps {
  initialData?: Partial<AuthorWithRelations>;
  authorId?: string;
  onSuccess?: () => void;
  header?: React.ReactNode;
  seoSettings?: SEOSettings;
}

export function AuthorForm({ initialData, authorId, onSuccess, header, seoSettings }: AuthorFormProps) {
  const seoConfig = createAuthorSEOConfig(seoSettings);
  const router = useRouter();
  const {
    formData,
    loading,
    error,
    setImageUploadData,
    setImageRemoved,
    updateField,
    updateSEOField,
    handleSubmit,
  } = useAuthorForm({ initialData, authorId, onSuccess });

  return (
    <div className="space-y-4">
      {/* Header + SEO Doctor */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="shrink-0">{header}</div>
        <div className="flex-1 min-w-0">
          <SEODoctor data={{ ...formData }} config={seoConfig} />
        </div>
      </div>

      {/* Auto-generated notice */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/40 border border-border/40">
        <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
        <p className="text-[11px] text-muted-foreground">
          <span className="font-medium">Auto on save:</span> Canonical URL · JSON-LD · Open Graph · Twitter Card · Articles updated
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Single card — all fields */}
          <Card>
            <CardContent className="pt-6 space-y-6">
              {/* Name + Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                />
                <FormInput
                  label="Job Title"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => updateField("jobTitle", e.target.value)}
                  hint={messages.hints.author.jobTitle}
                />
              </div>
              <input type="hidden" name="slug" value={formData.slug} />
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border">
                <span className="text-xs text-muted-foreground">Slug:</span>
                <code className="text-xs font-mono text-foreground">{formData.slug || "—"}</code>
                {authorId && (
                  <span className="text-xs text-yellow-600 ms-auto">⚠️ Won&apos;t change after publish</span>
                )}
              </div>

              {/* Profile Image */}
              <DeferredImageUpload
                categorySlug={formData.slug}
                onImageSelected={setImageUploadData}
                onImageRemoved={() => setImageRemoved(true)}
                initialImageUrl={initialData?.image || undefined}
                initialAltText={initialData?.imageAlt || undefined}
              />

              {/* Bio */}
              <div>
                <FormTextarea
                  label="Bio"
                  name="bio"
                  value={formData.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  rows={3}
                  hint={messages.hints.author.bio}
                />
                <CharacterCounter current={formData.bio.length} min={100} className="ms-1 mt-1" />
              </div>

              {/* Divider */}
              <div className="border-t" />

              {/* Contact + Social — one row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Website"
                  name="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => updateField("url", e.target.value)}
                />
                <FormInput
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormInput
                  label="LinkedIn"
                  name="linkedIn"
                  value={formData.linkedIn}
                  onChange={(e) => updateField("linkedIn", e.target.value)}
                />
                <FormInput
                  label="X (Twitter)"
                  name="twitter"
                  value={formData.twitter}
                  onChange={(e) => updateField("twitter", e.target.value)}
                />
                <FormInput
                  label="Facebook"
                  name="facebook"
                  value={formData.facebook}
                  onChange={(e) => updateField("facebook", e.target.value)}
                />
              </div>

              {/* Divider */}
              <div className="border-t" />

              {/* Expertise */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Expertise Areas"
                  name="expertiseAreas"
                  value={formData.expertiseAreas}
                  onChange={(e) => updateField("expertiseAreas", e.target.value)}
                  hint={messages.hints.author.expertiseAreas}
                />
                <FormInput
                  label="Organizations"
                  name="memberOf"
                  value={formData.memberOf}
                  onChange={(e) => updateField("memberOf", e.target.value)}
                  hint={messages.hints.author.expertiseAreas}
                />
              </div>
              <FormTextarea
                label="Credentials"
                name="credentials"
                value={formData.credentials}
                onChange={(e) => updateField("credentials", e.target.value)}
                rows={2}
                hint={messages.hints.author.credentials}
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  id="verificationStatus"
                  checked={formData.verificationStatus}
                  onCheckedChange={(checked) => updateField("verificationStatus", checked === true)}
                />
                <Label htmlFor="verificationStatus" className="text-sm cursor-pointer">
                  Verified Expert
                </Label>
              </div>

              {/* Divider */}
              <div className="border-t" />

              {/* SEO — inline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FormInput
                    label="SEO Title"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={(e) => updateSEOField("seoTitle", e.target.value)}
                    hint={messages.hints.author.metaTitle}
                    maxLength={51}
                  />
                  <CharacterCounter current={formData.seoTitle.length} max={51} className="mt-1 ms-1" />
                </div>
                <div>
                  <FormInput
                    label="SEO Description"
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={(e) => updateSEOField("seoDescription", e.target.value)}
                    hint={messages.hints.author.metaDescription}
                  />
                  <CharacterCounter current={formData.seoDescription.length} max={160} className="mt-1 ms-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save */}
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-1.5">
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
