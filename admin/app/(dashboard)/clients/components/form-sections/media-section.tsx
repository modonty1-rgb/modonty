"use client";

import { UseFormReturn } from "react-hook-form";
import { messages } from "@/lib/messages";
import { MediaPicker } from "@/components/shared/media-picker";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";
import type { ClientWithRelations } from "@/lib/types";
import { updateMedia } from "../../../media/actions/media-actions";
import { useToast } from "@/hooks/use-toast";
import { useMediaPreview } from "../../helpers/hooks/use-media-preview";

interface MediaSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
  clientId?: string;
  initialData?: Partial<ClientWithRelations>;
  onMediaChange?: () => void;
}

export function MediaSection({
  form,
  clientId,
  initialData,
  onMediaChange,
}: MediaSectionProps) {
  const { watch, setValue } = form;
  const { toast } = useToast();

  const logoMediaId = watch("logoMediaId");
  const heroImageMediaId = watch("heroImageMediaId");

  const { media: logoMedia, setMedia: setLogoMedia } = useMediaPreview({
    mediaId: logoMediaId,
    clientId: clientId || null,
    initialMedia: initialData?.logoMedia || null,
  });

  const { media: heroImageMedia, setMedia: setHeroImageMedia } = useMediaPreview({
    mediaId: heroImageMediaId,
    clientId: clientId || null,
    initialMedia: (initialData as any)?.heroImageMedia || null,
  });

  const handleLogoAltTextUpdate = async (newAltText: string) => {
    const logoMediaId = watch("logoMediaId");
    if (!logoMediaId) return;
    const result = await updateMedia(logoMediaId, { altText: newAltText });
    if (result.success) {
      toast({
        title: messages.success.updated,
        description: "Alt text saved",
      });
    } else {
      toast({
        title: messages.error.server_error,
        description: result.error || "Failed to update alt text",
        variant: "destructive",
      });
    }
  };

  const handleHeroImageAltTextUpdate = async (newAltText: string) => {
    const heroImageMediaId = watch("heroImageMediaId");
    if (!heroImageMediaId) return;
    const result = await updateMedia(heroImageMediaId, { altText: newAltText });
    if (result.success) {
      toast({
        title: messages.success.updated,
        description: "Alt text saved",
      });
    } else {
      toast({
        title: messages.error.server_error,
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
            onMediaChange?.();
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
          value={heroImageMedia?.url || (initialData as any)?.heroImageMedia?.url || ""}
          altText={heroImageMedia?.altText || (initialData as any)?.heroImageMedia?.altText || ""}
          mediaId={heroImageMediaId || undefined}
          showUrlField={false}
          showAltOverlay
          onSelect={(media) => {
            setValue("heroImageMediaId", media.mediaId || null, { shouldValidate: true });
            setHeroImageMedia({
              url: media.url,
              altText: media.altText,
            });
            onMediaChange?.();
          }}
          onClear={() => {
            setValue("heroImageMediaId", null, { shouldValidate: true });
            setHeroImageMedia(null);
          }}
          onAltTextUpdate={handleHeroImageAltTextUpdate}
          label="Hero Image"
        />
      </div>
    </div>
  );
}
