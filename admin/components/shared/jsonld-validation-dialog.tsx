"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ValidationReport } from "@/lib/seo/jsonld-validator";

interface JsonLdValidationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  validationReport: ValidationReport | null;
  isLoading?: boolean;
}

export function JsonLdValidationDialog({
  open,
  onOpenChange,
  validationReport,
  isLoading = false,
}: JsonLdValidationDialogProps) {
  const { toast } = useToast();

  const copyReport = () => {
    if (!validationReport) return;
    try {
      navigator.clipboard.writeText(JSON.stringify(validationReport, null, 2));
      toast({
        title: "نجح",
        description: "تم نسخ تقرير التحقق",
      });
    } catch {
      toast({
        title: "فشل",
        description: "فشل في النسخ",
        variant: "destructive",
      });
    }
  };

  if (!validationReport && !isLoading) {
    return null;
  }

  const adobeErrors = validationReport?.adobe?.errors || [];
  const adobeWarnings = validationReport?.adobe?.warnings || [];
  const ajvErrors = validationReport?.ajv?.errors || [];
  const ajvWarnings = validationReport?.ajv?.warnings || [];
  const customErrors = validationReport?.custom?.errors || [];
  const customWarnings = validationReport?.custom?.warnings || [];
  const customInfo = validationReport?.custom?.info || [];

  const totalErrors = adobeErrors.length + ajvErrors.length + customErrors.length;
  const totalWarnings = adobeWarnings.length + ajvWarnings.length + customWarnings.length;
  const isValid = totalErrors === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>نتائج التحقق من JSON-LD</DialogTitle>
              <DialogDescription>
                تقرير شامل للتحقق من صحة بيانات JSON-LD
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {isValid ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  صحيح
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  {totalErrors} خطأ
                </Badge>
              )}
              {totalWarnings > 0 && (
                <Badge variant="secondary" className="bg-yellow-500">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {totalWarnings} تحذير
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={copyReport}>
                <Copy className="h-4 w-4 mr-1" />
                نسخ التقرير
              </Button>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">جاري التحقق...</div>
          </div>
        ) : (
          <Tabs defaultValue="adobe" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="adobe" className="gap-2">
                Adobe
                {adobeErrors.length > 0 || adobeWarnings.length > 0 ? (
                  <Badge
                    variant={adobeErrors.length > 0 ? "destructive" : "secondary"}
                    className="h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {adobeErrors.length + adobeWarnings.length}
                  </Badge>
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </TabsTrigger>
              <TabsTrigger value="ajv" className="gap-2">
                Ajv
                {ajvErrors.length > 0 || ajvWarnings.length > 0 ? (
                  <Badge
                    variant={ajvErrors.length > 0 ? "destructive" : "secondary"}
                    className="h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {ajvErrors.length + ajvWarnings.length}
                  </Badge>
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </TabsTrigger>
              <TabsTrigger value="business" className="gap-2">
                Business Rules
                {customErrors.length > 0 || customWarnings.length > 0 ? (
                  <Badge
                    variant={customErrors.length > 0 ? "destructive" : "secondary"}
                    className="h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {customErrors.length + customWarnings.length}
                  </Badge>
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </TabsTrigger>
            </TabsList>

            {/* Adobe Validation Tab */}
            <TabsContent value="adobe" className="mt-4">
              <div className="max-h-[400px] overflow-y-auto">
                <div className="space-y-4">
                  {adobeErrors.length === 0 && adobeWarnings.length === 0 ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="h-5 w-5" />
                      <span>جميع فحوصات Adobe صحيحة</span>
                    </div>
                  ) : (
                    <>
                      {adobeErrors.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-destructive flex items-center gap-2">
                            <XCircle className="h-4 w-4" />
                            الأخطاء ({adobeErrors.length})
                          </h4>
                          {adobeErrors.map((error, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-destructive/50 bg-destructive/10 p-3"
                            >
                              <div className="text-sm font-medium text-destructive">
                                {error.message}
                              </div>
                              {error.path && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  المسار: {error.path}
                                </div>
                              )}
                              {error.property && (
                                <div className="text-xs text-muted-foreground">
                                  الخاصية: {error.property}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {adobeWarnings.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            التحذيرات ({adobeWarnings.length})
                          </h4>
                          {adobeWarnings.map((warning, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3"
                            >
                              <div className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                                {warning.message}
                              </div>
                              {warning.recommendation && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  التوصية: {warning.recommendation}
                                </div>
                              )}
                              {warning.path && (
                                <div className="text-xs text-muted-foreground">
                                  المسار: {warning.path}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Ajv Validation Tab */}
            <TabsContent value="ajv" className="mt-4">
              <div className="max-h-[400px] overflow-y-auto">
                <div className="space-y-4">
                  {ajvErrors.length === 0 && ajvWarnings.length === 0 ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="h-5 w-5" />
                      <span>جميع فحوصات Ajv صحيحة</span>
                    </div>
                  ) : (
                    <>
                      {ajvErrors.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-destructive flex items-center gap-2">
                            <XCircle className="h-4 w-4" />
                            الأخطاء ({ajvErrors.length})
                          </h4>
                          {ajvErrors.map((error, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-destructive/50 bg-destructive/10 p-3"
                            >
                              <div className="text-sm font-medium text-destructive">
                                {error}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {ajvWarnings.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            التحذيرات ({ajvWarnings.length})
                          </h4>
                          {ajvWarnings.map((warning, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3"
                            >
                              <div className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                                {warning}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Business Rules Tab */}
            <TabsContent value="business" className="mt-4">
              <div className="max-h-[400px] overflow-y-auto">
                <div className="space-y-4">
                  {customErrors.length === 0 && customWarnings.length === 0 && customInfo.length === 0 ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="h-5 w-5" />
                      <span>جميع قواعد العمل صحيحة</span>
                    </div>
                  ) : (
                    <>
                      {customErrors.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-destructive flex items-center gap-2">
                            <XCircle className="h-4 w-4" />
                            الأخطاء ({customErrors.length})
                          </h4>
                          {customErrors.map((error, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-destructive/50 bg-destructive/10 p-3"
                            >
                              <div className="text-sm font-medium text-destructive">
                                {error}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {customWarnings.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            التحذيرات ({customWarnings.length})
                          </h4>
                          {customWarnings.map((warning, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3"
                            >
                              <div className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                                {warning}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {customInfo.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            معلومات ({customInfo.length})
                          </h4>
                          {customInfo.map((info, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-3"
                            >
                              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                {info}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
