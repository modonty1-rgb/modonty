"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { SearchInput } from "./SearchInput";
import { SearchResultsSkeleton } from "./SearchResultsSkeleton";

interface SearchSectionProps {
  defaultQuery: string;
  defaultScope: "all" | "articles" | "clients";
  children: React.ReactNode;
}

export function SearchSection({ defaultQuery, defaultScope, children }: SearchSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleNavigate = (url: string) => {
    startTransition(() => router.replace(url));
  };

  return (
    <>
      <SearchInput
        defaultValue={defaultQuery}
        defaultScope={defaultScope}
        onNavigate={handleNavigate}
        isPending={isPending}
      />
      {isPending ? <SearchResultsSkeleton /> : children}
    </>
  );
}
