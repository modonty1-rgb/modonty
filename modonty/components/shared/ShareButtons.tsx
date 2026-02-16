"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Copy, Check, Mail } from "lucide-react";
import { SocialFacebookOutline } from "@/components/icons/facebook";
import { Twitter } from "@/components/icons/twitter";
import { Linkedin } from "@/components/icons/linkedin";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { cn } from "@/lib/utils";

export type SharePlatformKey = "twitter" | "linkedin" | "facebook" | "whatsapp" | "email";

export interface ShareButtonsProps {
  title: string;
  url?: string;
  platforms?: SharePlatformKey[];
  showCopyLink?: boolean;
  onShare?: (platform: string) => void | Promise<void>;
  size?: "sm" | "default";
  className?: string;
}

const DEFAULT_PLATFORMS: SharePlatformKey[] = ["twitter", "linkedin", "facebook", "whatsapp"];

export function ShareButtons({
  title,
  url: urlProp,
  platforms = DEFAULT_PLATFORMS,
  showCopyLink = true,
  onShare,
  size = "sm",
  className,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const fullUrl = mounted ? window.location.href : urlProp ?? "";
  const shareUrlEnc = encodeURIComponent(fullUrl);
  const shareTitleEnc = encodeURIComponent(title);

  const intentUrls: Record<string, string> = {};
  if (platforms.includes("twitter")) intentUrls.twitter = `https://twitter.com/intent/tweet?url=${shareUrlEnc}&text=${shareTitleEnc}`;
  if (platforms.includes("linkedin")) intentUrls.linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrlEnc}`;
  if (platforms.includes("facebook")) intentUrls.facebook = `https://www.facebook.com/sharer/sharer.php?u=${shareUrlEnc}`;
  if (platforms.includes("whatsapp")) intentUrls.whatsapp = `https://wa.me/?text=${shareTitleEnc}%20${fullUrl}`;
  if (platforms.includes("email")) intentUrls.email = `mailto:?subject=${shareTitleEnc}&body=${encodeURIComponent(`${title}\n\n${fullUrl}`)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
      await onShare?.("copy");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = fullUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
      await onShare?.("copy");
    }
  };

  const handlePlatform = (platform: string) => {
    if (platform === "copy") {
      handleCopy();
      return;
    }
    const href = intentUrls[platform];
    if (href) {
      if (platform === "email") window.location.href = href;
      else window.open(href, "_blank", "noopener,noreferrer");
      void onShare?.(platform);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} className={cn("min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 p-2", className)} aria-label="مشاركة">
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {platforms.includes("facebook") && (
          <DropdownMenuItem onClick={() => handlePlatform("facebook")} className="gap-2 cursor-pointer">
            <SocialFacebookOutline className="h-4 w-4" />
            <span>فيسبوك</span>
          </DropdownMenuItem>
        )}
        {platforms.includes("twitter") && (
          <DropdownMenuItem onClick={() => handlePlatform("twitter")} className="gap-2 cursor-pointer">
            <Twitter className="h-4 w-4" />
            <span>تويتر</span>
          </DropdownMenuItem>
        )}
        {platforms.includes("linkedin") && (
          <DropdownMenuItem onClick={() => handlePlatform("linkedin")} className="gap-2 cursor-pointer">
            <Linkedin className="h-4 w-4" />
            <span>لينكد إن</span>
          </DropdownMenuItem>
        )}
        {platforms.includes("whatsapp") && (
          <DropdownMenuItem onClick={() => handlePlatform("whatsapp")} className="gap-2 cursor-pointer">
            <WhatsAppIcon size={16} />
            <span>واتساب</span>
          </DropdownMenuItem>
        )}
        {platforms.includes("email") && (
          <DropdownMenuItem onClick={() => handlePlatform("email")} className="gap-2 cursor-pointer">
            <Mail className="h-4 w-4" />
            <span>بريد إلكتروني</span>
          </DropdownMenuItem>
        )}
        {showCopyLink && (
          <DropdownMenuItem onClick={handleCopy} className="gap-2 cursor-pointer">
            {copied ? <><Check className="h-4 w-4 text-green-500" /> <span className="text-green-500">تم النسخ!</span></> : <><Copy className="h-4 w-4" /> <span>نسخ الرابط</span></>}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
