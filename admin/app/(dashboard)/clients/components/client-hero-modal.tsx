"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { MediaPicker } from "@/components/shared/media-picker";
import { updateClientHero } from "../actions/clients-actions";
import { updateClientMobileHero } from "../actions/clients-actions/update-client-mobile-hero";
import { useToast } from "@/hooks/use-toast";

/**
 * One picker for both page images (26 Sep 2026): the desktop cover and the phone image. Only
 * the save action and the copy differ, so a `kind` prop instead of a second near-identical modal.
 */
const KIND = {
  cover: {
    save: updateClientHero,
    specType: "HERO",
    title: "Edit Hero Image",
    description: "Upload a hero image for this client. Recommended: 2400×400px (6:1 ratio).",
    label: "Hero Image",
    saved: "Hero image updated successfully",
    cta: "Save Hero Image",
  },
  mobile: {
    save: updateClientMobileHero,
    specType: "HERO_MOBILE",
    title: "Edit Mobile Image",
    description:
      "Shown at the top of the page on phones. Recommended: 1536×768px (2:1), transparent WebP/PNG. Empty = the hero image is used.",
    label: "Mobile Image",
    saved: "Mobile image updated successfully",
    cta: "Save Mobile Image",
  },
} as const;

interface ClientHeroModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  initialHeroUrl?: string | null;
  initialHeroMediaId?: string | null;
  /** `cover` (default) = the desktop hero · `mobile` = the phone image. */
  kind?: keyof typeof KIND;
}

export function ClientHeroModal({
  open,
  onOpenChange,
  clientId,
  initialHeroUrl,
  initialHeroMediaId,
  kind = "cover",
}: ClientHeroModalProps) {
  const copy = KIND[kind];
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaId, setMediaId] = useState<string | null>(initialHeroMediaId ?? null);
  const [mediaUrl, setMediaUrl] = useState<string>(initialHeroUrl ?? "");

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    const result = await copy.save(clientId, mediaId);
    if (result.success) {
      toast({ title: copy.saved });
      router.refresh();
      onOpenChange(false);
    } else {
      setError(result.error || `Failed to save ${copy.label.toLowerCase()}`);
    }
    setLoading(false);
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        {error && (
          <div
            className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        <MediaPicker
          clientId={clientId}
          value={mediaUrl}
          mediaId={mediaId ?? undefined}
          showUrlField={false}
          showAltOverlay
          onSelect={(media) => {
            setMediaId(media.mediaId || null);
            setMediaUrl(media.url);
            setError(null);
          }}
          onClear={() => {
            setMediaId(null);
            setMediaUrl("");
          }}
          label={copy.label}
          specType={copy.specType}
        />

        <DialogFooter className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={loading} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Saving..." : copy.cta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
