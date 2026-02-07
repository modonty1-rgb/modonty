"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Link2, Code, Image as ImageIcon, FileCode, Tag, AlertTriangle, Sparkles, Copy, Check, RefreshCw, Loader2, XCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { generateClientSEO } from "../../../actions/clients-actions";
import { getClientJsonLd, regenerateClientJsonLdAction } from "../../../actions/clients-actions/jsonld-actions";
import { validateClientJsonLdComplete } from "../../../helpers/client-seo-config/client-jsonld-validator";
import type { ValidationReport } from "@/lib/seo/jsonld-validator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SEOTabProps {
  client: {
    seoTitle: string | null;
    seoDescription: string | null;
    description: string | null;
    canonicalUrl: string | null;
    twitterCard: string | null;
    twitterTitle: string | null;
    twitterDescription: string | null;
    twitterSite: string | null;
    twitterImageMedia: {
      url: string;
      altText: string | null;
    } | null;
    ogImageMedia: {
      url: string;
      altText: string | null;
    } | null;
    gtmId: string | null;
    metaRobots: string | null;
    metaTags: {
      title: string;
      description: string;
      robots: string;
      author: string;
      language: string;
      charset: string;
      openGraph: {
        title: string;
        description: string;
        type: string;
        url: string;
        siteName: string;
        locale: string;
        images?: Array<{
          url: string;
          secure_url: string;
          type: string;
          width: number;
          height: number;
          alt: string;
        }>;
      };
      twitter: {
        card: string;
        title: string;
        description: string;
        image?: string;
        imageAlt?: string;
        site?: string;
        creator?: string;
      };
      canonical: string;
      formatDetection: {
        telephone: boolean;
        email: boolean;
        address: boolean;
      };
    } | null;
    jsonLdStructuredData: string | null;
    jsonLdLastGenerated: Date | null;
    jsonLdValidationReport: {
      adobe?: { valid: boolean; errors?: unknown[]; warnings?: unknown[] };
      custom?: { valid: boolean; errors?: unknown[]; warnings?: unknown[] };
      richResults?: { valid: boolean; errors?: unknown[]; warnings?: unknown[] };
    } | null;
    id: string;
    slug: string;
  };
}

export function SEOTab({ client }: SEOTabProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [metaTagsExpanded, setMetaTagsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [jsonLd, setJsonLd] = useState<object | null>(null);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Load stored JSON-LD and validation report
  useEffect(() => {
    const loadJsonLd = async () => {
      if (client.jsonLdStructuredData) {
        try {
          const parsed = JSON.parse(client.jsonLdStructuredData);
          setJsonLd(parsed);
        } catch {
          // Invalid JSON, try fetching from server
          const { jsonLd: fetchedJsonLd, validationReport: fetchedReport } = await getClientJsonLd(client.id);
          if (fetchedJsonLd) {
            setJsonLd(fetchedJsonLd);
          }
          if (fetchedReport) {
            setValidationReport(fetchedReport);
          }
        }
      } else {
        // Fetch from server if not in props
        const { jsonLd: fetchedJsonLd, validationReport: fetchedReport } = await getClientJsonLd(client.id);
        if (fetchedJsonLd) {
          setJsonLd(fetchedJsonLd);
        }
        if (fetchedReport) {
          setValidationReport(fetchedReport);
        }
      }

      // Use validation report from props if available
      if (client.jsonLdValidationReport) {
        setValidationReport(client.jsonLdValidationReport as ValidationReport);
      }
    };

    loadJsonLd();
  }, [client.id, client.jsonLdStructuredData, client.jsonLdValidationReport]);

  const handleRevalidate = async () => {
    if (!jsonLd) return;

    setIsValidating(true);
    try {
      const report = await validateClientJsonLdComplete(jsonLd, {
        requireLogo: true,
        requireAddress: false,
        requireContactPoint: false,
        minNameLength: 2,
        maxNameLength: 100,
      });
      setValidationReport(report);
      toast({
        title: "Success",
        description: "Validation completed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Validation failed",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const result = await regenerateClientJsonLdAction(client.id);
      if (result.success) {
        toast({
          title: "Success",
          description: "JSON-LD regenerated and validated",
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to regenerate JSON-LD",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate JSON-LD",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const adobeErrors = validationReport?.adobe?.errors || [];
  const adobeWarnings = validationReport?.adobe?.warnings || [];
  const ajvErrors = validationReport?.ajv?.errors || [];
  const ajvWarnings = validationReport?.ajv?.warnings || [];
  const customErrors = validationReport?.custom?.errors || [];
  const customWarnings = validationReport?.custom?.warnings || [];
  const isValid = adobeErrors.length === 0 && ajvErrors.length === 0 && customErrors.length === 0;

  const handleGenerateSEO = async () => {
    setIsGenerating(true);
    try {
      const result = await generateClientSEO(client.id);
      if (result.success) {
        toast({
          title: "Success",
          description: "SEO data generated successfully",
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate SEO data",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate SEO data",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyMetaTags = async () => {
    if (client.metaTags) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(client.metaTags, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Copied",
          description: "Meta tags copied to clipboard",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy meta tags",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <CardTitle>SEO Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {client.seoTitle && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">SEO Title</p>
                <p className="text-sm font-medium">{client.seoTitle}</p>
              </div>
            )}
            {client.seoDescription && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">SEO Description</p>
                <p className="text-sm leading-relaxed">{client.seoDescription}</p>
              </div>
            )}
            {client.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Organization Description</p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{client.description}</p>
              </div>
            )}
            {client.canonicalUrl && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Canonical URL</p>
                </div>
                <a
                  href={client.canonicalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline break-all"
                >
                  {client.canonicalUrl}
                </a>
              </div>
            )}
            {!client.seoTitle && !client.seoDescription && !client.description && !client.canonicalUrl && (
              <p className="text-sm text-muted-foreground text-center py-4">No SEO information available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {client.ogImageMedia?.url && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
              <CardTitle>OG Image</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <img
                src={client.ogImageMedia.url}
                alt={client.ogImageMedia.altText || "OG image"}
                className="h-40 w-40 rounded object-cover border"
              />
              <a
                href={client.ogImageMedia.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline block break-all"
              >
                {client.ogImageMedia.url}
              </a>
              {client.ogImageMedia.altText && (
                <p className="text-xs text-muted-foreground">Alt: {client.ogImageMedia.altText}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {(client.twitterCard ||
        client.twitterTitle ||
        client.twitterDescription ||
        client.twitterImageMedia?.url ||
        client.twitterSite) && (
          <Card>
            <CardHeader>
              <CardTitle>Twitter Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {client.twitterCard && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Twitter Card Type</p>
                    <p className="text-sm font-medium">{client.twitterCard}</p>
                  </div>
                )}
                {client.twitterTitle && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Twitter Title</p>
                    <p className="text-sm font-medium">{client.twitterTitle}</p>
                  </div>
                )}
                {client.twitterDescription && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Twitter Description</p>
                    <p className="text-sm leading-relaxed">{client.twitterDescription}</p>
                  </div>
                )}
                {client.twitterSite && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Twitter Site</p>
                    <p className="text-sm font-medium">{client.twitterSite}</p>
                  </div>
                )}
                {client.twitterImageMedia?.url && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Twitter Image</p>
                    <div className="space-y-3">
                      <img
                        src={client.twitterImageMedia.url}
                        alt={client.twitterImageMedia.altText || "Twitter image"}
                        className="h-40 w-40 rounded object-cover border"
                      />
                      <a
                        href={client.twitterImageMedia.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline block break-all"
                      >
                        {client.twitterImageMedia.url}
                      </a>
                      {client.twitterImageMedia.altText && (
                        <p className="text-xs text-muted-foreground">Alt: {client.twitterImageMedia.altText}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

      {(!client.metaRobots || !client.metaTags || !client.jsonLdStructuredData) && (
        <div className="flex justify-end">
          <Button
            onClick={handleGenerateSEO}
            disabled={isGenerating}
            variant="default"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Meta Tags & JSON-LD
              </>
            )}
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Meta Tags</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {!client.metaRobots && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Critical
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!client.metaRobots ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Meta Robots Tag Missing</AlertTitle>
                <AlertDescription>
                  The meta robots tag is not configured. This is critical for SEO as it controls how search engines index and follow links on this page.
                </AlertDescription>
              </Alert>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Meta Robots</p>
                <Badge variant="outline" className="font-mono">
                  {client.metaRobots}
                </Badge>
              </div>
            )}

            {client.metaTags && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Complete Meta Tags Object</p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyMetaTags}
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Collapsible open={metaTagsExpanded} onOpenChange={setMetaTagsExpanded}>
                      <CollapsibleTrigger asChild>
                        <Button size="sm" variant="ghost">
                          {metaTagsExpanded ? "Collapse" : "Expand"}
                        </Button>
                      </CollapsibleTrigger>
                    </Collapsible>
                  </div>
                </div>
                <Collapsible open={metaTagsExpanded} onOpenChange={setMetaTagsExpanded}>
                  <CollapsibleContent>
                    <div className="relative">
                      <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto max-h-96 overflow-y-auto font-mono">
                        {JSON.stringify(client.metaTags, null, 2)}
                      </pre>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              <p className="mb-1">Common values:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><code className="bg-muted px-1 rounded">index, follow</code> - Allow indexing and following links</li>
                <li><code className="bg-muted px-1 rounded">noindex, follow</code> - Don't index but follow links</li>
                <li><code className="bg-muted px-1 rounded">index, nofollow</code> - Index but don't follow links</li>
                <li><code className="bg-muted px-1 rounded">noindex, nofollow</code> - Don't index or follow links</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="h-5 w-5 text-muted-foreground" />
              <CardTitle>JSON-LD Structured Data</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {!client.jsonLdStructuredData && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Critical
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!client.jsonLdStructuredData ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>JSON-LD Structured Data Missing</AlertTitle>
                <AlertDescription>
                  JSON-LD structured data is not configured. This is critical for SEO as it helps search engines understand your organization's information and improves rich results visibility.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {client.jsonLdLastGenerated && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Last Generated</p>
                    <p className="text-sm font-medium">
                      {format(new Date(client.jsonLdLastGenerated), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                )}

                {validationReport && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Validation Status</p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleRevalidate}
                          disabled={!jsonLd || isValidating}
                        >
                          {isValidating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Validating...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Re-validate
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleRegenerate}
                          disabled={isRegenerating}
                        >
                          {isRegenerating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Regenerating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Regenerate
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isValid ? (
                        <Badge variant="default" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Valid
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Invalid ({adobeErrors.length + ajvErrors.length + customErrors.length} errors)
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Structured Data</p>
                  <div className="relative">
                    <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto max-h-96 overflow-y-auto font-mono">
                      {(() => {
                        try {
                          return JSON.stringify(JSON.parse(client.jsonLdStructuredData), null, 2);
                        } catch (error) {
                          return client.jsonLdStructuredData;
                        }
                      })()}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Results Section */}
      {jsonLd && validationReport && (
        <Card>
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
            <CardDescription>
              Detailed validation report from Adobe Structured Data Validator, Ajv, and custom business rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="validation" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="validation">Validation</TabsTrigger>
                <TabsTrigger value="jsonld">JSON-LD</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
              </TabsList>

              {/* Validation Tab */}
              <TabsContent value="validation" className="space-y-4 mt-4">
                {/* Validation Status */}
                <div className="flex items-center gap-3 p-4 rounded-lg border">
                  {isValid ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Validation Passed</p>
                        <p className="text-sm text-muted-foreground">
                          Client is ready for rich results
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="font-medium">Validation Failed</p>
                        <p className="text-sm text-muted-foreground">
                          {adobeErrors.length + ajvErrors.length + customErrors.length} error(s) found
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Adobe Validation Errors */}
                {adobeErrors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-destructive flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Schema.org Errors ({adobeErrors.length})
                    </h4>
                    <div className="space-y-2">
                      {adobeErrors.map((error, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-destructive/10 border border-destructive/20 rounded-md"
                        >
                          <p className="text-sm font-medium">{error.message}</p>
                          {error.path && <p className="text-xs text-muted-foreground mt-1">Path: {error.path}</p>}
                          {error.property && (
                            <p className="text-xs text-muted-foreground">Property: {error.property}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Adobe Validation Warnings */}
                {adobeWarnings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-yellow-500 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Schema.org Warnings ({adobeWarnings.length})
                    </h4>
                    <div className="space-y-2">
                      {adobeWarnings.map((warning, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md"
                        >
                          <p className="text-sm font-medium">{warning.message}</p>
                          {warning.recommendation && (
                            <p className="text-xs text-muted-foreground mt-1">{warning.recommendation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ajv Validation Errors */}
                {ajvErrors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-destructive flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Schema Validation Errors ({ajvErrors.length})
                    </h4>
                    <div className="space-y-2">
                      {ajvErrors.map((error, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-destructive/10 border border-destructive/20 rounded-md"
                        >
                          <p className="text-sm">{error}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ajv Validation Warnings */}
                {ajvWarnings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-yellow-500 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Schema Validation Warnings ({ajvWarnings.length})
                    </h4>
                    <div className="space-y-2">
                      {ajvWarnings.map((warning, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md"
                        >
                          <p className="text-sm">{warning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Business Rules Errors */}
                {customErrors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-destructive flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Business Rules Errors ({customErrors.length})
                    </h4>
                    <div className="space-y-2">
                      {customErrors.map((error, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-destructive/10 border border-destructive/20 rounded-md"
                        >
                          <p className="text-sm">{error}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Business Rules Warnings */}
                {customWarnings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-yellow-500 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Business Rules Warnings ({customWarnings.length})
                    </h4>
                    <div className="space-y-2">
                      {customWarnings.map((warning, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md"
                        >
                          <p className="text-sm">{warning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Clear */}
                {isValid && adobeWarnings.length === 0 && ajvWarnings.length === 0 && customWarnings.length === 0 && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-md text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="font-medium">Perfect! All validations passed</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your client is optimized for search engines
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* JSON-LD Tab */}
              <TabsContent value="jsonld" className="mt-4">
                <div className="relative">
                  <pre className="p-4 bg-muted rounded-md overflow-auto max-h-96 text-xs">
                    <code>{JSON.stringify(jsonLd, null, 2)}</code>
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(jsonLd, null, 2));
                      toast({
                        title: "Copied",
                        description: "JSON-LD copied to clipboard",
                      });
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </TabsContent>

              {/* Summary Tab */}
              <TabsContent value="summary" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Schema.org Validation</p>
                    <p className="text-2xl font-bold">
                      {validationReport?.adobe?.valid ? (
                        <span className="text-green-500">Valid</span>
                      ) : (
                        <span className="text-destructive">Invalid</span>
                      )}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total Errors</p>
                    <p className="text-2xl font-bold text-destructive">
                      {adobeErrors.length + ajvErrors.length + customErrors.length}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total Warnings</p>
                    <p className="text-2xl font-bold text-yellow-500">
                      {adobeWarnings.length + ajvWarnings.length + customWarnings.length}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Last Validated</p>
                    <p className="text-sm font-medium">
                      {validationReport?.adobe?.timestamp
                        ? format(new Date(validationReport.adobe.timestamp), 'PPp')
                        : client.jsonLdLastGenerated
                          ? format(new Date(client.jsonLdLastGenerated), 'PPp')
                          : 'Never'}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {client.gtmId && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Tracking</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Google Tag Manager ID</p>
              <p className="text-sm font-mono bg-muted p-2 rounded">{client.gtmId}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
