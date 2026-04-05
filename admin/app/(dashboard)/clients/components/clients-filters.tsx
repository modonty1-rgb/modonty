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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function buildUrl(params: Record<string, string>) {
  const filtered = Object.entries(params).filter(([, v]) => v && v !== "all");
  if (filtered.length === 0) return "/clients";
  const qs = new URLSearchParams(filtered).toString();
  return `/clients?${qs}`;
}

export function ClientsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const hasArticles = searchParams.get("hasArticles") || "all";
  const createdFrom = searchParams.get("createdFrom") || "";
  const createdTo = searchParams.get("createdTo") || "";
  const minArticleCount = searchParams.get("minArticleCount") || "";
  const maxArticleCount = searchParams.get("maxArticleCount") || "";

  const currentParams = () => ({
    hasArticles,
    createdFrom,
    createdTo,
    minArticleCount,
    maxArticleCount,
  });

  const handleChange = (key: string, value: string) => {
    startTransition(() => {
      const params = { ...currentParams(), [key]: value };
      router.push(buildUrl(params));
    });
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* فلتر المقالات */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">المقالات</Label>
        <Select
          value={hasArticles}
          onValueChange={(v) => handleChange("hasArticles", v)}
          disabled={isPending}
        >
          <SelectTrigger className="w-40 h-9 text-sm">
            <SelectValue placeholder="الكل" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="yes">لديه مقالات</SelectItem>
            <SelectItem value="no">بدون مقالات</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* تاريخ الإنشاء من */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">من تاريخ</Label>
        <Input
          type="date"
          value={createdFrom}
          onChange={(e) => handleChange("createdFrom", e.target.value)}
          disabled={isPending}
          className="w-40 h-9 text-sm"
        />
      </div>

      {/* تاريخ الإنشاء إلى */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">إلى تاريخ</Label>
        <Input
          type="date"
          value={createdTo}
          onChange={(e) => handleChange("createdTo", e.target.value)}
          disabled={isPending}
          className="w-40 h-9 text-sm"
        />
      </div>

      {/* الحد الأدنى لعدد المقالات */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">أقل عدد مقالات</Label>
        <Input
          type="number"
          min={0}
          placeholder="0"
          value={minArticleCount}
          onChange={(e) => handleChange("minArticleCount", e.target.value)}
          disabled={isPending}
          className="w-32 h-9 text-sm"
        />
      </div>

      {/* الحد الأقصى لعدد المقالات */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">أكثر عدد مقالات</Label>
        <Input
          type="number"
          min={0}
          placeholder="∞"
          value={maxArticleCount}
          onChange={(e) => handleChange("maxArticleCount", e.target.value)}
          disabled={isPending}
          className="w-32 h-9 text-sm"
        />
      </div>
    </div>
  );
}
