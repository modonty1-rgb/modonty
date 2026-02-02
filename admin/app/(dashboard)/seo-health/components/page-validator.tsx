"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  FileText,
  Code,
  Search,
  ExternalLink,
} from "lucide-react";
import type { FullPageValidationResult } from "@/lib/seo/types";

type PageType = "article" | "client" | "category" | "user";

export function PageValidator() {
  const [pageType, setPageType] = useState<PageType>("article");
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FullPageValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!identifier.trim()) {
      setError("Please enter a page identifier (slug or ID)");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `/api/seo/validate-page?type=${pageType}&id=${encodeURIComponent(identifier)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Validation failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to validate page");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Page Validator
          </CardTitle>
          <CardDescription>
            Validate any page for SEO and structured data issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="page-type">Page Type</Label>
              <Select value={pageType} onValueChange={(value) => setPageType(value as PageType)}>
                <SelectTrigger id="page-type">
                  <SelectValue placeholder="Select page type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="user">User/Author</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="identifier">Identifier (Slug or ID)</Label>
              <Input
                id="identifier"
                placeholder="e.g., my-article-slug or 123"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) {
                    handleValidate();
                  }
                }}
              />
            </div>
          </div>

          <Button
            onClick={handleValidate}
            disabled={loading || !identifier.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Validate Page
              </>
            )}
          </Button>

          {error && (
            <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
              <XCircle className="mr-2 inline h-4 w-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Validation Results</CardTitle>
                <Badge
                  variant={
                    result.canPublish
                      ? "default"
                      : result.overallScore >= 70
                      ? "secondary"
                      : "destructive"
                  }
                  className="text-lg px-3 py-1"
                >
                  {result.overallScore}/100
                </Badge>
              </div>
              <CardDescription>
                {result.canPublish
                  ? "Page is ready to publish"
                  : "Page has issues that need to be fixed"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Overall Score</span>
                  <span className="font-medium">{result.overallScore}/100</span>
                </div>
                <Progress value={result.overallScore} className="h-2" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Schema Validation</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Errors</span>
                      <Badge variant={result.structuredData.schemaErrors > 0 ? "destructive" : "default"}>
                        {result.structuredData.schemaErrors}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Warnings</span>
                      <Badge variant={result.structuredData.schemaWarnings > 0 ? "secondary" : "default"}>
                        {result.structuredData.schemaWarnings}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">SEO Analysis</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Score</span>
                      <Badge variant={result.seo.score >= 70 ? "default" : "secondary"}>
                        {result.seo.score}/100
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Issues</span>
                      <Badge variant={result.seo.issues.length > 0 ? "secondary" : "default"}>
                        {result.seo.issues.length}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ExternalLink className="h-4 w-4" />
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {result.url}
                </a>
                {!result.rendered && (
                  <Badge variant="outline" className="text-xs">
                    Generated from DB
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Critical Issues */}
          {result.issues.critical.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" />
                  Critical Issues ({result.issues.critical.length})
                </CardTitle>
                <CardDescription>Issues that must be fixed before publishing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {result.issues.critical.map((issue, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-destructive/50 bg-destructive/5 p-4"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm mb-1">{issue.message}</div>
                          {issue.code && (
                            <Badge variant="outline" className="text-xs">
                              {issue.code}
                            </Badge>
                          )}
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          {issue.category}
                        </Badge>
                      </div>
                      {issue.fix && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <strong>Fix:</strong> {issue.fix}
                        </div>
                      )}
                      {issue.path && (
                        <div className="mt-1 text-xs text-muted-foreground font-mono">
                          Path: {issue.path}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          {result.issues.warnings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="h-5 w-5" />
                  Warnings ({result.issues.warnings.length})
                </CardTitle>
                <CardDescription>Issues that should be addressed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {result.issues.warnings.map((issue, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-yellow-200 bg-yellow-50/50 p-4"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm mb-1">{issue.message}</div>
                          {issue.code && (
                            <Badge variant="outline" className="text-xs">
                              {issue.code}
                            </Badge>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {issue.category}
                        </Badge>
                      </div>
                      {issue.fix && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <strong>Fix:</strong> {issue.fix}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suggestions */}
          {result.issues.suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Suggestions ({result.issues.suggestions.length})
                </CardTitle>
                <CardDescription>Optional improvements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {result.issues.suggestions.map((issue, index) => (
                    <div
                      key={index}
                      className="rounded-lg border bg-muted/50 p-4"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm mb-1">{issue.message}</div>
                          {issue.code && (
                            <Badge variant="outline" className="text-xs">
                              {issue.code}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {issue.fix && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <strong>Suggestion:</strong> {issue.fix}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Message */}
          {result.canPublish && result.issues.critical.length === 0 && (
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Page is ready to publish!</span>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
