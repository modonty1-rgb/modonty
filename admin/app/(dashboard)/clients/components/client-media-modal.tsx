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
  });

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex-1">
            <DialogTitle>Edit Media</DialogTitle>
            <DialogDescription>
              Update logo and hero image for this client
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleClose}
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </Button>
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
