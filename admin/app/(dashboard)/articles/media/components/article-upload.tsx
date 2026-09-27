"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Plus, RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ClientCombobox } from "@/components/shared/client-combobox";
import { UploadMediaDialog, type UploadTarget } from "@/components/shared/media-upload/upload-media-dialog";
import { setArticleFeaturedImage } from "../../actions/articles-actions/mutations/set-article-featured-image";

/**
 * With an article in the target (`refId`), the saved image becomes its featured image and the
 * previous one goes (setArticleFeaturedImage). Without one, the image is saved to the client's
 * library as an article image, ready to pick in the editor.
 */
async function linkToArticle(mediaId: string, t: UploadTarget): Promise<{ linked: boolean; note?: string }> {
  if (!t.refId) return { linked: false };
  const r = await setArticleFeaturedImage(t.refId, mediaId);
  if (!r.success) return { linked: false, note: `Not set as featured — ${r.error}` };
  const notes = [
    r.removedOld ? "Previous image removed." : r.keptOldReason ? `Previous image kept — ${r.keptOldReason}` : "",
    r.seoOk ? "" : "SEO data did not rebuild — open the article and save once.",
  ].filter(Boolean);
  return { linked: true, note: notes.join(" ") || undefined };
}

const UploadCtx = createContext<(t: UploadTarget) => void>(() => {});

/** The one upload window for Articles › Media. */
export function ArticleUploadProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<UploadTarget | null>(null);
  const open = useCallback((t: UploadTarget) => setTarget(t), []);
  return (
    <UploadCtx.Provider value={open}>
      {children}
      <UploadMediaDialog target={target} onOpenChange={(o) => { if (!o) setTarget(null); }} link={linkToArticle} />
    </UploadCtx.Provider>
  );
}

/** The featured-image box is the button: empty says «Upload», filled shows «Replace» on hover. */
export function FeaturedTile({ target, filled, children }: { target: UploadTarget; filled: boolean; children?: ReactNode }) {
  const open = useContext(UploadCtx);
  const label = `${filled ? "Replace" : "Upload"} featured image`;
  return (
    <button
      type="button"
      onClick={() => open(target)}
      aria-label={label}
      title={label}
      className={
        "group/tile relative flex aspect-video w-full max-w-sm items-center justify-center overflow-hidden rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
        (filled ? "bg-muted/40" : "border border-dashed border-amber-500/60 bg-amber-500/5 hover:border-amber-500 hover:bg-amber-500/10")
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
 * The toolbar's Upload: an article image for a client's library. With a client picked (or an
 * article, which names its client) it opens straight away; otherwise it asks the client first.
 */
export function ArticleToolbarUpload({
  clients,
  clientId,
  label = "Upload",
}: {
  clients: Array<{ id: string; name: string }>;
  clientId?: string;
  label?: string;
}) {
  const open = useContext(UploadCtx);
  const [menu, setMenu] = useState(false);
  const [picked, setPicked] = useState<string | null>(clientId ?? null);
  const go = (id: string | null) => {
    const c = clients.find((x) => x.id === id);
    if (!c) return;
    setMenu(false);
    open({ clientId: c.id, clientName: c.name, role: "POST" });
  };

  if (clientId) {
    return (
      <Button size="sm" className="h-9 gap-1.5" onClick={() => go(clientId)}>
        <Upload className="h-4 w-4" />{label}
      </Button>
    );
  }
  return (
    <Popover open={menu} onOpenChange={setMenu}>
      <PopoverTrigger asChild>
        <Button size="sm" className="h-9 gap-1.5"><Upload className="h-4 w-4" />{label}</Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-3 p-3">
        <div className="space-y-1.5">
          <label htmlFor="article-upload-client" className="text-xs font-medium text-muted-foreground">Client</label>
          <ClientCombobox id="article-upload-client" clients={clients} value={picked} onChange={setPicked} className="h-9 w-full" />
        </div>
        <Button size="sm" className="w-full" disabled={!picked} onClick={() => go(picked)}>
          Upload article image
        </Button>
      </PopoverContent>
    </Popover>
  );
}
