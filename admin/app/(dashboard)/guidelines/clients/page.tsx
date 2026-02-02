"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Building2,
  Target,
  CheckCircle2,
  ArrowLeft,
  Image as ImageIcon,
  Globe,
  Settings,
  FileText,
  Mail,
  MapPin,
  Tag,
  Code2,
  BarChart3,
  Hash,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { CLIENT_FIELD_MAPPINGS, getFieldsByCategory, type FieldMapping } from "../../clients/helpers/client-field-mapping";

export default function ClientsGuidelinesPage() {
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
        <h1 className="text-3xl font-semibold">Client Guidelines</h1>
        <p className="text-muted-foreground">
          Complete guide for marketing team: Every field explained with purpose, recommended values, and how it generates metaTags & JSON-LD structured data for SEO.
        </p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Client/Organization Setup Guide</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on database schema and client-field-mapping.ts - Complete field documentation for marketing team. All mappings are automatically generated from the source of truth.
                </p>
              </div>
            </div>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="seo">SEO Fields</TabsTrigger>
                <TabsTrigger value="media">Media Assets</TabsTrigger>
                <TabsTrigger value="business">Business</TabsTrigger>
                <TabsTrigger value="output">MetaTags & JSON-LD</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4 mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Basic Information Fields</h4>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Name */}
                      <div className="border-l-4 border-primary pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">name</Badge>
                          <Badge className="bg-red-500">Required</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Client Name</h5>
                        <p className="text-sm text-muted-foreground">
                          Official organization name - displayed everywhere and used as fallback for meta tags.
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-foreground">Purpose:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Primary identifier for the organization</li>
                            <li>Used in page titles: "{`{name}`} - Site Name"</li>
                            <li>Used in Schema.org Organization JSON-LD as <code className="bg-muted px-1 rounded">@type: Organization, name</code></li>
                            <li>Used in metaTags as site name for Open Graph</li>
                          </ul>
                          <p className="text-xs font-medium text-foreground mt-2">Marketing Impact:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            Brand recognition in search results, social shares, and structured data. Critical for local SEO and brand visibility.
                          </p>
                        </div>
                      </div>

                      {/* Slug */}
                      <div className="border-l-4 border-green-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">slug</Badge>
                          <Badge className="bg-green-500">Auto-generated</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">URL Slug</h5>
                        <p className="text-sm text-muted-foreground">
                          SEO-friendly URL identifier (auto-generated from name, cleaned for URLs).
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-foreground">Purpose:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Creates URL: <code className="bg-muted px-1 rounded">/clients/{`{slug}`}</code></li>
                            <li>Auto-removes Arabic stop words (الشركة, المؤسسة, etc.)</li>
                            <li>Replaces spaces with hyphens, removes special characters</li>
                            <li>Limited to 50 characters for catchiness</li>
                          </ul>
                          <p className="text-xs font-medium text-foreground mt-2">Format:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            Example: "شركة-التقنية" (from "شركة التقنية")
                          </p>
                        </div>
                      </div>

                      {/* Legal Name */}
                      <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">legalName</Badge>
                          <Badge variant="secondary">Optional</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Legal Name</h5>
                        <p className="text-sm text-muted-foreground">
                          Official registered business name (if different from display name).
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-foreground">Purpose:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Used in JSON-LD: <code className="bg-muted px-1 rounded">@type: Organization, legalName</code></li>
                            <li>Important for legal compliance and official documentation</li>
                            <li>Helps with brand verification in search engines</li>
                          </ul>
                          <p className="text-xs font-medium text-foreground mt-2">Example:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            Display: "Modonty" → Legal: "Modonty Technology Solutions LLC"
                          </p>
                        </div>
                      </div>

                      {/* URL */}
                      <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">url</Badge>
                          <Badge variant="secondary">Recommended</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Website URL</h5>
                        <p className="text-sm text-muted-foreground">
                          Organization's official website URL (must be HTTPS).
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-foreground">Purpose:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Used in JSON-LD: <code className="bg-muted px-1 rounded">@type: Organization, url</code></li>
                            <li>Used in metaTags for Open Graph: <code className="bg-muted px-1 rounded">og:url</code></li>
                            <li>Required for LocalBusiness schema (local SEO)</li>
                            <li>Must be HTTPS for security</li>
                          </ul>
                          <p className="text-xs font-medium text-foreground mt-2">Format:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            Example: "https://www.company.com" (HTTPS required)
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* SEO Fields Tab */}
              <TabsContent value="seo" className="space-y-4 mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">SEO Fields</h4>
                    </div>
                    
                    <div className="space-y-6">
                      {/* SEO Title */}
                      <div className="border-l-4 border-red-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">seoTitle</Badge>
                          <Badge className="bg-red-500">Critical</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">SEO Title</h5>
                        <p className="text-sm text-muted-foreground">
                          Page title that appears in search results and browser tabs.
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-foreground">Recommended Length:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            <strong className="text-foreground">30-60 characters</strong> (optimal: 50-60 chars)
                          </p>
                          <p className="text-xs font-medium text-foreground mt-2">Purpose:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Used in HTML: <code className="bg-muted px-1 rounded">&lt;title&gt;{`{seoTitle}`} - {`{siteName}`}&lt;/title&gt;</code></li>
                            <li>Used in metaTags: <code className="bg-muted px-1 rounded">og:title</code> (Open Graph)</li>
                            <li>Used in metaTags: <code className="bg-muted px-1 rounded">twitter:title</code> (fallback if twitterTitle not set)</li>
                            <li>Displayed in search result snippets (first line)</li>
                          </ul>
                          <p className="text-xs font-medium text-foreground mt-2">Marketing Impact:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            Primary factor in click-through rate from search results. Include keywords and brand name. Keep it concise and compelling.
                          </p>
                        </div>
                      </div>

                      {/* SEO Description */}
                      <div className="border-l-4 border-red-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">seoDescription</Badge>
                          <Badge className="bg-red-500">Critical</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">SEO Description</h5>
                        <p className="text-sm text-muted-foreground">
                          Meta description that appears in search result snippets.
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-foreground">Recommended Length:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            <strong className="text-foreground">120-160 characters</strong> (optimal: 150-160 chars)
                          </p>
                          <p className="text-xs font-medium text-foreground mt-2">Purpose:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Used in HTML: <code className="bg-muted px-1 rounded">&lt;meta name="description" content="{`{seoDescription}`}" /&gt;</code></li>
                            <li>Used in metaTags: <code className="bg-muted px-1 rounded">og:description</code> (fallback if not separate)</li>
                            <li>Used in metaTags: <code className="bg-muted px-1 rounded">twitter:description</code> (fallback if twitterDescription not set)</li>
                            <li>Displayed in search result snippets (second line)</li>
                          </ul>
                          <p className="text-xs font-medium text-foreground mt-2">Marketing Impact:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            Critical for click-through rate. Include call-to-action, key benefits, and relevant keywords. Write compelling copy that encourages clicks.
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="border-l-4 border-yellow-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">description</Badge>
                          <Badge variant="secondary">Recommended</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Organization Description</h5>
                        <p className="text-sm text-muted-foreground">
                          Comprehensive organization description (separate from SEO description - used for Schema.org).
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-foreground">Recommended Length:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            <strong className="text-foreground">Minimum 100 characters</strong> (comprehensive: 200-500 chars)
                          </p>
                          <p className="text-xs font-medium text-foreground mt-2">Purpose:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Used in JSON-LD: <code className="bg-muted px-1 rounded">@type: Organization, description</code></li>
                            <li>Falls back to <code className="bg-muted px-1 rounded">seoDescription</code> if not provided</li>
                            <li>Used by search engines to understand what the organization does</li>
                            <li>More detailed than SEO description (can be longer)</li>
                          </ul>
                          <p className="text-xs font-medium text-foreground mt-2">Marketing Impact:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            Helps search engines understand the organization's purpose and services. Important for Knowledge Graph and rich results.
                          </p>
                        </div>
                      </div>

                      {/* Canonical URL */}
                      <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">canonicalUrl</Badge>
                          <Badge variant="secondary">Optional</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Canonical URL</h5>
                        <p className="text-sm text-muted-foreground">
                          Preferred URL for this page (prevents duplicate content issues).
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-foreground">Purpose:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Used in HTML: <code className="bg-muted px-1 rounded">&lt;link rel="canonical" href="{`{canonicalUrl}`}" /&gt;</code></li>
                            <li>Used in metaTags: <code className="bg-muted px-1 rounded">og:url</code> (fallback if not set)</li>
                            <li>Tells search engines which URL is the "official" version</li>
                            <li>Prevents duplicate content penalties</li>
                          </ul>
                          <p className="text-xs font-medium text-foreground mt-2">Marketing Impact:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            Prevents SEO dilution from duplicate content. Ensures all SEO signals point to one canonical URL.
                          </p>
                        </div>
                      </div>

                      {/* Meta Robots */}
                      <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">metaRobots</Badge>
                          <Badge variant="secondary">Optional</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Meta Robots</h5>
                        <p className="text-sm text-muted-foreground">
                          Controls how search engines index and follow links on this page.
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-foreground">Format:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            Options: <code className="bg-muted px-1 rounded">"index, follow"</code> (default), <code className="bg-muted px-1 rounded">"noindex, follow"</code>, <code className="bg-muted px-1 rounded">"index, nofollow"</code>, <code className="bg-muted px-1 rounded">"noindex, nofollow"</code>
                          </p>
                          <p className="text-xs font-medium text-foreground mt-2">Purpose:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Used in HTML: <code className="bg-muted px-1 rounded">&lt;meta name="robots" content="{`{metaRobots}`}" /&gt;</code></li>
                            <li><code className="bg-muted px-1 rounded">index</code> = allow indexing, <code className="bg-muted px-1 rounded">noindex</code> = prevent indexing</li>
                            <li><code className="bg-muted px-1 rounded">follow</code> = follow links, <code className="bg-muted px-1 rounded">nofollow</code> = don't follow links</li>
                          </ul>
                          <p className="text-xs font-medium text-foreground mt-2">Marketing Impact:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            Controls search engine visibility. Use "noindex" for pages you don't want in search results (e.g., internal pages).
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Media Assets Tab */}
              <TabsContent value="media" className="space-y-4 mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <ImageIcon className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Media Assets</h4>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Logo */}
                      <div className="border-l-4 border-red-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">logoMedia</Badge>
                          <Badge className="bg-red-500">Required</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Logo</h5>
                        <p className="text-sm text-muted-foreground">
                          Organization logo - displayed on articles, used in structured data, and required for rich results.
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-foreground">Recommended Dimensions:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            <strong className="text-foreground">Minimum 112×112px</strong> (required for Google rich results), optimal: 512×512px or 800×200px
                          </p>
                          <p className="text-xs font-medium text-foreground mt-2">Format:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            PNG with transparency (preferred), SVG, or JPG. Max 100KB for performance.
                          </p>
                          <p className="text-xs font-medium text-foreground mt-2">Purpose:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Used in JSON-LD: <code className="bg-muted px-1 rounded">@type: Organization, logo: ImageObject</code></li>
                            <li>Required for Article rich results (Google)</li>
                            <li>Displayed on all client articles as publisher logo</li>
                            <li>Used in social sharing when OG image not available</li>
                          </ul>
                          <p className="text-xs font-medium text-foreground mt-2">Alt Text Required:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            Format: "{`{Company Name}`} Logo" or "{`{Brand Name}`} Logo" (accessibility + SEO)
                          </p>
                        </div>
                      </div>

                      {/* OG Image */}
                      <div className="border-l-4 border-yellow-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">ogImageMedia</Badge>
                          <Badge variant="secondary">Recommended</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Open Graph Image</h5>
                        <p className="text-sm text-muted-foreground">
                          Default image shown when articles are shared on social media (Facebook, LinkedIn, etc.).
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-foreground">Recommended Dimensions:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            <strong className="text-foreground">1200×630px</strong> (optimal for all platforms), minimum: 600×314px
                          </p>
                          <p className="text-xs font-medium text-foreground mt-2">Format:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            JPG or PNG. Max 300KB for fast loading on social platforms.
                          </p>
                          <p className="text-xs font-medium text-foreground mt-2">Purpose:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Used in metaTags: <code className="bg-muted px-1 rounded">og:image</code>, <code className="bg-muted px-1 rounded">og:image:width</code>, <code className="bg-muted px-1 rounded">og:image:height</code></li>
                            <li>Used in metaTags: <code className="bg-muted px-1 rounded">twitter:image</code> (fallback if twitterImageMedia not set)</li>
                            <li>Default image for all client articles (if article has no featured image)</li>
                            <li>Critical for social media engagement (visual preview)</li>
                          </ul>
                          <p className="text-xs font-medium text-foreground mt-2">Marketing Impact:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            Visual preview in social shares significantly increases click-through rate. Include brand colors and logo for brand recognition.
                          </p>
                          <p className="text-xs font-medium text-foreground mt-2">Alt Text Required:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            Descriptive alt text for accessibility and SEO (e.g., "{`{Company Name}`} - {`{Description}`}")
                          </p>
                        </div>
                      </div>

                      {/* Twitter Image */}
                      <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">twitterImageMedia</Badge>
                          <Badge variant="secondary">Optional</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Twitter Card Image</h5>
                        <p className="text-sm text-muted-foreground">
                          Custom image for Twitter/X shares (uses OG image if not set).
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-foreground">Recommended Dimensions:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            <strong className="text-foreground">1200×630px</strong> (same as OG image, or optimized for Twitter)
                          </p>
                          <p className="text-xs font-medium text-foreground mt-2">Purpose:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Used in metaTags: <code className="bg-muted px-1 rounded">twitter:image</code></li>
                            <li>Only used if explicitly set (otherwise uses OG image)</li>
                            <li>Allows Twitter-specific optimization</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Business Information Tab */}
              <TabsContent value="business" className="space-y-4 mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Business Information</h4>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Business Brief */}
                      <div className="border-l-4 border-red-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">businessBrief</Badge>
                          <Badge className="bg-red-500">Required</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Business Brief</h5>
                        <p className="text-sm text-muted-foreground">
                          Comprehensive business description for content writers (helps them understand the company and create relevant content).
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-foreground">Recommended Length:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            <strong className="text-foreground">Minimum 100 characters</strong> (comprehensive: 200-500 chars)
                          </p>
                          <p className="text-xs font-medium text-foreground mt-2">Purpose:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Used internally by content writers to understand the business</li>
                            <li>Helps create relevant, on-brand content</li>
                            <li>Different from SEO description (more detailed, for internal use)</li>
                          </ul>
                          <p className="text-xs font-medium text-foreground mt-2">Marketing Impact:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            Ensures content quality and brand consistency. Well-written brief leads to better article quality.
                          </p>
                        </div>
                      </div>

                      {/* Industry */}
                      <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">industryId</Badge>
                          <Badge variant="secondary">Optional</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Industry</h5>
                        <p className="text-sm text-muted-foreground">
                          Industry/category classification for content organization.
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-foreground">Purpose:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Helps organize clients by industry</li>
                            <li>Used for filtering and reporting</li>
                            <li>Can be used for industry-specific SEO strategies</li>
                          </ul>
                        </div>
                      </div>

                      {/* Target Audience */}
                      <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">targetAudience</Badge>
                          <Badge variant="secondary">Optional</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Target Audience</h5>
                        <p className="text-sm text-muted-foreground">
                          Description of target audience for content targeting.
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-foreground">Purpose:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Helps content writers understand who the content is for</li>
                            <li>Used internally for content strategy</li>
                          </ul>
                        </div>
                      </div>

                      {/* Content Priorities */}
                      <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">contentPriorities</Badge>
                          <Badge variant="secondary">Optional</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Content Priorities</h5>
                        <p className="text-sm text-muted-foreground">
                          Array of key topics/priorities for content creation.
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-foreground">Format:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            Array of strings: <code className="bg-muted px-1 rounded">["Topic 1", "Topic 2", ...]</code>
                          </p>
                          <p className="text-xs font-medium text-foreground mt-2">Purpose:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Guides content writers on what topics to cover</li>
                            <li>Helps maintain content focus and relevance</li>
                          </ul>
                        </div>
                      </div>

                      {/* Founding Date */}
                      <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">foundingDate</Badge>
                          <Badge variant="secondary">Optional</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Founding Date</h5>
                        <p className="text-sm text-muted-foreground">
                          Date when the organization was founded.
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-foreground">Purpose:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Used in JSON-LD: <code className="bg-muted px-1 rounded">@type: Organization, foundingDate</code></li>
                            <li>Shows company history and credibility</li>
                            <li>Format: YYYY-MM-DD (ISO 8601 date)</li>
                          </ul>
                          <p className="text-xs font-medium text-foreground mt-2">Marketing Impact:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            Establishes credibility and company age. Older companies often have better trust signals.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact & Social Section */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Mail className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Contact & Social Information</h4>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Email */}
                      <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">email</Badge>
                          <Badge variant="secondary">Recommended</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Email</h5>
                        <p className="text-sm text-muted-foreground">
                          Organization contact email address.
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-foreground">Purpose:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Used in JSON-LD: <code className="bg-muted px-1 rounded">@type: ContactPoint, email</code></li>
                            <li>Required for ContactPoint schema (if phone not provided)</li>
                            <li>Must be valid email format</li>
                          </ul>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">phone</Badge>
                          <Badge variant="secondary">Recommended</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Phone</h5>
                        <p className="text-sm text-muted-foreground">
                          Organization contact phone number.
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-foreground">Purpose:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Used in JSON-LD: <code className="bg-muted px-1 rounded">@type: ContactPoint, telephone</code></li>
                            <li>Required for ContactPoint schema (if email not provided)</li>
                            <li>Important for local SEO (LocalBusiness schema)</li>
                          </ul>
                        </div>
                      </div>

                      {/* Contact Type */}
                      <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">contactType</Badge>
                          <Badge variant="secondary">Optional</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Contact Type</h5>
                        <p className="text-sm text-muted-foreground">
                          Type of contact point (Schema.org ContactPoint).
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-foreground">Options:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            <code className="bg-muted px-1 rounded">"customer service"</code>, <code className="bg-muted px-1 rounded">"technical support"</code>, <code className="bg-muted px-1 rounded">"sales"</code>, etc.
                          </p>
                          <p className="text-xs font-medium text-foreground mt-2">Purpose:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Used in JSON-LD: <code className="bg-muted px-1 rounded">@type: ContactPoint, contactType</code></li>
                            <li>Defaults to "customer service" if not specified</li>
                          </ul>
                        </div>
                      </div>

                      {/* Social Profiles */}
                      <div className="border-l-4 border-yellow-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">sameAs</Badge>
                          <Badge variant="secondary">Recommended</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Social Profiles (sameAs)</h5>
                        <p className="text-sm text-muted-foreground">
                          Array of social media profile URLs for brand verification.
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-foreground">Recommended:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            <strong className="text-foreground">3+ profiles</strong> (LinkedIn, Twitter, Facebook, Instagram, etc.)
                          </p>
                          <p className="text-xs font-medium text-foreground mt-2">Format:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            Array of full URLs: <code className="bg-muted px-1 rounded">["https://linkedin.com/company/...", "https://twitter.com/...", ...]</code>
                          </p>
                          <p className="text-xs font-medium text-foreground mt-2">Purpose:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Used in JSON-LD: <code className="bg-muted px-1 rounded">@type: Organization, sameAs: [urls]</code></li>
                            <li>Helps with brand verification in search engines</li>
                            <li>Connects organization to official social profiles</li>
                            <li>Important for Knowledge Graph and rich results</li>
                          </ul>
                          <p className="text-xs font-medium text-foreground mt-2">Marketing Impact:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            Strengthens brand identity and helps search engines verify the organization. More profiles = better verification.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Address & Local SEO Section */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Address & Local SEO</h4>
                    </div>
                    
                    <div className="space-y-4 text-sm">
                      <p className="text-muted-foreground">
                        Complete address information enables LocalBusiness schema for local search optimization. Required for local businesses.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="border-l-4 border-green-500 pl-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">addressStreet</Badge>
                            <Badge variant="secondary">For Local SEO</Badge>
                          </div>
                          <h5 className="font-semibold text-sm">Street Address</h5>
                          <p className="text-xs text-muted-foreground">Used in JSON-LD: <code className="bg-muted px-1 rounded">@type: PostalAddress, streetAddress</code></p>
                        </div>

                        <div className="border-l-4 border-green-500 pl-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">addressCity</Badge>
                            <Badge variant="secondary">For Local SEO</Badge>
                          </div>
                          <h5 className="font-semibold text-sm">City</h5>
                          <p className="text-xs text-muted-foreground">Used in JSON-LD: <code className="bg-muted px-1 rounded">@type: PostalAddress, addressLocality</code></p>
                        </div>

                        <div className="border-l-4 border-green-500 pl-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">addressRegion</Badge>
                            <Badge variant="secondary">For Local SEO</Badge>
                          </div>
                          <h5 className="font-semibold text-sm">Region/Province</h5>
                          <p className="text-xs text-muted-foreground">Saudi Arabia has 13 regions. Used in JSON-LD: <code className="bg-muted px-1 rounded">@type: PostalAddress, addressRegion</code></p>
                        </div>

                        <div className="border-l-4 border-green-500 pl-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">addressCountry</Badge>
                            <Badge variant="secondary">For Local SEO</Badge>
                          </div>
                          <h5 className="font-semibold text-sm">Country</h5>
                          <p className="text-xs text-muted-foreground">Used in JSON-LD: <code className="bg-muted px-1 rounded">@type: PostalAddress, addressCountry</code>. Defaults to "SA" for Saudi Arabia.</p>
                        </div>

                        <div className="border-l-4 border-green-500 pl-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">addressPostalCode</Badge>
                            <Badge variant="secondary">For Local SEO</Badge>
                          </div>
                          <h5 className="font-semibold text-sm">Postal Code</h5>
                          <p className="text-xs text-muted-foreground">
                            <strong>Recommended:</strong> 9-digit National Address format (Saudi Arabia). Used in JSON-LD: <code className="bg-muted px-1 rounded">@type: PostalAddress, postalCode</code>
                          </p>
                        </div>

                        <div className="border-l-4 border-green-500 pl-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">addressBuildingNumber</Badge>
                            <Badge variant="secondary">For Local SEO</Badge>
                          </div>
                          <h5 className="font-semibold text-sm">Building Number</h5>
                          <p className="text-xs text-muted-foreground">National Address format (Saudi Arabia). Used in JSON-LD: <code className="bg-muted px-1 rounded">@type: PostalAddress, addressBuildingNumber</code></p>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <p className="text-xs font-medium text-foreground">Complete Address Enables:</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside mt-1 ml-2">
                          <li>LocalBusiness schema in JSON-LD (for local search)</li>
                          <li>Google My Business integration</li>
                          <li>Local search result rankings</li>
                          <li>Map listings and location-based results</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Saudi Arabia Identifiers */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Hash className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Saudi Arabia Identifiers</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="border-l-4 border-red-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">commercialRegistrationNumber</Badge>
                          <Badge className="bg-red-500">Critical (SA)</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Commercial Registration Number (CR Number)</h5>
                        <p className="text-sm text-muted-foreground">
                          Official commercial registration number (CRITICAL for Saudi Arabia businesses).
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-foreground">Format:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            Numeric with optional dashes (e.g., "1234567890" or "12345-67890")
                          </p>
                          <p className="text-xs font-medium text-foreground mt-2">Purpose:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Used in JSON-LD: <code className="bg-muted px-1 rounded">@type: Organization, identifier: PropertyValue</code></li>
                            <li>Critical for Saudi Arabia business verification</li>
                            <li>Required for official business documentation</li>
                          </ul>
                        </div>
                      </div>

                      <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">vatID</Badge>
                          <Badge variant="secondary">Optional</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">VAT ID (ZATCA)</h5>
                        <p className="text-sm text-muted-foreground">VAT registration number from ZATCA.</p>
                        <p className="text-xs text-muted-foreground">Format: 15 digits. Used in JSON-LD: <code className="bg-muted px-1 rounded">@type: Organization, vatID</code></p>
                      </div>

                      <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">taxID</Badge>
                          <Badge variant="secondary">Optional</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Tax ID (ZATCA/Zakat)</h5>
                        <p className="text-sm text-muted-foreground">Tax identification number from ZATCA or Zakat.</p>
                        <p className="text-xs text-muted-foreground">Used in JSON-LD: <code className="bg-muted px-1 rounded">@type: Organization, taxID</code></p>
                      </div>

                      <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">legalForm</Badge>
                          <Badge variant="secondary">Recommended</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Legal Form</h5>
                        <p className="text-sm text-muted-foreground">Entity type under Saudi Arabia law.</p>
                        <p className="text-xs text-muted-foreground">
                          Options: "LLC", "JSC", "Sole Proprietorship", "Partnership", "Limited Partnership", "Simplified Joint Stock Company"
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Twitter Cards Section */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Tag className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Twitter Cards</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">twitterCard</Badge>
                          <Badge variant="secondary">Optional</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Twitter Card Type</h5>
                        <p className="text-sm text-muted-foreground">Type of Twitter Card to use.</p>
                        <p className="text-xs text-muted-foreground">
                          Options: <code className="bg-muted px-1 rounded">"summary_large_image"</code> (recommended), <code className="bg-muted px-1 rounded">"summary"</code>. Used in metaTags: <code className="bg-muted px-1 rounded">twitter:card</code>
                        </p>
                      </div>

                      <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">twitterTitle</Badge>
                          <Badge variant="secondary">Optional</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Twitter Title</h5>
                        <p className="text-sm text-muted-foreground">Custom title for Twitter shares (overrides seoTitle).</p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Recommended Length:</strong> Maximum 70 characters (Twitter display limit). Used in metaTags: <code className="bg-muted px-1 rounded">twitter:title</code>
                        </p>
                      </div>

                      <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">twitterDescription</Badge>
                          <Badge variant="secondary">Optional</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Twitter Description</h5>
                        <p className="text-sm text-muted-foreground">Custom description for Twitter shares (overrides seoDescription).</p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Recommended Length:</strong> Maximum 200 characters. Used in metaTags: <code className="bg-muted px-1 rounded">twitter:description</code>
                        </p>
                      </div>

                      <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">twitterSite</Badge>
                          <Badge variant="secondary">Optional</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Twitter Site (@username)</h5>
                        <p className="text-sm text-muted-foreground">Organization's Twitter/X username.</p>
                        <p className="text-xs text-muted-foreground">
                          Format: <code className="bg-muted px-1 rounded">"@username"</code> or <code className="bg-muted px-1 rounded">"username"</code>. Used in metaTags: <code className="bg-muted px-1 rounded">twitter:site</code>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* GTM Integration */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Settings className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">GTM Integration</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">gtmId</Badge>
                          <Badge variant="secondary">Optional</Badge>
                        </div>
                        <h5 className="font-semibold text-sm">Google Tag Manager ID</h5>
                        <p className="text-sm text-muted-foreground">
                          GTM container ID for analytics and tracking.
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-foreground">Format:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            <code className="bg-muted px-1 rounded">"GTM-XXXXXXX"</code> (where XXXXXXX is alphanumeric)
                          </p>
                          <p className="text-xs font-medium text-foreground mt-2">Purpose:</p>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                            <li>Enables Google Tag Manager integration for client</li>
                            <li>Allows client-specific tracking configurations</li>
                            <li>Required for multi-client analytics setup</li>
                            <li>Clients can see real results in their Analytics</li>
                          </ul>
                          <p className="text-xs font-medium text-foreground mt-2">Marketing Impact:</p>
                          <p className="text-xs text-muted-foreground ml-2">
                            Enables advanced analytics and tracking. Helps clients measure content performance and ROI.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* MetaTags & JSON-LD Output Tab */}
              <TabsContent value="output" className="space-y-4 mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Code2 className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">MetaTags & JSON-LD Generated Output</h4>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h5 className="font-semibold text-sm mb-3">HTML Head Example (Optimal SEO)</h5>
                        <p className="text-sm text-muted-foreground mb-4">
                          Below is an example of how the HTML <code className="bg-muted px-1 rounded">&lt;head&gt;</code> section should look for optimal SEO. This shows all meta tags generated from client fields.
                        </p>
                        
                        <div className="bg-muted/50 p-4 rounded-lg border overflow-x-auto">
                          <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
{`<head>
  <!-- Basic Meta Tags -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEO Title - Modonty</title>
  <meta name="description" content="SEO description optimized for search engines (120-160 characters).">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="author" content="Client Name">
  <meta name="language" content="ar">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://modonty.com/clients/client-slug">
  
  <!-- Open Graph Meta Tags (Facebook, LinkedIn, etc.) -->
  <meta property="og:title" content="SEO Title">
  <meta property="og:description" content="SEO description for social sharing.">
  <meta property="og:url" content="https://modonty.com/clients/client-slug">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Modonty">
  <meta property="og:locale" content="ar_SA">
  <meta property="og:image" content="https://cdn.example.com/og-image.jpg">
  <meta property="og:image:secure_url" content="https://cdn.example.com/og-image.jpg">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Client Name - Organization">
  
  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="SEO Title">
  <meta name="twitter:description" content="SEO description for Twitter sharing.">
  <meta name="twitter:image" content="https://cdn.example.com/twitter-image.jpg">
  <meta name="twitter:image:alt" content="Client Name - Organization">
  <meta name="twitter:site" content="@clientname">
  
  <!-- Theme Color -->
  <meta name="theme-color" content="#ffffff">
  
  <!-- Format Detection -->
  <meta name="format-detection" content="telephone=yes, email=yes, address=yes">
  
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://modonty.com/clients/client-slug#organization",
        "name": "Client Name",
        "legalName": "Client Legal Name",
        "url": "https://modonty.com/clients/client-slug",
        "logo": {
          "@type": "ImageObject",
          "url": "https://cdn.example.com/logo.jpg",
          "width": 200,
          "height": 200
        },
        "description": "Organization description for structured data.",
        "sameAs": [
          "https://linkedin.com/company/clientname",
          "https://twitter.com/clientname"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "email": "info@client.com",
          "telephone": "+966501234567",
          "areaServed": "SA",
          "availableLanguage": ["ar", "en"]
        },
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Street Address, Building 123",
          "addressLocality": "City",
          "addressRegion": "Region",
          "addressCountry": "SA",
          "postalCode": "12345"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://modonty.com#website",
        "url": "https://modonty.com",
        "name": "Modonty",
        "publisher": {
          "@id": "https://modonty.com/clients/client-slug#organization"
        }
      },
      {
        "@type": "WebPage",
        "@id": "https://modonty.com/clients/client-slug",
        "url": "https://modonty.com/clients/client-slug",
        "name": "SEO Title",
        "description": "SEO description",
        "isPartOf": {
          "@id": "https://modonty.com#website"
        },
        "about": {
          "@id": "https://modonty.com/clients/client-slug#organization"
        },
        "inLanguage": "ar",
        "primaryImageOfPage": {
          "@type": "ImageObject",
          "url": "https://cdn.example.com/og-image.jpg",
          "width": 1200,
          "height": 630
        }
      }
    ]
  }
  </script>
</head>`}
                          </pre>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-semibold text-sm mb-3">What Are MetaTags?</h5>
                        <p className="text-sm text-muted-foreground mb-4">
                          MetaTags are HTML meta elements that provide metadata about the page. They're used by search engines, social media platforms, and browsers to understand and display page content.
                        </p>
                        
                        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                          <div>
                            <p className="text-xs font-medium text-foreground mb-2">Standard SEO MetaTags (generated from client fields):</p>
                            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                              <li><code className="bg-background px-1 rounded">&lt;title&gt;</code> - From <code className="bg-background px-1 rounded">seoTitle</code> + site name</li>
                              <li><code className="bg-background px-1 rounded">&lt;meta name="description"&gt;</code> - From <code className="bg-background px-1 rounded">seoDescription</code></li>
                              <li><code className="bg-background px-1 rounded">&lt;link rel="canonical"&gt;</code> - From <code className="bg-background px-1 rounded">canonicalUrl</code></li>
                              <li><code className="bg-background px-1 rounded">&lt;meta name="robots"&gt;</code> - From <code className="bg-background px-1 rounded">metaRobots</code></li>
                            </ul>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-foreground mb-2">Open Graph MetaTags (for Facebook, LinkedIn, etc.):</p>
                            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                              <li><code className="bg-background px-1 rounded">og:title</code> - From <code className="bg-background px-1 rounded">seoTitle</code></li>
                              <li><code className="bg-background px-1 rounded">og:description</code> - From <code className="bg-background px-1 rounded">seoDescription</code></li>
                              <li><code className="bg-background px-1 rounded">og:url</code> - From <code className="bg-background px-1 rounded">canonicalUrl</code> or <code className="bg-background px-1 rounded">url</code></li>
                              <li><code className="bg-background px-1 rounded">og:image</code> - From <code className="bg-background px-1 rounded">ogImageMedia</code></li>
                              <li><code className="bg-background px-1 rounded">og:image:width</code> & <code className="bg-background px-1 rounded">og:image:height</code> - From <code className="bg-background px-1 rounded">ogImageMedia</code> dimensions</li>
                              <li><code className="bg-background px-1 rounded">og:site_name</code> - From <code className="bg-background px-1 rounded">name</code></li>
                              <li><code className="bg-background px-1 rounded">og:type</code> - "website" for client pages</li>
                            </ul>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-foreground mb-2">Twitter Card MetaTags:</p>
                            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                              <li><code className="bg-background px-1 rounded">twitter:card</code> - From <code className="bg-background px-1 rounded">twitterCard</code> (default: "summary_large_image")</li>
                              <li><code className="bg-background px-1 rounded">twitter:title</code> - From <code className="bg-background px-1 rounded">twitterTitle</code> or <code className="bg-background px-1 rounded">seoTitle</code></li>
                              <li><code className="bg-background px-1 rounded">twitter:description</code> - From <code className="bg-background px-1 rounded">twitterDescription</code> or <code className="bg-background px-1 rounded">seoDescription</code></li>
                              <li><code className="bg-background px-1 rounded">twitter:image</code> - From <code className="bg-background px-1 rounded">twitterImageMedia</code> or <code className="bg-background px-1 rounded">ogImageMedia</code></li>
                              <li><code className="bg-background px-1 rounded">twitter:site</code> - From <code className="bg-background px-1 rounded">twitterSite</code></li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-semibold text-sm mb-3">What Is JSON-LD Structured Data?</h5>
                        <p className="text-sm text-muted-foreground mb-4">
                          JSON-LD (JavaScript Object Notation for Linked Data) is structured data that helps search engines understand your organization. It enables rich results, Knowledge Graph, and enhanced search listings.
                        </p>
                        
                        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                          <div>
                            <p className="text-xs font-medium text-foreground mb-2">Schema.org Organization JSON-LD (generated from client fields):</p>
                            <div className="text-xs text-muted-foreground space-y-2">
                              <div className="bg-background p-2 rounded font-mono overflow-x-auto">
                                <div>{"{"}</div>
                                <div className="ml-2">"@context": "https://schema.org",</div>
                                <div className="ml-2">"@type": "Organization", <span className="text-muted-foreground">← from organizationType</span></div>
                                <div className="ml-2">"name": "<span className="text-primary">{"{name}"}</span>",</div>
                                <div className="ml-2">"legalName": "<span className="text-primary">{"{legalName}"}</span>", <span className="text-muted-foreground">← optional</span></div>
                                <div className="ml-2">"url": "<span className="text-primary">{"{url}"}</span>", <span className="text-muted-foreground">← optional</span></div>
                                <div className="ml-2">"description": "<span className="text-primary">{"{description || seoDescription}"}</span>",</div>
                                <div className="ml-2">"logo": {"{"}</div>
                                <div className="ml-4">"@type": "ImageObject",</div>
                                <div className="ml-4">"url": "<span className="text-primary">{"{logoMedia.url}"}</span>"</div>
                                <div className="ml-2">{"}"}, <span className="text-muted-foreground">← from logoMedia</span></div>
                                <div className="ml-2">"sameAs": [<span className="text-primary">{"{sameAs[0]}"}</span>, ...], <span className="text-muted-foreground">← social profiles</span></div>
                                <div className="ml-2">"contactPoint": {"{"}</div>
                                <div className="ml-4">"@type": "ContactPoint",</div>
                                <div className="ml-4">"email": "<span className="text-primary">{"{email}"}</span>", <span className="text-muted-foreground">← optional</span></div>
                                <div className="ml-4">"telephone": "<span className="text-primary">{"{phone}"}</span>", <span className="text-muted-foreground">← optional</span></div>
                                <div className="ml-4">"contactType": "<span className="text-primary">{"{contactType || 'customer service'}"}</span>"</div>
                                <div className="ml-2">{"}"},</div>
                                <div className="ml-2">"address": {"{"}</div>
                                <div className="ml-4">"@type": "PostalAddress",</div>
                                <div className="ml-4">"streetAddress": "<span className="text-primary">{"{addressStreet}"}</span>",</div>
                                <div className="ml-4">"addressLocality": "<span className="text-primary">{"{addressCity}"}</span>",</div>
                                <div className="ml-4">"addressRegion": "<span className="text-primary">{"{addressRegion}"}</span>",</div>
                                <div className="ml-4">"addressCountry": "<span className="text-primary">{"{addressCountry}"}</span>",</div>
                                <div className="ml-4">"postalCode": "<span className="text-primary">{"{addressPostalCode}"}</span>"</div>
                                <div className="ml-2">{"}"} <span className="text-muted-foreground">← if address provided</span></div>
                                <div>{"}"}</div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4">
                            <p className="text-xs font-medium text-foreground mb-2">Key JSON-LD Properties Mapping:</p>
                            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                              <li><code className="bg-background px-1 rounded">@type: Organization</code> - From <code className="bg-background px-1 rounded">organizationType</code> (default: "Organization")</li>
                              <li><code className="bg-background px-1 rounded">name</code> - From <code className="bg-background px-1 rounded">name</code> (required)</li>
                              <li><code className="bg-background px-1 rounded">logo</code> - From <code className="bg-background px-1 rounded">logoMedia</code> (required for rich results)</li>
                              <li><code className="bg-background px-1 rounded">description</code> - From <code className="bg-background px-1 rounded">description</code> or <code className="bg-background px-1 rounded">seoDescription</code></li>
                              <li><code className="bg-background px-1 rounded">sameAs</code> - From <code className="bg-background px-1 rounded">sameAs</code> array (social profiles)</li>
                              <li><code className="bg-background px-1 rounded">contactPoint</code> - From <code className="bg-background px-1 rounded">email</code>, <code className="bg-background px-1 rounded">phone</code>, <code className="bg-background px-1 rounded">contactType</code></li>
                              <li><code className="bg-background px-1 rounded">address</code> - From address fields (enables LocalBusiness schema)</li>
                              <li><code className="bg-background px-1 rounded">foundingDate</code> - From <code className="bg-background px-1 rounded">foundingDate</code></li>
                              <li><code className="bg-background px-1 rounded">identifier</code> - From <code className="bg-background px-1 rounded">commercialRegistrationNumber</code> (Saudi Arabia)</li>
                              <li><code className="bg-background px-1 rounded">vatID</code> - From <code className="bg-background px-1 rounded">vatID</code> (Saudi Arabia)</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                        <h5 className="font-semibold text-sm mb-2">Marketing Impact of MetaTags & JSON-LD:</h5>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-2">
                          <li><strong>Search Result Visibility:</strong> Better titles and descriptions = higher click-through rates</li>
                          <li><strong>Social Sharing:</strong> Rich previews with images = more engagement and shares</li>
                          <li><strong>Rich Results:</strong> Logo, structured data = enhanced search listings (Knowledge Graph)</li>
                          <li><strong>Local SEO:</strong> Address + contact info = LocalBusiness schema = map listings</li>
                          <li><strong>Brand Verification:</strong> Social profiles + identifiers = verified organization status</li>
                          <li><strong>Trust Signals:</strong> Complete information = higher credibility and search rankings</li>
                        </ul>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                        <h5 className="font-semibold text-sm mb-2">How to Validate:</h5>
                        <ul className="text-xs text-muted-foreground space-y-2 ml-2">
                          <li><strong>MetaTags:</strong> Check <code className="bg-background px-1 rounded">&lt;head&gt;</code> section in page source or use browser DevTools</li>
                          <li><strong>JSON-LD:</strong> Use <a href="https://validator.schema.org/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Schema.org Validator</a> or <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Rich Results Test</a></li>
                          <li><strong>Open Graph:</strong> Use <a href="https://www.opengraph.xyz/" target="_blank" rel="noopener noreferrer" className="text-primary underline">OpenGraph.xyz</a> or Facebook Sharing Debugger</li>
                          <li><strong>Twitter Cards:</strong> Use <a href="https://cards-dev.twitter.com/validator" target="_blank" rel="noopener noreferrer" className="text-primary underline">Twitter Card Validator</a></li>
                        </ul>
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
