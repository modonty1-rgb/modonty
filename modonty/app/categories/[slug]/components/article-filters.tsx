"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, LayoutGrid, List, AlignJustify } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ArticleFiltersProps {
  currentSort?: string;
  currentView?: string;
  categorySlug: string;
}

export function ArticleFilters({ currentSort = 'latest', currentView = 'grid', categorySlug }: ArticleFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sort);
    
    startTransition(() => {
      router.push(`/categories/${categorySlug}?${params.toString()}`);
    });
  };

  const handleViewChange = (view: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('category-articles-view', view);
    }
    
    startTransition(() => {
      router.push(`/categories/${categorySlug}?${params.toString()}`);
    });
  };

  const sortOptions = [
    { value: 'latest', label: 'الأحدث' },
    { value: 'oldest', label: 'الأقدم' },
    { value: 'popular', label: 'الأكثر مشاهدة' },
    { value: 'trending', label: 'الرائجة' },
  ];

  const currentSortLabel = sortOptions.find(opt => opt.value === currentSort)?.label || 'الأحدث';

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2" disabled={isPending}>
            <ArrowUpDown className="h-4 w-4" />
            <span className="hidden sm:inline">{currentSortLabel}</span>
            <span className="sm:hidden">ترتيب</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={currentSort === option.value ? 'bg-accent' : ''}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex border rounded-lg overflow-hidden">
        <Button
          variant={currentView === 'grid' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleViewChange('grid')}
          disabled={isPending}
          className="rounded-none px-3"
          title="عرض شبكي"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={currentView === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleViewChange('list')}
          disabled={isPending}
          className="rounded-none px-3"
          title="عرض قائمة"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={currentView === 'compact' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleViewChange('compact')}
          disabled={isPending}
          className="rounded-none px-3"
          title="عرض مضغوط"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
