"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function DatabaseError({ reset }: { reset: () => void }) {
  return (
    <div className="container mx-auto max-w-[1128px] py-20">
      <div className="flex flex-col items-center text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive/50" />
        <h2 className="text-xl font-semibold">Could not load database info</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          There might be a connection issue. Please try again.
        </p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
