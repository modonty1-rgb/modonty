'use client';

import { useState, useMemo, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Search, X, ExternalLink, ChevronDown } from 'lucide-react';
import { ArticleSelectionItem } from '../actions/articles-actions';
import { ArticleStatus } from '@prisma/client';
import { getStatusLabel, getStatusVariant } from '../helpers/status-utils';
import { format } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface RelatedArticleInfo {
  relatedId: string;
  relationshipType?: 'related' | 'similar' | 'recommended';
}

interface ArticleSelectionTableProps {
  articles: ArticleSelectionItem[];
  selectedArticleIds: string[];
  onSelectionChange: (articleIds: string[]) => void;
  categories: Array<{ id: string; name: string }>;
  tags: Array<{ id: string; name: string }>;
  loading?: boolean;
  onCategoryFilterChange?: (categoryId: string | undefined) => void;
  onTagFilterChange?: (tagIds: string[]) => void;
  onSearchChange?: (search: string) => void;
  defaultCategoryId?: string;
  defaultTagIds?: string[];
  relatedArticles?: RelatedArticleInfo[];
  onRelationshipTypeChange?: (relatedId: string, type: 'related' | 'similar' | 'recommended') => void;
}

export function ArticleSelectionTable({
  articles,
  selectedArticleIds,
  onSelectionChange,
  categories,
  tags,
  loading = false,
  onCategoryFilterChange,
  onTagFilterChange,
  onSearchChange,
  defaultCategoryId,
  defaultTagIds = [],
  relatedArticles = [],
  onRelationshipTypeChange,
}: ArticleSelectionTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(defaultCategoryId);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(defaultTagIds);

  // Sync state with default props when they change
  useEffect(() => {
    setSelectedCategoryId(defaultCategoryId);
  }, [defaultCategoryId]);

  useEffect(() => {
    setSelectedTagIds(defaultTagIds);
  }, [defaultTagIds]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  const handleCategoryChange = (value: string) => {
    const categoryId = value === 'all' ? undefined : value;
    setSelectedCategoryId(categoryId);
    onCategoryFilterChange?.(categoryId);
  };

  const handleTagToggle = (tagId: string) => {
    const newTagIds = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];
    setSelectedTagIds(newTagIds);
    onTagFilterChange?.(newTagIds);
  };

  const handleSelectAll = () => {
    if (selectedArticleIds.length === articles.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(articles.map((a) => a.id));
    }
  };

  const handleSelectOne = (articleId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedArticleIds, articleId]);
    } else {
      onSelectionChange(selectedArticleIds.filter((id) => id !== articleId));
    }
  };

  const isAllSelected = articles.length > 0 && selectedArticleIds.length === articles.length;
  const isSomeSelected = selectedArticleIds.length > 0 && selectedArticleIds.length < articles.length;

  const getRelationshipType = (articleId: string): 'related' | 'similar' | 'recommended' | null => {
    const related = relatedArticles.find((rel) => rel.relatedId === articleId);
    return related?.relationshipType || null;
  };

  const getRelationshipTypeLabel = (type: 'related' | 'similar' | 'recommended'): string => {
    switch (type) {
      case 'similar':
        return 'Similar';
      case 'recommended':
        return 'Recommended';
      default:
        return 'Related';
    }
  };

  const getRelationshipTypeVariant = (type: 'related' | 'similar' | 'recommended'): 'default' | 'secondary' | 'outline' => {
    switch (type) {
      case 'recommended':
        return 'default';
      case 'similar':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search titles..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedCategoryId || 'all'} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-between">
                <span>
                  {selectedTagIds.length > 0
                    ? `${selectedTagIds.length} tags selected`
                    : 'All Tags'}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0" align="start">
              <div className="max-h-[300px] overflow-y-auto p-2">
                {tags.length > 0 ? (
                  <div className="space-y-1">
                    {tags.map((tag) => {
                      const isSelected = selectedTagIds.includes(tag.id);
                      return (
                        <div
                          key={tag.id}
                          className="flex items-center gap-2 p-2 rounded-sm hover:bg-accent cursor-pointer"
                          onClick={() => handleTagToggle(tag.id)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleTagToggle(tag.id)}
                            id={`filter-tag-${tag.id}`}
                          />
                          <Label
                            htmlFor={`filter-tag-${tag.id}`}
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
                    No tags available
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {(selectedCategoryId || selectedTagIds.length > 0 || searchQuery) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedCategoryId && (
            <Badge variant="secondary" className="gap-1">
              {categories.find((c) => c.id === selectedCategoryId)?.name}
              <button
                onClick={() => handleCategoryChange('all')}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedTagIds.map((tagId) => {
            const tag = tags.find((t) => t.id === tagId);
            return tag ? (
              <Badge key={tagId} variant="secondary" className="gap-1">
                {tag.name}
                <button
                  onClick={() => handleTagToggle(tagId)}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : null;
          })}
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchQuery}
              <button
                onClick={() => handleSearchChange('')}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedArticleIds.length > 0 && (
            <span>{selectedArticleIds.length} articles selected</span>
          )}
        </div>
        {articles.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </Button>
        )}
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isSomeSelected;
                  }}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Relationship Type</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-medium">No articles found</p>
                    <p className="text-xs">Try adjusting filters or search terms</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => {
                const isSelected = selectedArticleIds.includes(article.id);
                return (
                  <TableRow
                    key={article.id}
                    className={cn(isSelected && 'bg-muted/50')}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectOne(article.id, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <HoverCard openDelay={150} closeDelay={100}>
                        <HoverCardTrigger asChild>
                          <button
                            type="button"
                            className="w-full text-left truncate hover:underline focus:outline-none"
                          >
                            {article.title}
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80 space-y-3">
                          <div>
                            <p className="text-sm font-semibold mb-1">{article.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {article.clientName}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-[11px] text-muted-foreground mb-1">Status</p>
                              <Badge variant={getStatusVariant(article.status as ArticleStatus)}>
                                {getStatusLabel(article.status as ArticleStatus)}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-[11px] text-muted-foreground mb-1">Published</p>
                              <p className="text-xs">
                                {article.datePublished
                                  ? format(new Date(article.datePublished), 'yyyy-MM-dd')
                                  : '-'}
                              </p>
                            </div>
                            <div>
                              <p className="text-[11px] text-muted-foreground mb-1">Category</p>
                              <p className="text-xs">
                                {article.categoryName || '-'}
                              </p>
                            </div>
                            <div>
                              <p className="text-[11px] text-muted-foreground mb-1">Tags</p>
                              {article.tags.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {article.tags.slice(0, 3).map((tag) => (
                                    <Badge key={tag.id} variant="secondary" className="text-[10px]">
                                      {tag.name}
                                    </Badge>
                                  ))}
                                  {article.tags.length > 3 && (
                                    <span className="text-[10px] text-muted-foreground">
                                      +{article.tags.length - 3}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">-</p>
                              )}
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                    <TableCell>{article.clientName}</TableCell>
                    <TableCell>
                      {isSelected ? (
                        <div className="space-y-2">
                          <Select
                            value={getRelationshipType(article.id) || 'related'}
                            onValueChange={(value) =>
                              onRelationshipTypeChange?.(
                                article.id,
                                value as 'related' | 'similar' | 'recommended'
                              )
                            }
                          >
                            <SelectTrigger className="h-8 w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="related">Related</SelectItem>
                              <SelectItem value="similar">Similar</SelectItem>
                              <SelectItem value="recommended">Recommended</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/articles/${article.id}`}
                          target="_blank"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
