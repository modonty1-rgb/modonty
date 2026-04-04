"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { Industry } from "@prisma/client";
import { createIndustry, updateIndustry } from "../../actions/industries-actions";

interface IndustryFormData {
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  socialImage: string;
  socialImageAlt: string;
}

interface UseIndustryFormParams {
  initialData?: Partial<Industry>;
  industryId?: string;
}

export function useIndustryForm({ initialData, industryId }: UseIndustryFormParams) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<IndustryFormData>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    canonicalUrl: initialData?.canonicalUrl || "",
    socialImage: initialData?.socialImage || "",
    socialImageAlt: initialData?.socialImageAlt || "",
  });

  const isEditMode = !!industryId;

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

    const result = industryId
      ? await updateIndustry(industryId, payload)
      : await createIndustry({
          ...payload,
          socialImage: payload.socialImage ?? undefined,
          socialImageAlt: payload.socialImageAlt ?? undefined,
        });

    if (result.success) {
      router.push("/industries");
      router.refresh();
    } else {
      setError(result.error || "Failed to save industry");
      setLoading(false);
    }
  };

  const updateField = (field: keyof IndustryFormData, value: string) => {
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
