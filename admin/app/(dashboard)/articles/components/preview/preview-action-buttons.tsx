'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { publishArticleById } from '../../actions/publish-action/publish-article-by-id';
import { requestChanges } from '../../actions/request-changes-action';
import type { Article } from '@prisma/client';

interface PreviewActionButtonsProps {
  article: Article;
}

export function PreviewActionButtons({ article }: PreviewActionButtonsProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApproveAndPublish = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const result = await publishArticleById(article.id);
      
      if (result.success) {
        router.push('/articles');
        router.refresh();
      } else {
        setError(result.error || 'Failed to publish article');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestChanges = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const result = await requestChanges(article.id);
      
      if (result.success) {
        router.push('/articles');
        router.refresh();
      } else {
        setError(result.error || 'Failed to request changes');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    router.push('/articles');
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
        </div>
      )}
      
      <div className="flex items-center gap-4">
        <Button
          onClick={handleApproveAndPublish}
          disabled={isProcessing}
          size="lg"
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve & Publish
            </>
          )}
        </Button>
        
        <Button
          onClick={handleRequestChanges}
          disabled={isProcessing}
          variant="outline"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 mr-2" />
              Request Changes
            </>
          )}
        </Button>
        
        <Button
          onClick={handleBack}
          disabled={isProcessing}
          variant="ghost"
          size="lg"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
      </div>
    </div>
  );
}