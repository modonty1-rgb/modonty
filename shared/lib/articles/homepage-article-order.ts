/**
 * **ترتيبُ رئيسية مدونتي — مكانٌ واحد** (خالد ٢٤ سبتمبر ٢٠٢٦: «أبغى أتحكّم في ترتيبها»).
 *
 * المختارُ أوّلاً (`featured`)، وبينها ترتيبُ المحرّر (`featuredOrder`: ١ يتصدّر)، ثم الأحدث.
 * يقرؤه ثلاثة: صفحةُ الرئيسية الأولى (`modonty/app/(site)/(homepage)/data/home-feed-shapes.ts`)،
 * وصفحاتُها التالية (`modonty/lib/queries/article-feed-shapes.ts` · `sortBy: "homepage"`)، وشاشةُ
 * الأدمن التي تعرض «أوّل ١٠ في الرئيسية الآن» (`admin/app/(dashboard)/articles/homepage`) — فما
 * تراه الشاشةُ هو ما يراه الزائر.
 *
 * ⚠ مونغو يضع الفارغ أوّلاً في التصاعديّ: مختارٌ بلا رقمٍ يتقدّم المرقَّمين. لذلك يُكتب الرقمُ مع كلّ
 * اختيار (`setHomepagePick`)، ولا يبقى مختارٌ بلا رقم. `id` يحسم التعادل فلا تتداخل الصفحات.
 */
export const HOMEPAGE_ARTICLE_ORDER = [
  { featured: "desc" as const },
  { featuredOrder: "asc" as const },
  { datePublished: "desc" as const },
  { id: "desc" as const },
];

/**
 * **حدُّ الاختيارات = خاناتُ الصفحة الأولى** (خالد ٢٤ سبتمبر ٢٠٢٦: «أوصل لعشرة تديني مسج»).
 * يساوي `FEED_PAGE_SIZE` في `modonty/lib/queries/feed-constants.ts` — اختيارٌ زائدٌ عليه لا يصل
 * الصفحةَ الأولى أصلاً. يقرؤه عدّادُ الأدمن وحارسُ `setHomepagePick`.
 */
export const HOMEPAGE_PICK_LIMIT = 10;
