"use client";

import { useState } from "react";
import { FlaskConical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { mapInitialDataToFormData } from "../helpers/map-initial-data-to-form-data";
import { generateClientTestData } from "../helpers/generate-client-test-data";
import type { UseFormReturn } from "react-hook-form";
import type { ClientFormSchemaType } from "../helpers/client-form-schema";
import type { SubscriptionTier } from "@prisma/client";

interface TestDataButtonProps {
  form: UseFormReturn<ClientFormSchemaType>;
  industries: Array<{ id: string; name: string }>;
  tierConfigs: Array<{
    id: string;
    tier: SubscriptionTier;
    name: string;
    articlesPerMonth: number;
  }>;
  clients?: Array<{ id: string; name: string; slug: string }>;
}

export function TestDataButton({
  form,
  industries,
  tierConfigs,
  clients = [],
}: TestDataButtonProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  if (tierConfigs.length === 0) {
    return null;
  }

  const handleFillTestData = () => {
    setIsLoading(true);
    try {
      const testData = generateClientTestData({
        industries,
        tierConfigs,
        clients,
      });
      const defaults = mapInitialDataToFormData(undefined) as Partial<ClientFormSchemaType>;
      const merged = { ...defaults, ...testData } as Partial<ClientFormSchemaType>;
      form.reset(merged);
      toast({
        title: "Fill Test Data",
        description: "Client form filled with sample data for development.",
      });
    } catch (error) {
      console.error("Error filling client test data:", error);
      toast({
        title: "Error",
        description: "Failed to fill test data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleFillTestData}
      disabled={isLoading}
      className="gap-2 border-dashed border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100 dark:hover:bg-amber-900"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FlaskConical className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">{isLoading ? "Loading…" : "Fill Test Data"}</span>
      <span className="sm:hidden">{isLoading ? "…" : "Test"}</span>
    </Button>
  );
}
