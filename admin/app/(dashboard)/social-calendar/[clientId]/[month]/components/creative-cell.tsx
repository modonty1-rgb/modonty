"use client";

import { useState } from "react";
import { ExternalLink, Film, ImageIcon, Lock } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { AssetMedia } from "../../../components/asset-media";
import type { SocialPostRow } from "../../../helpers/queries";

/**
 * خانة «إبداع» في الجدول (القديم `CreativeCell` — `CalendarTable.tsx:45-141`): قفل في «قيد الإنتاج»
 * أو بلا ملفات، وإلّا أيقونة نوع الأوّل + العدد، تفتح معاينة بتبويب لكل ملف.
 */
export function CreativeCell({ post }: { post: SocialPostRow }) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const assets = post.assets;

  if (assets.length === 0 || post.status === "IN_PRODUCTION") {
    return (
      <div className="flex items-center justify-center">
        <span
          className="text-muted-foreground/25"
          title={post.status === "IN_PRODUCTION" ? "الإبداع قيد الإنتاج" : "لا يوجد إبداع"}
        >
          <Lock className="h-3.5 w-3.5" />
        </span>
      </div>
    );
  }

  const active = assets[activeIdx] ?? assets[0];

  return (
    <>
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={() => {
            setActiveIdx(0);
            setOpen(true);
          }}
          className="inline-flex items-center gap-1 text-primary/60 transition-colors hover:text-primary"
          title="معاينة الإبداع"
        >
          {assets[0].kind === "VIDEO" ? <Film className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
          {assets.length > 1 && <span className="text-[10px] font-bold tabular-nums">{assets.length}</span>}
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="gap-0 overflow-hidden p-0 sm:max-w-3xl">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 pe-12">
            <DialogTitle className="truncate text-sm font-semibold">
              {post.idea || `يوم ${post.scheduledFor.getUTCDate()}`}
            </DialogTitle>
            {assets.length > 1 && (
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {activeIdx + 1} / {assets.length}
              </span>
            )}
          </div>

          {assets.length > 1 && (
            <div className="flex gap-1 overflow-x-auto border-b border-border bg-muted/20 px-4 py-2">
              {assets.map((a, i) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className={cn(
                    "shrink-0 rounded-lg px-3 py-1 text-xs font-medium transition-colors",
                    i === activeIdx
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {a.label || `ملف ${i + 1}`}
                </button>
              ))}
            </div>
          )}

          <div className="flex max-h-[65vh] min-h-[40vh] items-center justify-center overflow-auto bg-black/5 p-2">
            <AssetMedia asset={active} autoPlay className="max-h-[60vh] max-w-full rounded-lg" />
          </div>

          <div className="flex justify-end border-t border-border px-4 py-2">
            <a
              href={active.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              فتح
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
