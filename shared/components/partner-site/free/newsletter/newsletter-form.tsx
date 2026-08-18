import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";

/**
 * «النشرة» — one field + one button, centred (Tailwind "newsletter" / Shopify `newsletter`).
 * The form posts to the site's subscribe endpoint; in the console preview it is inert.
 */
export function NewsletterForm({ data, preview = false }: { data: HomeData; preview?: boolean }) {
  return (
    <Section id="newsletter" tone="muted">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-bold leading-tight text-foreground">خلّك على تواصل مع {data.name}</h2>
        <p className="mt-2 text-sm text-muted-foreground">جديدنا ومقالاتنا على بريدك — بلا إزعاج، وتقدر تلغي متى شئت.</p>
        {/* server-safe: no handlers here; previews sit inside a pointer-events-none wrapper */}
        <form className="mt-6 flex gap-2" action={preview ? "#" : "/api/subscribe"} method="post">
          <input
            type="email"
            name="email"
            required
            placeholder="بريدك الإلكتروني"
            className="h-11 flex-1 rounded-full border bg-background px-5 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button type="submit" className="h-11 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground">اشترك</button>
        </form>
      </div>
    </Section>
  );
}
