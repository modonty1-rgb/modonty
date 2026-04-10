"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface GuidelineLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function GuidelineLayout({
  title,
  description,
  children,
}: GuidelineLayoutProps) {
  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/guidelines" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5" />
          Guidelines
        </Link>
        <ChevronRight className="h-3 w-3 opacity-40" />
        <span className="text-foreground font-medium">{title}</span>
      </div>

      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>

      {children}
    </div>
  );
}
