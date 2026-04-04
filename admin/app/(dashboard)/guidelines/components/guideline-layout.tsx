"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
      <div className="flex items-center gap-3">
        <Link href="/guidelines">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowRight className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
            Guidelines
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>

      {children}
    </div>
  );
}
