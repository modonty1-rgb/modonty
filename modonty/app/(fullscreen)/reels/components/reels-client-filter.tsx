"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconChevronDown } from "@/lib/icons";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ReelClientFilterOption } from "@/lib/queries/get-reels-feed-page";

interface ReelsClientFilterProps {
  clients: ReelClientFilterOption[];
  selectedClient: ReelClientFilterOption | null;
}

/** Desktop gets a compact anchored menu; a bottom sheet would waste the wide screen. */
export function ReelsClientFilterDesktop({ clients, selectedClient }: ReelsClientFilterProps) {
  const router = useRouter();
  const label = selectedClient?.name ?? "كل الشركاء";
  const select = (slug?: string) => router.push(slug ? `/reels?client=${encodeURIComponent(slug)}` : "/reels");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`تصفية الريلز: ${label}`}
          className="pointer-events-auto inline-flex h-9 items-center gap-1 rounded-full bg-white/10 pe-2 ps-0.5 text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="relative grid size-8 shrink-0 place-items-center overflow-hidden rounded-full text-[10px] font-bold">
            {selectedClient?.logoUrl ? (
              <OptimizedImage media={asMedia(selectedClient.logoUrl)} alt="" fill sizes="32px" className="object-contain" />
            ) : (
              "م"
            )}
          </span>
          <IconChevronDown className="size-3.5 shrink-0" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-[min(60dvh,26rem)] w-64 overflow-y-auto bg-neutral-950 text-white" style={{ direction: "rtl" }}>
        <DropdownMenuItem onSelect={() => select()} className="min-h-11 cursor-pointer gap-2.5 text-white focus:bg-white/10 focus:text-white">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/10 text-[10px] font-black">م</span>
          <span className="flex-1">كل الريلز</span>
          {!selectedClient && <IconCheck className="size-4 text-primary" aria-label="محدد" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-neutral-800" />
        {clients.map((client) => {
          const selected = selectedClient?.slug === client.slug;
          return (
            <DropdownMenuItem
              key={client.slug}
              onSelect={() => select(client.slug)}
              className="min-h-11 cursor-pointer gap-2.5 text-white focus:bg-white/10 focus:text-white"
            >
              <span className="relative grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10 text-[10px] font-bold">
                {client.logoUrl ? <OptimizedImage media={asMedia(client.logoUrl)} alt="" fill sizes="28px" className="object-contain" /> : client.name.slice(0, 1)}
              </span>
              <span className="min-w-0 flex-1 truncate">{client.name}</span>
              {selected && <IconCheck className="size-4 text-primary" aria-label="محدد" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Mobile-only partner filter: the feed stays full-screen while the choice rises from below. */
export function ReelsClientFilter({ clients, selectedClient }: ReelsClientFilterProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const label = selectedClient?.name ?? "الريلز";

  const select = (slug?: string) => {
    setOpen(false);
    router.push(slug ? `/reels?client=${encodeURIComponent(slug)}` : "/reels");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`تصفية الريلز: ${label}`}
        className="pointer-events-auto inline-flex h-11 items-center gap-1.5 rounded-full bg-black/55 pe-3 ps-1 text-white backdrop-blur transition hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10 text-xs font-black">
          {selectedClient?.logoUrl ? (
            <OptimizedImage media={asMedia(selectedClient.logoUrl)} alt="" fill sizes="36px" className="object-contain" />
          ) : (
            "م"
          )}
        </span>
        <IconChevronDown className="size-4 shrink-0" aria-hidden />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="flex max-h-[62dvh] flex-col rounded-t-2xl border-neutral-800 bg-neutral-950 p-0 text-white" dir="rtl">
          {/* The all-reels option IS the sheet header: one clear selected state, no repeated
              title, helper copy, divider and option competing for a phone's short height. */}
          <button
            type="button"
            onClick={() => select()}
            className="flex min-h-12 w-full items-center gap-2.5 border-b border-neutral-800 px-3 text-start transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-black">م</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold">كل الريلز</span>
              <span className="block text-xs text-neutral-400">كل الشركاء</span>
            </span>
            {!selectedClient && <IconCheck className="size-5 text-primary" aria-label="محدد" />}
          </button>
          <div className="flex-1 overflow-y-auto overscroll-contain p-2">
            {clients.map((client) => {
              const selected = selectedClient?.slug === client.slug;
              return (
                <button
                  key={client.slug}
                  type="button"
                  onClick={() => select(client.slug)}
                  className="flex min-h-12 w-full items-center gap-2.5 rounded-xl px-2.5 text-start transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10 text-xs font-bold text-white">
                    {client.logoUrl ? <OptimizedImage media={asMedia(client.logoUrl)} alt="" fill sizes="36px" className="object-contain" /> : client.name.slice(0, 1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{client.name}</span>
                    <span className="block text-xs text-neutral-400">{client.reelCount} ريلز منشورة</span>
                  </span>
                  {selected && <IconCheck className="size-5 text-primary" aria-label="محدد" />}
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
