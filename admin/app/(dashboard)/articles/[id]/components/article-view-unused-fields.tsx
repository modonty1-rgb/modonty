import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database } from "lucide-react";
import { Article } from "../helpers/article-view-types";

interface ArticleViewUnusedFieldsProps {
  article: Article;
  sectionRef: (el: HTMLElement | null) => void;
}

export function ArticleViewUnusedFields({
  article,
  sectionRef,
}: ArticleViewUnusedFieldsProps) {
  const unusedFields = [
    // Technical SEO - Not Displayed

    // JSON-LD - Not Displayed
    { field: "article.jsonLdDiffSummary", value: article.jsonLdDiffSummary, type: "String?" },
  ]
    .map((field) => {
      const value = field.value;
      if (value === null || value === undefined) return null;
      return {
        ...field,
        displayValue:
          typeof value === "object" && value !== null
            ? JSON.stringify(value).substring(0, 100) + (JSON.stringify(value).length > 100 ? "..." : "")
            : String(value),
      };
    })
    .filter((field): field is NonNullable<typeof field> => field !== null);

  return (
    <Card id="section-unused-fields" ref={sectionRef} className="scroll-mt-20">
      <CardHeader className="text-right" dir="rtl">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <CardTitle className="text-right">Unused Database Fields</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4" dir="rtl">
        <p className="text-xs text-muted-foreground mb-4">
          Fields from the database schema that are not displayed in the view above. Useful for debugging.
        </p>
        {unusedFields.length > 0 ? (
          <div className="space-y-2">
            {unusedFields.map((field) => (
              <div key={field.field} className="flex flex-col gap-1 p-2 rounded border bg-muted/30">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-mono font-normal px-1.5 py-0 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800">
                    {field.field}
                  </Badge>
                  <span className="text-xs text-muted-foreground">({field.type})</span>
                </div>
                <span className="text-sm font-medium break-all">{field.displayValue}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">All available fields are displayed above.</p>
        )}
        <div className="mt-6 pt-4 border-t">
          <p className="text-xs font-semibold mb-2">Complete List of Unused DB Fields (from schema):</p>
          <div className="space-y-1 text-xs text-muted-foreground font-mono">
            <div>• article.analytics (Analytics[]) - Relation used in queries/exports but not displayed in view (accessed via API)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
