"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FormInput, FormTextarea } from "@/components/admin/form-field";
import { CharacterCounter } from "@/components/shared/character-counter";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SEOFieldsProps {
  seoTitle: string;
  seoDescription: string;
  canonicalUrl?: string;
  onSeoTitleChange: (value: string) => void;
  onSeoDescriptionChange: (value: string) => void;
  onCanonicalUrlChange?: (value: string) => void;
  showCanonical?: boolean;
  canonicalPlaceholder?: string;
  defaultOpen?: boolean;
}

export function SEOFields({
  seoTitle,
  seoDescription,
  canonicalUrl = "",
  onSeoTitleChange,
  onSeoDescriptionChange,
  onCanonicalUrlChange,
  showCanonical = true,
  canonicalPlaceholder = "https://example.com/...",
  defaultOpen = true,
}: SEOFieldsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <CardTitle>SEO</CardTitle>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
        <FormInput
          label="SEO Title"
          name="seoTitle"
          value={seoTitle}
          onChange={(e) => onSeoTitleChange(e.target.value)}
          hint="Meta title for search engines (50-60 chars optimal) - improves search visibility"
        />
        <div>
          <FormTextarea
            label="SEO Description"
            name="seoDescription"
            value={seoDescription}
            onChange={(e) => onSeoDescriptionChange(e.target.value)}
            rows={3}
            hint="Meta description shown in search results (150-160 chars) - influences click-through rate"
          />
          <div className="mt-1">
            <CharacterCounter
              current={seoDescription.length}
              max={160}
              className="ml-1"
            />
          </div>
        </div>
        {showCanonical && (
          <FormInput
            label="Canonical URL"
            name="canonicalUrl"
            value={canonicalUrl}
            onChange={(e) => onCanonicalUrlChange?.(e.target.value)}
            placeholder={canonicalPlaceholder}
          />
        )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
