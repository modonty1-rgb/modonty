"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CharacterCounter } from "@/components/shared/character-counter";
import { useState, useEffect } from "react";
import { getSEOSettings, type SEOSettings } from "@/app/(dashboard)/settings/actions/settings-actions";

interface SEOSectionProps {
  seoTitle: string;
  seoDescription: string;
  onSeoTitleChange: (value: string) => void;
  onSeoDescriptionChange: (value: string) => void;
  headerAction?: React.ReactNode;
}

export function SEOSection({
  seoTitle,
  seoDescription,
  onSeoTitleChange,
  onSeoDescriptionChange,
  headerAction,
}: SEOSectionProps) {
  const [seoSettings, setSeoSettings] = useState<SEOSettings | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getSEOSettings();
        setSeoSettings(settings);
      } catch (error) {
        console.error("Failed to load SEO settings:", error);
      }
    }
    loadSettings();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>SEO Settings</CardTitle>
        {headerAction}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <Label htmlFor="seoTitle">SEO Title</Label>
            <span className="text-xs text-amber-700 shrink-0">Ref: meta title · JSON-LD WebPage.name</span>
          </div>
          <Input
            id="seoTitle"
            value={seoTitle}
            onChange={(e) => onSeoTitleChange(e.target.value)}
            placeholder="e.g., About Us - Modonty"
            maxLength={seoSettings?.seoTitleMax || 60}
          />
          {seoSettings && (
            <CharacterCounter
              current={seoTitle.length}
              min={seoSettings.seoTitleMin}
              max={seoSettings.seoTitleMax}
              restrict={seoSettings.seoTitleRestrict}
            />
          )}
          <p className="text-xs text-muted-foreground">
            Meta title for search engines ({seoSettings?.seoTitleMin || 30}-{seoSettings?.seoTitleMax || 60} chars optimal)
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <Label htmlFor="seoDescription">SEO Description</Label>
            <span className="text-xs text-amber-700 shrink-0">Ref: meta description · JSON-LD WebPage.description</span>
          </div>
          <Textarea
            id="seoDescription"
            value={seoDescription}
            onChange={(e) => onSeoDescriptionChange(e.target.value)}
            placeholder="e.g., Learn about Modonty - the leading content platform..."
            rows={3}
            maxLength={seoSettings?.seoDescriptionMax || 160}
          />
          {seoSettings && (
            <CharacterCounter
              current={seoDescription.length}
              min={seoSettings.seoDescriptionMin}
              max={seoSettings.seoDescriptionMax}
              restrict={seoSettings.seoDescriptionRestrict}
            />
          )}
          <p className="text-xs text-muted-foreground">
            Meta description shown in search results ({seoSettings?.seoDescriptionMin || 120}-{seoSettings?.seoDescriptionMax || 160} chars)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
