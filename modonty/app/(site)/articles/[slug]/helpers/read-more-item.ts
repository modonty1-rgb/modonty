export interface ReadMoreItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  // `bunnyUrl` MUST stay on this type. Narrowing it away silently strips the Bunny copy
  // before `mediaSrc()` ever sees it — the component still calls mediaSrc, gets undefined,
  // and falls back to Cloudinary. tsc is happy either way (2026-07-30).
  featuredImage?: { url: string; bunnyUrl: string | null; blurDataURL: string | null; altText: string | null } | null;
  clientName?: string | null;
}
