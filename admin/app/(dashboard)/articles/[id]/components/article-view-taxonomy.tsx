import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";
import { Article } from "../helpers/article-view-types";

interface ArticleViewTaxonomyProps {
  article: Article;
  sectionRef: (el: HTMLElement | null) => void;
}

export function ArticleViewTaxonomy({ article, sectionRef }: ArticleViewTaxonomyProps) {
  return (
    <Card id="section-taxonomy" ref={sectionRef} className="scroll-mt-20">
      <CardHeader className="text-right" dir="rtl">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          <CardTitle className="text-right">Taxonomy</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Language</p>
          <p className="text-sm font-medium">{article.inLanguage || "—"}</p>
        </div>
        {article.tags && article.tags.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {article.tags.map((t) => (
                <Badge key={t.tag.id} variant="outline" className="text-xs">
                  {t.tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
