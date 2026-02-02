"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Check, Facebook, Twitter, Linkedin, Link2, Mail } from "lucide-react";

interface ShareClientButtonProps {
  clientName: string;
  clientUrl: string;
}

export function ShareClientButton({ clientName, clientUrl }: ShareClientButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : clientUrl;
  const shareText = `اطلع على ${clientName} على مودونتي`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Silent fail
    }
  };

  const handleShare = (platform: string) => {
    let url = '';
    
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
        break;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          مشاركة
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleShare('facebook')} className="gap-2 cursor-pointer">
          <Facebook className="h-4 w-4" />
          <span>فيسبوك</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('twitter')} className="gap-2 cursor-pointer">
          <Twitter className="h-4 w-4" />
          <span>تويتر</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('linkedin')} className="gap-2 cursor-pointer">
          <Linkedin className="h-4 w-4" />
          <span>لينكد إن</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('email')} className="gap-2 cursor-pointer">
          <Mail className="h-4 w-4" />
          <span>بريد إلكتروني</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink} className="gap-2 cursor-pointer">
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-green-500">تم النسخ!</span>
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4" />
              <span>نسخ الرابط</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
