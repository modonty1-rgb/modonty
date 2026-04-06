"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ClientsError({ reset }: { reset: () => void }) {
  return (
    <div className="max-w-[1200px] mx-auto py-20">
      <div className="flex flex-col items-center text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive/50" />
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          Failed to load data. Please try again.
        </p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
