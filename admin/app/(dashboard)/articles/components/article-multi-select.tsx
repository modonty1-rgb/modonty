'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Article {
  id: string;
  title: string;
  slug: string;
  clientName: string;
}

interface ArticleMultiSelectProps {
  availableArticles: Article[];
  selectedArticleIds: string[];
  onChange: (articleIds: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function ArticleMultiSelect({
  availableArticles,
  selectedArticleIds,
  onChange,
  placeholder = 'اختر المقالات',
  className,
}: ArticleMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedArticles = availableArticles.filter((article) => selectedArticleIds.includes(article.id));

  const handleArticleToggle = (articleId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedArticleIds, articleId]);
    } else {
      onChange(selectedArticleIds.filter((id) => id !== articleId));
    }
  };

  const handleRemoveArticle = (e: React.MouseEvent, articleId: string) => {
    e.stopPropagation();
    onChange(selectedArticleIds.filter((id) => id !== articleId));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between h-auto min-h-10', className)}
        >
          <div className="flex-1 flex flex-wrap gap-1 items-center">
            {selectedArticles.length > 0 ? (
              selectedArticles.map((article) => (
                <Badge
                  key={article.id}
                  variant="secondary"
                  className="gap-1 pr-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="max-w-[200px] truncate">{article.title}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleRemoveArticle(e, article.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleRemoveArticle(e as any, article.id);
                      }
                    }}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 cursor-pointer inline-flex items-center justify-center"
                    aria-label={`إزالة ${article.title}`}
                  >
                    <X className="h-3 w-3" />
                  </span>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="max-h-[400px] overflow-y-auto p-2">
          {availableArticles.length > 0 ? (
            <div className="space-y-1">
              {availableArticles.map((article) => {
                const isSelected = selectedArticleIds.includes(article.id);
                return (
                  <div
                    key={article.id}
                    className="flex items-center gap-2 p-2 rounded-sm hover:bg-accent cursor-pointer"
                    onClick={() => handleArticleToggle(article.id, !isSelected)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleArticleToggle(article.id, !!checked)}
                      id={`article-${article.id}`}
                    />
                    <Label
                      htmlFor={`article-${article.id}`}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{article.title}</span>
                        <span className="text-xs text-muted-foreground">{article.clientName}</span>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              لا توجد مقالات متاحة
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
