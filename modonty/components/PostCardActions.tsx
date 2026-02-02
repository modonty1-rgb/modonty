"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

interface PostCardActionsProps {
  postSlug: string;
}

export function PostCardActions({ postSlug }: PostCardActionsProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      }).catch(() => {});
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="min-h-11 min-w-11"
      onClick={handleShare}
      aria-label="مشاركة"
    >
      <Share2 className="h-4 w-4" />
    </Button>
  );
}
