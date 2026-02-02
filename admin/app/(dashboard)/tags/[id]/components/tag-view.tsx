"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import { SEOHealthGauge } from "@/components/shared/seo-doctor/seo-health-gauge";
import { tagSEOConfig } from "../../helpers/tag-seo-config";
import { ArticleStatus } from "@prisma/client";

interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  socialImage: string | null;
  socialImageAlt: string | null;
  createdAt: Date;
  updatedAt: Date;
  articles: Array<{
    article: {
      status: ArticleStatus;
    };
  }>;
}

interface TagViewProps {
  tag: Tag;
}

export function TagView({ tag }: TagViewProps) {
  const [basicOpen, setBasicOpen] = useState(true);
  const [seoOpen, setSeoOpen] = useState(true);

  const publishedArticlesCount = tag.articles.filter(
    (at) => at.article.status === ArticleStatus.PUBLISHED
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{tag.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          <SEOHealthGauge data={tag} config={tagSEOConfig} size="md" />
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/tags">Back</Link>
            </Button>
            <Button asChild>
              <Link href={`/tags/${tag.id}/edit`}>Edit</Link>
            </Button>
          </div>
        </div>
      </div>

      <Collapsible open={basicOpen} onOpenChange={setBasicOpen}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle>Basic Information</CardTitle>
              {basicOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Name</p>
                <p className="text-sm font-medium">{tag.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Slug</p>
                <p className="font-mono text-sm">{tag.slug}</p>
              </div>
              {tag.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm whitespace-pre-wrap">{tag.description}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Articles</p>
                <Link
                  href={`/articles?tagId=${tag.id}`}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  {publishedArticlesCount} {publishedArticlesCount === 1 ? "article" : "articles"}
                </Link>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Created</p>
                <p className="text-sm">{format(new Date(tag.createdAt), "MMM d, yyyy")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                <p className="text-sm">{format(new Date(tag.updatedAt), "MMM d, yyyy")}</p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible open={seoOpen} onOpenChange={setSeoOpen}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle>SEO</CardTitle>
              {seoOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              {tag.seoTitle && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">SEO Title</p>
                  <p className="text-sm">{tag.seoTitle}</p>
                </div>
              )}
              {tag.seoDescription && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">SEO Description</p>
                  <p className="text-sm">{tag.seoDescription}</p>
                </div>
              )}
              {tag.socialImage && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Social Image</p>
                  <div className="space-y-2">
                    <div className="relative border rounded-lg overflow-hidden max-w-md">
                      <img
                        src={tag.socialImage}
                        alt={tag.socialImageAlt || "Social image"}
                        className="w-full h-auto max-h-64 object-contain"
                      />
                    </div>
                    {tag.socialImageAlt && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Alt Text</p>
                        <p className="text-sm">{tag.socialImageAlt}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
