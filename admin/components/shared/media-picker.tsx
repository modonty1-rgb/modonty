"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NextImage from "next/image";
import { ImageIcon, X, Upload, Pencil } from "lucide-react";
import { MediaPickerDialog } from "./media-picker-dialog";

interface MediaPickerProps {
  clientId: string | null;
  value?: string;
  altText?: string;
  onSelect: (media: { url: string; altText: string | null; mediaId: string; width?: number | null; height?: number | null }) => void;
  onClear?: () => void;
  onAltTextUpdate?: (altText: string) => Promise<void>;
  label?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  showUrlField?: boolean;
  showAltOverlay?: boolean;
  mediaId?: string;
}

export function MediaPicker({
  clientId,
  value,
  altText,
  onSelect,
  onClear,
  onAltTextUpdate,
  label = "Media",
  hint,
  required = false,
  disabled = false,
  showUrlField = true,
  showAltOverlay = false,
  mediaId,
}: MediaPickerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [altTextDialogOpen, setAltTextDialogOpen] = useState(false);
  const [editingAltText, setEditingAltText] = useState(altText || "");
  const [isSavingAltText, setIsSavingAltText] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setSelectedMediaId(null);
    }
  }, [value]);

  useEffect(() => {
    setEditingAltText(altText || "");
  }, [altText]);

  const handleSaveAltText = async () => {
    if (!onAltTextUpdate) return;
    setIsSavingAltText(true);
    try {
      await onAltTextUpdate(editingAltText);
      setAltTextDialogOpen(false);
    } catch (error) {
      console.error("Failed to update alt text:", error);
    } finally {
      setIsSavingAltText(false);
    }
  };

  const handleSelect = (media: { url: string; altText: string | null; mediaId: string; width?: number | null; height?: number | null }) => {
    setSelectedMediaId(media.mediaId);
    onSelect(media);
  };

  const handleClear = () => {
    setSelectedMediaId(null);
    if (onClear) {
      onClear();
    } else {
      onSelect({ url: "", altText: null, mediaId: "", width: null, height: null });
    }
  };

  const getImageUrl = (): string | null => {
    if (!value || value.trim() === "") return null;
    const trimmedValue = value.trim();
    if (trimmedValue.startsWith("http://") || trimmedValue.startsWith("https://")) {
      try {
        new URL(trimmedValue);
        return trimmedValue;
      } catch {
        return null;
      }
    }
    if (trimmedValue.startsWith("/")) {
      return trimmedValue;
    }
    return null;
  };

  const imageUrl = getImageUrl();
  const isValidUrl = imageUrl !== null;
  const isDisabled = disabled || !clientId;

  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      {!clientId ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-4 border border-dashed rounded-md bg-muted/50">
            <p className="text-sm text-muted-foreground">Please select a client first</p>
          </div>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      ) : value ? (
        <div className="space-y-2">
          <div className="relative border rounded-md overflow-hidden">
            <div className="aspect-video relative bg-muted">
              {isValidUrl && imageUrl ? (
                <>
                  <NextImage
                    src={imageUrl}
                    alt={altText || "Selected media"}
                    fill
                    className="object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 transition-opacity flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setDialogOpen(true)}
                        disabled={isDisabled}
                      >
                        Change
                      </Button>
                      {onClear && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleClear}
                          disabled={isDisabled}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {showAltOverlay && (
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 flex items-center justify-between gap-2">
                      <p className="text-[11px] text-white truncate flex-1">
                        {altText || "No alt text"}
                      </p>
                      {onAltTextUpdate && mediaId && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAltTextDialogOpen(true);
                          }}
                          className="transition-colors p-1 rounded bg-background/80 hover:bg-background"
                          disabled={disabled}
                        >
                          <Pencil className="h-3 w-3 text-emerald-500" />
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-center">
                    Invalid image URL
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDialogOpen(true)}
                    disabled={isDisabled}
                  >
                    Select Valid Media
                  </Button>
                </div>
              )}
            </div>
          </div>
          {showUrlField && (
            <Input
              type="text"
              value={value}
              readOnly
              className="bg-muted"
              placeholder="Media URL will appear here"
            />
          )}
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      ) : (
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDialogOpen(true)}
            disabled={isDisabled}
            className="w-full"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Select Media
          </Button>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      )}

      <MediaPickerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        clientId={clientId}
        onSelect={handleSelect}
      />

      {onAltTextUpdate && (
        <Dialog open={altTextDialogOpen} onOpenChange={setAltTextDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Alt Text</DialogTitle>
              <DialogDescription>
                Update the alt text for accessibility and SEO. This will update the media record directly.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="alt-text-edit">Alt Text</Label>
                <Textarea
                  id="alt-text-edit"
                  value={editingAltText}
                  onChange={(e) => setEditingAltText(e.target.value)}
                  placeholder="Enter descriptive alt text for this image"
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Describe the image content for screen readers and SEO.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAltTextDialogOpen(false)}
                disabled={isSavingAltText}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveAltText}
                disabled={isSavingAltText}
              >
                {isSavingAltText ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
