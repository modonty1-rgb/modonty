"use client";

import { useState, useCallback } from "react";
import { useArticleForm } from "../article-form-context";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

type SemanticKeywordItem = { name: string; wikidataId?: string; url?: string };

function normalize(items: unknown): SemanticKeywordItem[] {
  if (!Array.isArray(items)) return [];
  return items.filter(
    (x): x is SemanticKeywordItem =>
      x != null && typeof (x as SemanticKeywordItem).name === "string"
  );
}

function trimOptional(s: string | undefined): string | undefined {
  if (s == null) return undefined;
  const t = s.trim();
  return t === "" ? undefined : t;
}

export function SemanticKeywordsSection() {
  const { formData, updateField } = useArticleForm();
  const [inputValue, setInputValue] = useState("");

  const keywords = normalize(formData.semanticKeywords);

  const addKeyword = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    const exists = keywords.some((k) => k.name.toLowerCase() === lower);
    if (exists) return;
    updateField("semanticKeywords", [...keywords, { name: trimmed }]);
    setInputValue("");
  }, [inputValue, keywords, updateField]);

  const updateItem = useCallback(
    (index: number, field: keyof SemanticKeywordItem, value: string) => {
      const next = keywords.map((k, i) => {
        if (i !== index) return k;
        const updated = { ...k };
        if (field === "name") updated.name = value;
        else if (field === "wikidataId") updated.wikidataId = trimOptional(value) ?? undefined;
        else if (field === "url") updated.url = trimOptional(value) ?? undefined;
        return updated;
      });
      updateField("semanticKeywords", next);
    },
    [keywords, updateField]
  );

  const removeKeyword = useCallback(
    (index: number) => {
      const next = keywords.filter((_, i) => i !== index);
      updateField("semanticKeywords", next.length > 0 ? next : undefined);
    },
    [keywords, updateField]
  );

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div>
          <Label>Semantic Keywords</Label>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Entities/concepts for disambiguation (e.g. people, places, organisations). Used for
            schema.org about/mentions and entity-first SEO. Optional Wikidata ID and URL.
          </p>
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addKeyword())
              }
              placeholder="Add entity name..."
              className="flex-1"
              aria-label="Add semantic keyword"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addKeyword}
              className="shrink-0 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>

        {keywords.length > 0 && (
          <div className="border-t pt-6 space-y-4">
            <Label className="text-sm font-medium">
              Semantic keywords ({keywords.length})
            </Label>
            <div className="space-y-3">
              {keywords.map((kw, index) => (
                <Card key={`${kw.name}-${index}`}>
                  <div className="flex items-center justify-between px-4 pt-4 pb-1">
                    <span className="text-sm font-medium">
                      Entity #{index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeKeyword(index)}
                      className="shrink-0 -mr-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      aria-label={`Remove ${kw.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="pt-2 pb-4 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <Label htmlFor={`sk-name-${index}`} className="text-xs">
                          Name
                        </Label>
                        <Input
                          id={`sk-name-${index}`}
                          value={kw.name}
                          onChange={(e) =>
                            updateItem(index, "name", e.target.value)
                          }
                          placeholder="Entity name"
                          className="h-9"
                          aria-label={`Entity name ${index + 1}`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor={`sk-wikidata-${index}`}
                          className="text-xs text-muted-foreground"
                        >
                          Wikidata ID (optional)
                        </Label>
                        <Input
                          id={`sk-wikidata-${index}`}
                          value={kw.wikidataId ?? ""}
                          onChange={(e) =>
                            updateItem(index, "wikidataId", e.target.value)
                          }
                          placeholder="e.g. Q42"
                          className="h-9 font-mono text-sm"
                          aria-label={`Wikidata ID ${index + 1}`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor={`sk-url-${index}`}
                          className="text-xs text-muted-foreground"
                        >
                          URL (optional)
                        </Label>
                        <Input
                          id={`sk-url-${index}`}
                          value={kw.url ?? ""}
                          onChange={(e) =>
                            updateItem(index, "url", e.target.value)
                          }
                          placeholder="https://..."
                          className="h-9"
                          aria-label={`URL ${index + 1}`}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
