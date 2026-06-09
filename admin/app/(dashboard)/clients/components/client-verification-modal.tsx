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
import { updateClientVerificationImage } from "../actions/clients-actions";
import { useToast } from "@/hooks/use-toast";

interface ClientVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  initialVerificationUrl?: string | null;
}

export function ClientVerificationModal({
  open,
  onOpenChange,
  clientId,
  initialVerificationUrl,
}: ClientVerificationModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string>(initialVerificationUrl ?? "");

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    const result = await updateClientVerificationImage(clientId, mediaUrl || null);
    if (result.success) {
      toast({ title: "Verification image updated" });
      router.refresh();
      onOpenChange(false);
    } else {
      setError(result.error || "Failed to save verification image");
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
          <DialogTitle>Verification Image</DialogTitle>
          <DialogDescription>
            Upload an image of the client&apos;s official registration / license.
            Modonty verifies — the client cannot self-verify. Shown on the public page.
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
          showUrlField={false}
          showAltOverlay
          onSelect={(media) => {
            setMediaUrl(media.url);
            setError(null);
          }}
          onClear={() => {
            setMediaUrl("");
          }}
          label="Verification image"
        />

        <DialogFooter className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={loading} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
