"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface LivePreviewSectionProps {
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  socialImage: string;
}

export function LivePreviewSection({
  seoTitle,
  seoDescription,
  canonicalUrl,
  socialImage,
}: LivePreviewSectionProps) {
  const [open, setOpen] = useState(true);
  const title = seoTitle || "Page title";
  const desc = seoDescription || "Page description";
  const url = canonicalUrl || "https://modonty.com/page";
  const displayUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const img = socialImage || "";

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Search & Social Previews</CardTitle>
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Google</p>
              <div className="rounded border bg-background p-3 text-left">
                <p className="text-blue-600 dark:text-blue-400 text-lg truncate">{title}</p>
                <p className="text-green-700 dark:text-green-400 text-sm">{displayUrl}</p>
                <p className="text-muted-foreground text-sm line-clamp-2">{desc}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Facebook</p>
              <div className="rounded border bg-background overflow-hidden max-w-md">
                {img && (
                  <div className="aspect-video bg-muted">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-2">
                  <p className="text-muted-foreground text-xs uppercase">{displayUrl}</p>
                  <p className="font-medium truncate">{title}</p>
                  <p className="text-muted-foreground text-sm line-clamp-2">{desc}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Twitter</p>
              <div className="rounded border bg-background overflow-hidden max-w-md">
                {img && (
                  <div className="aspect-video bg-muted">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-2">
                  <p className="font-medium truncate">{title}</p>
                  <p className="text-muted-foreground text-sm line-clamp-2">{desc}</p>
                  <p className="text-muted-foreground text-xs">{displayUrl}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
