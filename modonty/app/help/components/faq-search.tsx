"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FAQSearchProps {
  onSearchChange: (query: string) => void;
  resultCount?: number;
  totalCount: number;
}

export function FAQSearch({ onSearchChange, resultCount, totalCount }: FAQSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearchChange(value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    onSearchChange("");
  };

  return (
    <div className="relative mb-6">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="ابحث في الأسئلة الشائعة..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pr-10 pl-10"
          aria-label="بحث في الأسئلة الشائعة"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={clearSearch}
            aria-label="مسح البحث"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {searchQuery && resultCount !== undefined && (
        <p className="text-sm text-muted-foreground mt-2">
          {resultCount > 0 ? (
            <>تم العثور على {resultCount} من {totalCount} سؤال</>
          ) : (
            <>لم يتم العثور على نتائج</>
          )}
        </p>
      )}
    </div>
  );
}
