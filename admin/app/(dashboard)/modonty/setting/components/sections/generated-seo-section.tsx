"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Copy, RefreshCw, Loader2, ChevronRight, Save, ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { generateModontyPageSEO } from "../../actions/generate-modonty-page-seo";
import { getLivePreviewSEO } from "../../actions/get-live-preview-seo";
import { saveGeneratedSeoFromForm } from "../../actions/save-generated-seo-from-form";
import { validateLivePreviewSEO } from "../../actions/validate-modonty-seo";
import type { ValidateModontySEOReport } from "../../actions/validate-modonty-seo";
import { useToast } from "@/hooks/use-toast";
import type { PageFormData } from "../../helpers/page-schema";

const LIVE_PREVIEW_DEBOUNCE_MS = 450;

interface GeneratedSEOSectionProps {
  slug: string;
  formData?: PageFormData;
  metaTags?: unknown;
  jsonLdStructuredData?: string | null;
  jsonLdLastGenerated?: string | Date | null;
  onRegenerated?: () => void;
  onValidated?: (report: ValidateModontySEOReport) => void;
  showRegenerateButton?: boolean;
}

export function GeneratedSEOSection({
  slug,
  formData,
  metaTags,
  jsonLdStructuredData,
  jsonLdLastGenerated,
  onRegenerated,
  onValidated,
  showRegenerateButton = true,
}: GeneratedSEOSectionProps) {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [livePreview, setLivePreview] = useState<{ metaTags: Record<string, unknown>; jsonLd: string } | null>(null);
  const [livePreviewLoading, setLivePreviewLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lastGen = jsonLdLastGenerated
    ? new Date(jsonLdLastGenerated).toLocaleString()
    : null;

  useEffect(() => {
    if (!formData || !slug) {
      setLivePreview(null);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      setLivePreviewLoading(true);
      getLivePreviewSEO(slug, formData).then((result) => {
        setLivePreviewLoading(false);
        if ("error" in result) setLivePreview(null);
        else setLivePreview({ metaTags: result.metaTags, jsonLd: result.jsonLd });
      }).catch(() => {
        setLivePreviewLoading(false);
        setLivePreview(null);
      });
    }, LIVE_PREVIEW_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [slug, formData]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard` });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await generateModontyPageSEO(slug);
      if (result.success) {
        toast({ title: "Success", description: "Meta tags and JSON-LD generated" });
        onRegenerated?.();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveLivePreview = async () => {
    if (!formData) return;
    setSaving(true);
    try {
      const result = await saveGeneratedSeoFromForm(slug, formData);
      if (result.success) {
        toast({ title: "Saved", description: "Live preview saved to database" });
        onRegenerated?.();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleValidateLive = async () => {
    if (!formData) return;
    setValidating(true);
    try {
      const result = await validateLivePreviewSEO(slug, formData);
      if (result.success) {
        onValidated?.(result.report);
        toast({ title: "Done", description: "Live validation complete" });
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } finally {
      setValidating(false);
    }
  };

  const hasStoredData = metaTags != null || (jsonLdStructuredData != null && jsonLdStructuredData !== "");

  return (
    <Collapsible defaultOpen className="rounded-lg border bg-card">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3">
          <CollapsibleTrigger className="flex flex-1 items-center gap-2 text-left [&[data-state=open]>svg]:rotate-90">
            <ChevronRight className="h-4 w-4 shrink-0 transition-transform" />
            <CardTitle className="text-base">Generated SEO</CardTitle>
          </CollapsibleTrigger>
          {showRegenerateButton && (
            <Button
              type="button"
              size="sm"
              variant={hasStoredData ? "outline" : "default"}
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : hasStoredData ? <RefreshCw className="h-4 w-4 mr-2" /> : null}
              {hasStoredData ? "Regenerate" : "Generate Meta Tags & JSON-LD"}
            </Button>
          )}
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {formData != null && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3">
                  <CardTitle className="text-sm font-medium">Live preview (from current form)</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleValidateLive}
                      disabled={validating || livePreviewLoading || livePreview == null}
                    >
                      {validating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                      Validate Meta & JSON-LD
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="default"
                      onClick={handleSaveLivePreview}
                      disabled={saving || livePreviewLoading || livePreview == null}
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Save
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {livePreviewLoading && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Updating…
                    </p>
                  )}
                  {!livePreviewLoading && livePreview != null && (
                    <>
                      <div>
                        <div className="flex flex-row items-center justify-between mb-2">
                          <span className="text-xs font-medium text-muted-foreground">Meta Tags</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(JSON.stringify(livePreview.metaTags, null, 2), "Meta tags")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <pre className="p-3 bg-muted rounded text-xs overflow-visible whitespace-pre-wrap break-all">
                          {JSON.stringify(livePreview.metaTags, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <div className="flex flex-row items-center justify-between mb-2">
                          <span className="text-xs font-medium text-muted-foreground">JSON-LD</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(livePreview.jsonLd, "JSON-LD")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <pre className="p-3 bg-muted rounded text-xs overflow-visible whitespace-pre-wrap break-all">
                          {livePreview.jsonLd}
                        </pre>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3">
                <CardTitle className="text-sm font-medium">Stored (from database)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {!hasStoredData && (
                  <p className="text-sm text-muted-foreground">
                    No stored data. Click Save (Live preview) or Regenerate above.
                  </p>
                )}
                {metaTags != null && (
                  <div>
                    <div className="flex flex-row items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Meta Tags</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(JSON.stringify(metaTags, null, 2), "Meta tags")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <pre className="p-3 bg-muted rounded text-xs overflow-visible whitespace-pre-wrap break-all">
                      {JSON.stringify(metaTags, null, 2)}
                    </pre>
                  </div>
                )}
                {jsonLdStructuredData != null && jsonLdStructuredData !== "" && (
                  <div>
                    <div className="flex flex-row items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">JSON-LD</span>
                        {lastGen && <span className="text-xs text-muted-foreground">{lastGen}</span>}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(jsonLdStructuredData, "JSON-LD")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <pre className="p-3 bg-muted rounded text-xs overflow-visible whitespace-pre-wrap break-all">
                      {jsonLdStructuredData}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
