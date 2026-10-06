/**
 * Everything the home page blocks need — one plain object filled from the client row.
 * Each block reads only its slice; a block whose slice is empty is skipped on the site.
 */
export interface HomeData {
  /** صفّ الشريك — يحتاجه نموذج «اترك رقمك» ليربط الطلب بصاحبه. */
  clientId: string;
  /** نشاطٌ حسّاس (طبّي · قانوني · مالي): الطلب لا يُقبل بلا إقرار الزائر — يفرضه الخادم. */
  isYmyl: boolean;
  name: string;
  primaryColor: string | null;
  whatsappHref?: string | null;
  phone: string | null;
  /** The admin-configured request button (CtaPreset): FORM = our booking form · LINK = his URL · NONE = nothing. */
  booking: { mode: "NONE" | "FORM" | "LINK"; label: string | null; url: string | null };

  hero: {
    slogan: string | null;
    description: string | null;
    coverUrl: string | null;
    /** The cover's own width/height — the box takes the image's exact ratio, never crops. */
    coverWidth: number | null;
    coverHeight: number | null;
    logoUrl: string | null;
    industry: string | null;
    city: string | null;
    foundingYear: string | null;
  };
  trust: {
    verified: boolean;
    credentials: { name: string; authority: string | null; year: string | null }[];
  };
  about: {
    description: string | null;
    legalName: string | null;
  };
  services: { title: string; description: string | null; icon?: string | null }[];
  stats: { value: string; label: string }[];
  testimonials: { rating: number; comment: string; author: string }[];
  /** Latest images first; width/height drive the justified rows (repo gallery standard). */
  gallery: { url: string; alt: string; width: number | null; height: number | null }[];
  team: { name: string; role: string | null; photoUrl: string | null }[];
  video: { url: string; posterUrl: string | null; title: string | null; width?: number | null; height?: number | null } | null;
  faqs: { question: string; answer: string }[];
  posts: { title: string; href: string; imageUrl: string | null; date: string | null; excerpt: string | null; category: string | null }[];
  /** صفحة «مقالاتنا» — وجهة زرّ «كل المقالات» حين تتجاوز المقالات الثلاثة المعروضة. */
  blogHref?: string;
  /** The partner's booking page (`/clients/<slug>/book`) — where the FORM button leads. */
  bookHref?: string;
  /**
   * His published reels, newest first — each a link to its own watch page (`/reels/<slug>`).
   * Plan item د١ (2 Oct 2026): 11 of 23 reels were never indexed because no page linked to
   * them; every reel now has a link from its partner's page.
   */
  reels: { title: string; href: string; imageUrl: string | null }[];
  /** The partner's reels page — the home block's «كل الريلز» when it shows fewer than all. */
  reelsHref?: string;
  /** The other full pages, for the home sections' «عرض الكل» (4 Oct 2026). */
  servicesHref?: string;
  reviewsHref?: string;
  photosHref?: string;
  faqHref?: string;
  contact: {
    address: string | null;
    email: string | null;
    mapHref: string | null;
    /** Google Maps embed URL built from lat/lng (no key needed) — the contact page's map block. */
    mapEmbedSrc: string | null;
    hours: { day: string; time: string }[];
  };
}
