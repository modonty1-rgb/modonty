"use client";

import { UseFormReturn } from "react-hook-form";
import { FormInput, FormTextarea } from "@/components/admin/form-field";
import { MediaPicker } from "@/components/shared/media-picker";
import { CharacterCounter } from "@/components/shared/character-counter";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";
import type { ClientWithRelations } from "@/lib/types";
import { updateMedia } from "../../../media/actions/media-actions";
import { getMediaById } from "@/app/(dashboard)/media/actions/get-media-by-id";
import { useToast } from "@/hooks/use-toast";
import { getSEOSettings, type SEOSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { useState, useEffect } from "react";

interface TwitterSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
  clientId?: string;
  initialData?: Partial<ClientWithRelations>;
}

export function TwitterSection({
  form,
  clientId,
  initialData,
}: TwitterSectionProps) {
  const { watch, setValue, formState: { errors } } = form;
  const { toast } = useToast();
  const [seoSettings, setSeoSettings] = useState<SEOSettings | null>(null);
  const [twitterImageMedia, setTwitterImageMedia] = useState<{
    url: string;
    altText: string | null;
  } | null>(null);

  const twitterImageMediaId = watch("twitterImageMediaId");

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getSEOSettings();
        setSeoSettings(settings);
      } catch (error) {
        console.error("Failed to load SEO settings:", error);
      }
    }
    loadSettings();
  }, []);

  const handleTwitterImageAltTextUpdate = async (newAltText: string) => {
    const twitterImageMediaId = watch("twitterImageMediaId");
    if (!twitterImageMediaId) return;
    const result = await updateMedia(twitterImageMediaId, { altText: newAltText });
    if (result.success) {
      toast({
        title: "Alt text updated",
        description: "Twitter image alt text has been updated in the media library.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update alt text",
        variant: "destructive",
      });
    }
  };

  return (
      <div className="space-y-6">
        <div className="space-y-2">
          <MediaPicker
            clientId={clientId || initialData?.id || null}
            value={twitterImageMedia?.url || (initialData as any)?.twitterImageMedia?.url || ""}
            altText={twitterImageMedia?.altText || (initialData as any)?.twitterImageMedia?.altText || ""}
            mediaId={twitterImageMediaId || undefined}
            showUrlField={false}
            showAltOverlay
            onSelect={(media) => {
              setValue("twitterImageMediaId", media.mediaId || null, { shouldValidate: true });
              setTwitterImageMedia({
                url: media.url,
                altText: media.altText,
              });
            }}
            onClear={() => {
              setValue("twitterImageMediaId", null, { shouldValidate: true });
              setTwitterImageMedia(null);
            }}
            onAltTextUpdate={handleTwitterImageAltTextUpdate}
            label="Twitter Image"
          />
        </div>
      </div>
  );
}
