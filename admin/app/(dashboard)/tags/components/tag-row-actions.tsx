"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Edit, Eye, GitMerge } from "lucide-react";
import { useState } from "react";

import { TagMergeDialog, type TagLite } from "./tag-merge-dialog";

/** الحذف انتقل إلى System ← Deletion للأدمن وحده (خالد ١٦ أكتوبر ٢٠٢٦). هنا العرض والتعديل والدمج. */
export function TagRowActions({ tag, candidates }: { tag: TagLite; candidates: TagLite[] }) {
  const tagId = tag.id;
  const router = useRouter();
  const [mergeOpen, setMergeOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/tags/${tagId}`)} aria-label="View"><Eye className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/tags/${tagId}/edit`)} aria-label="Edit"><Edit className="h-4 w-4" /></Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 border border-violet-500/30 bg-violet-500/10 text-violet-600 hover:bg-violet-500 hover:text-white dark:text-violet-400"
          onClick={() => setMergeOpen(true)}
          aria-label="Merge"
          title="Merge into another tag"
        >
          <GitMerge className="h-4 w-4" />
        </Button>
      </div>
      <TagMergeDialog
        source={tag}
        candidates={candidates}
        open={mergeOpen}
        onOpenChange={setMergeOpen}
        onMerged={() => router.refresh()}
      />
    </>
  );
}
