"use client";

import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { MediaPicker } from "@/components/shared/media-picker";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";
import type { ClientWithRelations } from "@/lib/types";
import { updateMedia } from "../../../media/actions/media-actions";
import { getMediaById } from "@/app/(dashboard)/media/actions/get-media-by-id";
import { useToast } from "@/hooks/use-toast";

interface MediaSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
  clientId?: string;
  initialData?: Partial<ClientWithRelations>;
}

export function MediaSection({
  form,
  clientId,
  initialData,
}: MediaSectionProps) {
  const { watch, setValue } = form;
  const { toast } = useToast();

  const [logoMedia, setLogoMedia] = useState<{
    url: string;
    altText: string | null;
  } | null>(null);
  const [ogImageMedia, setOgImageMedia] = useState<{
    url: string;
    altText: string | null;
  } | null>(null);

  const logoMediaId = watch("logoMediaId");
  const ogImageMediaId = watch("ogImageMediaId");

  useEffect(() => {
    if (initialData?.logoMedia?.url) {
      setLogoMedia({
        url: initialData.logoMedia.url,
        altText: initialData.logoMedia.altText || null,
      });
    }
  }, []);

  useEffect(() => {
    if (initialData?.ogImageMedia?.url) {
      setOgImageMedia({
        url: initialData.ogImageMedia.url,
        altText: initialData.ogImageMedia.altText || null,
      });
    }
  }, []);

  useEffect(() => {
    const fetchLogoMedia = async () => {
      if (!logoMediaId || !clientId) {
        setLogoMedia(null);
        return;
      }

      try {
        const media = await getMediaById(logoMediaId, clientId);
        if (media) {
          setLogoMedia({
            url: media.url,
            altText: media.altText,
          });
        } else {
          setLogoMedia(null);
        }
      } catch (error) {
        console.error("Error fetching logo media:", error);
        setLogoMedia(null);
      }
    };

    fetchLogoMedia();
  }, [logoMediaId, clientId]);

  useEffect(() => {
    const fetchOgImageMedia = async () => {
      if (!ogImageMediaId || !clientId) {
        setOgImageMedia(null);
        return;
      }

      try {
        const media = await getMediaById(ogImageMediaId, clientId);
        if (media) {
          setOgImageMedia({
            url: media.url,
            altText: media.altText,
          });
        } else {
          setOgImageMedia(null);
        }
      } catch (error) {
        console.error("Error fetching OG image media:", error);
        setOgImageMedia(null);
      }
    };

    fetchOgImageMedia();
  }, [ogImageMediaId, clientId]);

  const handleLogoAltTextUpdate = async (newAltText: string) => {
    const logoMediaId = watch("logoMediaId");
    if (!logoMediaId) return;
    const result = await updateMedia(logoMediaId, { altText: newAltText });
    if (result.success) {
      toast({
        title: "Alt text updated",
        description: "Logo alt text has been updated in the media library.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update alt text",
        variant: "destructive",
      });
    }
  };

  const handleOGImageAltTextUpdate = async (newAltText: string) => {
    const ogImageMediaId = watch("ogImageMediaId");
    if (!ogImageMediaId) return;
    const result = await updateMedia(ogImageMediaId, { altText: newAltText });
    if (result.success) {
      toast({
        title: "Alt text updated",
        description: "OG image alt text has been updated in the media library.",
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
      <div className="text-xs text-muted-foreground">
        صور الشعار و Open Graph تُستخدم في كل المحتوى المنشور ومشاركات السوشيال،
        ويمكن تعديل نص البديل (alt text) من أيقونة التعديل على كل صورة.
      </div>

      <div className="space-y-2">
        <MediaPicker
          clientId={clientId || initialData?.id || null}
          value={logoMedia?.url || (initialData as any)?.logoMedia?.url || ""}
          altText={logoMedia?.altText || (initialData as any)?.logoMedia?.altText || ""}
          mediaId={logoMediaId || undefined}
          showUrlField={false}
          showAltOverlay
          onSelect={(media) => {
            setValue("logoMediaId", media.mediaId || null, { shouldValidate: true });
            setLogoMedia({
              url: media.url,
              altText: media.altText,
            });
          }}
          onClear={() => {
            setValue("logoMediaId", null, { shouldValidate: true });
            setLogoMedia(null);
          }}
          onAltTextUpdate={handleLogoAltTextUpdate}
          label="Logo"
        />
      </div>

      <div className="space-y-2">
        <MediaPicker
          clientId={clientId || initialData?.id || null}
          value={ogImageMedia?.url || (initialData as any)?.ogImageMedia?.url || ""}
          altText={ogImageMedia?.altText || (initialData as any)?.ogImageMedia?.altText || ""}
          mediaId={ogImageMediaId || undefined}
          showUrlField={false}
          showAltOverlay
          onSelect={(media) => {
            setValue("ogImageMediaId", media.mediaId || null, { shouldValidate: true });
            setOgImageMedia({
              url: media.url,
              altText: media.altText,
            });
          }}
          onClear={() => {
            setValue("ogImageMediaId", null, { shouldValidate: true });
            setOgImageMedia(null);
          }}
          onAltTextUpdate={handleOGImageAltTextUpdate}
          label="OG Image"
        />
      </div>
    </div>
  );
}
