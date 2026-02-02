'use client';

import { usePathname } from 'next/navigation';
import { useArticleForm } from './article-form-context';
import { ArticleFormHeader } from './article-form-header';
import { ArticleFormPreviewSidebar } from './article-form-preview-sidebar';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ArticleFormLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { formData, save, isSaving, isDirty, mode } = useArticleForm();
  const [showPreview, setShowPreview] = useState(false);

  // Extract current section from pathname
  const currentSection = pathname?.split('/').pop() || 'basic';

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-1.75rem)] bg-background -m-6 overflow-hidden">
      {/* Header with Sidebar Navigation */}
      <ArticleFormHeader
        currentSection={currentSection}
        mode={mode}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Content Area */}
        <main className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300",
          showPreview && "mr-0 lg:mr-[400px]"
        )}>
          <div className="container mx-auto max-w-6xl px-4 md:px-6 py-6 md:py-8">
            {children}
          </div>
        </main>

        {/* Floating Preview Toggle Button */}
        <div className="fixed bottom-8 right-8 z-[60] flex flex-col gap-2">
          <Button
            variant="default"
            size="icon"
            onClick={() => setShowPreview(!showPreview)}
            className={cn(
              "h-12 w-12 rounded-full shadow-2xl transition-all hover:scale-110",
              showPreview ? "bg-primary" : "bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900"
            )}
          >
            {showPreview ? <PanelRightClose className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
          </Button>
        </div>

        {/* Preview Sidebar */}
        <aside className={cn(
          "fixed top-[calc(3.5rem+1.75rem)] right-0 bottom-0 z-50 w-full lg:w-[400px] transition-transform duration-300 ease-in-out transform border-l bg-background",
          showPreview ? "translate-x-0" : "translate-x-full"
        )}>
          <ArticleFormPreviewSidebar onClose={() => setShowPreview(false)} />
        </aside>
      </div>
    </div>
  );
}
