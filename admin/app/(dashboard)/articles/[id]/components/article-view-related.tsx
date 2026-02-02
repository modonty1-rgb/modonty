"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";
import { Article } from "../helpers/article-view-types";
import { FieldLabel } from "./shared/field-label";
import { CopyableId } from "./shared/copyable-id";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ArticleViewRelatedProps {
  article: Article;
  sectionRef: (el: HTMLElement | null) => void;
}

export function ArticleViewRelated({ article, sectionRef }: ArticleViewRelatedProps) {
  const hasData = article.relatedTo && article.relatedTo.length > 0;

  return (
    <Card id="section-related" ref={sectionRef} className="scroll-mt-20">
      <CardHeader className="text-right" dir="rtl">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <CardTitle className="text-right flex-1">Related Articles (Outgoing Links)</CardTitle>
          <FieldLabel
            label=""
            fieldPath="article.relatedTo"
            fieldType="RelatedArticle[]"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3" dir="rtl">
        <p className="text-xs text-muted-foreground mb-3">
          Articles that this article links to (outgoing relationships)
        </p>
        {hasData ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">ID</TableHead>
                <TableHead className="text-right">Title</TableHead>
                <TableHead className="text-right">Category</TableHead>
                <TableHead className="text-right">Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {article.relatedTo!.map((rel) => (
                <TableRow key={rel.id} className="cursor-pointer" onClick={() => {}}>
                  <TableCell className="whitespace-nowrap">
                    <CopyableId id={rel.related.id} label={rel.related.title} />
                  </TableCell>
                  <TableCell className="max-w-[260px]">
                    <Link
                      href={`/articles/${rel.related.id}`}
                      className="flex flex-col items-start gap-1 group"
                    >
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">
                        {rel.related.title}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono break-all">
                        /{rel.related.slug}
                      </span>
                      {rel.relationshipType && (
                        <Badge variant="secondary" className="text-[10px] uppercase">
                          {rel.relationshipType}
                        </Badge>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {rel.related.category?.name ?? "-"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {rel.related.tags && rel.related.tags.length > 0
                      ? rel.related.tags.map((tag) => tag.tag.name).join(", ")
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            This article doesn't link to any other articles yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
