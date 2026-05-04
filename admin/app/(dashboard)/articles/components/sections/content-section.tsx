'use client';

import { useState } from 'react';
import { useArticleForm } from '../article-form-context';
import { Card, CardContent } from '@/components/ui/card';
import { RichTextEditor } from '../rich-text-editor';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AiArticleDialog } from '../ai-article-dialog';
import { PenLine, Sparkles, Trash2 } from 'lucide-react';
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

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-2.5 pb-1">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="space-y-0.5">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function ContentSection() {
  const { formData, updateField, mode } = useArticleForm();
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [, setEditorStats] = useState({ wordCount: 0, characterCount: 0 });

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-start justify-between gap-4">
          <SectionHeader
            icon={PenLine}
            title="محرّر المقال"
            description="جسم المقال — المحتوى الذي سيقرأه الزائر"
          />
          <div className="flex items-center gap-2 shrink-0">
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
      </CardContent>
    </Card>
  );
}
