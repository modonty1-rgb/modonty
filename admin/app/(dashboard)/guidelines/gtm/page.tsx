"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Code2,
  Settings,
  CheckCircle2,
  Info,
  ArrowLeft,
  BarChart3,
  Database,
  FileText,
  ExternalLink,
} from "lucide-react";

export default function GTMGuidelinesPage() {
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
        <h1 className="text-3xl font-semibold">Google Tag Manager (GTM) Guidelines</h1>
        <p className="text-muted-foreground">
          Complete guide for setting up and managing Google Tag Manager for multi-client analytics tracking.
        </p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Code2 className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">GTM Multi-Client Setup</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Single GTM container managing all clients with automatic client detection and tracking
                </p>
              </div>
            </div>

            <Tabs defaultValue="setup" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="setup">Setup</TabsTrigger>
                <TabsTrigger value="configuration">Configuration</TabsTrigger>
                <TabsTrigger value="tracking">Tracking</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="setup" className="space-y-6 mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Settings className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Initial Setup</h4>
                    </div>
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="font-medium mb-2">Step 1: Get GTM Container ID</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Go to <a href="https://tagmanager.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Tag Manager</a></li>
                          <li>Create a new container or select existing one</li>
                          <li>Copy Container ID (format: <code className="bg-muted px-1 rounded">GTM-XXXXXXX</code>)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-2">Step 2: Configure in Admin Dashboard</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Navigate to <strong>Settings</strong> → <strong>GTM Settings</strong></li>
                          <li>Enter GTM Container ID</li>
                          <li>Toggle <strong>Enable GTM</strong> to ON</li>
                          <li>Click <strong>Save</strong></li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-2">Step 3: Verify Setup</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Visit any article or client page</li>
                          <li>Open browser DevTools (F12)</li>
                          <li>Go to Console tab</li>
                          <li>Type: <code className="bg-muted px-1 rounded">window.dataLayer</code></li>
                          <li>Verify events with <code className="bg-muted px-1 rounded">client_id</code> and <code className="bg-muted px-1 rounded">article_id</code> appear</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold">How It Works</h4>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="font-medium mb-2">Single Container Architecture:</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li><strong>One GTM Container</strong> manages all clients</li>
                          <li><strong>Client Identification</strong> via unique <code className="bg-background px-1 rounded">client_id</code></li>
                          <li><strong>Automatic Detection</strong> - system detects client from URL</li>
                          <li><strong>No Manual Configuration</strong> needed per client</li>
                        </ul>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="font-medium mb-2">Data Flow:</p>
                        <p className="text-xs text-muted-foreground">
                          Visitor Views Page → System Detects Client → Data Sent to GTM → Analytics Tools (GA4, etc.)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="configuration" className="space-y-6 mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">GA4 Configuration</h4>
                    </div>
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="font-medium mb-2">Step 1: Create Custom Dimensions in GA4</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Go to Google Analytics → Admin → Custom Definitions → Custom Dimensions</li>
                          <li>Create <strong>Dimension 1: Client ID</strong> (Event scope, parameter: <code className="bg-muted px-1 rounded">client_id</code>)</li>
                          <li>Create <strong>Dimension 2: Client Slug</strong> (Event scope, parameter: <code className="bg-muted px-1 rounded">client_slug</code>)</li>
                          <li>Create <strong>Dimension 3: Client Name</strong> (Event scope, parameter: <code className="bg-muted px-1 rounded">client_name</code>)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-2">Step 2: Create Variables in GTM</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Go to <strong>Variables</strong> → <strong>User-Defined Variables</strong></li>
                          <li>Create <code className="bg-muted px-1 rounded">client_id</code> (Data Layer Variable, Version 2)</li>
                          <li>Create <code className="bg-muted px-1 rounded">client_slug</code> (Data Layer Variable, Version 2)</li>
                          <li>Create <code className="bg-muted px-1 rounded">client_name</code> (Data Layer Variable, Version 2)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-2">Step 3: Configure GA4 Tag</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Edit GA4 Configuration tag</li>
                          <li>Under <strong>Fields to Set</strong>, add: <code className="bg-muted px-1 rounded">client_id</code>, <code className="bg-muted px-1 rounded">client_slug</code>, <code className="bg-muted px-1 rounded">client_name</code></li>
                          <li>Map to Custom Dimensions (Dimension 1, 2, 3)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-2">Step 4: Create Trigger</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Create Custom Event trigger</li>
                          <li>Event name: <code className="bg-muted px-1 rounded">page_view</code> or <code className="bg-muted px-1 rounded">client_context</code></li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tracking" className="space-y-6 mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Database className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">What Gets Tracked</h4>
                    </div>
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="font-medium mb-2">Automatic Tracking:</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li><strong>Page Views</strong> - Every article/client page visit</li>
                          <li><strong>Client Context</strong> - Which client visitor is viewing</li>
                          <li><strong>Article Views</strong> - Specific article performance</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-2">Data Sent to GTM:</p>
                        <div className="bg-muted/50 p-3 rounded-lg mt-2">
                          <pre className="text-xs overflow-x-auto">
{`{
  "event": "page_view",
  "client_id": "507f1f77bcf86cd799439011",
  "client_slug": "techcorp-solutions",
  "client_name": "حلول التقنية المتقدمة",
  "article_id": "507f1f77bcf86cd799439012",
  "page_title": "Article Title",
  "page_location": "https://example.com/articles/slug"
}`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold">Best Practices</h4>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Always Include client_id</p>
                          <p className="text-xs text-muted-foreground">Every event should include client_id if available for proper segmentation</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Test Before Publishing</p>
                          <p className="text-xs text-muted-foreground">Always use GTM Preview mode before publishing changes</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Monitor Regularly</p>
                          <p className="text-xs text-muted-foreground">Check GA4 Real-Time reports daily to verify tracking</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Document Custom Events</p>
                          <p className="text-xs text-muted-foreground">Keep track of any custom events or client-specific tags</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6 mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Analytics Coverage</h4>
                    </div>
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="font-medium mb-2">Whole Client Analytics:</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Query by <code className="bg-muted px-1 rounded">client_id</code> to get all articles for a client</li>
                          <li>Total views, unique visitors, engagement metrics</li>
                          <li>Traffic sources, date range analytics</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-2">Single Article Analytics:</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Query by <code className="bg-muted px-1 rounded">article_id</code> for specific article</li>
                          <li>Views, unique visitors, time on page</li>
                          <li>Scroll depth, bounce rate, performance metrics</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-2">In GA4:</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Filter by Client Name or Client ID dimension</li>
                          <li>Create custom reports grouped by client</li>
                          <li>Compare client performance</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Documentation</h4>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <ExternalLink className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Technical Documentation</p>
                          <p className="text-xs text-muted-foreground">See <code className="bg-muted px-1 rounded">GTM-TECHNICAL-DOCUMENTATION.md</code> for developer guide</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <ExternalLink className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Marketing Guide</p>
                          <p className="text-xs text-muted-foreground">See <code className="bg-muted px-1 rounded">GTM-MARKETING-GUIDE.md</code> for marketing team guide</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
