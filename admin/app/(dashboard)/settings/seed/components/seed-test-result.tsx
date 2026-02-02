/**
 * Seed Test Result Component
 * Displays test result card with client and media information
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TestResult {
  success: boolean;
  clientId?: string;
  clientName?: string;
  logoUrl?: string;
  logoCloudinaryPublicId?: string;
  logoCloudinaryVersion?: string;
  logoMediaId?: string;
  ogImageUrl?: string;
  ogImageCloudinaryPublicId?: string;
  ogImageCloudinaryVersion?: string;
  ogImageMediaId?: string;
  databaseVerified?: boolean;
  error?: string;
}

interface SeedTestResultProps {
  testResult: TestResult | null;
}

export function SeedTestResult({ testResult }: SeedTestResultProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  if (!testResult) {
    return null;
  }

  return (
    <Card className="mt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <CollapsibleTrigger className="w-full flex items-center justify-between hover:bg-muted/50 transition-colors -m-4 p-4 rounded-lg">
            <CardTitle className="text-sm">
              {testResult.success ? "✅ Test Result - Success" : "❌ Test Result - Failed"}
            </CardTitle>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
        {testResult.success ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Client Information</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Client ID:</span> {testResult.clientId}</p>
                <p><span className="font-medium">Client Name:</span> {testResult.clientName}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Logo Media - Cloudinary URL</h4>
              <div className="space-y-2 text-sm">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Copy Logo URL:</label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={testResult.logoUrl || ""}
                      className="font-mono text-xs"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(testResult.logoUrl || "");
                        toast({
                          title: "Copied!",
                          description: "Logo URL copied to clipboard",
                        });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p><span className="font-medium">Media ID:</span> {testResult.logoMediaId}</p>
                  <p><span className="font-medium">Cloudinary Public ID:</span> <code className="text-xs bg-muted px-1 rounded">{testResult.logoCloudinaryPublicId}</code></p>
                  <p><span className="font-medium">Version:</span> {testResult.logoCloudinaryVersion}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">OG Image Media - Cloudinary URL</h4>
              <div className="space-y-2 text-sm">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Copy OG Image URL:</label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={testResult.ogImageUrl || ""}
                      className="font-mono text-xs"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(testResult.ogImageUrl || "");
                        toast({
                          title: "Copied!",
                          description: "OG Image URL copied to clipboard",
                        });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p><span className="font-medium">Media ID:</span> {testResult.ogImageMediaId}</p>
                  <p><span className="font-medium">Cloudinary Public ID:</span> <code className="text-xs bg-muted px-1 rounded">{testResult.ogImageCloudinaryPublicId}</code></p>
                  <p><span className="font-medium">Version:</span> {testResult.ogImageCloudinaryVersion}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm">
                <span className="font-medium">Database Verified:</span>{" "}
                <span className={testResult.databaseVerified ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                  {testResult.databaseVerified ? "✅ Yes" : "❌ No"}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div>
            <Alert variant="destructive">
              <AlertTitle>Test Failed</AlertTitle>
              <AlertDescription>{testResult.error}</AlertDescription>
            </Alert>
          </div>
        )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
