"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Lightbulb,
  Image as ImageIcon,
  Share2,
  FileText,
  User,
  Target,
  CheckCircle2,
  AlertCircle,
  Info,
  Zap,
  TrendingUp,
  Users,
  Palette,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function MediaGuidelines() {
  return (
    <Card className="mt-8 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Lightbulb className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold">Image Guidelines & Best Practices</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Comprehensive guide for SEO, Marketing, and Design teams
              </p>
            </div>
          </div>

          <Tabs defaultValue="types" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="types">Image Types</TabsTrigger>
              <TabsTrigger value="seo">SEO Team</TabsTrigger>
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
            </TabsList>

            {/* Image Types Tab */}
            <TabsContent value="types" className="space-y-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Logo */}
                <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/10">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <ImageIcon className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold">Logo Images</h4>
                      <Badge variant="outline" className="ml-auto">Brand Identity</Badge>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium mb-2">Dimensions & Format:</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li><strong>Recommended:</strong> 512×512px (square) or 800×200px (horizontal)</li>
                          <li><strong>Format:</strong> PNG with transparency (preferred) or SVG</li>
                          <li><strong>File Size:</strong> Under 100KB for web performance</li>
                          <li><strong>Aspect Ratio:</strong> 1:1 (square) or 4:1 (horizontal)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-2">SEO Requirements:</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li><strong>Alt Text:</strong> "Company Name Logo" or "Brand Name Logo"</li>
                          <li><strong>Title:</strong> Company/Brand name</li>
                          <li><strong>Description:</strong> Brief brand description</li>
                          <li><strong>Filename:</strong> company-name-logo.png (SEO-friendly)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-2">Use Cases:</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Client/organization branding</li>
                          <li>Header navigation</li>
                          <li>Email signatures</li>
                          <li>Social media profiles</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Open Graph (OG) Images */}
                <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/10">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Share2 className="h-5 w-5 text-purple-600" />
                      <h4 className="font-semibold">Open Graph (OG) Images</h4>
                      <Badge variant="outline" className="ml-auto">Social Sharing</Badge>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium mb-2">Dimensions & Format:</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li><strong>Required:</strong> 1200×630px (1.91:1 aspect ratio)</li>
                          <li><strong>Format:</strong> JPG or PNG (JPG preferred for smaller size)</li>
                          <li><strong>File Size:</strong> Under 300KB (optimized for social platforms)</li>
                          <li><strong>Safe Zone:</strong> Keep important content within 1200×600px center</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-2">SEO Requirements:</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li><strong>Alt Text:</strong> Article/page title or description</li>
                          <li><strong>Title:</strong> Same as article title</li>
                          <li><strong>Description:</strong> Meta description (50-160 chars)</li>
                          <li><strong>Filename:</strong> article-slug-og-image.jpg</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-2">Design Best Practices:</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Include readable text (minimum 24px font size)</li>
                          <li>Use high contrast for text visibility</li>
                          <li>Brand colors and logo placement</li>
                          <li>Test on Facebook, LinkedIn, Twitter previews</li>
                        </ul>
                      </div>
                      <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200">
                        <p className="text-xs text-yellow-800 dark:text-yellow-200">
                          <AlertCircle className="h-3 w-3 inline mr-1" />
                          <strong>Critical:</strong> OG images appear in link previews. Poor quality = lower click-through rates.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Featured Images */}
                <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/10">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold">Featured Images (Blog Posts)</h4>
                      <Badge variant="outline" className="ml-auto">Content</Badge>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium mb-2">Dimensions & Format:</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li><strong>Recommended:</strong> 1200×800px (3:2 aspect ratio)</li>
                          <li><strong>Minimum:</strong> 800×600px for quality display</li>
                          <li><strong>Format:</strong> JPG (photos) or PNG (graphics with text)</li>
                          <li><strong>File Size:</strong> Under 500KB (optimized for web)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-2">SEO Requirements:</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li><strong>Alt Text:</strong> Descriptive, 5-125 chars, includes keywords</li>
                          <li><strong>Title:</strong> Article headline or related title</li>
                          <li><strong>Description:</strong> Article excerpt or summary</li>
                          <li><strong>Caption:</strong> Contextual caption (read 300% more than body text)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-2">Content Guidelines:</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Relevant to article content and topic</li>
                          <li>High quality, professional appearance</li>
                          <li>Appropriate for all audiences</li>
                          <li>Includes proper attribution if required</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Profile/Avatar Images */}
                <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/10">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="h-5 w-5 text-orange-600" />
                      <h4 className="font-semibold">Profile/Avatar Images</h4>
                      <Badge variant="outline" className="ml-auto">Author</Badge>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium mb-2">Dimensions & Format:</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li><strong>Required:</strong> 400×400px (square, 1:1 ratio)</li>
                          <li><strong>Format:</strong> JPG or PNG</li>
                          <li><strong>File Size:</strong> Under 100KB</li>
                          <li><strong>Focus:</strong> Face centered, good lighting</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-2">SEO Requirements:</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li><strong>Alt Text:</strong> "Author Name Profile Photo" or "Name Headshot"</li>
                          <li><strong>Title:</strong> Author's full name</li>
                          <li><strong>Description:</strong> Author bio or role</li>
                          <li><strong>Creator:</strong> Photographer name (if applicable)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-2">Design Guidelines:</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Professional headshot or clear face photo</li>
                          <li>Consistent style across all authors</li>
                          <li>Good contrast, no filters or heavy editing</li>
                          <li>Appropriate for professional context</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* SEO Team Tab */}
            <TabsContent value="seo" className="space-y-6 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">SEO Optimization Checklist</h4>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium mb-2 text-sm">Critical SEO Fields (Required):</p>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong>Alt Text:</strong> 5-125 characters, descriptive, includes primary keyword
                              <p className="text-xs text-muted-foreground mt-1">
                                Direct ranking factor for Google Image Search. Required for accessibility compliance.
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong>Title:</strong> Used in Schema.org ImageObject structured data
                              <p className="text-xs text-muted-foreground mt-1">
                                Appears in rich search results and social media previews.
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong>Description:</strong> 50-160 characters for meta descriptions
                              <p className="text-xs text-muted-foreground mt-1">
                                Used in search snippets and Open Graph tags for social sharing.
                              </p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium mb-2 text-sm">Technical SEO Requirements:</p>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <Zap className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong>Dimensions:</strong> Proper width/height prevents layout shifts
                              <p className="text-xs text-muted-foreground mt-1">
                                Core Web Vitals metric - affects page speed ranking.
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <Zap className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong>Filename:</strong> SEO-friendly, descriptive, hyphenated
                              <p className="text-xs text-muted-foreground mt-1">
                                Example: "blog-post-seo-tips-2024.jpg" not "IMG_1234.jpg"
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <Zap className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong>File Size:</strong> Optimized for web (under 500KB)
                              <p className="text-xs text-muted-foreground mt-1">
                                Large files slow page load = lower rankings.
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
                  <h4 className="font-semibold mb-4 text-sm">Schema.org Structured Data</h4>
                  <div className="space-y-3 text-sm">
                    <p className="text-muted-foreground">
                      All image metadata is automatically converted to Schema.org ImageObject JSON-LD structured data. 
                      This enables:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Rich search results in Google Image Search</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Enhanced social media previews (Open Graph, Twitter Cards)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Better indexing and categorization by search engines</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Eligibility for Google's image license metadata feature</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Marketing Tab */}
            <TabsContent value="marketing" className="space-y-6 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Marketing Impact & ROI</h4>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium mb-2 text-sm">User Engagement Metrics:</p>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <Users className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong>Captions:</strong> Read 300% more than body text
                              <p className="text-xs text-muted-foreground mt-1">
                                Reduces bounce rate by 15-25%, increases time-on-page.
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <Users className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong>Social Sharing:</strong> Rich metadata = 40% higher CTR
                              <p className="text-xs text-muted-foreground mt-1">
                                Better link previews increase click-through rates on social platforms.
                              </p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium mb-2 text-sm">Search Visibility:</p>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <Target className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong>Image Search:</strong> 2-3x more organic traffic
                              <p className="text-xs text-muted-foreground mt-1">
                                Complete metadata = better Google Image Search rankings.
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <Target className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong>Brand Recognition:</strong> Consistent metadata builds trust
                              <p className="text-xs text-muted-foreground mt-1">
                                Professional image management improves brand perception.
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
                  <h4 className="font-semibold mb-4 text-sm">Content Marketing Best Practices</h4>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200">
                      <p className="font-medium mb-2">OG Images (Social Sharing):</p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        <li>First impression in social media feeds - design matters!</li>
                        <li>Include compelling headline or call-to-action</li>
                        <li>Test previews on Facebook, LinkedIn, Twitter before publishing</li>
                        <li>Use brand colors and consistent design language</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded border border-green-200">
                      <p className="font-medium mb-2">Featured Images (Blog Posts):</p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Choose images that represent article topic accurately</li>
                        <li>High-quality, professional images increase credibility</li>
                        <li>Include captions - they're read more than article body</li>
                        <li>Proper attribution builds trust and avoids legal issues</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Design Tab */}
            <TabsContent value="design" className="space-y-6 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Palette className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Design Specifications</h4>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium mb-2 text-sm">File Format Guidelines:</p>
                        <ul className="space-y-2 text-sm">
                          <li>
                            <strong>JPG:</strong> Photos, complex images, OG images
                            <p className="text-xs text-muted-foreground mt-1">
                              Best for: Photographs, images with many colors, smaller file sizes
                            </p>
                          </li>
                          <li>
                            <strong>PNG:</strong> Logos, graphics with text, transparency needed
                            <p className="text-xs text-muted-foreground mt-1">
                              Best for: Logos, icons, images requiring transparency
                            </p>
                          </li>
                          <li>
                            <strong>SVG:</strong> Logos, simple graphics, scalable icons
                            <p className="text-xs text-muted-foreground mt-1">
                              Best for: Vector graphics, logos that need to scale perfectly
                            </p>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium mb-2 text-sm">Color & Quality:</p>
                        <ul className="space-y-2 text-sm">
                          <li>
                            <strong>Color Space:</strong> sRGB (web standard)
                            <p className="text-xs text-muted-foreground mt-1">
                              Ensures consistent colors across all devices and browsers
                            </p>
                          </li>
                          <li>
                            <strong>Resolution:</strong> 72-96 DPI (web standard)
                            <p className="text-xs text-muted-foreground mt-1">
                              Higher DPI increases file size without web benefit
                            </p>
                          </li>
                          <li>
                            <strong>Compression:</strong> Optimize for web (85-90% quality)
                            <p className="text-xs text-muted-foreground mt-1">
                              Balance quality vs. file size for optimal page speed
                            </p>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-4 text-sm">Design Checklist</h4>
                  <div className="grid gap-4 md:grid-cols-2 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Correct dimensions for image type</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Optimized file size (under recommended limit)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Appropriate format (JPG/PNG/SVG)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>High quality, professional appearance</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Brand colors and style consistency</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Readable text (if applicable, min 24px)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Proper contrast for accessibility</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Tested on multiple devices/screens</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Reference */}
          <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">Quick Reference: Image Type Dimensions</p>
                <div className="grid gap-2 md:grid-cols-4 text-xs">
                  <div>
                    <strong>Logo:</strong> 512×512px or 800×200px
                  </div>
                  <div>
                    <strong>OG Image:</strong> 1200×630px (required)
                  </div>
                  <div>
                    <strong>Featured:</strong> 1200×800px (recommended)
                  </div>
                  <div>
                    <strong>Avatar:</strong> 400×400px (required)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
