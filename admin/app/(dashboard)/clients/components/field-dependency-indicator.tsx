"use client";

import { Info } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FieldDependencyIndicatorProps {
  condition: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FieldDependencyIndicator({
  condition,
  required = false,
  children,
  className,
}: FieldDependencyIndicatorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-md">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs text-blue-800 dark:text-blue-200">
          {required ? (
            <>
              This field is <strong>required</strong> when: {condition}
            </>
          ) : (
            <>This field is shown when: {condition}</>
          )}
        </p>
      </div>
      {children}
    </div>
  );
}
