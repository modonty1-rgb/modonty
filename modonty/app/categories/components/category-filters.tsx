"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CategoryFiltersProps {
  currentSort?: string;
  currentView?: string;
}

export function CategoryFilters({ currentSort = 'articles', currentView = 'grid' }: CategoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sort);
    
    startTransition(() => {
      router.push(`/categories?${params.toString()}`);
    });
  };

  const handleViewChange = (view: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('categories-view', view);
    }
    
    startTransition(() => {
      router.push(`/categories?${params.toString()}`);
    });
  };

  const sortOptions = [
    { value: 'articles', label: 'الأكثر مقالات' },
    { value: 'name', label: 'أبجديًا' },
    { value: 'trending', label: 'الأكثر رواجًا' },
    { value: 'recent', label: 'الأكثر نشاطًا' },
  ];

  const currentSortLabel = sortOptions.find(opt => opt.value === currentSort)?.label || 'الأكثر مقالات';

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
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={currentView === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleViewChange('list')}
          disabled={isPending}
          className="rounded-none px-3"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
