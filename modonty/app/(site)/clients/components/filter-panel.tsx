'use client';

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ClientFilters } from "../helpers/use-client-filters";

interface FilterPanelProps {
  industries: Array<{ id: string; name: string; clientCount: number }>;
  filters: ClientFilters;
  onFilterChange: (key: keyof ClientFilters, value: any) => void;
  onClear: () => void;
}

export function FilterPanel({ industries, filters, onFilterChange, onClear }: FilterPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">تصفية النتائج</h3>
        <Button variant="ghost" size="sm" onClick={onClear}>
          مسح الكل
        </Button>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium">الصناعة</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {industries.map(industry => (
            <label key={industry.id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.industries.includes(industry.id)}
                onCheckedChange={(checked) => {
                  const newIndustries = checked
                    ? [...filters.industries, industry.id]
                    : filters.industries.filter(id => id !== industry.id);
                  onFilterChange('industries', newIndustries);
                }}
              />
              <span className="text-sm flex-1">{industry.name}</span>
              <span className="text-xs text-muted-foreground">({industry.clientCount})</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium">عدد المقالات</h4>
        <Slider
          min={0}
          max={50}
          step={1}
          value={filters.articleCountRange}
          onValueChange={(value) => onFilterChange('articleCountRange', value as [number, number])}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{filters.articleCountRange[0]}</span>
          <span>{filters.articleCountRange[1]}+</span>
        </div>
      </div>
    </div>
  );
}
