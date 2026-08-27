"use client";

import { entityUrl } from "@modonty/shared/lib/seo/absolute-url";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthorWithRelations } from "@/lib/types";
import { updateAuthor } from "../../actions/authors-actions";
import { MODONTY_AUTHOR_SLUG, MODONTY_AUTHOR_NAME } from "@/lib/constants/modonty-author";
import { useToast } from "@/hooks/use-toast";
import { messages } from "@/lib/messages";
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
  /** Site base URL from Settings.siteUrl (passed by server parent). */
  siteUrl: string;
}

export function useAuthorForm({ initialData, authorId, onSuccess, siteUrl }: UseAuthorFormParams) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AuthorFormDataState>({
    name: initialData?.name || MODONTY_AUTHOR_NAME,
    slug: initialData?.slug || MODONTY_AUTHOR_SLUG,
    // Empty, not a guessed job title. Whatever stands here is saved to the row on the first
    // submit and then travels into the author's JSON-LD as `jobTitle` — so a default written
    // in this file becomes a claim about a real person that nobody chose to make.
    jobTitle: initialData?.jobTitle || "",
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
    verificationStatus: initialData?.verificationStatus ?? true,
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    canonicalUrl: initialData?.canonicalUrl || entityUrl("authors", initialData?.slug || MODONTY_AUTHOR_SLUG, siteUrl),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!authorId) {
      setError("Author ID is required");
      toast({ title: messages.error.server_error, description: "معرّف الكاتب مطلوب.", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Author policy: the Modonty author's visuals come from Settings (see
    // build-modonty-author-seo) — this form never touches image fields.
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
      image: undefined,
      imageAlt: undefined,
    };

    const result = await updateAuthor(authorId, submitData);

    if (result.success) {
      // A plain green "saved" would be a lie when the stored SEO blob did not rebuild —
      // the public page still shows the old data. Say which one happened.
      toast(
        result.seoWarning
          ? {
              title: "الحفظ تمّ — بيانات السيو ما تجدّدت",
              description: result.seoWarning,
              variant: "warning",
            }
          : {
              title: messages.success.updated,
              description: "تم تحديث بيانات الكاتب بنجاح",
              variant: "success",
            },
      );

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
        router.push("/authors");
      }
    } else {
      setError(result.error || "Failed to save author");
      toast({
        title: messages.error.server_error,
        description: result.error || "تعذّر حفظ بيانات الكاتب",
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
    updateField,
    updateSEOField,
    handleSubmit,
  };
}
