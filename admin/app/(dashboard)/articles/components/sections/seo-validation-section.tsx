'use client';

import { useState, useEffect } from 'react';
import { useArticleForm } from '../article-form-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { validateJsonLdComplete } from '@/lib/seo/jsonld-validator';
import type { ValidationReport } from '@/lib/seo/jsonld-validator';
import { getArticleJsonLd } from '../../actions/jsonld-actions/get-article-jsonld';
import { format } from 'date-fns';

export function SEOValidationSection() {
  const { formData } = useArticleForm();
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [jsonLd, setJsonLd] = useState<object | null>(null);

  // Fetch or generate JSON-LD from form data
  useEffect(() => {
    const loadJsonLd = async () => {
      // Generate preview JSON-LD from form data (client-side)
      // Note: This is a simplified preview for validation
      // Full JSON-LD with all relations generated server-side via generateArticleKnowledgeGraph
      if (formData.title && formData.content) {
        // Generate basic JSON-LD structure matching Article schema
        // Full knowledge graph generation requires server-side article data
        const previewJsonLd = {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Article',
              '@id': `#article`,
              headline: formData.seoTitle || formData.title,
              description: formData.seoDescription || formData.excerpt,
              datePublished: formData.scheduledAt
                ? new Date(formData.scheduledAt).toISOString()
                : new Date().toISOString(),
              author: {
                '@type': 'Person',
                name: 'Modonty',
              },
              publisher: {
                '@type': 'Organization',
                name: formData.ogSiteName || 'مودونتي',
              },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': formData.canonicalUrl || '#webpage',
              },
            },
          ],
        };
        setJsonLd(previewJsonLd);
      }
    };

    loadJsonLd();
  }, [formData]);

  // Validate JSON-LD
  const handleValidate = async () => {
    if (!jsonLd) return;

    setIsValidating(true);
    try {
      const report = await validateJsonLdComplete(jsonLd, {
        requirePublisherLogo: true,
        requireHeroImage: true,
        requireAuthorBio: false,
        minHeadlineLength: 30,
        maxHeadlineLength: 110,
      });
      setValidationReport(report);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  // Auto-validate when JSON-LD changes
  useEffect(() => {
    if (jsonLd) {
      handleValidate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jsonLd]);

  const adobeErrors = validationReport?.adobe?.errors || [];
  const adobeWarnings = validationReport?.adobe?.warnings || [];
  const customErrors = validationReport?.custom?.errors || [];
  const customWarnings = validationReport?.custom?.warnings || [];
  const isValid = adobeErrors.length === 0 && customErrors.length === 0;

  const openRichResultsTest = () => {
    if (!jsonLd) return;
    const encodedJsonLd = encodeURIComponent(JSON.stringify(jsonLd));
    window.open(`https://search.google.com/test/rich-results?code=${encodedJsonLd}`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>SEO & Validation</CardTitle>
            <CardDescription>
              Advanced SEO validation using Adobe Structured Data Validator
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {jsonLd && (
              <Button variant="outline" size="sm" onClick={openRichResultsTest}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Test in Google
              </Button>
            )}
            <Button size="sm" onClick={handleValidate} disabled={!jsonLd || isValidating}>
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
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!jsonLd ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Complete basic fields (title, content) to generate JSON-LD</p>
          </div>
        ) : (
          <Tabs defaultValue="validation" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="validation">Validation</TabsTrigger>
              <TabsTrigger value="jsonld">JSON-LD</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            {/* Validation Tab */}
            <TabsContent value="validation" className="space-y-4 mt-4">
              <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
                <p className="font-medium mb-1">Note:</p>
                <p>
                  This is a preview validation. Full validation with all relations happens after saving the article.
                </p>
              </div>

              {/* Validation Status */}
              <div className="flex items-center gap-3 p-4 rounded-lg border">
                {isValid ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Validation Passed</p>
                      <p className="text-sm text-muted-foreground">
                        Article is ready for rich results
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-destructive" />
                    <div>
                      <p className="font-medium">Validation Failed</p>
                      <p className="text-sm text-muted-foreground">
                        {adobeErrors.length + customErrors.length} error(s) found
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
              {isValid && adobeWarnings.length === 0 && customWarnings.length === 0 && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-md text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="font-medium">Perfect! All validations passed</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your article is optimized for search engines
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
                  }}
                >
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
                    {adobeErrors.length + customErrors.length}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Warnings</p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {adobeWarnings.length + customWarnings.length}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Last Validated</p>
                  <p className="text-sm font-medium">
                    {validationReport?.adobe?.timestamp
                      ? format(new Date(validationReport.adobe.timestamp), 'PPp')
                      : 'Never'}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
