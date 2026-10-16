"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Edit, Eye, GitMerge } from "lucide-react";
import { useState } from "react";

import { IndustryMergeDialog, type IndustryLite } from "./industry-merge-dialog";

/** الحذف انتقل إلى System ← Deletion للأدمن وحده (خالد ١٦ أكتوبر ٢٠٢٦). هنا العرض والتعديل والدمج. */
export function IndustryRowActions({ industry, candidates }: { industry: IndustryLite; candidates: IndustryLite[] }) {
  const industryId = industry.id;
  const router = useRouter();
  const [mergeOpen, setMergeOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/industries/${industryId}`)} aria-label="View"><Eye className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/industries/${industryId}/edit`)} aria-label="Edit"><Edit className="h-4 w-4" /></Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 border border-violet-500/30 bg-violet-500/10 text-violet-600 hover:bg-violet-500 hover:text-white dark:text-violet-400"
          onClick={() => setMergeOpen(true)}
          aria-label="Merge"
          title="Merge into another industry"
        >
          <GitMerge className="h-4 w-4" />
        </Button>
      </div>
      <IndustryMergeDialog
        source={industry}
        candidates={candidates}
        open={mergeOpen}
        onOpenChange={setMergeOpen}
        onMerged={() => router.refresh()}
      />
    </>
  );
}
