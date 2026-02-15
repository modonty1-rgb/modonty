"use client";

import { Button } from "@/components/ui/button";
import { Linkedin, Twitter, Facebook, Share2, Copy, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface ArticleShareButtonsProps {
  title: string;
  url: string;
  articleId: string;
  hideCopyLink?: boolean;
}

export function ArticleShareButtons({ title, url, articleId, hideCopyLink = false }: ArticleShareButtonsProps) {
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

  const fullUrl = mounted ? window.location.href : url;
  const shareUrl = encodeURIComponent(fullUrl);
  const shareTitle = encodeURIComponent(title);

  const handleShare = async (platform: string) => {
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      whatsapp: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
    };

    if (platform === "copy") {
      try {
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), 2000);
        
        // Track share
        try {
          await fetch(`/api/articles/${articleId}/share`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ platform: "COPY_LINK" }),
          });
        } catch {
          // Silent fail for tracking
        }
      } catch {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = fullUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), 2000);
      }
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "noopener,noreferrer");
      
      // Track share
      try {
        await fetch(`/api/articles/${articleId}/share`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platform: platform.toUpperCase() }),
        });
      } catch {
        // Silent fail for tracking
      }
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare("twitter")}
        className="text-sm min-h-[44px] md:min-h-0 min-w-[44px] md:min-w-0 p-2"
        title="مشاركة المقال على تويتر"
        aria-label="مشاركة على تويتر"
      >
        <Twitter className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare("linkedin")}
        className="text-sm min-h-[44px] md:min-h-0 min-w-[44px] md:min-w-0 p-2"
        title="مشاركة المقال على لينكد إن"
        aria-label="مشاركة على لينكد إن"
      >
        <Linkedin className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare("facebook")}
        className="text-sm min-h-[44px] md:min-h-0 min-w-[44px] md:min-w-0 p-2"
        title="مشاركة المقال على فيسبوك"
        aria-label="مشاركة على فيسبوك"
      >
        <Facebook className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare("whatsapp")}
        className="text-sm min-h-[44px] md:min-h-0 min-w-[44px] md:min-w-0 p-2"
        title="مشاركة المقال على واتساب"
        aria-label="مشاركة على واتساب"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </Button>
      {!hideCopyLink && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("copy")}
          className="text-sm"
          aria-label="نسخ الرابط"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 ml-2" />
              تم النسخ
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 ml-2" />
              نسخ الرابط
            </>
          )}
        </Button>
      )}
    </div>
  );
}
