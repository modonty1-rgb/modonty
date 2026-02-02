"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BarChart3,
  Target,
  CheckCircle2,
  Info,
  ArrowLeft,
  Zap,
  TrendingUp,
} from "lucide-react";

export default function AnalyticsGuidelinesPage() {
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
        <h1 className="text-3xl font-semibold">Analytics Guidelines</h1>
        <p className="text-muted-foreground">
          Performance tracking, Core Web Vitals optimization, engagement metrics, and monitoring best practices.
        </p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Analytics & Performance</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Track and optimize content performance for better SEO and user experience
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Core Web Vitals (2025 Standard)</h4>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 text-sm">
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium mb-2">Performance Metrics:</p>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong>LCP (Largest Contentful Paint):</strong> Target &lt; 2.5s
                              <p className="text-xs text-muted-foreground mt-1">
                                Measures loading performance
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong>CLS (Cumulative Layout Shift):</strong> Target &lt; 0.1
                              <p className="text-xs text-muted-foreground mt-1">
                                Measures visual stability
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong>INP (Interaction to Next Paint):</strong> Target &lt; 200ms
                              <p className="text-xs text-muted-foreground mt-1">
                                Measures interactivity (replaced FID in 2024)
                              </p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium mb-2">Additional Metrics:</p>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong>TBT (Total Blocking Time):</strong> Target &lt; 200ms
                              <p className="text-xs text-muted-foreground mt-1">
                                Measures responsiveness
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong>TTFB (Time to First Byte):</strong> Target &lt; 800ms
                              <p className="text-xs text-muted-foreground mt-1">
                                Measures server response time
                              </p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Engagement Metrics</h4>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-medium mb-2">Key Metrics to Track:</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span><strong>Time on Page:</strong> Average time users spend reading</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span><strong>Scroll Depth:</strong> How far users scroll (0-100%)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span><strong>Bounce Rate:</strong> Percentage of single-page sessions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span><strong>Traffic Sources:</strong> Organic, direct, referral, social, email</span>
                        </li>
                      </ul>
                    </div>
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
