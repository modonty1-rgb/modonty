"use client";

import { Loader2, FileText, ExternalLink } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface FetchedRobots {
  url: string;
  status: number;
  content: string;
  fetchedAt: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  robots: FetchedRobots | null;
}

export function RobotsTxtDialog({ open, onOpenChange, loading, robots }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-violet-500" />
            robots.txt
            {robots && (
              <span
                className={`inline-flex items-center gap-1 ms-2 px-2 py-0.5 rounded-full border text-xs font-bold ${
                  robots.status === 200
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20"
                }`}
              >
                {robots.status}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>Live content fetched from your domain</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {loading && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin inline-block me-2" />
              Fetching robots.txt…
            </div>
          )}

          {!loading && !robots && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No data
            </div>
          )}

          {robots && (
            <>
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="text-muted-foreground">URL:</span>
                <a
                  href={robots.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                  className="font-mono text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  {robots.url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <pre className="p-4 rounded-md border bg-muted/30 text-xs font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {robots.content || "(empty)"}
              </pre>
            </>
          )}
        </div>

        {robots && (
          <div className="px-6 py-3 border-t text-[10px] text-muted-foreground bg-muted/20">
            Fetched at {new Date(robots.fetchedAt).toLocaleTimeString("en-US")} ·{" "}
            {robots.content.length.toLocaleString("en-US")} characters
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
