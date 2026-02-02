"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FolderTree,
  Target,
  CheckCircle2,
  Info,
  ArrowLeft,
  Network,
} from "lucide-react";

export default function CategoriesGuidelinesPage() {
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
        <h1 className="text-3xl font-semibold">Category Guidelines</h1>
        <p className="text-muted-foreground">
          Category creation, hierarchy, SEO optimization, and organization best practices.
        </p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <FolderTree className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Category Management</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Organize content effectively with well-structured categories
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Network className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Category Structure</h4>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-medium mb-2">Hierarchical Organization:</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong>Parent Categories:</strong> Broad topics (e.g., "Technology", "Business")
                            <p className="text-xs text-muted-foreground mt-1">
                              Use for top-level organization
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong>Child Categories:</strong> Specific topics (e.g., "Web Development", "Marketing")
                            <p className="text-xs text-muted-foreground mt-1">
                              Creates logical content hierarchy
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
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">SEO Requirements</h4>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-medium mb-2">Required Fields:</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong>Name:</strong> Clear, descriptive category name
                            <p className="text-xs text-muted-foreground mt-1">
                              Use title case, be specific
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong>Slug:</strong> SEO-friendly URL (auto-generated)
                            <p className="text-xs text-muted-foreground mt-1">
                              Example: "web-development" not "Web Development"
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong>Description:</strong> Category overview (optional but recommended)
                            <p className="text-xs text-muted-foreground mt-1">
                              Helps users understand category purpose
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
                  <h4 className="font-semibold mb-4 text-sm">Best Practices</h4>
                  <div className="space-y-3 text-sm">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Keep category names concise and specific</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Avoid creating too many categories (aim for 5-10 main categories)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Use hierarchical structure for better organization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Ensure each category has at least 3-5 articles for relevance</span>
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
