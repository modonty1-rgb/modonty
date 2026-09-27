"use client";

import { useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import type { HeroPrompt } from "../helpers/hero-prompts";

/**
 * The image-AI prompt for one hero slot, behind a small button: its rules at a glance and the full
 * text one click to copy. Closed by default — it is needed when an image is changed, not every visit.
 */
export function PromptBox({ prompt }: { prompt: HeroPrompt }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" size="sm" variant="ghost" className="h-8 gap-1.5 text-[12px]">
          <Sparkles className="size-3.5" aria-hidden />
          البرومبت
        </Button>
      </PopoverTrigger>
      <PopoverContent dir="rtl" align="end" className="w-80 space-y-3">
        <p className="text-[12px] font-bold">برومبت ChatGPT لهذي الصورة</p>
        <ul className="list-disc space-y-1 ps-4 text-[12px] text-muted-foreground">
          {prompt.keys.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>
        <Button type="button" size="sm" className="w-full gap-1.5" onClick={copy}>
          {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          {copied ? "تم النسخ" : "انسخ البرومبت"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
