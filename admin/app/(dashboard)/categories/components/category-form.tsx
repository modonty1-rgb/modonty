"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput, FormTextarea, FormNativeSelect } from "@/components/admin/form-field";
import { SEODoctor } from "@/components/shared/seo-doctor";
import { categorySEOConfig } from "../helpers/category-seo-config";
import { CharacterCounter } from "@/components/shared/character-counter";
import { SEOFields } from "@/components/shared/seo-form-fields";
import { CategoryWithRelations } from "@/lib/types";
import { DeferredImageUpload } from "@/components/shared/deferred-image-upload";
import { useCategoryForm } from "../helpers/hooks/use-category-form";

interface CategoryFormProps {
  initialData?: Partial<CategoryWithRelations>;
  categories: Array<{ id: string; name: string }>;
  categoryId?: string;
}

export function CategoryForm({ initialData, categories, categoryId }: CategoryFormProps) {
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
  } = useCategoryForm({ initialData, categoryId });

  const availableParents = categories.filter((c) => c.id !== initialData?.id);

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                label="Name"
                name="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                hint={formData.slug ? `Slug: ${formData.slug}` : "Slug will be generated from name"}
                required
              />
              <input type="hidden" name="slug" value={formData.slug} />
              <div>
                <FormTextarea
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={3}
                  hint="Category description used for context and SEO (minimum 50 characters recommended)"
                />
                <div className="mt-1">
                  <CharacterCounter
                    current={formData.description.length}
                    min={50}
                    className="ml-1"
                  />
                </div>
              </div>
              <FormNativeSelect
                label="Parent Category"
                name="parentId"
                value={formData.parentId}
                onChange={(e) => updateField("parentId", e.target.value)}
                placeholder="None"
              >
                {availableParents.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </FormNativeSelect>
            </CardContent>
          </Card>

          <SEOFields
            seoTitle={formData.seoTitle}
            seoDescription={formData.seoDescription}
            canonicalUrl={formData.canonicalUrl}
            onSeoTitleChange={(value) => updateSEOField("seoTitle", value)}
            onSeoDescriptionChange={(value) => updateSEOField("seoDescription", value)}
            onCanonicalUrlChange={(value) => updateSEOField("canonicalUrl", value)}
            canonicalPlaceholder="https://example.com/categories/category-slug"
          />

          <Card>
            <CardHeader>
              <CardTitle>Social Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This social image will be used in Twitter Cards and Open Graph (OG) image for better social media sharing previews.
              </p>
              <DeferredImageUpload
                categorySlug={formData.slug}
                onImageSelected={setImageUploadData}
                onImageRemoved={() => setImageRemoved(true)}
                initialImageUrl={initialData?.socialImage || undefined}
                initialAltText={initialData?.socialImageAlt || undefined}
              />
            </CardContent>
          </Card>


          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : initialData ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </div>

        {/* Right Column - SEO Doctor (Always Visible) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <SEODoctor data={{ ...formData }} config={categorySEOConfig} />
          </div>
        </div>
      </div>
    </form>
  );
}
