"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { FileText, History } from "lucide-react";
import { Article, ContentStats } from "../helpers/article-view-types";
import { FieldLabel } from "./shared/field-label";
import { CopyableId } from "./shared/copyable-id";

interface ArticleViewInfoProps {
  article: Article;
  contentStats: ContentStats;
  sectionRef: (el: HTMLElement | null) => void;
}

export function ArticleViewInfo({ article, contentStats, sectionRef }: ArticleViewInfoProps) {
  return (
    <Card id="section-info" ref={sectionRef} className="scroll-mt-20">
      <CardHeader className="text-right" dir="rtl">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle className="text-right">Article Info</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4" dir="rtl">
        <div className="space-y-1">
          <FieldLabel
            label="Last Updated"
            fieldPath="article.updatedAt"
            fieldType="DateTime @updatedAt"
          />
          <p className="text-sm font-medium">
            {format(new Date(article.updatedAt), "MMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
        {article.datePublished && (
          <div className="space-y-1">
            <FieldLabel
              label="Published"
              fieldPath="article.datePublished"
              fieldType="DateTime?"
            />
            <p className="text-sm font-medium">
              {format(new Date(article.datePublished), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        )}
        {article.scheduledAt && (
          <div className="space-y-1">
            <FieldLabel
              label="Scheduled"
              fieldPath="article.scheduledAt"
              fieldType="DateTime?"
            />
            <p className="text-sm font-medium">
              {format(new Date(article.scheduledAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        )}
        <div className="pt-2 border-t space-y-4">
          <div className="space-y-1">
            <FieldLabel
              label="Language"
              fieldPath="article.inLanguage"
              fieldType="String"
            />
            <p className="text-sm font-medium">{article.inLanguage || "—"}</p>
          </div>
          {article.tags && article.tags.length > 0 && (
            <div className="space-y-2">
              <FieldLabel
                label="Tags"
                fieldPath="article.tags"
                fieldType="ArticleTag[]"
              />
              <div className="flex flex-wrap gap-1.5">
                {article.tags.map((t) => (
                  <div key={t.tag.id} className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-xs">
                      {t.tag.name}
                    </Badge>
                    <CopyableId id={t.tag.id} label="Tag" />
                  </div>
                ))}
              </div>
            </div>
          )}
          {article.versions && article.versions.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <FieldLabel
                  label="Versions"
                  fieldPath="article.versions"
                  fieldType="ArticleVersion[]"
                />
                <Badge variant="secondary" className="text-xs">
                  {article.versions.length}
                </Badge>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {article.versions.map((version, index) => (
                  <div key={version.id} className="flex flex-col gap-1 p-2 rounded border bg-muted/30 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Version {article.versions!.length - index}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(version.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                        {version.createdBy && (
                          <span className="text-xs text-muted-foreground">by {version.createdBy}</span>
                        )}
                      </div>
                      <CopyableId id={version.id} label="Version" />
                    </div>
                    <p className="text-xs font-medium truncate">{version.title}</p>
                    {version.seoTitle && version.seoTitle !== version.title && (
                      <p className="text-xs text-muted-foreground truncate">SEO: {version.seoTitle}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
