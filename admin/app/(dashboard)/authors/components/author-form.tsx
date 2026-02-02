"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput, FormTextarea } from "@/components/admin/form-field";
import { Label } from "@/components/ui/label";
import { SEODoctor } from "@/components/shared/seo-doctor";
import { authorSEOConfig } from "../helpers/author-seo-config";
import { CharacterCounter } from "@/components/shared/character-counter";
import { SEOFields } from "@/components/shared/seo-form-fields";
import { AuthorWithRelations } from "@/lib/types";
import { DeferredImageUpload } from "@/components/shared/deferred-image-upload";
import { useAuthorForm } from "../helpers/hooks/use-author-form";

interface AuthorFormProps {
  initialData?: Partial<AuthorWithRelations>;
  authorId?: string;
  onSuccess?: () => void;
}

export function AuthorForm({ initialData, authorId, onSuccess }: AuthorFormProps) {
  const router = useRouter();
  const {
    formData,
    loading,
    error,
    imageUploadData,
    imageRemoved,
    setImageUploadData,
    setImageRemoved,
    updateField,
    updateSEOField,
    handleSubmit,
  } = useAuthorForm({ initialData, authorId, onSuccess });

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormInput
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                hint={formData.slug ? `Slug: ${formData.slug}` : "The platform name (e.g., Modonty)"}
                required
              />
              <input type="hidden" name="slug" value={formData.slug} />
              <FormInput
                label="Job Title"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => updateField("jobTitle", e.target.value)}
                hint="Platform role (e.g., Content Platform, Digital Publisher) - Used in Schema.org jobTitle for E-E-A-T"
              />
              <div>
                <FormTextarea
                  label="Bio"
                  name="bio"
                  value={formData.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  rows={4}
                  hint="Author biography for E-E-A-T signals (minimum 100 characters recommended)"
                />
                <div className="mt-1">
                  <CharacterCounter
                    current={formData.bio.length}
                    min={100}
                    className="ml-1"
                  />
                </div>
              </div>
              <div>
                <Label>Profile Image</Label>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Upload a profile image for the author. This image will be used in author profile pages and Schema.org markup.
                </p>
                <DeferredImageUpload
                  categorySlug={formData.slug}
                  onImageSelected={setImageUploadData}
                  onImageRemoved={() => setImageRemoved(true)}
                  initialImageUrl={initialData?.image || undefined}
                  initialAltText={initialData?.imageAlt || undefined}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormInput
                    label="URL"
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
                    hint="Schema.org email - Optional contact email (privacy-sensitive)"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Social Profiles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormInput
                    label="LinkedIn"
                    name="linkedIn"
                    value={formData.linkedIn}
                    onChange={(e) => updateField("linkedIn", e.target.value)}
                  />
                  <FormInput
                    label="Twitter URL"
                    name="twitter"
                    value={formData.twitter}
                    onChange={(e) => updateField("twitter", e.target.value)}
                    hint="Full Twitter profile URL (e.g., https://twitter.com/username)"
                  />
                  <FormInput
                    label="Facebook"
                    name="facebook"
                    value={formData.facebook}
                    onChange={(e) => updateField("facebook", e.target.value)}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>E-E-A-T Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormTextarea
                    label="Credentials (one per line)"
                    name="credentials"
                    value={formData.credentials}
                    onChange={(e) => updateField("credentials", e.target.value)}
                    rows={3}
                  />
                  <FormInput
                    label="Expertise Areas (comma-separated)"
                    name="expertiseAreas"
                    value={formData.expertiseAreas}
                    onChange={(e) => updateField("expertiseAreas", e.target.value)}
                  />
                  <FormInput
                    label="Member Of (comma-separated)"
                    name="memberOf"
                    value={formData.memberOf}
                    onChange={(e) => updateField("memberOf", e.target.value)}
                    hint="Professional organizations - Schema.org memberOf (E-E-A-T authoritativeness)"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="verificationStatus"
                      checked={formData.verificationStatus}
                      onChange={(e) => updateField("verificationStatus", e.target.checked)}
                      className="h-4 w-4 rounded border-input"
                    />
                    <label htmlFor="verificationStatus" className="text-sm font-medium">
                      Verification Status
                    </label>
                  </div>
                </CardContent>
              </Card>

              <SEOFields
                seoTitle={formData.seoTitle}
                seoDescription={formData.seoDescription}
                canonicalUrl={formData.canonicalUrl}
                onSeoTitleChange={(value) => updateSEOField("seoTitle", value)}
                onSeoDescriptionChange={(value) => updateSEOField("seoDescription", value)}
                onCanonicalUrlChange={(value) => updateSEOField("canonicalUrl", value)}
                canonicalPlaceholder="https://example.com/authors/author-slug"
              />

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Update Author"}
            </Button>
          </div>
        </div>

        {/* Right Column - SEO Doctor */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <SEODoctor data={{ ...formData }} config={authorSEOConfig} />
          </div>
        </div>
      </div>
    </form>
  );
}
