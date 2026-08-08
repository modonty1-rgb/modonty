"use client";

import { useState } from "react";
import { OptimizedImage, asMedia } from "@modonty/database/components/optimized-image";
import { Library, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MediaPickerDialog } from "@/components/shared/media-picker-dialog";
import { Field } from "./field";

interface Props {
  /** Empty string renders the control bare (no Field label row) — for cards that
   *  already carry their own title, e.g. /settings/defaults role cards. */
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  aspect: "square" | "og" | "wide";
  /** Modonty Core (T2 p4-settings): when set, the ONLY way to fill the field is picking
   *  from the core client's media library (lockClient) — no manual URL entry (Khalid
   *  2026-08-01). The raw input renders solely when the core client is not configured,
   *  so the field is never dead-ended. Persistence is unchanged (same string value). */
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

  const body = (
    <>
      <div className="space-y-2">
        <div className={`${previewWrapper} shrink-0 rounded-md border bg-muted/30 overflow-hidden flex items-center justify-center p-1`}>
          {hasUrl && !imgError ? (
            <OptimizedImage
              media={asMedia(value, label)} alt={label}
              // كانت مفقودة قبل التحويل — المكوّن يجعلها خطأ تصريف
              sizes="(max-width: 768px) 100vw, 400px"
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
        {coreClientId ? (
          <div className="flex gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 text-xs"
              onClick={() => setPickerOpen(true)}
            >
              <Library className="h-3.5 w-3.5" />
              {hasUrl ? "Change from Modonty Library" : "Pick from Modonty Library"}
            </Button>
            {hasUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1 text-xs text-destructive"
                onClick={() => { setImgError(false); onChange(""); }}
                title="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ) : (
          <Input
            value={value}
            onChange={(e) => { setImgError(false); onChange(e.target.value); }}
            placeholder="https://modonty-asset.b-cdn.net/..."
            className="text-xs"
          />
        )}
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
    </>
  );

  if (!label) return body;
  return (
    <Field label={label} hint={hint}>
      {body}
    </Field>
  );
}
