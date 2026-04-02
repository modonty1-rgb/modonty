"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ClientsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const hasArticles = searchParams.get("hasArticles") || "all";

  const handleChange = (value: string) => {
    startTransition(() => {
      if (value === "all") {
        router.push("/clients");
      } else {
        router.push(`/clients?hasArticles=${value}`);
      }
    });
  };

  return (
    <Select value={hasArticles} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-40 h-9 text-sm">
        <SelectValue placeholder="All clients" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All clients</SelectItem>
        <SelectItem value="yes">With articles</SelectItem>
        <SelectItem value="no">Without articles</SelectItem>
      </SelectContent>
    </Select>
  );
}
