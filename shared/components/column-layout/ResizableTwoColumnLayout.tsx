"use client";

import { useEffect, useState, type ReactNode } from "react";

import { cn } from "../../lib/utils";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../resizable";

interface ResizableTwoColumnLayoutProps {
  header?: ReactNode;
  main: ReactNode;
  rail: ReactNode;
  className?: string;
}

/**
 * A desktop work surface with a dominant reading pane and an adjustable supporting rail.
 * Below 1240px it deliberately falls back to the regular stacked two-column reading order.
 */
export function ResizableTwoColumnLayout({ header, main, rail, className }: ResizableTwoColumnLayoutProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1240px)");
    const updateViewport = () => setIsDesktop(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  return (
    <div className={cn("container mx-auto max-w-[1128px] px-3 py-3 sm:px-4 sm:py-6", className)}>
      {header ? <div className="mb-6">{header}</div> : null}

      {isDesktop ? (
        <ResizablePanelGroup
          orientation="horizontal"
          className="h-[calc(100dvh-11rem)] min-h-[32rem] max-h-[46rem]"
        >
          <ResizablePanel defaultSize="73%" className="min-w-0">
            <div className="h-full overflow-y-auto overscroll-contain pe-3 sm:space-y-4">{main}</div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="27%" className="min-w-0">
            <div className="h-full overflow-y-auto overscroll-contain ps-3">{rail}</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="flex flex-col items-start gap-6">
          <div className="w-full min-w-0 space-y-3 sm:space-y-4">{main}</div>
          {rail}
        </div>
      )}
    </div>
  );
}
