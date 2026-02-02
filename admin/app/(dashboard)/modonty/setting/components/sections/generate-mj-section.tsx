"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Sparkles, CheckCircle, XCircle, Info, Save, Copy, Check, ScanSearch } from "lucide-react";
import {
  previewPageSeo,
  savePageSeo,
  type PageKey,
  type PreviewSeoData,
} from "../../actions/generate-home-and-list-page-seo";
import {
  type InspectType,
  PAGE_LABELS,
  TYPE_LABELS,
  getSourceMeta,
} from "../../helpers/inspect-meta";
import { SESSION_KEY } from "@/app/(dashboard)/inspect/helpers/constants";
import { useToast } from "@/hooks/use-toast";

export interface GeneratedSeoData {
  homeMetaTags?: unknown;
  jsonLdStructuredData?: string | null;
  jsonLdLastGenerated?: Date | string | null;
  jsonLdValidationReport?: unknown;
  clientsPageMetaTags?: unknown;
  clientsPageJsonLdStructuredData?: string | null;
  clientsPageJsonLdLastGenerated?: Date | string | null;
  clientsPageJsonLdValidationReport?: unknown;
  categoriesPageMetaTags?: unknown;
  categoriesPageJsonLdStructuredData?: string | null;
  categoriesPageJsonLdLastGenerated?: Date | string | null;
  categoriesPageJsonLdValidationReport?: unknown;
  trendingPageMetaTags?: unknown;
  trendingPageJsonLdStructuredData?: string | null;
  trendingPageJsonLdLastGenerated?: Date | string | null;
  trendingPageJsonLdValidationReport?: unknown;
}

interface GenerateMJSectionProps {
  generatedSeo: GeneratedSeoData;
  onRegenerated?: () => void;
}

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  try {
    const date = typeof d === "string" ? new Date(d) : d;
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString();
  } catch {
    return "—";
  }
}

function safeStringify(value: unknown, pretty = true): string {
  if (value == null) return "";
  if (typeof value === "string") return pretty ? tryPrettyJson(value) : value;
  try {
    return JSON.stringify(
      value,
      (_, v) => (typeof v === "bigint" ? String(v) : v),
      pretty ? 2 : undefined
    );
  } catch {
    return "[Unable to display — invalid or circular data]";
  }
}

function tryPrettyJson(str: string): string {
  try {
    const parsed = JSON.parse(str) as unknown;
    return JSON.stringify(parsed, null, 2);
  } catch {
    return str;
  }
}

function isValidReport(report: unknown): boolean {
  if (report == null || typeof report !== "object") return false;
  const r = report as { adobe?: { valid?: boolean }; ajv?: { valid?: boolean }; custom?: { errors?: unknown[] } };
  const adobe = r.adobe?.valid !== false;
  const ajv = r.ajv?.valid !== false;
  const noCustom = !(r.custom?.errors?.length);
  return adobe && ajv && noCustom;
}

function validationSummary(report: unknown): string {
  try {
    if (report == null || typeof report !== "object") return "No validation report.";
    const r = report as {
      adobe?: { valid?: boolean; errors?: Array<{ message?: string }> };
      ajv?: { valid?: boolean; errors?: string[] };
      custom?: { errors?: string[] };
    };
    const parts: string[] = [];
    if (r.adobe?.valid === false && r.adobe?.errors?.length) {
      const msg = (r.adobe.errors[0] as { message?: string })?.message ?? "Invalid";
      parts.push(`Adobe: ${msg}`);
    }
    if (r.ajv?.valid === false && r.ajv?.errors?.length) {
      parts.push(`Schema: ${r.ajv.errors[0] ?? "Invalid"}`);
    }
    if (r.custom?.errors?.length) {
      parts.push(`Rules: ${r.custom.errors[0] ?? "Invalid"}`);
    }
    return parts.length ? parts.join(" • ") : "Validation failed (see report).";
  } catch {
    return "Validation failed (see report).";
  }
}

const RETURN_URL = "/settings?tab=generate-mj";

function getSavedData(seo: GeneratedSeoData, page: PageKey) {
  switch (page) {
    case "home":
      return {
        metaTags: seo.homeMetaTags,
        jsonLd: seo.jsonLdStructuredData ?? null,
        lastGenerated: seo.jsonLdLastGenerated,
        report: seo.jsonLdValidationReport,
      };
    case "clients":
      return {
        metaTags: seo.clientsPageMetaTags,
        jsonLd: seo.clientsPageJsonLdStructuredData ?? null,
        lastGenerated: seo.clientsPageJsonLdLastGenerated,
        report: seo.clientsPageJsonLdValidationReport,
      };
    case "categories":
      return {
        metaTags: seo.categoriesPageMetaTags,
        jsonLd: seo.categoriesPageJsonLdStructuredData ?? null,
        lastGenerated: seo.categoriesPageJsonLdLastGenerated,
        report: seo.categoriesPageJsonLdValidationReport,
      };
    case "trending":
      return {
        metaTags: seo.trendingPageMetaTags,
        jsonLd: seo.trendingPageJsonLdStructuredData ?? null,
        lastGenerated: seo.trendingPageJsonLdLastGenerated,
        report: seo.trendingPageJsonLdValidationReport,
      };
  }
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 px-2 text-xs"
      onClick={handleCopy}
      title={`Copy ${label}`}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 mr-1 text-green-600" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3 w-3 mr-1" />
          Copy
        </>
      )}
    </Button>
  );
}

interface CodeBlockProps {
  title: string;
  content: string;
  maxHeight?: string;
  onViewClick?: (content: string, type: InspectType) => void;
  viewType?: InspectType;
}

function CodeBlock({ title, content, maxHeight = "max-h-40", onViewClick, viewType = "meta" }: CodeBlockProps) {
  const handleViewClick = onViewClick != null ? () => onViewClick(content, viewType) : undefined;
  return (
    <div className="min-w-0 overflow-hidden">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <h5 className="text-xs font-medium text-muted-foreground shrink-0">{title}</h5>
        <div className="flex items-center gap-1">
          {handleViewClick != null && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleViewClick}
              title={`Inspect ${title}`}
            >
              <ScanSearch className="h-3 w-3 mr-1" />
              Inspect
            </Button>
          )}
          <CopyButton text={content} label={title} />
        </div>
      </div>
      <pre className={`${maxHeight} overflow-y-auto rounded-md border bg-muted/30 p-2 text-xs whitespace-pre-wrap break-words`}>
        {content}
      </pre>
    </div>
  );
}

interface DataSectionProps {
  label: string;
  page: PageKey;
  metaTags: unknown;
  jsonLd: string | null;
  report: unknown;
  valid: boolean;
  errors?: string[];
  lastSaved?: Date | string | null;
  isPreview?: boolean;
  onPreviewView?: (content: string, type: InspectType) => void;
  onSavedView?: (content: string, type: InspectType) => void;
  hideViewButtons?: boolean;
}

function DataSection({ label, page, metaTags, jsonLd, report, valid, errors, lastSaved, isPreview, onPreviewView, onSavedView, hideViewButtons }: DataSectionProps) {
  const metaJson = metaTags != null ? safeStringify(metaTags) : null;
  const jsonLdStr = typeof jsonLd === "string" && jsonLd.length > 0 ? tryPrettyJson(jsonLd) : null;
  const reportJson = report != null ? safeStringify(report) : null;
  const summary = validationSummary(report);
  const viewHandler = isPreview ? onPreviewView : onSavedView;
  const viewMeta = !hideViewButtons && viewHandler && metaJson ? viewHandler : undefined;
  const viewJsonLd = !hideViewButtons && viewHandler && jsonLdStr ? viewHandler : undefined;
  const viewReport = !hideViewButtons && viewHandler && reportJson ? viewHandler : undefined;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`text-sm font-semibold ${isPreview ? "text-blue-600 dark:text-blue-400" : ""}`}>
            {label}
          </span>
          {lastSaved && (
            <>
              <span className="text-xs text-muted-foreground">Last saved:</span>
              <span className="text-xs text-muted-foreground">{formatDate(lastSaved)}</span>
            </>
          )}
          {valid ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-green-500/10 px-2 py-0.5 text-sm text-green-700 dark:text-green-400">
              <CheckCircle className="h-4 w-4 shrink-0" />
              Valid
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-destructive/10 px-2 py-0.5 text-sm text-destructive">
              <XCircle className="h-4 w-4 shrink-0" />
              Invalid
            </span>
          )}
        </div>
        {!valid && (errors?.length || summary) && (
          <p className="text-sm text-destructive break-words whitespace-pre-wrap">
            {errors?.join(" • ") || summary}
          </p>
        )}
      </div>

      {metaJson && (
        <CodeBlock
          title="Meta Tags"
          content={metaJson}
          maxHeight="max-h-40"
          onViewClick={viewMeta}
          viewType="meta"
        />
      )}
      {jsonLdStr && (
        <CodeBlock
          title="JSON-LD"
          content={jsonLdStr}
          maxHeight="max-h-48"
          onViewClick={viewJsonLd}
          viewType="jsonld"
        />
      )}
      {reportJson && (
        <CodeBlock
          title="Validation Report"
          content={reportJson}
          maxHeight="max-h-32"
          onViewClick={viewReport}
          viewType="report"
        />
      )}
    </div>
  );
}

interface PageTabContentProps {
  page: PageKey;
  savedData: GeneratedSeoData;
  preview: PreviewSeoData | null;
  generating: boolean;
  saving: boolean;
  onGenerate: () => void;
  onSave: () => void;
}

function PageTabContent({
  page,
  savedData,
  preview,
  generating,
  saving,
  onGenerate,
  onSave,
}: PageTabContentProps) {
  const router = useRouter();
  const saved = getSavedData(savedData, page);
  const hasSaved = saved.lastGenerated != null;
  const savedValid = isValidReport(saved.report);

  const openInspect = (payload: { source: string; content: string; sourceType?: "preview" | "saved"; field?: string; description?: string }) => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...payload, returnUrl: RETURN_URL }));
    router.push(`/inspect?from=session&returnUrl=${encodeURIComponent(RETURN_URL)}`);
  };

  const handlePreviewView = (content: string, type: InspectType) => {
    if (process.env.NODE_ENV === "development") {
      const fingerprint = `${content.length}:${content.slice(0, 80).replace(/\s/g, "")}`;
      sessionStorage.setItem("inspect-verify", fingerprint);
    }
    openInspect({
      source: `App Settings → Generate M/J → ${PAGE_LABELS[page]} → ${TYPE_LABELS[type]}`,
      content,
      sourceType: "preview",
      description: "Generated from Generate M/J tab. Not saved to database.",
    });
  };

  const handleSavedView = (content: string, type: InspectType) => {
    if (process.env.NODE_ENV === "development") {
      const fingerprint = `${content.length}:${content.slice(0, 80).replace(/\s/g, "")}`;
      sessionStorage.setItem("inspect-verify", fingerprint);
    }
    const { field, feeds } = getSourceMeta(page, type);
    openInspect({
      source: `App Settings → ${PAGE_LABELS[page]} → ${TYPE_LABELS[type]}`,
      content,
      sourceType: "saved",
      field: field ?? undefined,
      description: feeds,
    });
  };

  return (
    <div className="space-y-4 pt-2 min-w-0 overflow-hidden">
      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={onGenerate} disabled={generating || saving} variant="outline" size="sm">
          {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Generate Preview
        </Button>
        <Button onClick={onSave} disabled={!preview || saving || generating} size="sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save
        </Button>
        {preview && (
          <span className="text-xs text-amber-600 dark:text-amber-500">Unsaved preview below</span>
        )}
      </div>

      {/* Preview section (unsaved) */}
      {preview && (
        <div className="rounded-lg border-2 border-blue-500/50 bg-blue-500/5 p-3">
          <DataSection
            label="Preview (unsaved)"
            page={page}
            metaTags={preview.metaTags}
            jsonLd={preview.jsonLd}
            report={preview.report}
            valid={preview.valid}
            errors={preview.errors}
            isPreview
            onPreviewView={handlePreviewView}
          />
        </div>
      )}

      {/* Saved section (from DB) */}
      {hasSaved ? (
        <DataSection
          label="Saved"
          page={page}
          metaTags={saved.metaTags}
          jsonLd={saved.jsonLd}
          report={saved.report}
          valid={savedValid}
          lastSaved={saved.lastGenerated}
          onSavedView={handleSavedView}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          No saved data yet. Click &quot;Generate Preview&quot; to create meta and JSON-LD, then click &quot;Save&quot; to persist.
        </p>
      )}
    </div>
  );
}

export function GenerateMJSection({ generatedSeo, onRegenerated }: GenerateMJSectionProps) {
  const { toast } = useToast();
  const [previews, setPreviews] = useState<Record<PageKey, PreviewSeoData | null>>({
    home: null,
    clients: null,
    categories: null,
    trending: null,
  });
  const [generatingPage, setGeneratingPage] = useState<PageKey | null>(null);
  const [savingPage, setSavingPage] = useState<PageKey | null>(null);

  const handleGenerate = async (page: PageKey) => {
    setGeneratingPage(page);
    try {
      const result = await previewPageSeo(page);
      if (result.success && result.data) {
        setPreviews((prev) => ({ ...prev, [page]: result.data! }));
        toast({
          title: "Preview ready",
          description: `${PAGE_LABELS[page]} preview generated. Click Save to persist.`,
        });
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } finally {
      setGeneratingPage(null);
    }
  };

  const handleSave = async (page: PageKey) => {
    const preview = previews[page];
    if (!preview) return;

    setSavingPage(page);
    try {
      const result = await savePageSeo(page, preview);
      if (result.success) {
        setPreviews((prev) => ({ ...prev, [page]: null }));
        toast({
          title: "Saved",
          description: `${PAGE_LABELS[page]} SEO data saved to database.`,
        });
        onRegenerated?.();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } finally {
      setSavingPage(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4" />
          Generate M/J (Home & list pages)
        </CardTitle>
        <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-2.5 text-sm min-w-0">
          <Info className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500 mt-0.5" />
          <div className="min-w-0 flex-1 break-words">
            <span className="font-medium text-foreground">How it works:</span>{" "}
            Click <strong>Generate Preview</strong> to create meta and JSON-LD (not saved yet).
            Review the preview, then click <strong>Save</strong> to persist to database.
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="home" className="w-full min-w-0">
          <TabsList className="flex w-full min-w-0 overflow-x-auto flex-nowrap gap-0.5 p-1 h-auto">
            {(["home", "clients", "categories", "trending"] as PageKey[]).map((page) => (
              <TabsTrigger key={page} value={page} className="shrink-0 px-3 py-2">
                {PAGE_LABELS[page]}
                {previews[page] && (
                  <span className="ml-1.5 h-2 w-2 rounded-full bg-blue-500" title="Unsaved preview" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {(["home", "clients", "categories", "trending"] as PageKey[]).map((page) => (
            <TabsContent key={page} value={page} className="mt-4 min-w-0">
              <PageTabContent
                page={page}
                savedData={generatedSeo}
                preview={previews[page]}
                generating={generatingPage === page}
                saving={savingPage === page}
                onGenerate={() => handleGenerate(page)}
                onSave={() => handleSave(page)}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
