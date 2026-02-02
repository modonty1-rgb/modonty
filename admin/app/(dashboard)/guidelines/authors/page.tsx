"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  User,
  Target,
  CheckCircle2,
  Info,
  ArrowLeft,
  Award,
  GraduationCap,
  Link as LinkIcon,
  Users,
  FileText,
  DollarSign,
  Clock,
  AlertCircle,
  BookOpen,
  PenTool,
} from "lucide-react";

export default function AuthorsGuidelinesPage() {
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
        <h1 className="text-3xl font-semibold">Modonty Author Guidelines</h1>
        <p className="text-muted-foreground">
          Complete guide for managing the Modonty author profile. E-E-A-T requirements, profile optimization, credentials, and author page SEO best practices for the unified Modonty brand.
        </p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <User className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Modonty Author Profile Optimization</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Build trust and authority with a comprehensive Modonty author profile that represents the platform as a unified brand
                </p>
              </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="e-e-a-t">E-E-A-T</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Info className="h-6 w-6 text-primary" />
                      <div>
                        <h4 className="font-semibold text-lg">Singleton Author Model</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Modonty uses a unified author identity where all content is attributed to the Modonty brand
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h5 className="font-semibold mb-3 flex items-center gap-2">
                          <Target className="h-5 w-5 text-blue-600" />
                          Why Singleton Author Model?
                        </h5>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-3 p-4 border rounded-lg">
                            <h6 className="font-medium text-sm">Benefits</h6>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>Brand Consistency:</strong> All content reflects the unified Modonty brand identity</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>Simplified Management:</strong> Single author profile to maintain and optimize</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>SEO Benefits:</strong> Concentrated authority signals to a single author entity</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>User Experience:</strong> Consistent author identity across all articles</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>E-E-A-T Signals:</strong> Platform-level expertise and authority</span>
                              </li>
                            </ul>
                          </div>
                          <div className="space-y-3 p-4 border rounded-lg">
                            <h6 className="font-medium text-sm">Implementation</h6>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span><strong>Author Name:</strong> "Modonty" - represents the platform as a whole</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span><strong>Auto-Assignment:</strong> All articles automatically assigned to Modonty author</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span><strong>Profile Management:</strong> Single editable profile in the admin dashboard</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span><strong>SEO Fields:</strong> Platform-level credentials, expertise, and social links</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span><strong>Display:</strong> "Modonty" shown as author on all article pages</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-semibold mb-3 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-purple-600" />
                          Managing the Modonty Author Profile
                        </h5>
                        <div className="space-y-4">
                          <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-sm bg-primary/10 text-primary px-2 py-1 rounded">Key Point</span>
                              <h6 className="font-medium">Single Author Identity</h6>
                            </div>
                            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>All articles are automatically assigned to the Modonty author</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>No author selection is needed when creating articles - it's automatic</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>The author profile represents Modonty.com as a unified content platform</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>Profile can be edited in the Authors section of the admin dashboard</span>
                              </li>
                            </ul>
                          </div>

                          <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-sm bg-primary/10 text-primary px-2 py-1 rounded">Important</span>
                              <h6 className="font-medium">Profile Information</h6>
                            </div>
                            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                              <li className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                <span><strong>Name:</strong> Should be "Modonty" to maintain brand consistency</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                <span><strong>Slug:</strong> Fixed to "modonty" and cannot be changed</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                <span><strong>Bio:</strong> Should describe Modonty as a content platform and brand</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                <span><strong>Social Links:</strong> Use Modonty's official social media profiles</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                <span><strong>URL:</strong> Should point to https://modonty.com</span>
                              </li>
                            </ul>
                          </div>

                          <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-sm bg-primary/10 text-primary px-2 py-1 rounded">Note</span>
                              <h6 className="font-medium">E-E-A-T for Platform</h6>
                            </div>
                            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>Credentials should reflect Modonty's platform expertise and authority</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>Expertise areas should cover the topics Modonty publishes about</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>Verification status should be enabled to show platform credibility</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="e-e-a-t" className="space-y-6 mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-4 text-sm">E-E-A-T Requirements (Google Quality Guidelines)</h4>
                    <div className="grid gap-6 md:grid-cols-3">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-blue-600" />
                          <h5 className="font-medium">Expertise</h5>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>List relevant credentials and qualifications</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>Include years of experience</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>Specify areas of specialization</span>
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-5 w-5 text-purple-600" />
                          <h5 className="font-medium">Authoritativeness</h5>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>Link to professional profiles (LinkedIn, etc.)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>Include published works or portfolio</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>Show industry recognition or awards</span>
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-green-600" />
                          <h5 className="font-medium">Trustworthiness</h5>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>Use professional profile photo</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>Provide accurate contact information</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>Maintain consistent online presence</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6 mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-4 text-sm">Profile Requirements</h4>
                    <div className="space-y-6 text-sm">
                      <div>
                        <p className="font-medium mb-3">Basic Information:</p>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="p-3 border rounded-lg">
                            <ul className="text-xs text-muted-foreground space-y-2">
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>Full Name:</strong> Author's complete name (required)</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>First Name:</strong> For OG profile tags (og:profile:first_name)</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>Last Name:</strong> For OG profile tags (og:profile:last_name)</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>Slug:</strong> Fixed to "modonty" (cannot be changed in singleton mode)</span>
                              </li>
                            </ul>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <ul className="text-xs text-muted-foreground space-y-2">
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>Job Title:</strong> Professional role/position</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>Works For:</strong> Organization/Client affiliation</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>Email:</strong> Contact email (optional, privacy-sensitive)</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>URL:</strong> Author page or personal website</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium mb-3">Profile Image:</p>
                        <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside ml-4">
                          <li><strong>Dimensions:</strong> 400×400px (square, 1:1 ratio) recommended</li>
                          <li><strong>Format:</strong> JPG or PNG, optimized (under 100KB)</li>
                          <li><strong>Style:</strong> Professional headshot, clear face, good lighting, neutral background</li>
                          <li><strong>Alt Text:</strong> Descriptive alt text like "Author Name Profile Photo" (required for accessibility and SEO)</li>
                          <li><strong>Quality:</strong> High resolution, no filters or heavy editing</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-3">Bio & Description:</p>
                        <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside ml-4">
                          <li><strong>Minimum Length:</strong> 100 words (150+ recommended for comprehensive profile)</li>
                          <li><strong>Content:</strong> Include professional background, expertise areas, and notable achievements</li>
                          <li><strong>Style:</strong> Use natural language, professional tone, avoid keyword stuffing</li>
                          <li><strong>Value:</strong> Should provide readers with clear understanding of author's expertise and credibility</li>
                          <li><strong>Updates:</strong> Keep bio current - reflect recent achievements and changes</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-3">Social Profiles:</p>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="p-3 border rounded-lg">
                            <ul className="text-xs text-muted-foreground space-y-2">
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>LinkedIn:</strong> Full profile URL (required for E-E-A-T)</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>Twitter URL:</strong> Full profile URL</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>Twitter Handle:</strong> @username for twitter:creator tag</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                                <span><strong>Facebook:</strong> Professional or author page URL</span>
                              </li>
                            </ul>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <p className="text-xs text-muted-foreground mb-2">
                              <strong>Why Social Profiles Matter:</strong>
                            </p>
                            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                              <li>Schema.org sameAs property (verification signal)</li>
                              <li>E-E-A-T trustworthiness signals</li>
                              <li>Professional credibility and authority</li>
                              <li>Easy way for readers to connect</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="seo" className="space-y-6 mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-4 text-sm">Schema.org Person Structured Data</h4>
                    <div className="space-y-3 text-sm">
                      <p className="text-muted-foreground mb-4">
                        Author profiles automatically include Schema.org Person JSON-LD for enhanced SEO. All fields are optimized for search engines and social media sharing.
                      </p>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h6 className="font-medium mb-2">Required Properties</h6>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              <span><strong>name:</strong> Author's full name (required)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              <span><strong>url:</strong> Author page URL (canonical)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              <span><strong>givenName:</strong> First name (for OG profile)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              <span><strong>familyName:</strong> Last name (for OG profile)</span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h6 className="font-medium mb-2">Recommended Properties</h6>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              <span><strong>jobTitle:</strong> Professional title/role</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              <span><strong>worksFor:</strong> Organization/Client reference</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              <span><strong>sameAs:</strong> Social profile URLs (LinkedIn, Twitter, etc.)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              <span><strong>knowsAbout:</strong> Areas of expertise/topics</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              <span><strong>memberOf:</strong> Professional organizations</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              <span><strong>email:</strong> Contact email (optional)</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-4 text-sm">Open Graph & Twitter Cards</h4>
                    <div className="space-y-3 text-sm">
                      <p className="text-muted-foreground mb-4">
                        Author pages use profile-type Open Graph tags for optimal social media sharing. Twitter Cards link to author's Twitter account when available.
                      </p>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h6 className="font-medium mb-2">Open Graph Tags</h6>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span><strong>og:type:</strong> "profile" (not "website")</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span><strong>og:profile:first_name:</strong> First name</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span><strong>og:profile:last_name:</strong> Last name</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span><strong>og:image:</strong> Profile or OG image (1200×630px)</span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h6 className="font-medium mb-2">Twitter Cards</h6>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span><strong>twitter:card:</strong> "summary" or "summary_large_image"</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span><strong>twitter:creator:</strong> Author's Twitter handle (@username)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span><strong>twitter:title:</strong> Author name or custom title</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span><strong>twitter:image:</strong> Profile image for Twitter sharing</span>
                            </li>
                          </ul>
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
