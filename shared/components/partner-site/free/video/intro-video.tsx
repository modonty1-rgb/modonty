import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";

/** «فيديو تعريفي» — one wide player with the partner's own poster (Shopify `video` section). */
export function IntroVideo({ data }: { data: HomeData; preview?: boolean }) {
  const v = data.video;
  if (!v) return null;
  return (
    <Section id="video" eyebrow="بالصوت والصورة" heading={v.title ?? `تعرّف على ${data.name} في دقيقة`} tone="muted">
      <div className="overflow-hidden rounded-lg bg-black">
        <video controls preload="none" poster={v.posterUrl ?? undefined} className="aspect-video w-full">
          <source src={v.url} type="video/mp4" />
        </video>
      </div>
    </Section>
  );
}
