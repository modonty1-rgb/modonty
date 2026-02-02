"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { ImageUploadData } from "@/components/shared/deferred-image-upload";
import { Tag } from "@prisma/client";
import { createTag, updateTag } from "../../actions/tags-actions";
import { deleteOldImage as deleteOldImageAction } from "../../../actions/delete-image";
import { uploadImage } from "../../../actions/upload-image";
import { prepareImageData } from "../../../helpers/prepare-image-data";

interface TagFormData {
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
}

interface UseTagFormParams {
  initialData?: Partial<Tag>;
  tagId?: string;
}

export function useTagForm({ initialData, tagId }: UseTagFormParams) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUploadData, setImageUploadData] = useState<ImageUploadData | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  const [formData, setFormData] = useState<TagFormData>({
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

    if (tagId && initialData?.id && (imageUploadData?.file || imageRemoved)) {
      await deleteOldImageAction("tags", initialData.id);
    }

    const uploadResult = await uploadImage({
      imageData: imageUploadData,
      tableName: "tags",
      urlFieldName: "socialImage",
      altFieldName: "socialImageAlt",
      slug: formData.slug,
      name: formData.name,
      recordId: tagId,
      initialId: initialData?.id,
    });

    if (!uploadResult.success) {
      setError(uploadResult.error || "Failed to upload image");
      setLoading(false);
      return;
    }

    const { finalSocialImage, finalSocialImageAlt, finalCloudinaryPublicId } =
      prepareImageData(
        !!tagId,
        imageRemoved,
        !!imageUploadData?.file,
        uploadResult.result
      );

    const result = tagId
      ? await updateTag(tagId, {
          ...formData,
          ...(finalSocialImage !== undefined ? { socialImage: finalSocialImage } : {}),
          ...(finalSocialImageAlt !== undefined ? { socialImageAlt: finalSocialImageAlt } : {}),
          ...(finalCloudinaryPublicId !== undefined ? { cloudinaryPublicId: finalCloudinaryPublicId } : {}),
        })
      : await createTag({
          ...formData,
          socialImage: finalSocialImage ?? undefined,
          socialImageAlt: finalSocialImageAlt ?? undefined,
          cloudinaryPublicId: finalCloudinaryPublicId ?? undefined,
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
