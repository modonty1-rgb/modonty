"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { ASSET_LABEL } from "../../helpers/video-labels";
import { CopyEditor, type AssetCopy } from "./copy-editor";
import { PlatformRow, type ItemView } from "./platform-row";

const N1 = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 1 });

/** ملف واحد (الفيديو العادي أو شورت): تشغيله، وقرار كل منصة، ونصّه للتعديل. */
export function AssetCard({
  jobId,
  asset,
  file,
  seconds,
  series,
  items,
  copy,
}: {
  jobId: string;
  asset: string;
  file: string | null;
  seconds: number | null;
  series: string | null;
  items: ItemView[];
  copy: AssetCopy;
}) {
  const isLong = asset === "long";
  const [editing, setEditing] = useState(false);
  const captionFor = (p: ItemView["platform"]) =>
    p === "TIKTOK"
      ? [copy.tiktok?.caption, (copy.tiktok?.hashtags ?? []).map((t) => `#${t}`).join(" ")].filter(Boolean).join("\n\n")
      : p === "INSTAGRAM"
        ? (copy.instagram?.caption ?? "")
        : "";

  return (
    <section className={cn("rounded-lg border bg-card", isLong && "lg:col-span-3")}>
      <header className="flex flex-wrap items-baseline gap-2 border-b px-3 py-2">
        <h2 className="text-sm font-semibold">{ASSET_LABEL(asset)}</h2>
        {series ? <span className="text-xs text-muted-foreground">{series}</span> : null}
        {seconds ? <span className="ms-auto text-xs tabular-nums text-muted-foreground">{N1.format(seconds)} ث</span> : null}
      </header>
      <div className={cn("grid gap-3 p-3", isLong && "lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]")}>
        {file ? (
          <video src={file} controls preload="metadata" className={cn("w-full rounded-md bg-black", isLong ? "aspect-video" : "mx-auto aspect-[9/16] max-h-[420px]")} />
        ) : (
          <p className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">الملف ما وصل</p>
        )}
        <div className="min-w-0">
          {copy.youtube?.title ? <p className="mb-1 text-sm font-medium" dir="auto">{copy.youtube.title}</p> : null}
          <ul className="divide-y">
            {items.map((item) => (
              <PlatformRow key={item.platform} jobId={jobId} asset={asset} item={item} file={file} caption={captionFor(item.platform)} />
            ))}
          </ul>
          <button type="button" onClick={() => setEditing((v) => !v)} className="mt-2 flex items-center gap-1 text-xs font-medium text-primary">
            <ChevronDown className={cn("size-3.5 transition-transform", editing && "rotate-180")} aria-hidden /> عدّل النص قبل الاعتماد
          </button>
          {editing ? (
            <div className="mt-2 rounded-md border bg-background/70 p-3">
              <CopyEditor jobId={jobId} asset={asset} isLong={isLong} initial={copy} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
