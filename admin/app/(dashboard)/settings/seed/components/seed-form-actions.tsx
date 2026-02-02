/**
 * Seed Form Actions Component
 * Action buttons section (Create Client Seed, Test, Create Article)
 */

"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { testCreateClientWithMedia } from "../actions/seed-actions";
import { useToast } from "@/hooks/use-toast";

type TestResult = {
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
} | null;

interface SeedFormActionsProps {
  isRunning: boolean;
  progress: number;
  seedPhase: "clients-only" | "full";
  hasClients: boolean;
  clientCount: number;
  useOpenAI: boolean;
  industryBrief: string;
  clearDatabase: boolean;
  isDev: boolean;
  isTestingClientCreation: boolean;
  testResult: TestResult;
  onRunSeed: () => void;
  onCreateClientSeed: () => void;
  onTestingClientCreationChange: (isTesting: boolean) => void;
  onTestResultChange: (result: TestResult) => void;
}

export function SeedFormActions({
  isRunning,
  progress,
  seedPhase,
  hasClients,
  clientCount,
  useOpenAI,
  industryBrief,
  clearDatabase,
  isDev,
  isTestingClientCreation,
  testResult,
  onRunSeed,
  onCreateClientSeed,
  onTestingClientCreationChange,
  onTestResultChange,
}: SeedFormActionsProps) {
  const { toast } = useToast();

  return (
    <div className="flex justify-end">
      <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:justify-end">
        {isRunning && (
          <div className="w-full md:w-48">
            <Progress value={progress} />
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onCreateClientSeed}
          disabled={isRunning || !isDev}
        >
          {isRunning ? "Creating clients..." : "Create Client Seed"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isTestingClientCreation || !isDev}
          onClick={async () => {
            onTestingClientCreationChange(true);
            onTestResultChange(null);
            try {
              console.log("Starting test...");
              const result = await testCreateClientWithMedia();
              console.log("Test result received:", result);
              onTestResultChange(result);
              if (result.success) {
                toast({
                  title: "Client creation test succeeded",
                  description: `Client "${result.clientName}" created! Cloudinary URLs available in result card below.`,
                });
              } else {
                toast({
                  title: "Client creation test failed",
                  description: result.error || "Unknown error occurred.",
                  variant: "destructive",
                });
              }
            } catch (error) {
              console.error("Test error:", error);
              const errorResult = {
                success: false,
                error: error instanceof Error ? error.message : "Unexpected error during client creation test.",
              };
              onTestResultChange(errorResult);
              toast({
                title: "Error",
                description: errorResult.error,
                variant: "destructive",
              });
            } finally {
              onTestingClientCreationChange(false);
            }
          }}
        >
          {isTestingClientCreation ? "Testing..." : "Test Client + Media"}
        </Button>
        <Button
          type="button"
          onClick={onRunSeed}
          disabled={isRunning || !isDev || (seedPhase === "full" && !hasClients)}
        >
          {isRunning ? "Creating articles..." : "Create Article"}
        </Button>
      </div>
    </div>
  );
}
