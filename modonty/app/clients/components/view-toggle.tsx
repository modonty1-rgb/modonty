'use client';

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 border rounded-md p-1">
      <Button
        variant={value === 'grid' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onChange('grid')}
        aria-label="عرض شبكي"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={value === 'list' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onChange('list')}
        aria-label="عرض قائمة"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
