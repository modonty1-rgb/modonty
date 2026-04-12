'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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

  const handleArchive = async () => {
    setLoading(true);
    const result = await archiveArticle(articleId);
    if (result.success) {
      router.refresh();
    } else {
      setLoading(false);
      toast({ title: 'فشل', description: result.error, variant: 'destructive' });
    }
  };

  const handleUnarchive = async () => {
    setLoading(true);
    const result = await unarchiveArticle(articleId);
    if (result.success) {
      router.refresh();
    } else {
      setLoading(false);
      toast({ title: 'فشل', description: result.error, variant: 'destructive' });
    }
  };

  if (isArchived) {
    return (
      <Button variant="outline" size="sm" onClick={handleUnarchive} disabled={loading}>
        <ArchiveRestore className="h-3.5 w-3.5 me-1.5" />
        Unarchive
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          <Archive className="h-3.5 w-3.5 me-1.5" />
          Archive
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>أرشفة المقال</AlertDialogTitle>
          <AlertDialogDescription>
            هذا المقال لن يظهر في المدونة بعد الأرشفة. يمكنك إلغاء الأرشفة في أي وقت.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>كنسل</AlertDialogCancel>
          <AlertDialogAction onClick={handleArchive}>استمرار</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
