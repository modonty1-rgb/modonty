import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Link2, Navigation } from "lucide-react";
import { Article } from "../helpers/article-view-types";
import { FieldLabel } from "./shared/field-label";

interface ArticleViewSeoProps {
  article: Article;
  sectionRef: (el: HTMLElement | null) => void;
}

export function ArticleViewSeo({ article, sectionRef }: ArticleViewSeoProps) {
  return (
    <Card id="section-seo" ref={sectionRef} className="scroll-mt-20">
      <CardHeader className="text-right" dir="rtl">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          <CardTitle className="text-right">SEO</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4" dir="rtl">
        <div className="space-y-1">
          <FieldLabel
            label="SEO Title"
            fieldPath="article.seoTitle"
            fieldType="String?"
          />
          <p className="text-sm font-medium">
            {article.seoTitle || <span className="text-muted-foreground italic">Missing</span>}
          </p>
        </div>
        <div className="space-y-1">
          <FieldLabel
            label="SEO Description"
            fieldPath="article.seoDescription"
            fieldType="String?"
          />
          <p className="text-sm line-clamp-3">
            {article.seoDescription || (
              <span className="text-muted-foreground italic">Missing</span>
            )}
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Link2 className="h-3 w-3 text-muted-foreground" />
            <FieldLabel
              label="Canonical URL"
              fieldPath="article.canonicalUrl"
              fieldType="String?"
            />
          </div>
          <p className="text-sm">
            {article.canonicalUrl ? (
              <span className="font-mono text-xs break-all text-primary">
                {article.canonicalUrl}
              </span>
            ) : (
              <span className="text-muted-foreground italic">Not set</span>
            )}
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Link2 className="h-3 w-3 text-muted-foreground" />
            <FieldLabel
              label="Main Entity of Page"
              fieldPath="article.mainEntityOfPage"
              fieldType="String?"
            />
          </div>
          <p className="text-sm">
            {article.mainEntityOfPage ? (
              <span className="font-mono text-xs break-all text-primary">
                {article.mainEntityOfPage}
              </span>
            ) : (
              <span className="text-muted-foreground italic">Not set</span>
            )}
          </p>
        </div>
        <div className="space-y-1">
          <FieldLabel
            label="Meta Robots"
            fieldPath="article.metaRobots"
            fieldType="String?"
          />
          <p className="text-sm font-medium">
            {article.metaRobots || <span className="text-muted-foreground italic">Not set</span>}
          </p>
        </div>
        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center gap-1">
            <Navigation className="h-3 w-3 text-muted-foreground" />
            <FieldLabel
              label="Breadcrumb Path"
              fieldPath="article.breadcrumbPath"
              fieldType="Json?"
            />
          </div>
          {article.breadcrumbPath ? (
            <div className="p-3 rounded border bg-muted/30">
              <pre className="text-xs font-mono overflow-auto max-h-64">
                <code>{JSON.stringify(article.breadcrumbPath, null, 2)}</code>
              </pre>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No breadcrumb path set</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
