"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { ImageUploadData } from "@/components/shared/deferred-image-upload";
import { CategoryWithRelations } from "@/lib/types";
import { createCategory, updateCategory } from "../../actions/categories-actions";
import { deleteOldImage as deleteOldImageAction } from "../../../actions/delete-image";
import { uploadImage } from "../../../actions/upload-image";
import { prepareImageData } from "../../../helpers/prepare-image-data";

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  parentId: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
}

interface UseCategoryFormParams {
  initialData?: Partial<CategoryWithRelations>;
  categoryId?: string;
}

export function useCategoryForm({ initialData, categoryId }: UseCategoryFormParams) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUploadData, setImageUploadData] = useState<ImageUploadData | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  const [formData, setFormData] = useState<CategoryFormData>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    parentId: initialData?.parentId || "",
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

    if (categoryId && initialData?.id && (imageUploadData?.file || imageRemoved)) {
      await deleteOldImageAction("categories", initialData.id);
    }

    const uploadResult = await uploadImage({
      imageData: imageUploadData,
      tableName: "categories",
      urlFieldName: "socialImage",
      altFieldName: "socialImageAlt",
      slug: formData.slug,
      name: formData.name,
      recordId: categoryId,
      initialId: initialData?.id,
    });

    if (!uploadResult.success) {
      setError(uploadResult.error || "Failed to upload image");
      setLoading(false);
      return;
    }

    const { finalSocialImage, finalSocialImageAlt, finalCloudinaryPublicId } =
      prepareImageData(
        !!categoryId,
        imageRemoved,
        !!imageUploadData?.file,
        uploadResult.result
      );

    const result = categoryId
      ? await updateCategory(categoryId, {
          ...formData,
          parentId: formData.parentId || undefined,
          ...(finalSocialImage !== undefined ? { socialImage: finalSocialImage } : {}),
          ...(finalSocialImageAlt !== undefined ? { socialImageAlt: finalSocialImageAlt } : {}),
          ...(finalCloudinaryPublicId !== undefined ? { cloudinaryPublicId: finalCloudinaryPublicId } : {}),
        })
      : await createCategory({
          ...formData,
          parentId: formData.parentId || undefined,
          socialImage: finalSocialImage ?? undefined,
          socialImageAlt: finalSocialImageAlt ?? undefined,
          cloudinaryPublicId: finalCloudinaryPublicId ?? undefined,
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
