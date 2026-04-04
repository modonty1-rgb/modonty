"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, CheckCircle2, Code2, FileText } from "lucide-react";

interface SeoCachePreviewProps {
  jsonLd?: string | null;
  metaTags?: unknown;
  lastGenerated?: Date | null;
}

export function SeoCachePreview({ jsonLd, metaTags, lastGenerated }: SeoCachePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!jsonLd && !metaTags) return null;

  const formattedDate = lastGenerated
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(lastGenerated))
    : null;

  let parsedJsonLd: string | null = null;
  try {
    if (jsonLd) parsedJsonLd = JSON.stringify(JSON.parse(jsonLd), null, 2);
  } catch {
    parsedJsonLd = jsonLd ?? null;
  }

  const parsedMeta = metaTags ? JSON.stringify(metaTags, null, 2) : null;

  return (
    <Card className="mb-4 border-emerald-500/20 bg-emerald-500/[0.02]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-start"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-xs font-medium text-emerald-400">SEO Cache</span>
          {formattedDate && (
            <span className="text-[10px] text-muted-foreground">— {formattedDate}</span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <CardContent className="pt-0 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {parsedJsonLd && (
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Code2 className="h-3 w-3 text-blue-400" />
                  <span className="text-[10px] font-medium text-blue-400">JSON-LD</span>
                </div>
                <pre className="text-[10px] leading-relaxed font-mono bg-background/80 border border-border/50 rounded-md p-2.5 overflow-auto max-h-44 whitespace-pre-wrap">
                  {parsedJsonLd}
                </pre>
              </div>
            )}
            {parsedMeta && (
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <FileText className="h-3 w-3 text-violet-400" />
                  <span className="text-[10px] font-medium text-violet-400">Meta Tags</span>
                </div>
                <pre className="text-[10px] leading-relaxed font-mono bg-background/80 border border-border/50 rounded-md p-2.5 overflow-auto max-h-44 whitespace-pre-wrap">
                  {parsedMeta}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
