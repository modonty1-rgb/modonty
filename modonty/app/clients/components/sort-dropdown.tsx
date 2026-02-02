'use client';

import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type SortOption = 
  | 'name-asc' 
  | 'name-desc' 
  | 'articles-desc' 
  | 'articles-asc' 
  | 'newest' 
  | 'oldest';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'name-asc', label: 'الأبجدي (أ-ي)' },
  { value: 'name-desc', label: 'الأبجدي (ي-أ)' },
  { value: 'articles-desc', label: 'الأكثر مقالات' },
  { value: 'articles-asc', label: 'الأقل مقالات' },
  { value: 'newest', label: 'الأحدث انضماماً' },
  { value: 'oldest', label: 'الأقدم انضماماً' },
];

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const selectedOption = sortOptions.find(opt => opt.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowUpDown className="h-4 w-4" />
          <span className="hidden md:inline">{selectedOption?.label || 'ترتيب'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {sortOptions.map(option => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className={option.value === value ? 'bg-accent' : ''}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function sortClients<T extends { 
  name: string; 
  articleCount: number; 
  createdAt: Date 
}>(clients: T[], sortBy: SortOption): T[] {
  const sorted = [...clients];

  switch (sortBy) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name, 'ar'));
    case 'articles-desc':
      return sorted.sort((a, b) => b.articleCount - a.articleCount);
    case 'articles-asc':
      return sorted.sort((a, b) => a.articleCount - b.articleCount);
    case 'newest':
      return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    case 'oldest':
      return sorted.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    default:
      return sorted;
  }
}
