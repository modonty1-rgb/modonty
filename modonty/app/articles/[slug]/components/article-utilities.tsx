"use client";

import { Button } from "@/components/ui/button";
import { Printer, Copy, Check, Eye } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface ArticleUtilitiesProps {
  articleUrl: string;
}

export function ArticleUtilities({ articleUrl }: ArticleUtilitiesProps) {
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

  const handlePrint = () => {
    window.print();
  };

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
        size="sm"
        onClick={handlePrint}
        className="text-sm min-h-[44px] md:min-h-0"
        aria-label="طباعة"
      >
        <Printer className="h-4 w-4 ml-2" />
        <span className="hidden sm:inline">طباعة</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className="text-sm min-h-[44px] md:min-h-0"
        aria-label="نسخ الرابط"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 ml-2" />
            <span className="hidden sm:inline">تم النسخ</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 ml-2" />
            <span className="hidden sm:inline">نسخ الرابط</span>
          </>
        )}
      </Button>
    </div>
  );
}
