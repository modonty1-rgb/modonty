import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Code } from "lucide-react";
import { Article } from "../helpers/article-view-types";
import { FieldLabel } from "./shared/field-label";

interface ArticleViewStructuredDataProps {
  article: Article;
  sectionRef: (el: HTMLElement | null) => void;
}

export function ArticleViewStructuredData({
  article,
  sectionRef,
}: ArticleViewStructuredDataProps) {
  return (
    <Card id="section-structured-data" ref={sectionRef} className="scroll-mt-20">
      <CardHeader className="text-right" dir="rtl">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-primary" />
          <CardTitle className="text-right">JSON-LD</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm" dir="rtl">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">JSON-LD Status</p>
          <div className="space-y-1.5">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Version:</span>
                <FieldLabel
                  label=""
                  fieldPath="article.jsonLdVersion"
                  fieldType="String?"
                />
              </div>
              <span className="font-medium">{article.jsonLdVersion ?? "—"}</span>
            </div>
            {article.jsonLdLastGenerated && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Last generated:</span>
                  <FieldLabel
                    label=""
                    fieldPath="article.jsonLdLastGenerated"
                    fieldType="DateTime?"
                  />
                </div>
                <span className="font-medium text-xs">
                  {format(new Date(article.jsonLdLastGenerated), "MMM d, yyyy")}
                </span>
              </div>
            )}
            {typeof article.jsonLdGenerationTimeMs === "number" && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Generation time:</span>
                  <FieldLabel
                    label=""
                    fieldPath="article.jsonLdGenerationTimeMs"
                    fieldType="Int?"
                  />
                </div>
                <span className="font-medium">{article.jsonLdGenerationTimeMs} ms</span>
              </div>
            )}
            {article.performanceBudgetMet !== undefined && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Budget:</span>
                  <FieldLabel
                    label=""
                    fieldPath="article.performanceBudgetMet"
                    fieldType="Boolean?"
                  />
                </div>
                <Badge
                  variant={
                    article.performanceBudgetMet === false
                      ? "destructive"
                      : article.performanceBudgetMet === true
                        ? "default"
                        : "secondary"
                  }
                  className="text-xs"
                >
                  {article.performanceBudgetMet === false
                    ? "Over budget"
                    : article.performanceBudgetMet === true
                      ? "Pass"
                      : "Unknown"}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {article.semanticKeywords &&
          Array.isArray(article.semanticKeywords) &&
          article.semanticKeywords.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">Semantic Keywords</p>
                <FieldLabel
                  label=""
                  fieldPath="article.semanticKeywords"
                  fieldType="Json?"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {article.semanticKeywords.slice(0, 8).map((kw, index) => {
                  const keyword =
                    typeof kw === "object" && kw !== null && "name" in kw
                      ? (kw as { name?: string | null })
                      : null;
                  return keyword?.name ? (
                    <Badge key={`${keyword.name}-${index}`} variant="outline" className="text-xs">
                      {keyword.name}
                    </Badge>
                  ) : null;
                })}
                {article.semanticKeywords.length > 8 && (
                  <Badge variant="secondary" className="text-xs">
                    +{article.semanticKeywords.length - 8}
                  </Badge>
                )}
              </div>
            </div>
          )}

        {article.citations && article.citations.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">Citations</p>
              <FieldLabel
                label=""
                fieldPath="article.citations"
                fieldType="String[]?"
              />
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {article.citations.slice(0, 3).map((url) => (
                <p key={url} className="font-mono text-[10px] break-all text-muted-foreground">
                  {url}
                </p>
              ))}
              {article.citations.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{article.citations.length - 3} more
                </p>
              )}
            </div>
          </div>
        )}

        {article.jsonLdStructuredData && (
          <div className="space-y-2 pt-2 border-t" dir="ltr">
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">JSON-LD Structured Data</p>
              <FieldLabel
                label=""
                fieldPath="article.jsonLdStructuredData"
                fieldType="String?"
              />
            </div>
            <div className="p-3 rounded border bg-muted/30">
              <pre className="text-xs font-mono overflow-auto max-h-96">
                <code>
                  {(() => {
                    try {
                      const parsed = JSON.parse(article.jsonLdStructuredData);
                      return JSON.stringify(parsed, null, 2);
                    } catch {
                      return article.jsonLdStructuredData;
                    }
                  })()}
                </code>
              </pre>
            </div>
          </div>
        )}

        {article.jsonLdValidationReport && (
          <div className="space-y-2 pt-2 border-t" dir="ltr">
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">JSON-LD Validation Report</p>
              <FieldLabel
                label=""
                fieldPath="article.jsonLdValidationReport"
                fieldType="Json?"
              />
            </div>
            <div className="p-3 rounded border bg-muted/30">
              <pre className="text-xs font-mono overflow-auto max-h-96">
                <code>{JSON.stringify(article.jsonLdValidationReport, null, 2)}</code>
              </pre>
            </div>
          </div>
        )}

        {article.jsonLdHistory && (
          <div className="space-y-2 pt-2 border-t" dir="ltr">
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">JSON-LD History</p>
              <FieldLabel
                label=""
                fieldPath="article.jsonLdHistory"
                fieldType="Json?"
              />
            </div>
            <div className="p-3 rounded border bg-muted/30">
              <pre className="text-xs font-mono overflow-auto max-h-96">
                <code>{JSON.stringify(article.jsonLdHistory, null, 2)}</code>
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
