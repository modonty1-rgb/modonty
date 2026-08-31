import type { HomeBlock } from "../home";
import { AboutIntro } from "./about-intro";
import { ImageTextAbout } from "./image-text-about";
import { TrustStrip } from "../trust/trust-strip";
import { TeamGrid } from "../team/team-grid";
import { FinalCta } from "../cta/final-cta";

/**
 * «من نحن» — الهويّة وحدها: البيان → القصّة كاملةً → الاعتمادات → الناس → دعوة واحدة.
 *
 * كانت تحمل أيضاً الأرقام والفيديو وآراء العملاء، فصارت خمسةَ أسداسها تكراراً للرئيسية
 * (مقيس ٣١ أغسطس: ٥ من ٦ أقسامها موجودة هناك). خالد شالها: الأرقام والفيديو في الرئيسية،
 * والآراء في صفحتها — وصفحةٌ تكرّر جارتها لا تعطي الزائر سبباً لفتحها.
 */
export const ABOUT_BLOCKS: readonly HomeBlock[] = [
  { key: "hero", name: "البيان", toggleable: false, isEmpty: () => false, Component: AboutIntro },
  { key: "about", name: "قصّتنا", toggleable: true, isEmpty: (d) => !d.about.description, Component: ImageTextAbout },
  { key: "trust", name: "شريط الثقة", toggleable: true, isEmpty: (d) => d.trust.credentials.length === 0, Component: TrustStrip },
  { key: "team", name: "الفريق", toggleable: true, isEmpty: (d) => d.team.length === 0, Component: TeamGrid },
  { key: "cta", name: "النداء الأخير", toggleable: false, isEmpty: () => false, Component: FinalCta },
] as const;
