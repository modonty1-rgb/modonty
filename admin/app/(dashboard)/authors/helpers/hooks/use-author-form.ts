"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ImageUploadData } from "@/components/shared/deferred-image-upload";
import { AuthorWithRelations } from "@/lib/types";
import { updateAuthor } from "../../actions/authors-actions";
import { deleteOldImage as deleteOldImageAction } from "../../../actions/delete-image";
import { uploadImage } from "../../../actions/upload-image";
import { prepareImageData } from "../../../helpers/prepare-image-data";
import { MODONTY_AUTHOR_SLUG, MODONTY_AUTHOR_NAME } from "@/lib/constants/modonty-author";
import { useToast } from "@/hooks/use-toast";
import { AuthorFormData } from "@/lib/types";

interface AuthorFormDataState {
  name: string;
  slug: string;
  jobTitle: string;
  bio: string;
  image: string;
  imageAlt: string;
  url: string;
  email: string;
  linkedIn: string;
  twitter: string;
  facebook: string;
  credentials: string;
  expertiseAreas: string;
  memberOf: string;
  verificationStatus: boolean;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
}

interface UseAuthorFormParams {
  initialData?: Partial<AuthorWithRelations>;
  authorId?: string;
  onSuccess?: () => void;
}

export function useAuthorForm({ initialData, authorId, onSuccess }: UseAuthorFormParams) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUploadData, setImageUploadData] = useState<ImageUploadData | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  const [formData, setFormData] = useState<AuthorFormDataState>({
    name: initialData?.name || MODONTY_AUTHOR_NAME,
    slug: initialData?.slug || MODONTY_AUTHOR_SLUG,
    jobTitle: initialData?.jobTitle || "Content Platform",
    bio: initialData?.bio || "",
    image: initialData?.image || "",
    imageAlt: initialData?.imageAlt || "",
    url: initialData?.url || "",
    email: initialData?.email || "",
    linkedIn: initialData?.linkedIn || "",
    twitter: initialData?.twitter || "",
    facebook: initialData?.facebook || "",
    credentials: initialData?.credentials?.join("\n") || "",
    expertiseAreas: initialData?.expertiseAreas?.join(", ") || "",
    memberOf: initialData?.memberOf?.join(", ") || "",
    verificationStatus: initialData?.verificationStatus || false,
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    canonicalUrl: initialData?.canonicalUrl || "",
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, slug: MODONTY_AUTHOR_SLUG }));
  }, [formData.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (authorId && initialData?.id && (imageUploadData?.file || imageRemoved)) {
      await deleteOldImageAction("authors", initialData.id);
    }

    const uploadResult = await uploadImage({
      imageData: imageUploadData,
      tableName: "authors",
      urlFieldName: "image",
      altFieldName: "imageAlt",
      slug: formData.slug,
      name: formData.name,
      recordId: authorId,
      initialId: initialData?.id,
    });

    if (!uploadResult.success) {
      setError(uploadResult.error || "Failed to upload image");
      toast({
        title: "Error",
        description: uploadResult.error || "Failed to upload image",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { finalSocialImage: finalImage, finalSocialImageAlt: finalImageAlt, finalCloudinaryPublicId } =
      prepareImageData(
        !!authorId,
        imageRemoved,
        !!imageUploadData?.file,
        uploadResult.result
      );

    const submitData: AuthorFormData = {
      ...formData,
      email: formData.email || undefined,
      credentials: formData.credentials
        ? formData.credentials.split("\n").map((c: string) => c.trim()).filter(Boolean)
        : [],
      expertiseAreas: formData.expertiseAreas
        ? formData.expertiseAreas.split(",").map((e: string) => e.trim()).filter(Boolean)
        : [],
      memberOf: formData.memberOf
        ? formData.memberOf.split(",").map((m: string) => m.trim()).filter(Boolean)
        : [],
      sameAs: [
        formData.linkedIn,
        formData.twitter,
        formData.facebook,
      ].filter(Boolean) as string[],
      imageAlt: formData.imageAlt || undefined,
    };

    if (!authorId) {
      setError("Author ID is required");
      toast({
        title: "Error",
        description: "Author ID is required. Only the Modonty author can be edited.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const result = await updateAuthor(authorId, {
      ...submitData,
      ...(finalImage !== undefined ? { image: finalImage } : {}),
      ...(finalImageAlt !== undefined ? { imageAlt: finalImageAlt } : {}),
      ...(finalCloudinaryPublicId !== undefined ? { cloudinaryPublicId: finalCloudinaryPublicId } : {}),
    });

    if (result.success) {
      toast({
        title: "Success",
        description: "Author profile updated successfully",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/authors");
        router.refresh();
      }
    } else {
      setError(result.error || "Failed to save author");
      toast({
        title: "Error",
        description: result.error || "Failed to save author",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const updateField = (field: keyof AuthorFormDataState, value: string | boolean) => {
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
