"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput, FormTextarea, FormNativeSelect } from "@/components/admin/form-field";
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
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6">
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
              {!!categoryId && (
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border">
                  <span className="text-xs text-muted-foreground">Slug:</span>
                  <code className="text-xs font-mono text-foreground">{formData.slug}</code>
                  <span className="text-xs text-yellow-600 mr-auto">⚠️ لا يتغير بعد النشر</span>
                </div>
              )}
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
                    min={0}
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
            onSeoTitleChange={(value) => updateSEOField("seoTitle", value)}
            onSeoDescriptionChange={(value) => updateSEOField("seoDescription", value)}
            showCanonical={false}
          />

          <Card>
            <CardHeader>
              <CardTitle>Social Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                صورة تظهر عند مشاركة التصنيف على وسائل التواصل الاجتماعي.
              </p>
              <DeferredImageUpload
                categorySlug={formData.slug}
                onImageSelected={(imageData) => {
                  if (imageData && !imageData.altText) {
                    imageData.altText = formData.name || formData.slug;
                  }
                  setImageUploadData(imageData);
                }}
                onImageRemoved={() => setImageRemoved(true)}
                initialImageUrl={initialData?.socialImage || undefined}
                initialAltText={initialData?.socialImageAlt || formData.name || undefined}
                autoAltText={formData.name}
              />
            </CardContent>
          </Card>


          <div className="flex justify-end gap-4">
            {categoryId ? (
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            ) : null}
            <Button type="submit" disabled={loading}>
              {loading ? "Saving & Generating SEO..." : categoryId ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
