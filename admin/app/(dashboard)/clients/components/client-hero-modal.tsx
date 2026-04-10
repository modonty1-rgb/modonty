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
import { useToast } from "@/hooks/use-toast";

interface ClientHeroModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  initialHeroUrl?: string | null;
  initialHeroMediaId?: string | null;
}

export function ClientHeroModal({
  open,
  onOpenChange,
  clientId,
  initialHeroUrl,
  initialHeroMediaId,
}: ClientHeroModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaId, setMediaId] = useState<string | null>(initialHeroMediaId ?? null);
  const [mediaUrl, setMediaUrl] = useState<string>(initialHeroUrl ?? "");

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    const result = await updateClientHero(clientId, mediaId);
    if (result.success) {
      toast({ title: "Hero image updated successfully" });
      router.refresh();
      onOpenChange(false);
    } else {
      setError(result.error || "Failed to save hero image");
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
          <DialogTitle>Edit Hero Image</DialogTitle>
          <DialogDescription>
            Upload a hero image for this client. Recommended: 1200×630px or 1200×400px.
          </DialogDescription>
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
          label="Hero Image"
        />

        <DialogFooter className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={loading} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Saving..." : "Save Hero Image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
