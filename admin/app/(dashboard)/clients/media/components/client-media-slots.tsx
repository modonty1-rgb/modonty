import type { MediaType } from "@prisma/client";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { MEDIA_SPECS } from "@/lib/media/media-specs";
import { cn } from "@/lib/utils";
import { SlotTile } from "./client-upload";

interface ClientMediaSlotsProps {
  clientId: string;
  name: string;
  slots: Array<{ role: MediaType; src: string | null; id?: string }>;
}

/**
 * The picked client's four page images, each drawn at its own ratio — present, or a dashed
 * «Upload» box. The box itself opens the upload window on this role and client, in place.
 */
export function ClientMediaSlots({ clientId, name, slots }: ClientMediaSlotsProps) {
  const missing = slots.filter((s) => !s.src).length;

  return (
    <section aria-label={`${name} page images`} className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold">{name} · page images</h2>
        <span className={cn("text-xs font-medium", missing ? "text-amber-600" : "text-emerald-600")}>
          {missing ? `${missing} missing` : "All set"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {slots.map(({ role, src, id }) => {
          const spec = MEDIA_SPECS[role];
          return (
            <div key={role} className="space-y-1.5">
              <SlotTile target={{ clientId, clientName: name, role, replacesId: id }} filled={!!src}>
                {src ? <OptimizedImage media={asMedia(src)} alt={`${name} ${spec.label}`} fill className="object-contain p-1.5" sizes="240px" /> : null}
              </SlotTile>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">{spec.label}</p>
                  <p className="text-[10px] text-muted-foreground">{spec.ratioLabel} · {spec.width}×{spec.height}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
