"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CategorySearchFormProps {
  defaultValue?: string;
}

export function CategorySearchForm({ defaultValue = "" }: CategorySearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(defaultValue);

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }

    startTransition(() => {
      router.push(`/categories?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setSearchValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    
    startTransition(() => {
      router.push(`/categories?${params.toString()}`);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchValue);
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="ابحث في الفئات..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pr-10 pl-10"
          disabled={isPending}
        />
        {searchValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            disabled={isPending}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {isPending && (
        <div className="absolute left-0 right-0 -bottom-1 h-0.5 bg-primary/20 overflow-hidden">
          <div className="h-full bg-primary w-1/3 animate-pulse"></div>
        </div>
      )}
    </form>
  );
}
