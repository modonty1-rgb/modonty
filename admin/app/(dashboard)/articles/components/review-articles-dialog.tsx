'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getWritingArticles } from '../actions/get-writing-articles';

type WritingArticle = {
  id: string;
  title: string;
  slug: string;
  client: { id: string; name: string; slug: string | null } | null;
  category: { id: string; name: string; slug: string | null } | null;
  author: { id: string; name: string } | null;
  updatedAt: Date;
};

export function ReviewArticlesDialog() {
  const [open, setOpen] = useState(false);
  const [articles, setArticles] = useState<WritingArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      const fetchArticles = async () => {
        setLoading(true);
        try {
          const data = await getWritingArticles();
          setArticles(data);
        } catch (error) {
          console.error('Error fetching writing articles:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchArticles();
    }
  }, [open]);

  const handleArticleClick = (id: string) => {
    router.push(`/articles/preview/${id}`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Review Articles
          {articles.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {articles.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Articles Pending Review</DialogTitle>
          <DialogDescription>
            Articles with WRITING status that need review
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[500px] overflow-y-auto pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No articles pending review
            </div>
          ) : (
            <div className="space-y-2">
              {articles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => handleArticleClick(article.id)}
                  className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{article.title || 'Untitled Article'}</h4>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        {article.client && (
                          <span>{article.client.name}</span>
                        )}
                        {article.category && (
                          <>
                            <span>•</span>
                            <span>{article.category.name}</span>
                          </>
                        )}
                        {article.author && (
                          <>
                            <span>•</span>
                            <span>{article.author.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(article.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}