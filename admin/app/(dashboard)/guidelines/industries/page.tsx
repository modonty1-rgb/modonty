"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Briefcase,
  Target,
  CheckCircle2,
  Info,
  ArrowLeft,
} from "lucide-react";

export default function IndustriesGuidelinesPage() {
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
        <h1 className="text-3xl font-semibold">Industry Guidelines</h1>
        <p className="text-muted-foreground">
          Industry classification, SEO requirements, and industry-specific optimization.
        </p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Briefcase className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Industry Classification</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Properly classify clients by industry for better organization and targeting
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Industry Setup</h4>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-medium mb-2">Required Fields:</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong>Name:</strong> Industry name (e.g., "Technology", "Healthcare", "Finance")
                            <p className="text-xs text-muted-foreground mt-1">
                              Use standard industry classifications
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong>Slug:</strong> SEO-friendly URL (auto-generated)
                            <p className="text-xs text-muted-foreground mt-1">
                              Example: "technology" not "Technology"
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
                        <span>Use standard industry classifications (NAICS, SIC codes)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Keep industry list manageable (10-20 main industries)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Assign clients to most specific industry category</span>
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
