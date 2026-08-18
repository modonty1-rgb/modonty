import type { HomeBlock } from "../home";
import { AboutIntro } from "./about-intro";
import { ImageTextAbout } from "./image-text-about";
import { TrustStrip } from "../trust/trust-strip";
import { StatsRow } from "../stats/stats-row";
import { TeamGrid } from "../team/team-grid";
import { IntroVideo } from "../video/intro-video";
import { TestimonialsGrid } from "../testimonials/testimonials-grid";
import { FinalCta } from "../cta/final-cta";

/**
 * «من نحن», block by block — the elements the big guides agree on (Shopify «how to write an
 * About Us page» · HubSpot «About Us page» template): mission/who-it's-for → the story →
 * credibility → numbers → the people → video → social proof → a clear next step.
 * Values and a timeline are recommended too but need fields we do not have yet — not shown.
 * Same data object as the home page; same switch-per-block behaviour.
 */
export const ABOUT_BLOCKS: readonly HomeBlock[] = [
  { key: "hero", name: "البيان", toggleable: false, isEmpty: () => false, Component: AboutIntro },
  { key: "about", name: "قصّتنا", toggleable: true, isEmpty: (d) => !d.about.description, Component: ImageTextAbout },
  { key: "trust", name: "شريط الثقة", toggleable: true, isEmpty: (d) => !d.trust.verified && d.trust.credentials.length === 0, Component: TrustStrip },
  { key: "stats", name: "أرقامنا", toggleable: true, isEmpty: (d) => d.stats.length === 0, Component: StatsRow },
  { key: "team", name: "الفريق", toggleable: true, isEmpty: (d) => d.team.length === 0, Component: TeamGrid },
  { key: "video", name: "فيديو تعريفي", toggleable: true, isEmpty: (d) => !d.video, Component: IntroVideo },
  { key: "testimonials", name: "آراء العملاء", toggleable: true, isEmpty: (d) => d.testimonials.length === 0, Component: TestimonialsGrid },
  { key: "cta", name: "النداء الأخير", toggleable: false, isEmpty: () => false, Component: FinalCta },
] as const;
