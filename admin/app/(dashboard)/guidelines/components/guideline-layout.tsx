"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

interface GuidelineLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}

export function GuidelineLayout({
  title,
  description,
  children,
  backHref = "/guidelines",
  backLabel = "All Guidelines",
}: GuidelineLayoutProps) {
  return (
    <div className="container mx-auto max-w-[1128px] space-y-6">
      <div className="flex items-center gap-4">
        <Link href={backHref}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {backLabel}
          </Button>
        </Link>
      </div>

      <PageHeader title={title} description={description} />

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-6">
            <BookOpen className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                These guidelines are designed for SEO, Marketing, and Design teams. Follow these best practices to
                optimize content for search engines, improve user engagement, and maintain brand consistency.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {children}
    </div>
  );
}
