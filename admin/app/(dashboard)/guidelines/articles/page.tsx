"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FileText,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Info,
  ArrowLeft,
  BookOpen,
  Search,
  Users,
  Zap,
  Clock,
  Link2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ArticlesGuidelinesPage() {
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
        <h1 className="text-3xl font-semibold">Article Guidelines</h1>
        <p className="text-muted-foreground">
          Complete guide for creating SEO-optimized articles with best practices for content, structure, and metadata.
        </p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Article Creation & SEO Best Practices</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Comprehensive guide for content creators, SEO specialists, and marketing teams
                </p>
              </div>
            </div>

            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="marketing">Marketing</TabsTrigger>
                <TabsTrigger value="structure">Structure</TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-6 mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Content Requirements</h4>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <p className="font-medium mb-2 text-sm">Title Best Practices:</p>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>Length:</strong> 50-60 characters optimal
                                <p className="text-xs text-muted-foreground mt-1">
                                  Appears fully in search results without truncation
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>Primary Keyword:</strong> Include in first 60 characters
                                <p className="text-xs text-muted-foreground mt-1">
                                  Front-loading keywords improves SEO ranking
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>Engaging:</strong> Compelling and click-worthy
                                <p className="text-xs text-muted-foreground mt-1">
                                  Higher CTR improves search rankings
                                </p>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="font-medium mb-2 text-sm">Content Quality:</p>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>Word Count:</strong> Minimum 1000 words for depth
                                <p className="text-xs text-muted-foreground mt-1">
                                  Longer content ranks better (2000+ words ideal)
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>Readability:</strong> Clear, scannable structure
                                <p className="text-xs text-muted-foreground mt-1">
                                  Use headings, bullet points, short paragraphs
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>Value:</strong> Comprehensive, actionable content
                                <p className="text-xs text-muted-foreground mt-1">
                                  Answer user intent completely
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
                    <h4 className="font-semibold mb-4 text-sm">Featured Image Requirements</h4>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200">
                        <p className="font-medium mb-2">Image Specifications:</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li><strong>Dimensions:</strong> 1200×800px (3:2 aspect ratio) recommended</li>
                          <li><strong>Format:</strong> JPG or PNG, optimized for web</li>
                          <li><strong>File Size:</strong> Under 500KB for fast loading</li>
                          <li><strong>Alt Text:</strong> Descriptive, includes primary keyword</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded border border-green-200">
                        <p className="font-medium mb-2">Content Guidelines:</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Relevant to article topic and content</li>
                          <li>High quality, professional appearance</li>
                          <li>Appropriate for all audiences</li>
                          <li>Includes proper attribution if required</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Reading Time Estimates</h4>
                      <Badge variant="outline" className="ml-2">Automatic</Badge>
                    </div>
                    <div className="space-y-4 text-sm">
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded border border-green-200">
                        <p className="font-medium mb-2 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          How It Works
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-6">
                          <li>Fully automatic calculation - no manual work required</li>
                          <li>Updates automatically on every article save</li>
                          <li>Displays as "⏱️ X دقيقة" on article cards and detail pages</li>
                          <li>Real-time preview shown while editing in admin panel</li>
                        </ul>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200">
                          <p className="font-medium mb-2">Technical Details:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            <li><strong>Reading Speed:</strong> 200 words per minute (industry standard)</li>
                            <li><strong>Formula:</strong> Math.ceil(wordCount / 200)</li>
                            <li><strong>Arabic Support:</strong> Removes diacritics for accurate counting</li>
                            <li><strong>HTML Handling:</strong> Strips all HTML tags before counting</li>
                          </ul>
                        </div>

                        <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded border border-purple-200">
                          <p className="font-medium mb-2">Reading Time Ranges:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            <li><strong>Quick Read:</strong> 1-3 minutes (200-600 words)</li>
                            <li><strong>Standard:</strong> 5-7 minutes (1,000-1,400 words)</li>
                            <li><strong>Long-form:</strong> 10+ minutes (2,000+ words)</li>
                            <li className="text-xs italic mt-2">Use these as reference for content planning</li>
                          </ul>
                        </div>
                      </div>

                      <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200">
                        <p className="font-medium mb-2 flex items-center gap-2">
                          <Info className="h-4 w-4 text-yellow-600" />
                          Admin Workflow
                        </p>
                        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside ml-2">
                          <li>Write your article content naturally in the editor</li>
                          <li>System automatically calculates word count and reading time</li>
                          <li>Preview pane shows live reading time as you type</li>
                          <li>Save article - reading time is stored in database</li>
                          <li>Reading time appears automatically on frontend (no extra steps)</li>
                        </ol>
                      </div>

                      <div>
                        <p className="font-medium mb-2 text-sm">Benefits:</p>
                        <div className="grid gap-2 md:grid-cols-2">
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>User Experience:</strong> Readers know time commitment upfront
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>Engagement:</strong> Better expectations reduce bounce rate
                              </div>
                            </li>
                          </ul>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>SEO Impact:</strong> Lower bounce rate improves rankings
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>Zero Effort:</strong> System handles everything automatically
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 mt-4">
                        <p className="text-xs text-blue-800 dark:text-blue-200">
                          <AlertCircle className="h-3 w-3 inline mr-1" />
                          <strong>Note:</strong> Reading time follows Medium.com and NY Times standards. The 200 WPM rate works well for both Arabic and English content, providing accurate estimates for average readers.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* SEO Tab */}
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
                          <p className="font-medium mb-2 text-sm">Meta Tags (Required):</p>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <Search className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>SEO Title:</strong> 50-60 characters, includes keyword
                                <p className="text-xs text-muted-foreground mt-1">
                                  Appears in search results - different from article title
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <Search className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>Meta Description:</strong> 150-160 characters optimal
                                <p className="text-xs text-muted-foreground mt-1">
                                  Compelling snippet that encourages clicks
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <Search className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>Slug:</strong> SEO-friendly URL (auto-generated from title)
                                <p className="text-xs text-muted-foreground mt-1">
                                  Keep short, descriptive, include keyword
                                </p>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="font-medium mb-2 text-sm">Content SEO:</p>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <Zap className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>H1 Tag:</strong> One per article (article title)
                                <p className="text-xs text-muted-foreground mt-1">
                                  Most important heading for SEO
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <Zap className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>H2/H3 Headings:</strong> Structure content logically
                                <p className="text-xs text-muted-foreground mt-1">
                                  Helps search engines understand content hierarchy
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <Zap className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>Internal Links:</strong> Link to related articles
                                <p className="text-xs text-muted-foreground mt-1">
                                  Improves site structure and user engagement
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
                    <h4 className="font-semibold mb-4 text-sm">Schema.org Article Structured Data</h4>
                    <div className="space-y-3 text-sm">
                      <p className="text-muted-foreground">
                        All articles automatically include Schema.org Article JSON-LD structured data. Required fields:
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span><strong>headline:</strong> Article title</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span><strong>datePublished:</strong> Publication date (ISO 8601 format)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span><strong>dateModified:</strong> Last update date</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span><strong>author:</strong> Author information (Person schema)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span><strong>publisher:</strong> Organization/Client information</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span><strong>image:</strong> Featured image URL</span>
                        </li>
                      </ul>
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 mt-4">
                        <p className="text-xs text-yellow-800 dark:text-yellow-200">
                          <AlertCircle className="h-3 w-3 inline mr-1" />
                          <strong>Important:</strong> Structured data enables rich search results, article carousels, and enhanced visibility in Google Search.
                        </p>
                      </div>
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
                      <h4 className="font-semibold">Marketing Impact & Best Practices</h4>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <p className="font-medium mb-2 text-sm">Engagement Metrics:</p>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <Users className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>Time on Page:</strong> Aim for 3+ minutes
                                <p className="text-xs text-muted-foreground mt-1">
                                  Longer engagement signals quality to search engines
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <Users className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>Bounce Rate:</strong> Keep under 50%
                                <p className="text-xs text-muted-foreground mt-1">
                                  Low bounce rate indicates relevant, valuable content
                                </p>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="font-medium mb-2 text-sm">Social Sharing:</p>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <Target className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>OG Image:</strong> 1200×630px for social previews
                                <p className="text-xs text-muted-foreground mt-1">
                                  First impression in social media feeds
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <Target className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>Share Buttons:</strong> Easy sharing increases reach
                                <p className="text-xs text-muted-foreground mt-1">
                                  Social signals can indirectly impact SEO
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
                      <h4 className="font-semibold">Trending Algorithm</h4>
                      <Badge variant="outline" className="ml-2">Automatic</Badge>
                    </div>
                    <div className="space-y-4 text-sm">
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded border border-green-200">
                        <p className="font-medium mb-2 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          How It Works
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-6">
                          <li>Fully automatic calculation based on engagement metrics</li>
                          <li>Shows top 6 trending articles from the last 7 days</li>
                          <li>Updates every 60 seconds with ISR (Incremental Static Regeneration)</li>
                          <li>Time-weighted scoring favors recent popular content</li>
                        </ul>
                      </div>

                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200">
                        <p className="font-medium mb-2">Trending Score Formula:</p>
                        <div className="space-y-2">
                          <code className="text-xs bg-white dark:bg-gray-900 p-2 rounded block">
                            score = (interactions) / (age + 2) ^ 1.8
                          </code>
                          <p className="text-xs text-muted-foreground">
                            Similar to Reddit/Hacker News algorithm - balances popularity with freshness
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded border border-purple-200">
                          <p className="font-medium mb-2">Interaction Weights:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            <li><strong>Views:</strong> ×1 (baseline engagement)</li>
                            <li><strong>Likes:</strong> ×2 (positive signal)</li>
                            <li><strong>Comments:</strong> ×3 (highest engagement)</li>
                            <li><strong>Favorites:</strong> ×2 (save for later)</li>
                          </ul>
                          <p className="text-xs italic mt-2 text-muted-foreground">
                            Comments count more because they indicate deep engagement
                          </p>
                        </div>

                        <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded border border-orange-200">
                          <p className="font-medium mb-2">Time Decay (Gravity: 1.8):</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            <li><strong>0-6 hours:</strong> Peak visibility</li>
                            <li><strong>6-24 hours:</strong> High visibility</li>
                            <li><strong>24-72 hours:</strong> Declining visibility</li>
                            <li><strong>72+ hours:</strong> Needs high engagement to stay</li>
                          </ul>
                          <p className="text-xs italic mt-2 text-muted-foreground">
                            Newer content gets a boost to compete with older popular content
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200">
                        <p className="font-medium mb-2 flex items-center gap-2">
                          <Info className="h-4 w-4 text-yellow-600" />
                          How to Improve Trending Score
                        </p>
                        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside ml-2">
                          <li><strong>Timing:</strong> Publish when your audience is most active</li>
                          <li><strong>Engagement:</strong> Encourage comments with questions or discussion prompts</li>
                          <li><strong>Quality:</strong> High-quality content naturally gets more shares and likes</li>
                          <li><strong>Promotion:</strong> Share on social media immediately after publishing</li>
                          <li><strong>Titles:</strong> Compelling titles drive more clicks and views</li>
                        </ol>
                      </div>

                      <div>
                        <p className="font-medium mb-2 text-sm">Benefits:</p>
                        <div className="grid gap-2 md:grid-cols-2">
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>Content Discovery:</strong> Users find popular articles easily
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>Homepage Engagement:</strong> Trending section increases time on site
                              </div>
                            </li>
                          </ul>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>Fair Competition:</strong> New articles can compete with older ones
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>Automatic:</strong> No manual curation needed
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 mt-4">
                        <p className="text-xs text-blue-800 dark:text-blue-200">
                          <AlertCircle className="h-3 w-3 inline mr-1" />
                          <strong>Performance Note:</strong> Trending calculations are cached and update every 60 seconds. The algorithm is optimized for performance using React cache() and ISR, ensuring fast page loads while maintaining fresh trending content.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Structure Tab */}
              <TabsContent value="structure" className="space-y-6 mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-4 text-sm">Article Structure Best Practices</h4>
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="font-medium mb-2">Recommended Structure:</p>
                        <ol className="space-y-2 text-sm list-decimal list-inside text-muted-foreground">
                          <li><strong>Introduction (H2):</strong> Hook, context, what the article covers</li>
                          <li><strong>Main Content (H2/H3):</strong> Detailed sections with subheadings</li>
                          <li><strong>Conclusion (H2):</strong> Summary, key takeaways, call-to-action</li>
                          <li><strong>Related Articles:</strong> Internal links to related content</li>
                        </ol>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200">
                        <p className="font-medium mb-2">Content Formatting:</p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Use short paragraphs (2-3 sentences)</li>
                          <li>Include bullet points and numbered lists</li>
                          <li>Add images every 300-500 words</li>
                          <li>Use bold/italic for emphasis (sparingly)</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Link2 className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Related Articles Recommendation</h4>
                      <Badge variant="outline" className="ml-2">Automatic</Badge>
                    </div>
                    <div className="space-y-4 text-sm">
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded border border-green-200">
                        <p className="font-medium mb-2 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          How It Works
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-6">
                          <li>Automatically displays 3 related articles at the end of each article</li>
                          <li>Smart multi-level matching algorithm for best recommendations</li>
                          <li>Prevents showing the current article in recommendations</li>
                          <li>Server Component - zero JavaScript bundle impact</li>
                        </ul>
                      </div>

                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200">
                        <p className="font-medium mb-2">Recommendation Algorithm (3-Level Priority):</p>
                        <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside ml-2">
                          <li>
                            <strong>Tag-Based Matching (Highest Priority):</strong> Articles with matching tags
                            <p className="text-xs italic mt-1 ml-5">Most relevant - shares specific topics</p>
                          </li>
                          <li>
                            <strong>Category-Based Matching (Medium Priority):</strong> Articles in the same category
                            <p className="text-xs italic mt-1 ml-5">Fallback if not enough tag matches</p>
                          </li>
                          <li>
                            <strong>Recent Articles (Low Priority):</strong> Most recently published articles
                            <p className="text-xs italic mt-1 ml-5">Final fallback to ensure 3 articles shown</p>
                          </li>
                        </ol>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded border border-purple-200">
                          <p className="font-medium mb-2">How to Improve Recommendations:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            <li><strong>Use Tags:</strong> Add 3-5 relevant tags to each article</li>
                            <li><strong>Consistent Categories:</strong> Assign appropriate categories</li>
                            <li><strong>Tag Consistency:</strong> Use existing tags when possible</li>
                            <li><strong>Related Content:</strong> Create articles in same topics/categories</li>
                          </ul>
                        </div>

                        <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded border border-orange-200">
                          <p className="font-medium mb-2">Display Features:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            <li><strong>Title:</strong> "مقالات قد تهمك" (Articles You Might Like)</li>
                            <li><strong>Layout:</strong> 3-column grid (responsive)</li>
                            <li><strong>Info Shown:</strong> Title, excerpt, image, client, date</li>
                            <li><strong>Style:</strong> Hover effects, consistent with site design</li>
                          </ul>
                        </div>
                      </div>

                      <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200">
                        <p className="font-medium mb-2 flex items-center gap-2">
                          <Info className="h-4 w-4 text-yellow-600" />
                          Best Practices for Admins
                        </p>
                        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside ml-2">
                          <li><strong>Always Add Tags:</strong> Minimum 3 tags per article for better matching</li>
                          <li><strong>Choose Right Category:</strong> Ensures fallback recommendations are relevant</li>
                          <li><strong>Create Series:</strong> Articles in a series get naturally recommended together</li>
                          <li><strong>Check Preview:</strong> Preview shows related articles before publishing</li>
                          <li><strong>Build Content Clusters:</strong> Create multiple articles around same topic</li>
                        </ol>
                      </div>

                      <div>
                        <p className="font-medium mb-2 text-sm">Benefits:</p>
                        <div className="grid gap-2 md:grid-cols-2">
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>Session Duration:</strong> Users stay longer on site
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>Page Views:</strong> Increases articles read per session
                              </div>
                            </li>
                          </ul>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>SEO Internal Linking:</strong> Improves site structure and crawlability
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>Content Discovery:</strong> Older articles get more visibility
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 mt-4">
                        <p className="text-xs text-blue-800 dark:text-blue-200">
                          <AlertCircle className="h-3 w-3 inline mr-1" />
                          <strong>Performance Note:</strong> Related articles are loaded as a Server Component on the server, ensuring zero JavaScript bundle impact on the frontend. The algorithm runs efficiently with optimized database queries, and only published articles are shown.
                        </p>
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
