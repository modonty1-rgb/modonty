"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  RefreshCw,
  ChevronDown,
  Code,
  Eye,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ValidationReport } from "@/lib/seo/jsonld-validator";
import { previewAutoFix, autoFixArticle } from "@/lib/seo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Wrench, Loader2 } from "lucide-react";

interface JsonLdPreviewProps {
  jsonLd: object | null;
  validationReport: ValidationReport | null;
  isGenerating?: boolean;
  lastGenerated?: Date | null;
  articleId?: string;
  onRegenerate?: () => void;
  onAutoFix?: () => void;
}

export function JsonLdPreview({
  jsonLd,
  validationReport,
  isGenerating = false,
  lastGenerated,
  articleId,
  onRegenerate,
  onAutoFix,
}: JsonLdPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [autoFixDialogOpen, setAutoFixDialogOpen] = useState(false);
  const [autoFixPreview, setAutoFixPreview] = useState<any>(null);
  const [isPreviewingAutoFix, setIsPreviewingAutoFix] = useState(false);
  const [isApplyingAutoFix, setIsApplyingAutoFix] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    if (!jsonLd) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(jsonLd, null, 2));
      toast({
        title: "نجح",
        description: "تم نسخ JSON-LD",
      });
    } catch {
      toast({
        title: "فشل",
        description: "فشل في النسخ",
        variant: "destructive",
      });
    }
  };

  const openRichResultsTest = () => {
    if (!jsonLd) return;
    const encodedJsonLd = encodeURIComponent(JSON.stringify(jsonLd));
    window.open(
      `https://search.google.com/test/rich-results?code=${encodedJsonLd}`,
      "_blank"
    );
  };

  const handlePreviewAutoFix = async () => {
    if (!articleId) return;

    setIsPreviewingAutoFix(true);
    try {
      const preview = await previewAutoFix(articleId);
      setAutoFixPreview(preview);
      setAutoFixDialogOpen(true);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في معاينة الإصلاحات",
        variant: "destructive",
      });
    } finally {
      setIsPreviewingAutoFix(false);
    }
  };

  const handleApplyAutoFix = async () => {
    if (!articleId) return;

    setIsApplyingAutoFix(true);
    try {
      const result = await autoFixArticle(articleId);
      if (result.success) {
        toast({
          title: "نجح",
          description: `تم إصلاح ${result.fixes.length} مشكلة`,
        });
        setAutoFixDialogOpen(false);
        setAutoFixPreview(null);
        if (onAutoFix) {
          onAutoFix();
        }
        if (onRegenerate) {
          onRegenerate();
        }
      } else {
        toast({
          title: "فشل",
          description: result.error || "فشل في إصلاح المشاكل",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إصلاح المشاكل",
        variant: "destructive",
      });
    } finally {
      setIsApplyingAutoFix(false);
    }
  };

  // Calculate validation status
  const hasErrors =
    (validationReport?.adobe?.errors?.length ?? 0) > 0 ||
    (validationReport?.custom?.errors?.length ?? 0) > 0;
  const hasWarnings =
    (validationReport?.adobe?.warnings?.length ?? 0) > 0 ||
    (validationReport?.custom?.warnings?.length ?? 0) > 0;

  const getStatusBadge = () => {
    if (!jsonLd) {
      return <Badge variant="secondary">لم يتم التوليد</Badge>;
    }
    if (hasErrors) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          أخطاء
        </Badge>
      );
    }
    if (hasWarnings) {
      return (
        <Badge variant="secondary" className="gap-1 bg-yellow-500 text-white">
          <AlertTriangle className="h-3 w-3" />
          تحذيرات
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="gap-1 bg-green-500">
        <CheckCircle className="h-3 w-3" />
        صالح
      </Badge>
    );
  };

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">JSON-LD Knowledge Graph</CardTitle>
              {getStatusBadge()}
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CardDescription className="flex items-center gap-4 text-xs">
            {lastGenerated && (
              <span>
                آخر توليد:{" "}
                {new Date(lastGenerated).toLocaleString("ar-SA", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            )}
          </CardDescription>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRegenerate}
                disabled={isGenerating}
              >
                <RefreshCw
                  className={`ml-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`}
                />
                {isGenerating ? "جارٍ التوليد..." : "إعادة التوليد"}
              </Button>
              {articleId && (hasErrors || hasWarnings) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviewAutoFix}
                  disabled={isPreviewingAutoFix || isGenerating}
                >
                  {isPreviewingAutoFix ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري التحليل...
                    </>
                  ) : (
                    <>
                      <Wrench className="ml-2 h-4 w-4" />
                      إصلاح تلقائي
                    </>
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={!jsonLd}
              >
                <Copy className="ml-2 h-4 w-4" />
                نسخ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openRichResultsTest}
                disabled={!jsonLd}
              >
                <ExternalLink className="ml-2 h-4 w-4" />
                اختبار Rich Results
              </Button>
            </div>

            {/* Tabs for preview and validation */}
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preview" className="gap-2">
                  <Code className="h-4 w-4" />
                  المعاينة
                </TabsTrigger>
                <TabsTrigger value="validation" className="gap-2">
                  <Eye className="h-4 w-4" />
                  التحقق
                  {(hasErrors || hasWarnings) && (
                    <Badge
                      variant={hasErrors ? "destructive" : "secondary"}
                      className={`mr-1 h-5 w-5 rounded-full p-0 text-xs ${
                        hasWarnings ? "bg-yellow-500 text-white" : ""
                      }`}
                    >
                      {(validationReport?.adobe?.errors?.length ?? 0) +
                        (validationReport?.custom?.errors?.length ?? 0) +
                        (validationReport?.adobe?.warnings?.length ?? 0) +
                        (validationReport?.custom?.warnings?.length ?? 0)}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Preview tab */}
              <TabsContent value="preview" className="mt-4">
                {jsonLd ? (
                  <pre
                    className="max-h-96 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-50"
                    dir="ltr"
                  >
                    <code>{JSON.stringify(jsonLd, null, 2)}</code>
                  </pre>
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    لم يتم توليد JSON-LD بعد. اضغط على "إعادة التوليد" لإنشائه.
                  </div>
                )}
              </TabsContent>

              {/* Validation tab */}
              <TabsContent value="validation" className="mt-4 space-y-4">
                {validationReport ? (
                  <>
                    {/* Errors */}
                    {((validationReport.adobe?.errors?.length ?? 0) > 0 ||
                      (validationReport.custom?.errors?.length ?? 0) > 0) && (
                      <div className="space-y-2">
                        <h4 className="flex items-center gap-2 font-medium text-red-500">
                          <XCircle className="h-4 w-4" />
                          أخطاء (تمنع النشر)
                        </h4>
                        <ul className="space-y-1 text-sm">
                          {validationReport.adobe?.errors?.map((err, i) => (
                            <li
                              key={`adobe-err-${i}`}
                              className="rounded bg-red-50 p-2 text-red-700"
                            >
                              {err.message}
                              {err.path && (
                                <span className="mr-2 text-xs text-red-500">
                                  ({err.path})
                                </span>
                              )}
                            </li>
                          ))}
                          {validationReport.custom?.errors?.map((err, i) => (
                            <li
                              key={`custom-err-${i}`}
                              className="rounded bg-red-50 p-2 text-red-700"
                            >
                              {err}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Warnings */}
                    {((validationReport.adobe?.warnings?.length ?? 0) > 0 ||
                      (validationReport.custom?.warnings?.length ?? 0) > 0) && (
                      <div className="space-y-2">
                        <h4 className="flex items-center gap-2 font-medium text-yellow-600">
                          <AlertTriangle className="h-4 w-4" />
                          تحذيرات
                        </h4>
                        <ul className="space-y-1 text-sm">
                          {validationReport.adobe?.warnings?.map((warn, i) => (
                            <li
                              key={`adobe-warn-${i}`}
                              className="rounded bg-yellow-50 p-2 text-yellow-700"
                            >
                              {warn.message}
                            </li>
                          ))}
                          {validationReport.custom?.warnings?.map((warn, i) => (
                            <li
                              key={`custom-warn-${i}`}
                              className="rounded bg-yellow-50 p-2 text-yellow-700"
                            >
                              {warn}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Info */}
                    {(validationReport.custom?.info?.length ?? 0) > 0 && (
                      <div className="space-y-2">
                        <h4 className="flex items-center gap-2 font-medium text-blue-600">
                          معلومات
                        </h4>
                        <ul className="space-y-1 text-sm">
                          {validationReport.custom?.info?.map((info, i) => (
                            <li
                              key={`info-${i}`}
                              className="rounded bg-blue-50 p-2 text-blue-700"
                            >
                              {info}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Success message */}
                    {!hasErrors && !hasWarnings && (
                      <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-700">
                        <CheckCircle className="h-5 w-5" />
                        <span>JSON-LD صالح ومتوافق مع معايير Google</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    لا يوجد تقرير تحقق. قم بتوليد JSON-LD أولاً.
                  </div>
                )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </CollapsibleContent>
  </Card>
</Collapsible>

      {/* Auto-Fix Preview Dialog */}
      {articleId && (
        <Dialog open={autoFixDialogOpen} onOpenChange={setAutoFixDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>معاينة الإصلاحات التلقائية</DialogTitle>
            <DialogDescription>
              سيتم تطبيق الإصلاحات التالية على المقال. راجع التغييرات قبل التطبيق.
            </DialogDescription>
          </DialogHeader>

            <div className="space-y-4 py-4">
              {autoFixPreview?.fixes && autoFixPreview.fixes.length > 0 ? (
                <div className="space-y-3">
                  {autoFixPreview.fixes.map((fix: any, index: number) => (
                    <div
                      key={index}
                      className="rounded-lg border bg-muted/50 p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {fix.field}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {fix.reason}
                            </span>
                          </div>
                          <div className="text-sm space-y-1">
                            <div>
                              <span className="text-muted-foreground">القيمة الحالية:</span>{" "}
                              <span className="line-through text-red-500">
                                {fix.oldValue === null || fix.oldValue === undefined
                                  ? "غير موجود"
                                  : String(fix.oldValue)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">القيمة الجديدة:</span>{" "}
                              <span className="text-green-600 font-medium">
                                {fix.newValue === null || fix.newValue === undefined
                                  ? "غير موجود"
                                  : String(fix.newValue)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد إصلاحات متاحة
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setAutoFixDialogOpen(false);
                  setAutoFixPreview(null);
                }}
                disabled={isApplyingAutoFix}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleApplyAutoFix}
                disabled={isApplyingAutoFix || !autoFixPreview?.fixes || autoFixPreview.fixes.length === 0}
              >
                {isApplyingAutoFix ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري التطبيق...
                  </>
                ) : (
                  <>
                    <Wrench className="ml-2 h-4 w-4" />
                    تطبيق الإصلاحات
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
