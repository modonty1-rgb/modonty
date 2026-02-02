'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tag {
  id: string;
  name: string;
}

interface TagMultiSelectProps {
  availableTags: Tag[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagMultiSelect({
  availableTags,
  selectedTagIds,
  onChange,
  placeholder = 'اختر العلامات',
  className,
}: TagMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedTags = availableTags.filter((tag) => selectedTagIds.includes(tag.id));

  const handleTagToggle = (tagId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedTagIds, tagId]);
    } else {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    }
  };

  const handleRemoveTag = (e: React.MouseEvent, tagId: string) => {
    e.stopPropagation();
    onChange(selectedTagIds.filter((id) => id !== tagId));
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
            {selectedTags.length > 0 ? (
              selectedTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="gap-1 pr-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {tag.name}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleRemoveTag(e, tag.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleRemoveTag(e as any, tag.id);
                      }
                    }}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 cursor-pointer inline-flex items-center justify-center"
                    aria-label={`إزالة ${tag.name}`}
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
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="max-h-[300px] overflow-y-auto p-2">
          {availableTags.length > 0 ? (
            <div className="space-y-1">
              {availableTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <div
                    key={tag.id}
                    className="flex items-center gap-2 p-2 rounded-sm hover:bg-accent cursor-pointer"
                    onClick={() => handleTagToggle(tag.id, !isSelected)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleTagToggle(tag.id, !!checked)}
                      id={`tag-${tag.id}`}
                    />
                    <Label
                      htmlFor={`tag-${tag.id}`}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      {tag.name}
                    </Label>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              لا توجد علامات متاحة
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
