"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { Tag } from "@prisma/client";
import { createTag, updateTag } from "../../actions/tags-actions";

interface TagFormData {
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  socialImage: string;
  socialImageAlt: string;
}

interface UseTagFormParams {
  initialData?: Partial<Tag>;
  tagId?: string;
}

export function useTagForm({ initialData, tagId }: UseTagFormParams) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TagFormData>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    canonicalUrl: initialData?.canonicalUrl || "",
    socialImage: initialData?.socialImage || "",
    socialImageAlt: initialData?.socialImageAlt || "",
  });

  const isEditMode = !!tagId;

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
      seoTitle: formData.seoTitle || undefined,
      seoDescription: formData.seoDescription || undefined,
      canonicalUrl: formData.canonicalUrl || undefined,
      socialImage: formData.socialImage || null,
      socialImageAlt: formData.socialImageAlt || null,
    };

    const result = tagId
      ? await updateTag(tagId, payload)
      : await createTag({
          ...payload,
          socialImage: payload.socialImage ?? undefined,
          socialImageAlt: payload.socialImageAlt ?? undefined,
        });

    if (result.success) {
      router.push("/tags");
      router.refresh();
    } else {
      setError(result.error || "Failed to save tag");
      setLoading(false);
    }
  };

  const updateField = (field: keyof TagFormData, value: string) => {
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
