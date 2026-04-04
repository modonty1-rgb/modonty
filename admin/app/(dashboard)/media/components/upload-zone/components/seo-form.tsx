"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { SEOFormData } from "../types";

interface SEOFormProps {
  formData: SEOFormData;
  onChange: (data: SEOFormData) => void;
  isDisabled: boolean;
}

export function SEOForm({ formData, onChange, isDisabled }: SEOFormProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold">SEO Details</h4>

      {/* Alt Text - Required */}
      <div className="space-y-2">
        <Label htmlFor="altText">
          Alt Text <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="altText"
          placeholder="Describe the image content..."
          value={formData.altText}
          onChange={(e) => onChange({ ...formData, altText: e.target.value })}
          rows={3}
          required
          disabled={isDisabled}
        />
        <p className="text-xs text-muted-foreground">
          Required. Helps search engines and visitors understand the image.
        </p>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Image title (optional)"
          value={formData.title}
          onChange={(e) => onChange({ ...formData, title: e.target.value })}
          disabled={isDisabled}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Detailed description (optional)"
          value={formData.description}
          onChange={(e) => onChange({ ...formData, description: e.target.value })}
          rows={3}
          disabled={isDisabled}
        />
      </div>
    </div>
  );
}
