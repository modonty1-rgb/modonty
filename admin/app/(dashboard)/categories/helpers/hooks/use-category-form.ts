"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { CategoryWithRelations } from "@/lib/types";
import { createCategory, updateCategory } from "../../actions/categories-actions";

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  parentId: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  socialImage: string;
  socialImageAlt: string;
}

interface UseCategoryFormParams {
  initialData?: Partial<CategoryWithRelations>;
  categoryId?: string;
}

export function useCategoryForm({ initialData, categoryId }: UseCategoryFormParams) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CategoryFormData>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    parentId: initialData?.parentId || "",
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    canonicalUrl: initialData?.canonicalUrl || "",
    socialImage: initialData?.socialImage || "",
    socialImageAlt: initialData?.socialImageAlt || "",
  });

  const isEditMode = !!categoryId;

  useEffect(() => {
    if (!isEditMode) {
      const newSlug = slugify(formData.name);
      setFormData((prev) => ({ ...prev, slug: newSlug }));
    }
  }, [formData.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || undefined,
      parentId: formData.parentId || undefined,
      seoTitle: formData.seoTitle || undefined,
      seoDescription: formData.seoDescription || undefined,
      canonicalUrl: formData.canonicalUrl || undefined,
      socialImage: formData.socialImage || null,
      socialImageAlt: formData.socialImageAlt || null,
    };

    const result = categoryId
      ? await updateCategory(categoryId, payload)
      : await createCategory({
          ...payload,
          socialImage: payload.socialImage ?? undefined,
          socialImageAlt: payload.socialImageAlt ?? undefined,
        });

    if (result.success) {
      router.push("/categories");
      router.refresh();
    } else {
      setError(result.error || "Failed to save category");
      setLoading(false);
    }
  };

  const updateField = (field: keyof CategoryFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateSEOField = (field: "seoTitle" | "seoDescription" | "canonicalUrl", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateImageField = (field: "socialImage" | "socialImageAlt", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    loading,
    error,
    updateField,
    updateSEOField,
    updateImageField,
    handleSubmit,
  };
}
