/**
 * modonty's team — one list, read by `/story` (carousel) and `/modonty` (rail gallery).
 * Promoted out of `app/story/TeamCarousel.tsx` on 2026-08-17 when the second consumer
 * appeared (folder rule: two routes → app-level lib). Photos live on the Bunny assets
 * zone `brand/story/team/`; one member still has a generated avatar.
 *
 * `email` values are PLACEHOLDERS (`<slug>@modonty.com`) until Khalid hands over the real
 * business mailboxes (2026-08-17: «حط email عادية تجريبية لحد ما نشوف هيكلة الصفحة»).
 */
const TEAM_ASSETS = "https://modonty-asset.b-cdn.net/brand/story/team";
const teamImage = (file: string) => `${TEAM_ASSETS}/${file}`;

export type TeamDept = "leadership" | "content" | "creative" | "ops" | "outreach";

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  dept: TeamDept;
  /** URL-safe id — anchors the person's card on `/team` and their `Person` node in JSON-LD. */
  slug: string;
  /** Business mailbox shown on `/team` so a partner can reach the right person directly. */
  email: string;
  /** Generated avatar, not a photograph — kept out of the faces strip on `/modonty`. */
  isAvatar?: boolean;
}

export const TEAM_MEMBERS: readonly TeamMember[] = [
  {
    name: "م. محمد حسني جبر",
    role: "المدير العام",
    bio: "صاحب الرؤية الاستراتيجية، يضمن تكامل كل الإدارات.",
    imageUrl: teamImage("abo-salman.jpg"),
    slug: "mohamed-hosny",
    email: "mohamed-hosny@modonty.com",
    dept: "leadership",
  },
  {
    name: "م. خالد علي",
    role: "المدير التنفيذي",
    bio: "قائد العمليات اليومية وتحويل الخطط لواقع ملموس.",
    imageUrl: teamImage("khalid.jpg"),
    slug: "khalid-ali",
    email: "khalid-ali@modonty.com",
    dept: "leadership",
  },
  {
    name: "د. محمد شلبي",
    role: "أخصائي تحسين محركات البحث",
    bio: "يضمن تصدّر المواقع نتائج البحث الأولى لزيادة الانتشار.",
    imageUrl: teamImage("muhammed-shlpy.jpg"),
    slug: "mohamed-shalaby",
    email: "mohamed-shalaby@modonty.com",
    dept: "content",
  },
  {
    name: "أ. مايا أحمد",
    role: "كاتبة محتوى وأخصائية SEO",
    bio: "تكتب محتوى عربياً قوياً مُحسَّناً لمحركات البحث ويتحدّث بصوت العميل.",
    imageUrl:
      "https://api.dicebear.com/9.x/micah/png?seed=maya&earringsProbability=100&facialHairProbability=0&baseColor=f9c9b6&backgroundColor=10b981,059669&size=256&radius=50",
    dept: "content",
    slug: "maya-ahmed",
    email: "maya-ahmed@modonty.com",
    isAvatar: true,
  },
  {
    name: "أ. روان عطيتو",
    role: "استراتيجي محتوى",
    bio: "تخطّط وتبتكر محتوى إبداعي يربط الجمهور بالعلامة التجارية.",
    imageUrl: teamImage("rawan.jpg"),
    slug: "rawan-attito",
    email: "rawan-attito@modonty.com",
    dept: "content",
  },
  {
    name: "أ. مصطفى محمد",
    role: "قائد فريق التصميم",
    bio: "يقود المصممين لتقديم هوية بصرية احترافية تعزّز الثقة.",
    imageUrl: teamImage("mustafa.jpg"),
    slug: "mustafa-mohamed",
    email: "mustafa-mohamed@modonty.com",
    dept: "creative",
  },
  {
    name: "أ. أحمد عثمان",
    role: "قائد فريق المونتاج",
    bio: "يصنع محتوى مرئياً يروي قصة العلامة التجارية بأسلوب مبهر.",
    imageUrl: teamImage("ahmed.png"),
    slug: "ahmed-osman",
    email: "ahmed-osman@modonty.com",
    dept: "creative",
  },
  {
    name: "م. محمد سليمان",
    role: "مدير المشروعات",
    bio: "يخطّط ويدير الموارد لتسليم المشاريع بدقة وكفاءة عالية.",
    imageUrl: teamImage("mohamed-soliman.jpg"),
    slug: "mohamed-soliman",
    email: "mohamed-soliman@modonty.com",
    dept: "ops",
  },
  {
    name: "م. عمر حسني",
    role: "مدير حسابات الشركاء",
    bio: "حلقة الوصل مع الشركاء، يبني علاقات مستدامة ويضمن رضاهم.",
    imageUrl: teamImage("omar-hosney.jpg"),
    slug: "omar-hosny",
    email: "omar-hosny@modonty.com",
    dept: "ops",
  },
  {
    name: "م. أحمد طارق",
    role: "الموارد البشرية",
    bio: "يستقطب الكفاءات ويطوّر بيئة العمل لضمان إنتاجية الفريق.",
    imageUrl: teamImage("ahmed-tarek.jpg"),
    slug: "ahmed-tarek",
    email: "ahmed-tarek@modonty.com",
    dept: "ops",
  },
  {
    name: "ميديا باير سمية محمد",
    role: "مسؤول الحملات الإعلانية",
    bio: "تدير الحملات الإعلانية لأفضل وصول وأعلى عائد على الاستثمار.",
    imageUrl: teamImage("somaya.jpg"),
    slug: "somaya-mohamed",
    email: "somaya-mohamed@modonty.com",
    dept: "outreach",
  },
  {
    name: "أ. أحمد فرج",
    role: "مدير المبيعات",
    bio: "يقود الخطط البيعية ويصنع الفرص التجارية لتحقيق النمو.",
    imageUrl: teamImage("ahmed-farag.jpg"),
    slug: "ahmed-farag",
    email: "ahmed-farag@modonty.com",
    dept: "outreach",
  },
  {
    name: "أ. بلال يوسف",
    role: "خدمة الشركاء",
    bio: "الواجهة المباشرة للمنصة، يقدّم الدعم السريع لتجربة مثالية.",
    imageUrl: teamImage("belal-youssef.jpg"),
    slug: "belal-youssef",
    email: "belal-youssef@modonty.com",
    dept: "outreach",
  },
];
