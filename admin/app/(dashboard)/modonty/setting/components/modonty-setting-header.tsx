"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare } from "lucide-react";
import { PAGE_CONFIGS, getDefaultPageConfig } from "../helpers/page-config";

export function ModontySettingHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slugFromUrl = searchParams.get("page");
  const selectedSlug =
    slugFromUrl && PAGE_CONFIGS.some((c) => c.slug === slugFromUrl)
      ? slugFromUrl
      : getDefaultPageConfig().slug;

  const handlePageChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", slug);
    router.replace(`/modonty/setting?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="sticky top-0 z-40 bg-background border-b pb-3 mb-4 pt-3 -mx-6 px-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1">
          <h1 className="text-lg font-semibold leading-tight">Modonty Pages Settings</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Content and SEO for Modonty pages
          </p>
        </div>
        <div className="col-span-3 flex items-center justify-end gap-2">
          <div className="flex flex-1 items-center gap-2 min-w-0 max-w-2xl justify-end">
            <Label htmlFor="page-selector" className="text-[11px] text-muted-foreground shrink-0">
              Select Page
            </Label>
            <Select value={selectedSlug} onValueChange={handlePageChange}>
              <SelectTrigger id="page-selector" className="h-8 text-sm min-w-[200px] flex-1 max-w-full">
                <SelectValue placeholder="Select a page" />
              </SelectTrigger>
              <SelectContent>
                {PAGE_CONFIGS.map((config) => (
                  <SelectItem key={config.slug} value={config.slug}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Link href="/modonty/faq">
            <Button variant="outline" size="sm" className="h-8 text-sm">
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
              Manage FAQs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
