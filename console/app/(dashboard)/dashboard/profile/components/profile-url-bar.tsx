"use client";

import { useState } from "react";
import { Link2, Copy, Check } from "lucide-react";

// The client's live page URL on modonty.com — shown prominently in the profile
// header with one-tap copy. Read-only (admin/system owns canonicalUrl).
export function ProfileUrlBar({ url }: { url: string | null }) {
  const [copied, setCopied] = useState(false);

  if (!url) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
      <Link2 className="h-4 w-4 flex-shrink-0 text-primary" aria-hidden />
      <span className="flex-shrink-0 text-xs text-muted-foreground">رابط صفحتك:</span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        dir="ltr"
        className="min-w-0 flex-1 truncate text-start text-sm font-medium text-primary hover:underline"
      >
        {url}
      </a>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="نسخ الرابط"
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}
