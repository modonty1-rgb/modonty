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
import { categorySEOConfig } from "../../helpers/category-seo-config";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  parent: { id: string; name: string } | null;
  seoTitle: string | null;
  seoDescription: string | null;
  socialImage: string | null;
  socialImageAlt: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    articles: number;
    children: number;
  };
}

interface CategoryViewProps {
  category: Category;
}

export function CategoryView({ category }: CategoryViewProps) {
  const [basicOpen, setBasicOpen] = useState(true);
  const [seoOpen, setSeoOpen] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{category.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          <SEOHealthGauge data={category} config={categorySEOConfig} size="md" />
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/categories">Back</Link>
            </Button>
            <Button asChild>
              <Link href={`/categories/${category.id}/edit`}>Edit</Link>
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
                <p className="text-sm font-medium">{category.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Slug</p>
                <p className="font-mono text-sm">{category.slug}</p>
              </div>
              {category.parent && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Parent Category</p>
                  <Link
                    href={`/categories/${category.parentId}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {category.parent.name}
                  </Link>
                </div>
              )}
              {category.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm whitespace-pre-wrap">{category.description}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Articles</p>
                <Link
                  href={`/articles?categoryId=${category.id}`}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  {category._count.articles} {category._count.articles === 1 ? "article" : "articles"}
                </Link>
              </div>
              {category._count.children > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Child Categories</p>
                  <p className="text-sm font-medium">{category._count.children}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Created</p>
                <p className="text-sm">{format(new Date(category.createdAt), "MMM d, yyyy")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                <p className="text-sm">{format(new Date(category.updatedAt), "MMM d, yyyy")}</p>
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
              {category.seoTitle && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">SEO Title</p>
                  <p className="text-sm">{category.seoTitle}</p>
                </div>
              )}
              {category.seoDescription && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">SEO Description</p>
                  <p className="text-sm">{category.seoDescription}</p>
                </div>
              )}
              {category.socialImage && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Social Image</p>
                  <div className="space-y-2">
                    <div className="relative border rounded-lg overflow-hidden max-w-md">
                      <img
                        src={category.socialImage}
                        alt={category.socialImageAlt || "Social image"}
                        className="w-full h-auto max-h-64 object-contain"
                      />
                    </div>
                    {category.socialImageAlt && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Alt Text</p>
                        <p className="text-sm">{category.socialImageAlt}</p>
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
