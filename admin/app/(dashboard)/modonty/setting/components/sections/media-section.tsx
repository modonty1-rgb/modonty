"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, ExternalLink, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { validateHeroImageUrl } from "../../actions/page-actions";

interface MediaSectionProps {
  heroImage?: string;
  heroImageAlt?: string;
  onHeroImageChange?: (value: string) => void;
  onHeroImageAltChange?: (value: string) => void;
  headerAction?: React.ReactNode;
}

export function MediaSection({
  heroImage,
  heroImageAlt,
  onHeroImageChange,
  onHeroImageAltChange,
  headerAction,
}: MediaSectionProps) {
  const [previewOpen, setPreviewOpen] = useState(true);
  const [validating, setValidating] = useState(false);
  const [previewResult, setPreviewResult] = useState<{
    valid: boolean;
    enhancedUrl?: string;
    error?: string;
  } | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const heroUrl = (heroImage ?? "").trim();

  useEffect(() => {
    if (heroUrl) {
      setValidating(true);
      validateHeroImageUrl(heroUrl)
        .then((result) => {
          setPreviewResult(
            result.valid
              ? { valid: true, enhancedUrl: result.enhancedUrl }
              : { valid: false, error: result.error }
          );
          if (result.valid) setPreviewOpen(true);
        })
        .finally(() => setValidating(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePreview() {
    if (!heroUrl) return;
    setValidating(true);
    setPreviewResult(null);
    setImageSize(null);
    try {
      const result = await validateHeroImageUrl(heroUrl);
      setPreviewResult(
        result.valid
          ? { valid: true, enhancedUrl: result.enhancedUrl }
          : { valid: false, error: result.error }
      );
      if (result.valid) setPreviewOpen(true);
    } finally {
      setValidating(false);
    }
  }

  const displayUrl = previewResult?.valid && previewResult.enhancedUrl
    ? previewResult.enhancedUrl
    : heroUrl;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Media</CardTitle>
          <p className="text-sm text-amber-700 mt-1">
            Use one image for hero and social: paste the same Cloudinary (or Social / OG / Twitter) URL here. It appears at the top of the page and feeds JSON-LD primaryImageOfPage.
          </p>
        </div>
        {headerAction}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <Label htmlFor="heroImage">Hero Image URL</Label>
            <span className="text-xs text-amber-700 shrink-0">Ref: JSON-LD primaryImageOfPage</span>
          </div>
          <div className="flex gap-2">
            <Input
              id="heroImage"
              type="url"
              value={heroImage ?? ""}
              onChange={(e) => {
                onHeroImageChange?.(e.target.value);
                setPreviewResult(null);
                setImageSize(null);
              }}
              placeholder="https://res.cloudinary.com/.../image/upload/..."
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handlePreview}
              disabled={!heroUrl || validating}
            >
              {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Preview"}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <Label htmlFor="heroImageAlt">Hero Image Alt Text</Label>
            <span className="text-xs text-amber-700 shrink-0">Ref: accessibility / JSON-LD</span>
          </div>
          <Input
            id="heroImageAlt"
            value={heroImageAlt ?? ""}
            onChange={(e) => onHeroImageAltChange?.(e.target.value)}
            placeholder="e.g. Page hero image alt"
          />
        </div>

        <Collapsible open={previewOpen} onOpenChange={setPreviewOpen}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded border bg-muted/50 px-3 py-2 text-left text-sm font-medium hover:bg-muted"
            >
              <span>Hero preview</span>
              {previewOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 rounded border bg-background overflow-hidden">
              {previewResult && !previewResult.valid ? (
                <p className="text-sm text-destructive px-3 py-3">{previewResult.error}</p>
              ) : previewResult?.valid && displayUrl ? (
                <>
                  {previewResult.enhancedUrl && (
                    <p className="text-xs text-muted-foreground px-3 pt-1 break-all">
                      <a
                        href={previewResult.enhancedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-primary hover:underline"
                      >
                        {previewResult.enhancedUrl}
                      </a>
                      {" "}
                      <a
                        href={previewResult.enhancedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                        title="Open in new tab"
                      >
                        <ExternalLink className="h-3 w-3 inline" />
                      </a>
                    </p>
                  )}
                  <div className="w-full min-h-[120px] flex items-center justify-center bg-muted overflow-hidden relative">
                    {imageSize ? (
                      <Image
                        src={displayUrl}
                        alt={heroImageAlt ?? ""}
                        width={imageSize.width}
                        height={imageSize.height}
                        className="max-w-full h-auto object-contain"
                        sizes="(max-width: 768px) 100vw, 1128px"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <Image
                        src={displayUrl}
                        alt={heroImageAlt ?? ""}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 1128px"
                        onLoad={(e) => {
                          const img = e.target as HTMLImageElement;
                          setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                  </div>
                  {heroImageAlt && (
                    <p className="text-xs text-muted-foreground px-3 pb-2">Alt: {heroImageAlt}</p>
                  )}
                </>
              ) : heroUrl ? (
                <p className="text-xs text-muted-foreground px-3 py-3">Click Preview to see the image.</p>
              ) : (
                <p className="text-xs text-muted-foreground px-3 py-3">Paste a Hero Image URL above and click Preview.</p>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
