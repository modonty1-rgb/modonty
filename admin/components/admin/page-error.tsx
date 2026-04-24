"use client";

import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

interface PageErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}

export function PageError({ error, reset, title = "Something went wrong" }: PageErrorProps) {
  return (
    <div className="max-w-[1200px] mx-auto py-20">
      <div className="flex flex-col items-center text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-destructive/50" />
        <h2 className="text-xl font-semibold">{title}</h2>

        {error.message && (
          <p className="text-sm text-destructive/80 max-w-md font-mono bg-destructive/5 px-3 py-2 rounded">
            {error.message}
          </p>
        )}

        {error.digest && (
          <p className="text-xs text-muted-foreground">
            Error ID:{" "}
            <Link href="/system-errors" className="font-mono underline hover:text-foreground">
              {error.digest}
            </Link>
            {" "}— check{" "}
            <Link href="/system-errors" className="underline hover:text-foreground">
              Error Logs
            </Link>
          </p>
        )}

        <Button onClick={reset} size="sm">
          Try Again
        </Button>
      </div>
    </div>
  );
}
