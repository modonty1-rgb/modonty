"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle2, XCircle, Loader2, ShieldCheck, ChevronRight } from "lucide-react";
import { useState } from "react";
import { validateModontyPageSEO, type ValidateModontySEOReport } from "../../actions/validate-modonty-seo";
import { useToast } from "@/hooks/use-toast";

interface ValidationReportSectionProps {
  slug: string;
  report?: ValidateModontySEOReport | null;
  showValidateButton?: boolean;
}

export function ValidationReportSection({ slug, report: reportProp, showValidateButton = true }: ValidationReportSectionProps) {
  const { toast } = useToast();
  const [validating, setValidating] = useState(false);
  const [reportLocal, setReportLocal] = useState<ValidateModontySEOReport | null>(null);
  const report = reportProp ?? reportLocal;

  const handleValidate = async () => {
    setValidating(true);
    setReportLocal(null);
    try {
      const result = await validateModontyPageSEO(slug);
      if (result.success) {
        setReportLocal(result.report);
        toast({ title: "Done", description: "Validation complete" });
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } finally {
      setValidating(false);
    }
  };

  return (
    <Collapsible defaultOpen className="rounded-lg border bg-card">
      <div className="flex flex-row items-center justify-between px-4 py-3 hover:bg-muted/50 rounded-t-lg">
        <CollapsibleTrigger className="flex flex-1 items-center gap-2 text-left [&[data-state=open]>svg]:rotate-90">
          <ChevronRight className="h-4 w-4 shrink-0 transition-transform" />
          <span className="text-base font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Validation Report
          </span>
        </CollapsibleTrigger>
        {showValidateButton && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleValidate}
            disabled={validating}
          >
            {validating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Validate Meta & JSON-LD
          </Button>
        )}
      </div>
      <CollapsibleContent>
      <div className="px-4 pb-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          Run Adobe (Schema.org), AJV (JSON Schema), jsonld.js (expand), and custom business rules. Full report below.
        </p>

        {report && (
          <div className="space-y-4">
            {/* Meta */}
            <Card className="border-muted">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  Meta Tags
                  {report.meta.valid ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Valid
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" /> Issues
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {report.meta.errors.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-destructive space-y-0.5">
                    {report.meta.errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                )}
                {report.meta.warnings.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-amber-600 dark:text-amber-500 space-y-0.5">
                    {report.meta.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                )}
                {report.meta.valid && report.meta.warnings.length === 0 && (
                  <p className="text-sm text-muted-foreground">Required keys present.</p>
                )}
              </CardContent>
            </Card>

            {/* JSON-LD */}
            {report.jsonLd ? (
              <Card className="border-muted">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">JSON-LD (Adobe, AJV, jsonld.js, Custom)</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {/* Adobe */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      {report.jsonLd.adobe?.valid ? (
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      ) : (
                        <XCircle className="h-3 w-3 text-destructive" />
                      )}
                      Adobe (Schema.org)
                    </p>
                    {report.jsonLd.adobe?.errors?.length ? (
                      <ul className="list-disc list-inside text-xs text-destructive space-y-0.5">
                        {report.jsonLd.adobe.errors.map((e, i) => (
                          <li key={i}>{e.message}{e.path ? ` (${e.path})` : ""}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">Passed.</p>
                    )}
                  </div>

                  {/* AJV */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      {report.jsonLd.ajv?.valid ? (
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      ) : (
                        <XCircle className="h-3 w-3 text-destructive" />
                      )}
                      AJV (JSON Schema)
                    </p>
                    {report.jsonLd.ajv?.errors?.length ? (
                      <ul className="list-disc list-inside text-xs text-destructive space-y-0.5">
                        {report.jsonLd.ajv.errors.map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">Passed.</p>
                    )}
                  </div>

                  {/* jsonld.js */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      {report.jsonLd.jsonldJs?.valid ? (
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      ) : (
                        <XCircle className="h-3 w-3 text-destructive" />
                      )}
                      jsonld.js (expand)
                    </p>
                    {report.jsonLd.jsonldJs?.errors?.length ? (
                      <ul className="list-disc list-inside text-xs text-destructive space-y-0.5">
                        {report.jsonLd.jsonldJs.errors.map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">Passed.</p>
                    )}
                  </div>

                  {/* Custom */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      {report.jsonLd.custom?.errors?.length === 0 ? (
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      ) : (
                        <XCircle className="h-3 w-3 text-destructive" />
                      )}
                      Custom (business rules)
                    </p>
                    {report.jsonLd.custom?.errors?.length ? (
                      <ul className="list-disc list-inside text-xs text-destructive space-y-0.5">
                        {report.jsonLd.custom.errors.map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    ) : null}
                    {report.jsonLd.custom?.warnings?.length ? (
                      <ul className="list-disc list-inside text-xs text-amber-600 dark:text-amber-500 space-y-0.5 mt-1">
                        {report.jsonLd.custom.warnings.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    ) : null}
                    {report.jsonLd.custom?.errors?.length === 0 && !report.jsonLd.custom?.warnings?.length && (
                      <p className="text-xs text-muted-foreground">Passed.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <p className="text-sm text-muted-foreground">No JSON-LD stored for this page. Run Regenerate first.</p>
            )}
          </div>
        )}

        {!report && !validating && (
          <p className="text-sm text-muted-foreground">Click &quot;Validate Meta &amp; JSON-LD&quot; in the Live preview block above.</p>
        )}
      </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
