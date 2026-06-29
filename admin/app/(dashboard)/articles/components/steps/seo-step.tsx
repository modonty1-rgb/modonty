'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useArticleForm } from '../article-form-context';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { messages } from '@/lib/messages';
import { extractLinksFromContent } from '../../helpers/link-extraction-helper';
import { Plus, X, Link as LinkIcon, Loader2, Wrench, ExternalLink } from 'lucide-react';

export function SEOStep() {
  const { formData, updateField, articleId } = useArticleForm();
  const { toast } = useToast();
  const [citationInput, setCitationInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const citations = formData.citations ?? [];

  const addCitation = useCallback(() => {
    const trimmed = citationInput.trim();
    if (!trimmed) return;
    if (citations.some((c) => c.trim() === trimmed)) return;
    updateField('citations', [...citations, trimmed]);
    setCitationInput('');
  }, [citationInput, citations, updateField]);

  const removeCitation = useCallback(
    (idx: number) => {
      updateField('citations', citations.filter((_, i) => i !== idx));
    },
    [citations, updateField],
  );

  const extractAuthSources = useCallback(() => {
    if (!formData.content) {
      toast({
        title: messages.error.operation_failed,
        description: messages.descriptions.article_content_required,
        variant: 'destructive',
      });
      return;
    }
    setIsExtracting(true);
    try {
      const links = extractLinksFromContent(formData.content);
      const auth = links.filter((l) => l.isAuthoritative && l.isExternal).map((l) => l.url);
      const existing = new Set(citations);
      const newOnes = auth.filter((url) => !existing.has(url));
      if (newOnes.length === 0) {
        toast({
          title: messages.success.success,
          description:
            auth.length > 0 ? 'تم إضافة جميع المصادر الموثوقة مسبقاً' : 'لا توجد مصادر موثوقة في المحتوى',
        });
        return;
      }
      updateField('citations', [...citations, ...newOnes]);
      const dups = auth.length - newOnes.length;
      toast({
        title: messages.success.updated,
        description: `تمت إضافة ${newOnes.length} مصدر${dups > 0 ? ` • تم تخطي ${dups} مكرر` : ''}`,
      });
    } catch {
      toast({
        title: messages.error.server_error,
        description: messages.descriptions.citations_error,
        variant: 'destructive',
      });
    } finally {
      setIsExtracting(false);
    }
  }, [formData.content, citations, updateField, toast]);

  return (
    <Card>
      <CardContent className="pt-5 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Citations (E-E-A-T)
          </Label>
          {citations.length > 0 && (
            <Badge variant="outline" className="font-mono text-xs h-5 px-1.5">
              {citations.length}
            </Badge>
          )}
        </div>

        {/* Input row */}
        <div className="flex gap-2">
          <Input
            value={citationInput}
            onChange={(e) => setCitationInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCitation())}
            placeholder="https://..."
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCitation}
            className="shrink-0 gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={extractAuthSources}
            disabled={isExtracting || !formData.content}
            className="shrink-0 gap-1.5"
          >
            {isExtracting
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <LinkIcon className="h-4 w-4" />}
            Extract
          </Button>
        </div>

        {/* Citation badges */}
        {citations.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {citations.map((url, i) => (
              <Badge
                key={`${url}-${i}`}
                variant="secondary"
                className="ps-2.5 pe-1 py-1 text-sm font-medium flex items-center gap-1.5"
              >
                <span className="truncate max-w-[240px]">{url}</span>
                <button
                  type="button"
                  onClick={() => removeCitation(i)}
                  className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                  aria-label={`Remove ${url}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Technical review link — inline footer */}
        {articleId && (
          <>
            <Separator />
            <Link
              href={`/articles/${articleId}/technical`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
            >
              <Wrench className="h-3 w-3 shrink-0" />
              <span>فتح المراجعة التقنية الكاملة</span>
              <ExternalLink className="h-3 w-3 opacity-40 ms-auto group-hover:opacity-70 transition-opacity" />
            </Link>
          </>
        )}

      </CardContent>
    </Card>
  );
}
