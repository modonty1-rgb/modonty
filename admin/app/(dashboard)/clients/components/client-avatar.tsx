"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  url?: string | null;
  fallbackUrl?: string | null;
  name: string;
}

/**
 * Client logo avatar with graceful fallback:
 * own logo → platform default → first-letter chip.
 * Handles broken/404 URLs via onError (swaps to default, then to letter).
 */
export function ClientAvatar({ url, fallbackUrl, name }: Props) {
  const first = url || fallbackUrl || null;
  const [src, setSrc] = useState<string | null>(first);

  function handleError() {
    setSrc((cur) => (fallbackUrl && cur !== fallbackUrl ? fallbackUrl : null));
  }

  return (
    <div className="relative h-8 w-8 shrink-0 rounded-full overflow-hidden bg-muted border border-border">
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          sizes="32px"
          onError={handleError}
          unoptimized
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-xs font-bold text-muted-foreground">
          {name.charAt(0)}
        </div>
      )}
    </div>
  );
}
