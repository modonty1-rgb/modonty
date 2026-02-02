"use client";

import { useCallback, useEffect, useRef } from "react";
import JSONFormatter from "json-formatter-js";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

interface JsonTreeViewerProps {
  data: string;
  className?: string;
}

function tryParseJson(str: string): object | null {
  if (!str?.trim()) return null;
  try {
    const parsed = JSON.parse(str) as unknown;
    if (parsed !== null && typeof parsed === "object") return parsed;
    return { value: parsed };
  } catch {
    return null;
  }
}

export function JsonTreeViewer({ data, className = "" }: JsonTreeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const formatterRef = useRef<InstanceType<typeof JSONFormatter> | null>(null);
  const { resolvedTheme } = useTheme();
  const parsed = tryParseJson(data);

  useEffect(() => {
    const obj = tryParseJson(data);
    if (obj === null || !containerRef.current) return;

    const formatter = new JSONFormatter(obj, 2, {
      theme: resolvedTheme === "dark" ? "dark" : undefined,
      hoverPreviewEnabled: true,
      animateOpen: true,
      animateClose: true,
    });

    formatterRef.current = formatter;
    const el = formatter.render();
    containerRef.current.replaceChildren(el);

    return () => {
      formatterRef.current = null;
      containerRef.current?.replaceChildren();
    };
  }, [data, resolvedTheme]);

  const expandAll = useCallback(() => {
    if (typeof formatterRef.current?.openAtDepth === "function") {
      formatterRef.current.openAtDepth(Infinity);
    }
  }, []);

  const collapseAll = useCallback(() => {
    if (typeof formatterRef.current?.openAtDepth === "function") {
      formatterRef.current.openAtDepth(0);
    }
  }, []);

  if (parsed === null) {
    return (
      <pre
        className={`rounded-md border bg-muted/30 p-4 text-sm font-mono whitespace-pre-wrap break-words overflow-x-auto ${className}`}
      >
        {data}
      </pre>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={expandAll} className="h-7 text-xs">
          <ChevronDown className="h-3.5 w-3.5 mr-1.5" />
          Expand All
        </Button>
        <Button variant="outline" size="sm" onClick={collapseAll} className="h-7 text-xs">
          <ChevronRight className="h-3.5 w-3.5 mr-1.5" />
          Collapse All
        </Button>
      </div>
      <div
        ref={containerRef}
        className="rounded-md border bg-muted/30 p-4 text-sm overflow-auto json-formatter-container min-h-[200px]"
      />
    </div>
  );
}
