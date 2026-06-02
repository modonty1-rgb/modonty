"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import type { EssentialSeoField } from "@/lib/seo/essential-seo-fields";

interface EssentialSeoDialogProps {
  missing: EssentialSeoField[];
}

// Shown once per browser session (until dismissed) when essential SEO fields are empty.
const SESSION_KEY = "essential-seo-dialog-dismissed";

export function EssentialSeoDialog({ missing }: EssentialSeoDialogProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (missing.length === 0) return;
    if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    setOpen(true);
  }, [missing.length]);

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, "1");
    setOpen(false);
  }

  if (missing.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && dismiss()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Essential SEO fields are missing</DialogTitle>
          <DialogDescription>
            These required fields power modonty.com&apos;s homepage metadata, social
            share cards, and structured data. Please fill them in Modonty settings.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 py-2">
          {missing.map((field) => (
            <li key={field.key} className="flex items-center gap-2 text-sm">
              <span
                className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-destructive"
                aria-hidden
              />
              {field.label}
            </li>
          ))}
        </ul>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={dismiss}>
            Later
          </Button>
          <Button asChild>
            <Link href="/settings/modonty" onClick={dismiss}>
              Go to Modonty settings
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
