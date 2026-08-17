'use client';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface IndustryChipsProps {
  industries: Array<{ id: string; name: string; clientCount: number }>;
  selected: string[];
  onSelect: (ids: string[]) => void;
}

export function IndustryChips({ 
  industries, 
  selected, 
  onSelect 
}: IndustryChipsProps) {
  return (
    <div className="py-6 border-b">
      <div className="container mx-auto max-w-[1128px] px-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          تصفح حسب الصناعة
        </h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <Button
            variant={selected.length === 0 ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelect([])}
          >
            الكل
          </Button>
          {industries.map(industry => (
            <Button
              key={industry.id}
              variant={selected.includes(industry.id) ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                const newSelected = selected.includes(industry.id)
                  ? selected.filter(id => id !== industry.id)
                  : [...selected, industry.id];
                onSelect(newSelected);
              }}
              className="gap-1.5"
            >
              {industry.name}
              <Badge variant="secondary" className="mr-1 h-5 px-1.5 text-xs">
                {industry.clientCount}
              </Badge>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
