import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";

/** «فيديو تعريفي» — one wide player with the partner's own poster (Shopify `video` section). */
export function IntroVideo({ data }: { data: HomeData; preview?: boolean }) {
  const v = data.video;
  if (!v) return null;
  // A phone video (portrait) in a fixed 16:9 box played as a thin strip inside black bars
  // (4 Oct 2026). The box now takes the file's own ratio, and a portrait one is capped in width
  // so it does not run three screens tall. «في دقيقة» promised a length nobody checked.
  const ratio = v.width && v.height ? v.width / v.height : 16 / 9;
  const portrait = ratio < 1;
  return (
    <Section id="video" eyebrow="بالصوت والصورة" heading={v.title ?? `تعرّف على ${data.name}`} tone="muted">
      <div className={portrait ? "mx-auto max-w-sm overflow-hidden rounded-[var(--ps-radius-card,0.5rem)] bg-black" : "overflow-hidden rounded-[var(--ps-radius-card,0.5rem)] bg-black"}>
        <video controls preload="none" poster={v.posterUrl ?? undefined} className="w-full" style={{ aspectRatio: String(ratio) }}>
          <source src={v.url} type="video/mp4" />
        </video>
      </div>
    </Section>
  );
}
