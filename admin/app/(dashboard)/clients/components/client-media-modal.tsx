"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { messages } from "@/lib/messages";
import { MediaSection } from "./form-sections/media-section";
import type { ClientWithRelations } from "@/lib/types";
import { useClientMediaModal } from "./hooks/use-client-media-modal";

interface ClientMediaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  initialData?: Partial<ClientWithRelations>;
}

export function ClientMediaModal({
  open,
  onOpenChange,
  clientId,
  initialData,
}: ClientMediaModalProps) {
  const { form, handleSave, loading, error, setError } = useClientMediaModal({
    clientId,
    initialData,
    onSuccess: () => onOpenChange(false),
  });

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Media</DialogTitle>
          <DialogDescription>
            Update logo and hero image for this client
          </DialogDescription>
        </DialogHeader>

        {/* Error Display */}
        {error && (
          <div
            className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        {/* Media Section */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-6"
        >
          <MediaSection
            form={form as any}
            clientId={clientId}
            initialData={initialData}
            onMediaChange={() => setError(null)}
          />

          <DialogFooter className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Saving..." : "Save Media"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
