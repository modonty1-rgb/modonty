import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Share2 } from "lucide-react";
import { Article } from "../helpers/article-view-types";
import { FieldLabel } from "./shared/field-label";

interface ArticleViewSocialProps {
  article: Article;
  sectionRef: (el: HTMLElement | null) => void;
}

export function ArticleViewSocial({ article, sectionRef }: ArticleViewSocialProps) {
  return (
    <Card id="section-social" ref={sectionRef} className="scroll-mt-20">
      <CardHeader className="text-right" dir="rtl">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          <CardTitle className="text-right">Social & Protocols</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="text-sm" dir="rtl">
        <div className="flex flex-wrap gap-4 items-start">
          <div className="flex flex-col gap-1 min-w-[200px]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">OG Type:</span>
              <FieldLabel
                label=""
                fieldPath="article.ogType"
                fieldType="String?"
              />
            </div>
            <span className="font-medium text-sm">{article.ogType || "article"}</span>
          </div>

          {article.ogArticlePublishedTime && (
            <div className="flex flex-col gap-1 min-w-[200px]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">OG Published:</span>
                <FieldLabel
                  label=""
                  fieldPath="article.ogArticlePublishedTime"
                  fieldType="DateTime?"
                />
              </div>
              <span className="font-medium text-xs">
                {format(new Date(article.ogArticlePublishedTime), "MMM d, yyyy")}
              </span>
            </div>
          )}

          {article.ogArticleModifiedTime && (
            <div className="flex flex-col gap-1 min-w-[200px]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">OG Modified:</span>
                <FieldLabel
                  label=""
                  fieldPath="article.ogArticleModifiedTime"
                  fieldType="DateTime?"
                />
              </div>
              <span className="font-medium text-xs">
                {format(new Date(article.ogArticleModifiedTime), "MMM d, yyyy")}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-1 min-w-[200px]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Twitter Card:</span>
              <FieldLabel
                label=""
                fieldPath="article.twitterCard"
                fieldType="String?"
              />
            </div>
            <span className="font-medium text-sm">{article.twitterCard || "Not set"}</span>
          </div>

          {article.twitterSite && (
            <div className="flex flex-col gap-1 min-w-[200px]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Twitter Site:</span>
                <FieldLabel
                  label=""
                  fieldPath="article.twitterSite"
                  fieldType="String?"
                />
              </div>
              <span className="font-medium text-sm">{article.twitterSite}</span>
            </div>
          )}

          {article.twitterCreator && (
            <div className="flex flex-col gap-1 min-w-[200px]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Twitter Creator:</span>
                <FieldLabel
                  label=""
                  fieldPath="article.twitterCreator"
                  fieldType="String?"
                />
              </div>
              <span className="font-medium text-sm">{article.twitterCreator}</span>
            </div>
          )}

          <div className="flex flex-col gap-1 min-w-[200px]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sitemap Priority:</span>
              <FieldLabel
                label=""
                fieldPath="article.sitemapPriority"
                fieldType="Float?"
              />
            </div>
            <span className="font-medium text-sm">
              {typeof article.sitemapPriority === "number"
                ? article.sitemapPriority.toFixed(2)
                : "Default"}
            </span>
          </div>

          <div className="flex flex-col gap-1 min-w-[200px]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Change Frequency:</span>
              <FieldLabel
                label=""
                fieldPath="article.sitemapChangeFreq"
                fieldType="String?"
              />
            </div>
            <span className="font-medium text-sm">{article.sitemapChangeFreq || "Default"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
