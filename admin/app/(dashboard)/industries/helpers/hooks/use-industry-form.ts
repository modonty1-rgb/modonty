"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { ImageUploadData } from "@/components/shared/deferred-image-upload";
import { Industry } from "@prisma/client";
import { createIndustry, updateIndustry } from "../../actions/industries-actions";
import { deleteOldImage as deleteOldImageAction } from "../../../actions/delete-image";
import { uploadImage } from "../../../actions/upload-image";
import { prepareImageData } from "../../../helpers/prepare-image-data";

interface IndustryFormData {
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
}

interface UseIndustryFormParams {
  initialData?: Partial<Industry>;
  industryId?: string;
}

export function useIndustryForm({ initialData, industryId }: UseIndustryFormParams) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUploadData, setImageUploadData] = useState<ImageUploadData | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  const [formData, setFormData] = useState<IndustryFormData>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    canonicalUrl: initialData?.canonicalUrl || "",
  });

  useEffect(() => {
    const newSlug = slugify(formData.name);
    setFormData((prev) => ({ ...prev, slug: newSlug }));
  }, [formData.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (industryId && initialData?.id && (imageUploadData?.file || imageRemoved)) {
      await deleteOldImageAction("industries", initialData.id);
    }

    const uploadResult = await uploadImage({
      imageData: imageUploadData,
      tableName: "industries",
      urlFieldName: "socialImage",
      altFieldName: "socialImageAlt",
      slug: formData.slug,
      name: formData.name,
      recordId: industryId,
      initialId: initialData?.id,
    });

    if (!uploadResult.success) {
      setError(uploadResult.error || "Failed to upload image");
      setLoading(false);
      return;
    }

    const { finalSocialImage, finalSocialImageAlt, finalCloudinaryPublicId } =
      prepareImageData(
        !!industryId,
        imageRemoved,
        !!imageUploadData?.file,
        uploadResult.result
      );

    const result = industryId
      ? await updateIndustry(industryId, {
          ...formData,
          ...(finalSocialImage !== undefined ? { socialImage: finalSocialImage } : {}),
          ...(finalSocialImageAlt !== undefined ? { socialImageAlt: finalSocialImageAlt } : {}),
          ...(finalCloudinaryPublicId !== undefined ? { cloudinaryPublicId: finalCloudinaryPublicId } : {}),
        })
      : await createIndustry({
          ...formData,
          socialImage: finalSocialImage ?? undefined,
          socialImageAlt: finalSocialImageAlt ?? undefined,
          cloudinaryPublicId: finalCloudinaryPublicId ?? undefined,
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

  return {
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
  };
}
