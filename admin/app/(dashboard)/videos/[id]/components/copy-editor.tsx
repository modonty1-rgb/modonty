"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { saveVideoCopy } from "../actions/save-video-copy";

export type AssetCopy = {
  youtube?: { title: string; description: string; chapters?: string; tags?: string[] };
  tiktok?: { caption: string; hashtags: string[] };
  instagram?: { caption: string };
};

/** نصوص ملف واحد قبل الاعتماد — يوتيوب للكل، وتيك توك وإنستغرام للشورتس. يُحفظ دفعة واحدة. */
export function CopyEditor({ jobId, asset, isLong, initial }: { jobId: string; asset: string; isLong: boolean; initial: AssetCopy }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [c, setC] = useState({
    ytTitle: initial.youtube?.title ?? "",
    ytDesc: initial.youtube?.description ?? "",
    chapters: initial.youtube?.chapters ?? "",
    ytTags: (initial.youtube?.tags ?? []).join("، "),
    tt: initial.tiktok?.caption ?? "",
    tags: (initial.tiktok?.hashtags ?? []).join(" "),
    ig: initial.instagram?.caption ?? "",
  });
  const set = (k: keyof typeof c) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setC((v) => ({ ...v, [k]: e.target.value }));

  const save = () =>
    start(async () => {
      const r = await saveVideoCopy({
        jobId,
        asset: asset as "long",
        copy: {
          youtube: {
            title: c.ytTitle,
            description: c.ytDesc,
            ...(isLong ? { chapters: c.chapters } : {}),
            // A YouTube tag may hold spaces («تحليل صورة الدم») — split on commas only.
            tags: c.ytTags.split(/[,،]+/).map((t) => t.trim()).filter(Boolean),
          },
          ...(isLong
            ? {}
            : {
                tiktok: { caption: c.tt, hashtags: c.tags.split(/[\s,،]+/).map((t) => t.replace(/^#/, "")).filter(Boolean) },
                instagram: { caption: c.ig },
              }),
        },
      });
      toast(r.success ? { title: "انحفظ النص", variant: "success" } : { title: r.error, variant: "destructive" });
      if (r.success) router.refresh();
    });

  return (
    <div className="space-y-2 text-sm">
      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">عنوان يوتيوب ({c.ytTitle.length}/١٠٠)</span>
        <Input value={c.ytTitle} onChange={set("ytTitle")} maxLength={100} dir="auto" />
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">وصف يوتيوب</span>
        <Textarea value={c.ytDesc} onChange={set("ytDesc")} className="min-h-20" dir="auto" />
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">وسوم يوتيوب (مفصولة بفاصلة)</span>
        <Input value={c.ytTags} onChange={set("ytTags")} dir="auto" />
      </label>
      {isLong ? (
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">الفصول</span>
          <Textarea value={c.chapters} onChange={set("chapters")} className="min-h-16 font-mono text-xs" dir="auto" />
        </label>
      ) : (
        <>
          <label className="block space-y-1">
            <span className="text-xs text-muted-foreground">نص تيك توك</span>
            <Textarea value={c.tt} onChange={set("tt")} className="min-h-16" dir="auto" />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-muted-foreground">وسوم تيك توك (مفصولة بمسافة)</span>
            <Input value={c.tags} onChange={set("tags")} dir="auto" />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-muted-foreground">نص إنستغرام</span>
            <Textarea value={c.ig} onChange={set("ig")} className="min-h-16" dir="auto" />
          </label>
        </>
      )}
      <Button size="sm" className="h-8 gap-1" disabled={pending || !c.ytTitle.trim()} onClick={save}>
        {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Save className="size-3.5" aria-hidden />} احفظ النص
      </Button>
    </div>
  );
}
