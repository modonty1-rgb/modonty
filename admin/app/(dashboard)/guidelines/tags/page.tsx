"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Tag,
  Target,
  CheckCircle2,
  Info,
  ArrowLeft,
} from "lucide-react";

export default function TagsGuidelinesPage() {
  return (
    <div className="container mx-auto max-w-[1128px] space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/guidelines">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Guidelines
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Tag Guidelines</h1>
        <p className="text-muted-foreground">
          Tag creation, usage strategies, SEO best practices, and content organization.
        </p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Tag className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Tag Management</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Use tags effectively to improve content discoverability and organization
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Tag Best Practices</h4>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-medium mb-2">Tag Creation:</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong>Specific Tags:</strong> Use precise, descriptive tags
                            <p className="text-xs text-muted-foreground mt-1">
                              Example: "nextjs" not "web development"
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong>Consistent Naming:</strong> Use lowercase, hyphenated format
                            <p className="text-xs text-muted-foreground mt-1">
                              Example: "seo-tips" not "SEO Tips" or "seo_tips"
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong>Limit Per Article:</strong> 3-5 tags maximum
                            <p className="text-xs text-muted-foreground mt-1">
                              Too many tags dilutes relevance
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-4 text-sm">SEO Considerations</h4>
                  <div className="space-y-3 text-sm">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Tags help with internal linking and content discovery</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Use tags that match user search intent</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Avoid tag duplication - reuse existing tags when possible</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Tags create tag archive pages - ensure quality content</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
