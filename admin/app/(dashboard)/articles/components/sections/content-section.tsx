'use client';

import { useState, useMemo, useEffect } from 'react';
import { useArticleForm } from '../article-form-context';
import { Card, CardContent } from '@/components/ui/card';
import { RichTextEditor } from '../rich-text-editor';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AiArticleDialog } from '../ai-article-dialog';
import {
  calculateWordCountImproved,
  calculateReadingTime,
  determineContentDepth,
} from '../../helpers/seo-helpers';
import {
  hasH1,
  hasH2orH3,
  hasImageWithAlt,
  hasLink,
  areParagraphsConcise,
} from '../../helpers/content-html-checks';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Sparkles, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function ContentSection() {
  const { formData, updateField, mode } = useArticleForm();
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [editorStats, setEditorStats] = useState({ wordCount: 0, characterCount: 0 });

  // Calculate content stats (editor as SOT with helper fallback)
  const fallbackWordCount = useMemo(
    () => calculateWordCountImproved(formData.content || '', formData.inLanguage || 'ar'),
    [formData.content, formData.inLanguage],
  );
  const wordCount = editorStats.wordCount || fallbackWordCount;
  const characterCount = editorStats.characterCount || 0;
  const readingTime = useMemo(() => calculateReadingTime(wordCount), [wordCount]);
  const contentDepth = useMemo(() => determineContentDepth(wordCount), [wordCount]);

  // Keep derived content stats in sync with formData so validation and SEO analyzer can use them
  useEffect(() => {
    if (!formData.content) {
      return;
    }

    const updates: Partial<typeof formData> = {};

    if (formData.wordCount !== wordCount) {
      updates.wordCount = wordCount;
    }
    if (formData.readingTimeMinutes !== readingTime) {
      updates.readingTimeMinutes = readingTime;
    }
    if (formData.contentDepth !== contentDepth) {
      updates.contentDepth = contentDepth;
    }

    if (Object.keys(updates).length > 0) {
      updateField('wordCount', updates.wordCount ?? formData.wordCount);
      updateField('readingTimeMinutes', updates.readingTimeMinutes ?? formData.readingTimeMinutes);
      updateField('contentDepth', updates.contentDepth ?? formData.contentDepth);
    }
  }, [formData.content, formData.wordCount, formData.readingTimeMinutes, formData.contentDepth, wordCount, readingTime, contentDepth, updateField]);

  const depthLabel =
    contentDepth === 'short' ? 'Short' : contentDepth === 'medium' ? 'Medium' : 'Long';
  const depthColor =
    contentDepth === 'short'
      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      : contentDepth === 'medium'
        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div>
          <div className="flex items-center justify-between gap-4 mb-2">
            <Label>Content</Label>
            <div className="flex items-center gap-2">
              {formData.content && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setClearConfirmOpen(true)}
                        className="h-8 px-3 gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Clear</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Clear all content</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {mode === 'new' && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAiDialogOpen(true)}
                        className="h-8 px-3 gap-2 border-amber-500/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">AI Assistant</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Generate Article with AI</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <AiArticleDialog open={aiDialogOpen} onOpenChange={setAiDialogOpen} />
            </div>
          </div>
          <AlertDialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear content?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all content from the editor. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    updateField('content', '');
                    setClearConfirmOpen(false);
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <RichTextEditor
            content={formData.content}
            onChange={(content) => updateField('content', content)}
            placeholder="Start writing content..."
            clientId={formData.clientId || null}
            onStatsChange={setEditorStats}
          />
        </div>

        {/* Content Stats */}
        {formData.content && (
          <div className="border-t pt-6 space-y-4">
            <Label className="text-sm font-medium">Content Statistics</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col p-4 bg-muted/30 rounded-lg">
                <span className="text-xs text-muted-foreground mb-1">Word Count</span>
                <span className="text-2xl font-semibold">{wordCount}</span>
                <span className="text-xs text-muted-foreground mt-1">
                  Letters: {characterCount}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {wordCount < 300
                    ? 'Short content (less than 300 words)'
                    : wordCount < 1000
                      ? 'Medium content (300-1000 words)'
                      : 'Long content (more than 1000 words)'}
                </span>
              </div>

              <div className="flex flex-col p-4 bg-muted/30 rounded-lg">
                <span className="text-xs text-muted-foreground mb-1">Reading Time</span>
                <span className="text-2xl font-semibold">{readingTime}</span>
                <span className="text-xs text-muted-foreground mt-1">minutes</span>
              </div>

              <div className="flex flex-col p-4 bg-muted/30 rounded-lg">
                <span className="text-xs text-muted-foreground mb-1">Content Depth</span>
                <Badge className={`w-fit ${depthColor} border-0`}>{depthLabel}</Badge>
                <span className="text-xs text-muted-foreground mt-1">
                  {contentDepth === 'short'
                    ? 'Add more content'
                    : contentDepth === 'medium'
                      ? 'Balanced content'
                      : 'Comprehensive and detailed content'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quick SEO Check */}
        {formData.content && (
          <div className="border-t pt-6">
            <Label className="text-sm font-medium mb-4 block">Quick SEO Content Check</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SEORequirement 
                label="Headline (H1) present" 
                met={hasH1(formData.content)} 
              />
              <SEORequirement 
                label="Subheadings (H2/H3) used" 
                met={hasH2orH3(formData.content)} 
              />
              <SEORequirement 
                label="Images with Alt text" 
                met={hasImageWithAlt(formData.content)} 
              />
              <SEORequirement 
                label="Internal/External links" 
                met={hasLink(formData.content)} 
              />
              <SEORequirement 
                label="Optimal length (> 600 words)" 
                met={wordCount >= 600} 
              />
              <SEORequirement 
                label="Paragraphs are concise (< 500 characters per paragraph)" 
                met={areParagraphsConcise(formData.content, 500)} 
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SEORequirement({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/10">
      <div className={cn(
        "h-4 w-4 rounded-full flex items-center justify-center border transition-colors",
        met ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-muted border-muted-foreground/30 text-muted-foreground/30"
      )}>
        {met && <CheckCircle2 className="h-2.5 w-2.5 stroke-[4]" />}
      </div>
      <span className={cn("text-xs font-medium", met ? "text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
    </div>
  );
}
