"use client";

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { UrlsDataTable, type UrlRow } from "./urls-data-table";

interface Props {
  rows: UrlRow[];
}

export function UrlsTabs({ rows }: Props) {
  // "Not yet indexed" = sitemap MINUS indexed (status is anything except Indexed/Indexed-with-notes)
  const notYetIndexed = useMemo(
    () =>
      rows.filter(
        (r) => r.status !== "Indexed" && r.status !== "Indexed (with notes)",
      ),
    [rows],
  );

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="all" className="gap-2">
          All URLs
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted-foreground/15 tabular-nums font-bold">
            {rows.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="pending" className="gap-2">
          Not yet indexed
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 tabular-nums font-bold">
            {notYetIndexed.length}
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-4">
        <UrlsDataTable rows={rows} />
      </TabsContent>

      <TabsContent value="pending" className="mt-4">
        <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-xs text-amber-700 dark:text-amber-400">
          Sitemap URLs that Google hasn&apos;t indexed yet. Click <strong>GSC</strong> per row,
          then submit <strong>Request Indexing</strong> in Google Search Console.
        </div>
        <UrlsDataTable rows={notYetIndexed} />
      </TabsContent>
    </Tabs>
  );
}
