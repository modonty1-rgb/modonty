import type { HomeData } from "../home/home-data";
import { NewsletterIsland } from "./newsletter-form";

/**
 * «النشرة» as a registry block — a server component, so the client form receives two strings,
 * not the whole page data (a client component ships every prop it gets to the browser).
 */
export function NewsletterForm({ data, preview = false }: { data: HomeData; preview?: boolean }) {
  return <NewsletterIsland clientId={data.clientId} name={data.name} preview={preview} />;
}
