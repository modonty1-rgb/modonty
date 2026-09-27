"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { MediaType } from "@prisma/client";
import { Plus, RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ClientCombobox } from "@/components/shared/client-combobox";
import { UploadMediaDialog, type UploadTarget } from "@/components/shared/media-upload/upload-media-dialog";
import { CLIENT_UPLOAD_ROLES, MEDIA_SPECS } from "@/lib/media/media-specs";
import { replaceClientSlotImage } from "../../actions/clients-actions/replace-client-slot-image";
import { replaceClientMini } from "../../actions/clients-actions/replace-client-mini";

/**
 * Put the saved file in its slot and drop the one it replaces (see replaceClientSlotImage).
 * The mini image has no slot field: being the client's CLIENT_MINI row is its link.
 */
async function linkToClient(mediaId: string, t: UploadTarget): Promise<{ linked: boolean; note?: string }> {
  if (t.role === "CLIENT_MINI") {
    const r = await replaceClientMini(t.clientId, mediaId);
    return { linked: true, note: r.success && r.removed ? "Previous image removed." : undefined };
  }
  if (t.role !== "LOGO" && t.role !== "HERO" && t.role !== "HERO_MOBILE") return { linked: false };
  const r = await replaceClientSlotImage(t.clientId, t.role, mediaId);
  if (!r.success) return { linked: false };
  if (r.removedOld) return { linked: true, note: "Previous image removed." };
  if ("keptOldReason" in r && r.keptOldReason) return { linked: true, note: `Previous image kept — ${r.keptOldReason}` };
  return { linked: true };
}

const UploadCtx = createContext<(t: UploadTarget) => void>(() => {});

/** Holds the one upload window for Clients › Media; every Upload/Replace on the page opens it. */
export function ClientUploadProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<UploadTarget | null>(null);
  const open = useCallback((t: UploadTarget) => setTarget(t), []);
  return (
    <UploadCtx.Provider value={open}>
      {children}
      <UploadMediaDialog target={target} onOpenChange={(o) => { if (!o) setTarget(null); }} link={linkToClient} />
    </UploadCtx.Provider>
  );
}

/**
 * A slot box that IS the button (Khalid, 26 Sep 2026: «الميسنج هذه ليش ما تخليها هي نفس الابلود»):
 * an empty box says «Upload», a filled one shows its image and «Replace» on hover/focus.
 * Either way it opens the window already set to this client and role.
 */
export function SlotTile({ target, filled, children }: { target: UploadTarget; filled: boolean; children: ReactNode }) {
  const open = useContext(UploadCtx);
  const label = `${filled ? "Replace" : "Upload"} ${MEDIA_SPECS[target.role].label}`;
  return (
    <button
      type="button"
      onClick={() => open(target)}
      aria-label={label}
      title={label}
      className={
        "group/tile relative flex h-20 w-full items-center justify-center overflow-hidden rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
        (filled
          ? "bg-muted/40 hover:bg-muted/60"
          : "border border-dashed border-amber-500/60 bg-amber-500/5 hover:border-amber-500 hover:bg-amber-500/10")
      }
    >
      {filled ? (
        <>
          {children}
          <span className="absolute inset-0 flex items-center justify-center gap-1 bg-black/55 text-xs font-medium text-white opacity-0 transition-opacity group-hover/tile:opacity-100 group-focus-visible/tile:opacity-100">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Replace
          </span>
        </>
      ) : (
        <span className="flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-500">
          <Plus className="h-3.5 w-3.5" aria-hidden /> Upload
        </span>
      )}
    </button>
  );
}

/**
 * The toolbar's Upload. With a client picked it asks only «which image?»; with none it asks
 * the client first — the window itself always opens knowing both.
 */
export function ToolbarUploadButton({
  clients,
  clientId,
  role,
  label = "Upload",
}: {
  clients: Array<{ id: string; name: string }>;
  clientId?: string;
  role?: MediaType | null;
  label?: string;
}) {
  const open = useContext(UploadCtx);
  const [menu, setMenu] = useState(false);
  const [picked, setPicked] = useState<string | undefined>(clientId);
  const client = clients.find((c) => c.id === (picked ?? clientId));

  // Client and role both known (a filtered page) — straight to the window.
  if (clientId && role) {
    const c = clients.find((x) => x.id === clientId);
    return (
      <Button size="sm" className="h-9 gap-1.5" onClick={() => c && open({ clientId, clientName: c.name, role })}>
        <Upload className="h-4 w-4" />{label}
      </Button>
    );
  }

  return (
    <Popover open={menu} onOpenChange={(o) => { setMenu(o); if (o) setPicked(clientId); }}>
      <PopoverTrigger asChild>
        <Button size="sm" className="h-9 gap-1.5"><Upload className="h-4 w-4" />{label}</Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-3 p-3">
        <div className="space-y-1.5">
          <label htmlFor="upload-client" className="text-xs font-medium text-muted-foreground">Client</label>
          {/* Same searchable picker as the page top (Khalid, 26 Sep 2026). */}
          <ClientCombobox
            id="upload-client"
            clients={clients}
            value={picked ?? null}
            onChange={(id) => setPicked(id ?? undefined)}
            className="h-9 w-full"
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Which image?</p>
          <div className="grid grid-cols-2 gap-1.5">
            {CLIENT_UPLOAD_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                disabled={!client}
                onClick={() => { if (client) { setMenu(false); open({ clientId: client.id, clientName: client.name, role: r }); } }}
                className="rounded-md border px-2 py-1.5 text-start text-xs hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="block font-medium">{MEDIA_SPECS[r].label}</span>
                <span className="text-[10px] text-muted-foreground">{MEDIA_SPECS[r].ratioLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
