"use client";

import type { ComponentProps } from "react";
import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "../lib/utils";

/** Shared shadcn wrapper around react-resizable-panels. */
export function ResizablePanelGroup({
  className,
  orientation = "horizontal",
  ...props
}: ComponentProps<typeof ResizablePrimitive.Group>) {
  return (
    <ResizablePrimitive.Group
      orientation={orientation}
      className={cn("flex w-full", orientation === "vertical" ? "flex-col" : "flex-row", className)}
      {...props}
    />
  );
}

export function ResizablePanel(props: ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel {...props} />;
}

export function ResizableHandle({
  className,
  withHandle = false,
  ...props
}: ComponentProps<typeof ResizablePrimitive.Separator> & { withHandle?: boolean }) {
  return (
    <ResizablePrimitive.Separator
      className={cn(
        "relative flex w-5 shrink-0 cursor-col-resize items-center justify-center bg-transparent outline-none before:absolute before:inset-y-0 before:w-px before:bg-border before:transition-colors hover:before:bg-primary focus-visible:before:bg-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {withHandle ? (
        <span className="grid size-6 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-sm">
          <GripVertical className="size-3.5" aria-hidden />
        </span>
      ) : null}
    </ResizablePrimitive.Separator>
  );
}
