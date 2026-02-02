"use client";

import { useState, useCallback } from "react";
import { useArticleForm } from "../article-form-context";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Link as LinkIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extractLinksFromContent } from "../../helpers/link-extraction-helper";

export function CitationsSection() {
  const { formData, updateField } = useArticleForm();
  const [inputValue, setInputValue] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();

  const citations = formData.citations ?? [];

  const addCitation = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    const exists = citations.some((c) => c.trim() === trimmed);
    if (exists) return;
    updateField("citations", [...citations, trimmed]);
    setInputValue("");
  }, [inputValue, citations, updateField]);

  const removeCitation = useCallback(
    (index: number) => {
      const next = citations.filter((_, i) => i !== index);
      updateField("citations", next);
    },
    [citations, updateField]
  );

  const extractLinks = useCallback(() => {
    if (!formData.content) {
      toast({
        title: "لا يوجد محتوى",
        description: "يرجى إضافة محتوى للمقال أولاً",
        variant: "destructive",
      });
      return;
    }
    
    setIsExtracting(true);
    
    try {
      const links = extractLinksFromContent(formData.content);
      
      // Filter only authoritative external sources
      const authoritativeSources = links
        .filter(l => l.isAuthoritative && l.isExternal)
        .map(l => l.url);
      
      // Remove duplicates with existing citations
      const existingCitationsSet = new Set(citations);
      const newCitations = authoritativeSources.filter(
        url => !existingCitationsSet.has(url)
      );
      
      if (newCitations.length === 0) {
        toast({
          title: "لا توجد روابط جديدة",
          description: authoritativeSources.length > 0 
            ? "تم إضافة جميع المصادر الموثوقة مسبقاً" 
            : "لا توجد مصادر موثوقة في المحتوى",
        });
        return;
      }
      
      // Auto-add to citations
      updateField("citations", [...citations, ...newCitations]);
      
      // Show success toast with details
      const duplicates = authoritativeSources.length - newCitations.length;
      
      toast({
        title: "✓ تم تحديث المصادر",
        description: `تمت إضافة ${newCitations.length} مصدر موثوق${duplicates > 0 ? ` • تم تخطي ${duplicates} مكرر` : ''}`,
      });
    } catch (error) {
      console.error('Error extracting links:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء استخراج الروابط",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  }, [formData.content, citations, updateField, toast]);

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div>
          <Label>Citations</Label>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            External authoritative source URLs for E-E-A-T.
          </p>
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCitation())}
              placeholder="https://..."
              className="flex-1"
              aria-label="Add citation URL"
            />
            <Button type="button" variant="outline" size="sm" onClick={addCitation} className="shrink-0 gap-1.5">
              <Plus className="h-4 w-4" />
              Add
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={extractLinks}
              disabled={isExtracting || !formData.content}
              className="shrink-0 gap-1.5"
            >
              {isExtracting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LinkIcon className="h-4 w-4" />
              )}
              Extract
            </Button>
          </div>
        </div>

        {citations.length > 0 && (
          <div className="border-t pt-6">
            <Label className="text-sm font-medium mb-3 block">
              Citations ({citations.length})
            </Label>
            <div className="flex flex-wrap gap-2">
              {citations.map((url, index) => (
                <Badge
                  key={`${url}-${index}`}
                  variant="secondary"
                  className="pl-2.5 pr-1 py-1.5 text-sm font-medium flex items-center gap-1.5"
                >
                  <span className="truncate max-w-[240px]">{url}</span>
                  <button
                    type="button"
                    onClick={() => removeCitation(index)}
                    className="rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                    aria-label={`Remove ${url}`}
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
