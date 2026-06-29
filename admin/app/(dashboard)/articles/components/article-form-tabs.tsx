'use client';

import { TabsContent } from '@/components/ui/tabs';
import { BasicStep } from './steps/basic-step';
import { ContentStep } from './steps/content-step';
import { MediaStep } from './steps/media-step';
import { FAQsStep } from './steps/faqs-step';
import { RelatedArticlesStep } from './steps/related-articles-step';

export function ArticleFormTabs() {
  return (
    <>
      <TabsContent value="basic" className="space-y-6 mt-0">
        <BasicStep />
      </TabsContent>
      <TabsContent value="content" className="space-y-6 mt-0">
        <ContentStep />
      </TabsContent>
      <TabsContent value="media" className="space-y-6 mt-0">
        <MediaStep />
      </TabsContent>
      <TabsContent value="faqs" className="space-y-6 mt-0">
        <FAQsStep />
      </TabsContent>
      <TabsContent value="related" className="space-y-6 mt-0">
        <RelatedArticlesStep />
      </TabsContent>
    </>
  );
}
