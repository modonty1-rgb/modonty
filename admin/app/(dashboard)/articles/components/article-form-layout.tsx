'use client';

import { useArticleForm } from './article-form-context';
import { ArticleFormHeader } from './article-form-header';
import { Tabs } from '@/components/ui/tabs';
import { STEP_CONFIGS } from '../helpers/step-validation-helpers';

export function ArticleFormLayout({ children }: { children: React.ReactNode }) {
  const { currentStep, goToStep } = useArticleForm();
  const activeTabId = STEP_CONFIGS[currentStep - 1]?.id ?? 'basic';

  const handleTabChange = (value: string) => {
    const step = STEP_CONFIGS.find((s) => s.id === value);
    if (step) goToStep(step.number);
  };

  return (
    <Tabs
      value={activeTabId}
      onValueChange={handleTabChange}
      className="flex flex-col h-[calc(100vh-3.5rem)] bg-background -m-6 overflow-hidden"
    >
      {/* Unified header — tabs + actions + progress strip */}
      <ArticleFormHeader />

      {/* Scrollable content — fills full remaining height (no footer below) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="container mx-auto max-w-6xl px-4 md:px-6 py-6 md:py-8">
          {children}
        </div>
      </div>
    </Tabs>
  );
}
