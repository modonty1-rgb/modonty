"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, Copy, Check } from "lucide-react";
import type { SourceInfo } from "../helpers/source-info";

interface DataSourceCardProps {
  sourceInfo: SourceInfo;
  onCopy?: () => void;
  hasData?: boolean;
  copied?: boolean;
  dataLength?: number;
  nodeCount?: number;
  itemCount?: number | null;
}

export function DataSourceCard({ sourceInfo, onCopy, hasData, copied, dataLength, nodeCount, itemCount }: DataSourceCardProps) {
  return (
    <Card className="border-muted/50">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
            Data Source
            {dataLength != null && dataLength > 0 && (
              <Badge variant="secondary" className="font-normal">
                {dataLength.toLocaleString()} chars
              </Badge>
            )}
            {nodeCount != null && nodeCount > 0 && (
              <Badge variant="outline" className="font-normal">
                {nodeCount.toLocaleString()} nodes
              </Badge>
            )}
          </div>
          {hasData && onCopy != null && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={onCopy}
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Copy
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-4 space-y-2">
        <div className="rounded-md bg-muted/50 px-3 py-2">
          <span className="text-xs text-muted-foreground">From: </span>
          <span className="text-sm font-medium">{sourceInfo.originPath}</span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Source: </span>
          <span className="text-sm font-medium">{sourceInfo.label}</span>
        </div>
        {sourceInfo.field && (
          <div>
            <span className="text-xs text-muted-foreground">Field: </span>
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
              {sourceInfo.field}
            </code>
          </div>
        )}
        <div>
          <span className="text-xs text-muted-foreground">What feeds this: </span>
          <span className="text-sm">
            {sourceInfo.feeds}
            {itemCount != null && itemCount > 0 && ` (${itemCount.toLocaleString()} items)`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
