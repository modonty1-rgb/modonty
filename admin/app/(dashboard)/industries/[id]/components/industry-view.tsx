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
import { industrySEOConfig } from "../../helpers/industry-seo-config";

interface Industry {
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
  _count: {
    clients: number;
  };
}

interface IndustryViewProps {
  industry: Industry;
}

export function IndustryView({ industry }: IndustryViewProps) {
  const [basicOpen, setBasicOpen] = useState(true);
  const [seoOpen, setSeoOpen] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{industry.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          <SEOHealthGauge data={industry} config={industrySEOConfig} size="md" />
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/industries">Back</Link>
            </Button>
            <Button asChild>
              <Link href={`/industries/${industry.id}/edit`}>Edit</Link>
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
                <p className="text-sm font-medium">{industry.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Slug</p>
                <p className="font-mono text-sm">{industry.slug}</p>
              </div>
              {industry.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm whitespace-pre-wrap">{industry.description}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Clients</p>
                <Link
                  href={`/clients?industryId=${industry.id}`}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  {industry._count.clients} {industry._count.clients === 1 ? "client" : "clients"}
                </Link>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Created</p>
                <p className="text-sm">{format(new Date(industry.createdAt), "MMM d, yyyy")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                <p className="text-sm">{format(new Date(industry.updatedAt), "MMM d, yyyy")}</p>
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
              {industry.seoTitle && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">SEO Title</p>
                  <p className="text-sm">{industry.seoTitle}</p>
                </div>
              )}
              {industry.seoDescription && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">SEO Description</p>
                  <p className="text-sm">{industry.seoDescription}</p>
                </div>
              )}
              {industry.socialImage && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Social Image</p>
                  <div className="space-y-2">
                    <div className="relative border rounded-lg overflow-hidden max-w-md">
                      <img
                        src={industry.socialImage}
                        alt={industry.socialImageAlt || "Social image"}
                        className="w-full h-auto max-h-64 object-contain"
                      />
                    </div>
                    {industry.socialImageAlt && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Alt Text</p>
                        <p className="text-sm">{industry.socialImageAlt}</p>
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
