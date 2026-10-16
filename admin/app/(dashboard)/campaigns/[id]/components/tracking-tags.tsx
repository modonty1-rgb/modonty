import { cn } from "@/lib/utils";
import type { LandingTracking } from "../helpers/get-landing-tracking";

/** ما يطلقه GTM على صفحة الهبوط — النسخة المنشورة: كل تاق، بكسله، أحداثه، ومتى يُطلق. */
export function TrackingTags({ tracking, page }: { tracking: LandingTracking; page: string }) {
  // Technical — closed by default; the summary line carries the one fact that matters (is the pixel there).
  return (
    <details className="group rounded-lg border bg-card">
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm [&::-webkit-details-marker]:hidden">
        {/* The page's name on the same line — with two landing pages the two rows looked identical (Khalid, 16 Oct 2026). */}
        <span className="font-semibold">
          التتبّع على صفحة الهبوط{" "}
          <span dir="ltr" className="text-primary">{tracking.ok ? tracking.containerName : page}</span>
        </span>
        {tracking.ok ? (
          <span className="text-xs text-muted-foreground">
            <span dir="ltr">{tracking.containerId}</span> · بكسل ميتا{" "}
            <b dir="ltr" className="text-foreground">{tracking.pixelIds.join(" · ") || "مو موجود"}</b>
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">{tracking.error}</span>
        )}
        <span className="ms-auto text-xs text-muted-foreground group-open:hidden">تفاصيل ▾</span>
      </summary>
      {tracking.ok ? <TagList tracking={tracking} /> : null}
    </details>
  );
}

function TagList({ tracking }: { tracking: Extract<LandingTracking, { ok: true }> }) {
  return (
    <section className="border-t">
      <p className="border-b px-3 py-2 text-xs text-muted-foreground">النسخة المنشورة {tracking.liveVersion}</p>
      <ul className="divide-y text-xs">
        {tracking.tags.map((t) => (
          <li key={t.name} className={cn("grid grid-cols-[1fr_7rem_1fr] gap-3 px-3 py-1.5", t.paused && "opacity-50")}>
            <span className="font-medium" dir="auto">
              {t.name}
              {t.paused ? <span className="ms-1.5 rounded bg-muted px-1 text-[10px]">موقوف</span> : null}
            </span>
            <span className="text-muted-foreground">{t.kind}</span>
            <span className="text-muted-foreground" dir="auto">
              {t.events.length ? <b className="text-foreground">{t.events.join("، ")}</b> : null}
              {t.events.length ? " ← " : ""}
              {t.firesOn.join(" · ") || "لا يُطلق"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
