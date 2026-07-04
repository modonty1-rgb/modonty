"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconSort } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface EntitySortOption {
  value: string;
  label: string;
}

interface EntitySortFilterProps {
  /** Route to push to, e.g. "/tags" or "/categories". */
  basePath: string;
  options: EntitySortOption[];
  currentSort?: string;
}

export function EntitySortFilter({ basePath, options, currentSort }: EntitySortFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const active = currentSort ?? options[0]?.value;
  const currentLabel = options.find((o) => o.value === active)?.label ?? options[0]?.label;

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    startTransition(() => router.push(`${basePath}?${params.toString()}`));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-12 gap-2 rounded-xl" disabled={isPending}>
          <IconSort className="h-4 w-4" />
          <span>{currentLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleSortChange(option.value)}
            className={active === option.value ? "bg-accent" : ""}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
