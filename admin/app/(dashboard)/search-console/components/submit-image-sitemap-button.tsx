"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, Plus } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import { submitSitemapAction } from "../actions/sitemap-actions";

interface Props {
  sitemapUrl: string;
}

export function SubmitImageSitemapButton({ sitemapUrl }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, startSubmit] = useTransition();
  const [done, setDone] = useState(false);

  const handleSubmit = () => {
    startSubmit(async () => {
      const res = await submitSitemapAction(sitemapUrl);
      if (res.ok) {
        toast({
          title: "Image sitemap submitted to GSC",
          description: "Google will start crawling images from this sitemap shortly.",
        });
        setDone(true);
        router.refresh();
      } else {
        toast({
          title: "Submit failed",
          description: res.error,
          variant: "destructive",
        });
      }
    });
  };

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-medium">
        <CheckCircle2 className="h-3 w-3" />
        Submitted
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSubmit}
      disabled={submitting}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-pink-600 hover:bg-pink-700 text-white text-xs font-medium disabled:opacity-50"
      title="Submit this image sitemap to Google Search Console"
    >
      {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
      Submit to GSC
    </button>
  );
}
