"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { MediaType } from "@prisma/client";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UploadMediaDialog, type UploadTarget } from "@/components/shared/media-upload/upload-media-dialog";
import { MEDIA_SPECS } from "@/lib/media/media-specs";

/**
 * What Modonty uploads: share images for its pages, brand and free images. No article image:
 * that one uploads from Articles › Media, where it is linked to its article on save — here it
 * only landed in the library, two places for one job (Khalid, 27 Sep 2026: «عشان ما يصير لخبطه»).
 */
const MODONTY_UPLOAD_ROLES: MediaType[] = ["OGIMAGE", "LOGO", "GENERAL"];

const UploadCtx = createContext<(t: UploadTarget) => void>(() => {});

/**
 * The one upload window for Modonty › Media. The owner is fixed — Modonty itself — so the
 * window never asks «which client?». Files land in Modonty's library, ready to pick in the
 * page, category or article editor; nothing is swapped on a live page from here.
 */
export function ModontyUploadProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<UploadTarget | null>(null);
  const open = useCallback((t: UploadTarget) => setTarget(t), []);
  return (
    <UploadCtx.Provider value={open}>
      {children}
      <UploadMediaDialog target={target} onOpenChange={(o) => { if (!o) setTarget(null); }} />
    </UploadCtx.Provider>
  );
}

/** Toolbar Upload: straight to the window when the kind names a role, else «which image?». */
export function ModontyUploadButton({
  coreClientId,
  coreName,
  role,
  label = "Upload",
}: {
  coreClientId: string;
  coreName: string;
  role?: MediaType | null;
  label?: string;
}) {
  const open = useContext(UploadCtx);
  const [menu, setMenu] = useState(false);
  const start = (r: MediaType) => open({ clientId: coreClientId, clientName: coreName, role: r });

  if (role) {
    return (
      <Button size="sm" className="h-9 gap-1.5" onClick={() => start(role)}>
        <Upload className="h-4 w-4" />{label}
      </Button>
    );
  }

  return (
    <Popover open={menu} onOpenChange={setMenu}>
      <PopoverTrigger asChild>
        <Button size="sm" className="h-9 gap-1.5"><Upload className="h-4 w-4" />{label}</Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 space-y-1.5 p-3">
        <p className="text-xs font-medium text-muted-foreground">Which image?</p>
        <div className="grid grid-cols-2 gap-1.5">
          {MODONTY_UPLOAD_ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => { setMenu(false); start(r); }}
              className="rounded-md border px-2 py-1.5 text-start text-xs hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="block font-medium">{MEDIA_SPECS[r].label}</span>
              <span className="text-[10px] text-muted-foreground">{MEDIA_SPECS[r].ratioLabel}</span>
            </button>
          ))}
        </div>
        {/* Nothing on the live site changes from here — said before the file is chosen. */}
        <p className="pt-1 text-[11px] leading-snug text-muted-foreground">
          Saved to Modonty&apos;s library only. To put it on the site, pick it in the page, category or Settings editor.
        </p>
      </PopoverContent>
    </Popover>
  );
}
