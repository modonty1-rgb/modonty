"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { validateJsonLdPreview } from "@/lib/seo/jsonld-validation-action";
import { JsonLdValidationDialog } from "./jsonld-validation-dialog";
import type { ValidationReport } from "@/lib/seo/jsonld-validator";

interface JsonLdValidationButtonProps {
  jsonLd: object | null;
  entityType?: "article" | "client" | "tag" | "category" | "author";
  options?: {
    requirePublisherLogo?: boolean;
    requireHeroImage?: boolean;
    requireAuthorBio?: boolean;
    minHeadlineLength?: number;
    maxHeadlineLength?: number;
  };
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function JsonLdValidationButton({
  jsonLd,
  entityType = "article",
  options,
  size = "sm",
  variant = "outline",
}: JsonLdValidationButtonProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleValidate = async () => {
    if (!jsonLd) return;

    setIsValidating(true);
    setDialogOpen(true);

    try {
      const result = await validateJsonLdPreview(jsonLd, {
        ...defaultOptions,
        skipNormalization: true, // Validate raw preview structure (Ajv is SOT)
      });
      if (result.success && result.validationReport) {
        setValidationReport(result.validationReport);
      } else {
        setValidationReport(null);
      }
    } catch (error) {
      console.error("Validation failed:", error);
      setValidationReport(null);
    } finally {
      setIsValidating(false);
    }
  };

  // Determine default options based on entity type
  const defaultOptions = {
    requirePublisherLogo: entityType === "article",
    requireHeroImage: entityType === "article",
    requireAuthorBio: false,
    minHeadlineLength: 30,
    maxHeadlineLength: 110,
    ...options,
  };

  // Calculate quick status for badge
  const getQuickStatus = () => {
    if (!validationReport) return null;

    const adobeErrors = validationReport.adobe?.errors?.length || 0;
    const ajvErrors = validationReport.ajv?.errors?.length || 0;
    const customErrors = validationReport.custom?.errors?.length || 0;
    const totalErrors = adobeErrors + ajvErrors + customErrors;

    if (totalErrors === 0) {
      const adobeWarnings = validationReport.adobe?.warnings?.length || 0;
      const ajvWarnings = validationReport.ajv?.warnings?.length || 0;
      const customWarnings = validationReport.custom?.warnings?.length || 0;
      const totalWarnings = adobeWarnings + ajvWarnings + customWarnings;

      if (totalWarnings === 0) {
        return { type: "success" as const, count: 0 };
      }
      return { type: "warning" as const, count: totalWarnings };
    }
    return { type: "error" as const, count: totalErrors };
  };

  const quickStatus = getQuickStatus();

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleValidate}
        disabled={!jsonLd || isValidating}
        className="gap-1.5"
      >
        {isValidating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            جاري التحقق...
          </>
        ) : quickStatus?.type === "success" ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            التحقق
          </>
        ) : quickStatus?.type === "error" ? (
          <>
            <AlertCircle className="h-4 w-4 text-destructive" />
            التحقق
            <Badge variant="destructive" className="h-4 px-1 text-xs">
              {quickStatus.count}
            </Badge>
          </>
        ) : quickStatus?.type === "warning" ? (
          <>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            التحقق
            <Badge variant="secondary" className="h-4 px-1 text-xs bg-yellow-500">
              {quickStatus.count}
            </Badge>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            التحقق
          </>
        )}
      </Button>

      <JsonLdValidationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        validationReport={validationReport}
        isLoading={isValidating}
      />
    </>
  );
}
