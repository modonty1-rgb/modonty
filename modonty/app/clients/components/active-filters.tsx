'use client';

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClientFilters } from "../helpers/use-client-filters";

interface ActiveFiltersProps {
  filters: ClientFilters;
  industries: Array<{ id: string; name: string }>;
  onRemove: (key: keyof ClientFilters, value: any) => void;
  onClearAll: () => void;
}

export function ActiveFilters({ 
  filters, 
  industries, 
  onRemove, 
  onClearAll 
}: ActiveFiltersProps) {
  const activeFilters: Array<{ key: string; label: string; onRemove: () => void }> = [];

  filters.industries.forEach(id => {
    const industry = industries.find(i => i.id === id);
    if (industry) {
      activeFilters.push({
        key: `industry-${id}`,
        label: industry.name,
        onRemove: () => onRemove('industries', id)
      });
    }
  });

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap mb-6">
      <span className="text-sm text-muted-foreground">تصفية حسب:</span>
      {activeFilters.map(filter => (
        <Badge key={filter.key} variant="secondary" className="gap-1">
          {filter.label}
          <X 
            className="h-3 w-3 cursor-pointer hover:text-destructive" 
            onClick={filter.onRemove}
          />
        </Badge>
      ))}
      <Button variant="ghost" size="sm" onClick={onClearAll}>
        مسح الكل
      </Button>
    </div>
  );
}
