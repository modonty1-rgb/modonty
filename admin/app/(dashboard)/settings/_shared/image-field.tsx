"use client";

import { useState } from "react";
import NextImage from "next/image";
import { Input } from "@/components/ui/input";
import { Field } from "./field";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  aspect: "square" | "og";
}

export function ImageField({ label, value, onChange, hint, aspect }: Props) {
  const [imgError, setImgError] = useState(false);
  const hasUrl = value.trim().length > 0;
  const previewWrapper = aspect === "og" ? "aspect-[1200/630] w-full max-w-[280px]" : "h-20 w-20";

  return (
    <Field label={label} hint={hint}>
      <div className="space-y-2">
        <div className={`${previewWrapper} shrink-0 rounded-md border bg-muted/30 overflow-hidden flex items-center justify-center`}>
          {hasUrl && !imgError ? (
            <NextImage
              src={value}
              alt={label}
              width={aspect === "og" ? 280 : 80}
              height={aspect === "og" ? 147 : 80}
              className="object-cover w-full h-full"
              onError={() => setImgError(true)}
              unoptimized
            />
          ) : (
            <span className="text-[10px] text-muted-foreground">
              {hasUrl && imgError ? "Failed to load" : "No image"}
            </span>
          )}
        </div>
        <Input
          value={value}
          onChange={(e) => { setImgError(false); onChange(e.target.value); }}
          placeholder="https://res.cloudinary.com/..."
          className="text-xs"
        />
      </div>
    </Field>
  );
}
