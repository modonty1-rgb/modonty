"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MobileSearch() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden min-h-11 min-w-11"
        aria-label="Open search"
        disabled
      >
        <Search className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden min-h-11 min-w-11"
          aria-label="Open search"
        >
          <Search className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-full h-full m-0 rounded-none sm:max-w-full sm:h-auto sm:rounded-lg">
        <DialogHeader>
          <DialogTitle>بحث</DialogTitle>
        </DialogHeader>
        <div className="pt-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="بحث"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-4 pr-10 text-base"
              autoFocus
              aria-label="Search input"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
