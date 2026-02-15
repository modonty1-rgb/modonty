"use client";

import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface ArticleUtilitiesProps {
  articleUrl: string;
  /** Smaller button to sit beside engagement actions */
  compact?: boolean;
}

export function ArticleUtilities({ articleUrl, compact = false }: ArticleUtilitiesProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    setMounted(true);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const currentUrl = mounted ? window.location.href : articleUrl;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
      <Button
        variant="outline"
        size={compact ? "icon" : "sm"}
        onClick={handleCopyLink}
        className={compact ? "h-8 w-8 shrink-0" : "text-sm min-h-[44px] md:min-h-0"}
        aria-label={copied ? "تم النسخ" : "نسخ الرابط"}
      >
        {copied ? (
          <Check className={compact ? "h-3.5 w-3.5" : "h-4 w-4 ml-2"} />
        ) : (
          <Copy className={compact ? "h-3.5 w-3.5" : "h-4 w-4 ml-2"} />
        )}
        {!compact && (
          <>
            {copied ? (
              <span className="hidden sm:inline">تم النسخ</span>
            ) : (
              <span className="hidden sm:inline">نسخ الرابط</span>
            )}
          </>
        )}
      </Button>
    </div>
  );
}
