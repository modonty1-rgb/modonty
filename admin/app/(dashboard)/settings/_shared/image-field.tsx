"use client";

import { useState } from "react";
import NextImage from "next/image";
import { Library } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MediaPickerDialog } from "@/components/shared/media-picker-dialog";
import { Field } from "./field";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  aspect: "square" | "og" | "wide";
  /** Modonty Core (T2 p4-settings): when set, a picker button opens the core client's
   *  own media library (lockClient) and writes the picked Bunny URL into the field.
   *  The manual URL input stays as fallback — zero-loss, same string persistence. */
  coreClientId?: string | null;
}

export function ImageField({ label, value, onChange, hint, aspect, coreClientId }: Props) {
  const [imgError, setImgError] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const hasUrl = value.trim().length > 0;
  const previewWrapper =
    aspect === "og"
      ? "aspect-[1200/630] w-full max-w-[280px]"
      : aspect === "wide"
        ? "h-16 w-full max-w-[300px]"
        : "h-20 w-20";
  const imgSize =
    aspect === "og"
      ? { width: 280, height: 147 }
      : aspect === "wide"
        ? { width: 300, height: 73 }
        : { width: 80, height: 80 };

  return (
    <Field label={label} hint={hint}>
      <div className="space-y-2">
        <div className={`${previewWrapper} shrink-0 rounded-md border bg-muted/30 overflow-hidden flex items-center justify-center p-1`}>
          {hasUrl && !imgError ? (
            <NextImage
              src={value}
              alt={label}
              width={imgSize.width}
              height={imgSize.height}
              className="object-contain w-full h-full"
              onError={() => setImgError(true)}
              unoptimized
            />
          ) : (
            <span className="text-[10px] text-muted-foreground">
              {hasUrl && imgError ? "Failed to load" : "No image"}
            </span>
          )}
        </div>
        {coreClientId && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-1.5 text-xs"
            onClick={() => setPickerOpen(true)}
          >
            <Library className="h-3.5 w-3.5" />
            {hasUrl ? "Change from Modonty Library" : "Pick from Modonty Library"}
          </Button>
        )}
        <Input
          value={value}
          onChange={(e) => { setImgError(false); onChange(e.target.value); }}
          placeholder="https://modonty-asset.b-cdn.net/..."
          className="text-xs"
        />
      </div>
      {coreClientId && (
        <MediaPickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          clientId={coreClientId}
          lockClient
          onSelect={(media) => {
            setImgError(false);
            onChange(media.url);
            setPickerOpen(false);
          }}
        />
      )}
    </Field>
  );
}
