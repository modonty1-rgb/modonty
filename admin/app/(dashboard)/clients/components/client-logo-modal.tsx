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
import { updateClientLogo } from "../actions/clients-actions";
import { useToast } from "@/hooks/use-toast";

interface ClientLogoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  initialLogoUrl?: string | null;
  initialLogoMediaId?: string | null;
}

export function ClientLogoModal({
  open,
  onOpenChange,
  clientId,
  initialLogoUrl,
  initialLogoMediaId,
}: ClientLogoModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaId, setMediaId] = useState<string | null>(initialLogoMediaId ?? null);
  const [mediaUrl, setMediaUrl] = useState<string>(initialLogoUrl ?? "");

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    const result = await updateClientLogo(clientId, mediaId);
    if (result.success) {
      toast({ title: "Logo updated successfully" });
      router.refresh();
      onOpenChange(false);
    } else {
      setError(result.error || "Failed to save logo");
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
          <DialogTitle>Add Publisher Logo</DialogTitle>
          <DialogDescription>
            Upload a logo for rich results in search engines. Recommended: 160×160px circular.
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
          label="Logo"
        />

        <DialogFooter className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={loading} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Saving..." : "Save Logo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
