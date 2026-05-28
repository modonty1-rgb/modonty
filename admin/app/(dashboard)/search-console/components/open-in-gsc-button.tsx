"use client";

import { Search } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

const GSC_INSPECT_URL =
  "https://search.google.com/search-console?action=inspect&resource_id=sc-domain%3Amodonty.com";

interface Props {
  url: string;
}

/**
 * Copies the URL to clipboard + opens Google Search Console URL Inspection.
 * Google does NOT support `?id=<url>` deep-link — admin must paste manually
 * (the copy makes that one keystroke).
 */
export function OpenInGscButton({ url }: Props) {
  const { toast } = useToast();

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard may be blocked — still open GSC; admin can copy from the page
    }
    window.open(GSC_INSPECT_URL, "_blank", "noopener,noreferrer");
    toast({
      title: "URL copied — paste in GSC",
      description: "Paste it (Ctrl+V / Cmd+V) in the inspection bar at the top of GSC.",
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 text-[10px] font-medium transition-colors"
      title="Open this URL in Google Search Console Inspection"
    >
      <Search className="h-3 w-3" />
      GSC
    </button>
  );
}
