'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Archive, ArchiveRestore } from 'lucide-react';
import { archiveArticle, unarchiveArticle } from '../../actions/articles-actions';
import { useToast } from '@/hooks/use-toast';

interface ArchiveArticleButtonProps {
  articleId: string;
  isArchived: boolean;
}

export function ArchiveArticleButton({ articleId, isArchived }: ArchiveArticleButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const result = isArchived
      ? await unarchiveArticle(articleId)
      : await archiveArticle(articleId);

    if (result.success) {
      router.refresh();
    } else {
      setLoading(false);
      toast({
        title: 'فشل',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={loading}
    >
      {isArchived ? (
        <>
          <ArchiveRestore className="h-3.5 w-3.5 me-1.5" />
          Unarchive
        </>
      ) : (
        <>
          <Archive className="h-3.5 w-3.5 me-1.5" />
          Archive
        </>
      )}
    </Button>
  );
}
