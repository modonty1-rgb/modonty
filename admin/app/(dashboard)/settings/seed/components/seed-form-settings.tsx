/**
 * Seed Form Settings Component
 * OpenAI, clear database, and seed phase settings
 */

"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { testOpenAI, testUnsplash, testNewsAPI } from "../actions/seed-actions";

interface SeedFormSettingsProps {
  useOpenAI: boolean;
  useNewsAPI: boolean;
  industryBrief: string;
  clearDatabase: boolean;
  seedPhase: "clients-only" | "full";
  isTestingOpenAI: boolean;
  isTestingUnsplash: boolean;
  isTestingNewsAPI: boolean;
  onUseOpenAIChange: (checked: boolean) => void;
  onUseNewsAPIChange: (checked: boolean) => void;
  onIndustryBriefChange: (value: string) => void;
  onClearDatabaseChange: (checked: boolean) => void;
  onSeedPhaseChange: (phase: "clients-only" | "full") => void;
  onTestingOpenAIChange: (isTesting: boolean) => void;
  onTestingUnsplashChange: (isTesting: boolean) => void;
  onTestingNewsAPIChange: (isTesting: boolean) => void;
}

export function SeedFormSettings({
  useOpenAI,
  useNewsAPI,
  industryBrief,
  clearDatabase,
  seedPhase,
  isTestingOpenAI,
  isTestingUnsplash,
  isTestingNewsAPI,
  onUseOpenAIChange,
  onUseNewsAPIChange,
  onIndustryBriefChange,
  onClearDatabaseChange,
  onSeedPhaseChange,
  onTestingOpenAIChange,
  onTestingUnsplashChange,
  onTestingNewsAPIChange,
}: SeedFormSettingsProps) {
  const { toast } = useToast();

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="useOpenAI"
            checked={useOpenAI}
            onCheckedChange={(checked) => onUseOpenAIChange(checked === true)}
          />
          <label htmlFor="useOpenAI" className="text-sm">
            Use OpenAI to generate realistic content (requires OPENAI_API_KEY)
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          When enabled, ALL data (clients, industries, categories, articles, etc.) will be generated using OpenAI based on your industry brief. If it fails, the seed will
          fall back to local templates.
        </p>
        {useOpenAI && (
          <div className="flex flex-col gap-2 max-w-2xl pt-2">
            <label className="text-sm font-medium" htmlFor="industry-brief">
              Industry Brief (Optional)
            </label>
            <Textarea
              id="industry-brief"
              placeholder="Describe the industry or business context (e.g., 'Saudi fintech companies specializing in digital payments and banking solutions'). Leave empty for general business data."
              value={industryBrief}
              onChange={(e) => onIndustryBriefChange(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              AI will generate all seed data based on this brief. If left empty, AI generates general business data.
            </p>
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isTestingOpenAI}
            onClick={async () => {
              onTestingOpenAIChange(true);
              try {
                const result = await testOpenAI();
                if (result.success) {
                  toast({
                    title: "OpenAI test succeeded",
                    description: "The API key is valid and OpenAI responded successfully.",
                  });
                } else {
                  toast({
                    title: "OpenAI test failed",
                    description: result.error ?? "Unknown error while testing OpenAI.",
                    variant: "destructive",
                  });
                }
              } catch (error) {
                toast({
                  title: "OpenAI test error",
                  description: "Unexpected error while testing OpenAI.",
                  variant: "destructive",
                });
              } finally {
                onTestingOpenAIChange(false);
              }
            }}
          >
            {isTestingOpenAI ? "Testing..." : "Test OpenAI"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isTestingUnsplash}
            onClick={async () => {
              onTestingUnsplashChange(true);
              try {
                const result = await testUnsplash();
                if (result.success) {
                  toast({
                    title: "Unsplash test succeeded",
                    description: "The API key is valid and Unsplash responded successfully.",
                  });
                } else {
                  toast({
                    title: "Unsplash test failed",
                    description: result.error ?? "Unknown error while testing Unsplash.",
                    variant: "destructive",
                  });
                }
              } catch (error) {
                toast({
                  title: "Unsplash test error",
                  description: "Unexpected error while testing Unsplash.",
                  variant: "destructive",
                });
              } finally {
                onTestingUnsplashChange(false);
              }
            }}
          >
            {isTestingUnsplash ? "Testing..." : "Test Unsplash"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isTestingNewsAPI}
            onClick={async () => {
              onTestingNewsAPIChange(true);
              try {
                const result = await testNewsAPI();
                if (result.success) {
                  toast({
                    title: "NewsAPI test succeeded",
                    description: "The API key is valid and NewsAPI responded successfully.",
                  });
                } else {
                  toast({
                    title: "NewsAPI test failed",
                    description: result.error ?? "Unknown error while testing NewsAPI.",
                    variant: "destructive",
                  });
                }
              } catch (error) {
                toast({
                  title: "NewsAPI test error",
                  description: "Unexpected error while testing NewsAPI.",
                  variant: "destructive",
                });
              } finally {
                onTestingNewsAPIChange(false);
              }
            }}
          >
            {isTestingNewsAPI ? "Testing..." : "Test NewsAPI"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="useNewsAPI"
            checked={useNewsAPI}
            onCheckedChange={(checked) => onUseNewsAPIChange(checked === true)}
          />
          <label htmlFor="useNewsAPI" className="text-sm">
            Use NewsAPI to fetch real article titles (requires NEWS_API_KEY)
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          When enabled, article titles will be fetched from NewsAPI.org (Arabic articles). Tags will be extracted from NewsAPI articles and merged with OpenAI/templates. If it fails, the seed will fall back to OpenAI/templates.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="clearDatabase"
            checked={clearDatabase}
            onCheckedChange={(checked) => onClearDatabaseChange(checked === true)}
          />
          <label htmlFor="clearDatabase" className="text-sm">
            Clear database before seeding (recommended)
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          When checked, the database will be cleared before seeding. Uncheck to append new data to existing data.
        </p>
      </div>

    </>
  );
}
