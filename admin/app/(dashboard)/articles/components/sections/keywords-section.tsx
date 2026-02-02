"use client";

import { useState, useCallback } from "react";
import { useArticleForm } from "../article-form-context";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

export function KeywordsSection() {
  const { formData, updateField } = useArticleForm();
  const [inputValue, setInputValue] = useState("");

  const keywords = formData.seoKeywords ?? [];

  const addKeyword = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    const exists = keywords.some((k) => k.toLowerCase() === lower);
    if (exists) return;
    updateField("seoKeywords", [...keywords, trimmed]);
    setInputValue("");
  }, [inputValue, keywords, updateField]);

  const removeKeyword = useCallback(
    (index: number) => {
      const next = keywords.filter((_, i) => i !== index);
      updateField("seoKeywords", next);
    },
    [keywords, updateField]
  );

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div>
          <Label>SEO Keywords</Label>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Keywords this article is based on. Stored as reference for the article.
          </p>
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
              placeholder="Add keyword..."
              className="flex-1"
              aria-label="Add SEO keyword"
            />
            <Button type="button" variant="outline" size="sm" onClick={addKeyword} className="shrink-0 gap-1.5">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>

        {keywords.length > 0 && (
          <div className="border-t pt-6">
            <Label className="text-sm font-medium mb-3 block">
              Keywords ({keywords.length})
            </Label>
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw, index) => (
                <Badge
                  key={`${kw}-${index}`}
                  variant="secondary"
                  className="pl-2.5 pr-1 py-1.5 text-sm font-medium flex items-center gap-1.5"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => removeKeyword(index)}
                    className="rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                    aria-label={`Remove ${kw}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
