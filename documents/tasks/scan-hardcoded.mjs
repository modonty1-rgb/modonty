/**
 * جرد الهارد كود — مصدر الحقيقة الواحد.
 *
 * السؤال الذي يجيبه: **أي قيمة يملكها `Settings` في القاعدة، ومع ذلك مكتوبة في كود مدونتي؟**
 *
 * لا يخمّن ولا يعتمد قائمة مكتوبة بيد. يقرأ صفّ `Settings` كاملاً (١٦٤ عموداً) ويبحث عن
 * قيمه حرفياً في الكود. فأي عمود يُضاف غداً يدخل الجرد وحده — بلا تعديل هنا.
 *
 * يلتقط شكلين:
 *   ١ · **قيمة مطابقة**   — نصّ الصفّ نفسه مكتوب في الكود (`"Modonty"` وقيمة `siteName` هي نفسها).
 *   ٢ · **احتياط بعد ||** — `settings?.x || "قيمة"`. وهذا **أخطر** من الأول: خالد (٢٨ أغسطس)
 *       «الاحتياط المكتوب في الكود هو المخالفة» — لأنه يجعل غياب البيان من القاعدة لا يُكتشف أبداً.
 *
 * ومعهما أصناف لا يملكها `Settings` بعدُ لكنها بيانات بلا شكّ: تهجئات الماركة · بريد الفريق ·
 * الإحداثيات · الأسعار.
 *
 * المستبعَد عمداً، وكلٌّ لسبب:
 *   كلمات JSON-LD المحجوزة نحوٌ لا بيانات · `x-default` ثابت بروتوكول · `next.config.ts`
 *   قائمة سماح أمنية يغيّرها مهندس بنشر · التعليقات لا تصل زائراً · `placeholder` نصّ واجهة ·
 *   بذور الاختبار لا تُقدَّم · نقاط نهاية المشاركة والتضمين آليّةٌ لا محتوى · القيم القصيرة
 *   (أقلّ من ٤ محارف) لأن مطابقتها صدفةٌ لا دليل.
 *
 * التشغيل:  node documents/tasks/scan-hardcoded.mjs
 * المخرَج :  documents/tasks/hardcoded-inventory.json  (يقرؤه build-task-board.mjs)
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const ROOT = path.resolve(process.argv[2] || "c:/Users/w2nad/Desktop/dreamToApp/MODONTY");

// الحزم تُحلّ من `shared/` لا من مكان هذا الملفّ: السكربت يعيش في `documents/tasks/`
// وهو مجلّد بلا `node_modules`، فاستيرادٌ عاديّ يفشل بـERR_MODULE_NOT_FOUND.
const req = createRequire(path.join(ROOT, "shared/package.json"));
const { config } = req("dotenv");
const { PrismaClient } = req("@prisma/client");
const SCOPE = ["modonty", "shared"];
const COMPARE = ["admin", "console"];

config({ path: path.join(ROOT, "shared/.env") });
config({ path: path.join(ROOT, "shared/.env.local"), override: true });

const SKIP_DIR = /node_modules|[\\/]\.next|[\\/]dist|[\\/]\.turbo|[\\/]coverage|[\\/]\.playwright-mcp/;
const SKIP_FILE = /next\.config\.ts$|[\\/]seed-[^\\/]*\.tsx?$|test-data|\.d\.ts$|middleware\.ts$/;
const CODE = /\.(ts|tsx)$/;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (SKIP_DIR.test(p)) continue;
    if (e.isDirectory()) walk(p, out);
    else if (CODE.test(e.name) && !SKIP_FILE.test(p)) out.push(p);
  }
  return out;
}

/** يفرّغ التعليقات مع الحفاظ على أرقام الأسطر — المسح على المفرَّغ، والعرض من الأصل. */
function blankComments(src) {
  const out = src.split("");
  let i = 0, inLine = false, inBlock = false, inStr = null;
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    if (inLine) { if (c === "\n") inLine = false; else out[i] = " "; }
    else if (inBlock) {
      if (c === "*" && d === "/") { out[i] = out[i + 1] = " "; i++; inBlock = false; }
      else if (c !== "\n") out[i] = " ";
    } else if (inStr) {
      // نصّ عادي لا يعبر سطراً — الباكتيك وحده يعبر. بدون هذا السطر كان تعبيرٌ نمطيّ
      // مثل `.replace(/'/g, "&apos;")` يفتح نصّاً لا يُغلق، فيبتلع بقيّة الملفّ ويمرّ
      // التعليق كأنه كود: عُدَّ تعليقٌ في `feed.xml/route.ts:26` إصابةَ هارد كود.
      if (c === "\n" && inStr !== "`") inStr = null;
      else if (c === "\\") i++;
      else if (c === inStr) inStr = null;
    } else if (c === "/" && d === "/") { inLine = true; out[i] = out[i + 1] = " "; i++; }
    else if (c === "/" && d === "*") { inBlock = true; out[i] = out[i + 1] = " "; i++; }
    else if (c === '"' || c === "'" || c === "`") inStr = c;
    i++;
  }
  return out.join("");
}

const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const JSONLD_KEYWORDS = new Set(["@id", "@type", "@context", "@graph", "@language", "@value", "@list", "@set", "@reverse", "@container", "@vocab"]);
const FORMATTING_LINE = /Intl\.|toLocale(?:Date|Time)?String|NumberFormat|DateTimeFormat|RelativeTimeFormat|PluralRules|localeCompare/;
/** ثوابت بروتوكول لا بيانات عمل — تظهر كقيم أعمدة لكنها ليست قابلة للتحرير معنى. */
const PROTOCOL_VALUES = new Set(["x-default", "UTF-8", "website", "article", "summary", "summary_large_image", "auto", "index, follow", "noindex, follow", "origin-when-cross-origin", "image/webp", "image/jpeg", "…", "/"]);

// ── ١ · صفّ الإعدادات: مصدر الحقيقة الذي نقيس عليه ──────────────────────────
const db = new PrismaClient();
const dbName = (process.env.DATABASE_URL || "").match(/\/([A-Za-z0-9_-]+)\?/)?.[1] ?? "?";
const settings = await db.settings.findFirst();
await db.$disconnect();
if (!settings) throw new Error("لا صفّ Settings — الجرد يقيس عليه، فلا يعمل بدونه.");

/** أعمدة داخلية: مفاتيح ومعرّفات لا يراها زائر ولا زاحف. */
const INTERNAL_COLS = /^(id|singletonKey|createdAt|updatedAt|coreClientId|.*Id)$/;

/** الأعمدة التي لها قيمة نصّية مميّزة تصلح للبحث الحرفي. */
const settingsValues = Object.entries(settings)
  .filter(([k, v]) => typeof v === "string" && v.trim().length >= 4 && !INTERNAL_COLS.test(k))
  .map(([k, v]) => ({ col: k, val: v.trim() }))
  .filter((e) => !PROTOCOL_VALUES.has(e.val))
  // الأطول أولاً: لو تداخلت قيمتان، تُنسب الإصابة إلى الأدقّ
  .sort((a, b) => b.val.length - a.val.length);

/** كل أسماء أعمدة Settings — لكشف الاحتياط `settings?.col || …` أياً كانت قيمته. */
const settingsCols = Object.keys(settings).filter((k) => k !== "id");

// ── ٢ · أصناف لا يملكها Settings بعدُ، وهي بيانات بلا شكّ ────────────────────
const EXTRA = [
  {
    k: "brand", n: "تهجئات الماركة", sev: "high",
    owner: "Settings.siteName + alternateName (العمود الثاني غير موجود بعد)",
    why: "أربع تهجئات منشورة، والاسم في البيانات المنظَّمة لا يظهر على الصفحة.",
    re: /"مُدَوَّنَتِي"|'مُدَوَّنَتِي'|"مدوّنتي"|'مدوّنتي'|"مدونتي"|'مدونتي'|\bBRAND_AR\b|\bBRAND_EN\b/g,
  },
  {
    k: "mail", n: "بريد الفريق والاتصال", sev: "normal",
    owner: "Settings.orgContactEmail · وجدول للفريق",
    why: "يظهر للزائر وفي بنية المؤسسة؛ تغييره اليوم يحتاج نشراً.",
    re: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi,
    skip: (m) => /^example@|@email\.com$|@sentry\.io$/.test(m),
  },
  {
    k: "geo", n: "إحداثيات المقرّ", sev: "normal",
    owner: "Settings — موقع المقر",
    why: "تظهر في بنية المؤسسة والبحث المحلي.",
    re: /(?:latitude|longitude)\s*[:=]\s*["']?-?\d{1,3}\.\d{3,}/gi,
  },
  {
    k: "money", n: "أسعار وعملة", sev: "normal",
    owner: "الباقات في القاعدة",
    why: "سعر منشور يتغيّر بقرار تجاري لا بنشرة.",
    re: /\b\d{3,5}\s*(?:ريال|SAR|جنيه|EGP)\b/g,
  },
  {
    k: "extern", n: "روابط جهات خارجية", sev: "normal",
    owner: "Settings — الروابط الرسمية",
    why: "روابط منصّات وجهات توثيق تظهر للزائر أو في البيانات المنظَّمة.",
    re: /https?:\/\/(?:www\.)?(?:twitter|x|facebook|instagram|linkedin|youtube|tiktok|snapchat|wa\.me|maps\.google|maroof)\.[a-z.]{2,}[^"'`\s)]*/gi,
    skip: (m) => /\/intent\/|\/share|\/embed\/|[?&]text=|[?&]u=/.test(m),
  },
  {
    k: "fmt", n: "لغة تنسيق الأرقام والتواريخ", sev: "low",
    owner: "قرار عرض — لا يملكه الأدمن",
    why: "`Intl` تأخذ لغة لتنسيق الرقم والتاريخ. لا تصل جوجل — مدرَجة للاكتمال وحدها.",
    re: /"ar-SA"|'ar-SA'|"ar-EG"|'ar-EG'/g,
    skipLine: (l) => !FORMATTING_LINE.test(l),
  },
];

// ── ٣ · المراحل: أين نفتح المحرّر ────────────────────────────────────────────
const REACHES_GOOGLE = /(?:lib[\\/]seo|[\\/]seo[\\/]|jsonld|json-ld|metadata|feed\.xml|sitemap|robots|opengraph|og-image|structured|hreflang|canonical)/i;
const MAIL_AND_TEAM = /(?:lib[\\/]email|[\\/]email[\\/]|team-members|constants[\\/]contact)/i;
// المسار يقرّر أوّلاً، لا نوع الإصابة. كان `kind === "settings"` يدفع كل إصابة إلى المرحلة ٢
// أياً كان ملفّها، فسقطت مكوّنات واجهة (مثل `QuickLinks.tsx` وفيه `label: "مدونتي"` — نصّ
// زرّ لا هويّة سيو) في ممرّ «ما يصل جوجل». الملفّ هو ما يقول أين تُفتح، لا اسم الصنف.
const IS_PROMPT = /build-[a-z-]*prompt\.ts$|identity-prompt/i;

/**
 * الممرّ يُقرَّر بثلاث أسئلة بالترتيب:
 *   ١ · هل قرّر خالد أن يبقى؟ → `keep` (وسبب البقاء مكتوب على السطر)
 *   ٢ · أين يقع الملفّ؟       → المرحلة ٢ أو ٤
 *   ٣ · وإلا                  → المرحلة ٣
 */
function laneOf(file, kind, line, lineNo) {
  if (kind === "fmt") return { lane: "keep", why: KEEP_REASONS.fmt };
  // مكوّنات العميل الباقية بعد نقل الرسائل (٢٨ أغسطس) — مقيسة بـ`"use client"` في رأس الملفّ.
  if (IS_CLIENT_COMPONENT.test(file)) return { lane: "keep", why: KEEP_REASONS.clientBundle };
  // إشعارات تلغرام للفريق — رسائل آلة لا نصّ زائر.
  if (IS_OPS_NOTICE.test(file)) return { lane: "keep", why: KEEP_REASONS.ops };
  // بيانات الفريق خرجت من هذا الجرد كلّه إلى بطاقة `TEAMDB` على اللوحة الرئيسية
  // (خالد، ٢٨ أغسطس: «انقلها للملفّ الرئيسي واحذفها من هنا»). مالكها جبر سيو لا مدونتي،
  // فليست دَيناً على هذا الجرد ولا تُعدّ فيه.
  if (/team-members/.test(file)) return { lane: "drop" };
  if (MAIL_AND_TEAM.test(file)) return { lane: "keep", why: KEEP_REASONS.email };
  if (/modo-chat/.test(file)) return { lane: "keep", why: KEEP_REASONS.modo };
  if (/constants[\\/](brand|index)\.ts$/.test(file)) return { lane: "keep", why: KEEP_REASONS.constant };
  if (/TestimonialPlayer/.test(file)) return { lane: "keep", why: KEEP_REASONS.content };
  if (/get-site-language|FormattedDate/.test(file)) return { lane: "keep", why: KEEP_REASONS.documented };
  // ملفّ الثابت نفسه هو **مصدر الحقيقة** لا مخالفةً له — يخرج من العدّ كما يخرج ملفّ المعجم
  // من عدّ الكلمات. (أُنشئ ٢٨ أغسطس: ٨٦ نصّاً في مدونتي صاروا يقرأون منه.)
  if (/constants[\\/]locale\.ts$/.test(file)) return { lane: "drop" };
  // اسم منتَج أو معرّف تتبّع: يُطابَق بالقيمة لا بالملفّ، فلا يُعمَّم على بقيّة الملفّ.
  if (/"Modonty Story"|"Modonty Hero — become a partner"/.test(line)) {
    return { lane: "keep", why: KEEP_REASONS.productName };
  }
  // خريطة اللغات الصريحة في مولّد الشريك — كُتبت عمداً بدل تخمين `includes("ar")`.
  if (/LOCALE_BY_LANGUAGE/.test(line)) return { lane: "keep", why: KEEP_REASONS.documented };
  if (IS_PROMPT.test(file)) return { lane: "keep", why: KEEP_REASONS.prompt };
  // آخِرُ القواعد قبل «جملة تحريرية»: مكوّن في `shared/` يخدم الثلاثة، وملفّ الرسائل
  // يخصّ مدونتي وحدها. متأخّرٌ عمداً — القواعد الأخصّ أعلاه (البريد · الاستثناء الموثَّق)
  // تصف السبب الحقيقي، وهذه تلتقط ما بقي فقط.
  if (/^shared[\\/]/.test(file) && ARABIC_SENTENCE.test(line)) {
    return { lane: "keep", why: KEEP_REASONS.sharedApp };
  }
  if (!REACHES_GOOGLE.test(file) && !MAIL_AND_TEAM.test(file) && ARABIC_SENTENCE.test(line)) {
    return { lane: "keep", why: KEEP_REASONS.sentence };
  }
  if (MAIL_AND_TEAM.test(file)) return { lane: "4" };
  return { lane: REACHES_GOOGLE.test(file) ? "2" : "3" };
}

/**
 * ما قرّر خالد (٢٨ أغسطس ٢٠٢٦) أن يبقى — يخرج من ممرّ الشغل إلى ممرّ «مقصود».
 * القرار مكتوب هنا لا في رأسي: من يقرأ الجرد بعد شهر يعرف لماذا بقي هذا السطر.
 */
/**
 * الملفّات التي بقيت بعد نقل الرسائل لأنها مكوّنات عميل — مقيسة لا مُخمَّنة:
 * كلٌّ منها يحمل `"use client"` في أوّل ثلاثة أسطر (فُحصت ٢٨ أغسطس ٢٠٢٦).
 * `lib/whatsapp.ts` ليس عميلاً بنفسه، لكن `whatsapp-booking-cta.tsx` (عميل) يستورده،
 * فالاستيراد يعبر الحدّ ويشحن الملفّ في الباندل — نفس الثمن بالضبط.
 */
const IS_CLIENT_COMPONENT =
  /(?:ChatList|share-client-button|PartnersShowcase|SalesPitchPage|TeamCarousel|register-form|MobileAccountBenefitsMenu|error)\.tsx$|lib[\\/]whatsapp\.ts$/;

/** إشعارات تلغرام للفريق — يُطابَق بالمسار: تسجيل مستخدم، والاشتراك في النشرة. */
const IS_OPS_NOTICE = /register-actions\.ts$|news[\\/]subscribe[\\/]route\.ts$/;

const KEEP_REASONS = {
  sentence: "جملة تحريرية — الاسم داخل نصٍّ يقرؤه الزائر، لا حقلَ هوية. حقنه يجعل النحو العربي رهينةَ اسمٍ قد يصير لاتينياً.",
  prompt: "تعليمات مودو — نصٌّ يُملى على النموذج، لا يصل جوجل ولا يُعرض للزائر.",
  fmt: "لغة تنسيق الأرقام والتواريخ — `Intl` تحتاج رمز لغة، وليست بياناً عن العمل.",
  team: "بيانات الفريق — ثلاثة عشر عضواً في `team-members.ts`، **ومالكها جبر سيو لا مدونتي** (خالد، ٢٨ أغسطس): جبر سيو يعرض الطاقم كامل، ومدونتي تعرض منهم من يشتغل عليها. والمشروعان على نفس القاعدة — مقيس: كلاهما `modonty-cluster.tgixa8h.mongodb.net`، قاعدة `modonty` للإنتاج و`modonty_dev` للتطوير — فلا جدول فريق جديد عندنا ولا شاشة أدمن. يُغلق البند يوم يصير الفريق في القاعدة من جهة جبر سيو. **مؤجَّل بقرار خالد (٢٨ أغسطس) بعد قياس ثلاثة حواجز**: فريقهم في القاعدة فعلاً — مجموعة `LandingSection`، صفّ `section:\"team\"`، فيه `coreTeam` (٢) و`executionTeam` (٨) = عشرة أعضاء. لكن (١) ليست احتواءً: مشترك تسعة · عندهم وحدهم واحد (فاتن حسنين) · **عندنا وحدنا أربعة** (محمد شلبي · مايا أحمد · أحمد عثمان · سمية محمد)، فالقراءة اليوم تحذف أربعةً من ثلاث شاشات؛ (٢) صورهم كلها على Cloudinary، وبني هو مورّدنا الوحيد؛ (٣) أربعة حقول ناقصة عندهم: `slug` و`email` و`dept` بخمس قيم بدل مجموعتين و`isAvatar`. الترتيب حين نعود: يُكمَّل صفّهم أولاً، ثم نقرأ منه — ويلزم إضافة نموذج `LandingSection` إلى سكيمانا.",
  modo: "مودو — اسم المساعد ونصّ تعليماته. «مدونتي الذكية» اسمُ شخصية لا اسمُ موقع، والتعليمات تُملى على النموذج ولا تصل جوجل ولا الزائر.",
  constant: "ثابتا `BRAND_AR`/`BRAND_EN` ومُعيدا تصديرهما — محجوزان بمستهلكٍ واحدٍ باقٍ: تعليمات مودو. يُحذفان يوم تُحذف، لا قبله.",
  content: "محتوى منشور — روابط فيديو الشهادات وقناة اليوتيوب. مادّةٌ يختارها المحرّر، لا إعدادٌ يملكه الأدمن.",
  productName: "اسم منتَج أو معرّف تتبّع — «Modonty Story» اسم البودكاست، و«Modonty Hero — become a partner» معرّفٌ يُرسَل إلى التحليلات لا نصٌّ يراه زائر. أسماءُ أعلامٍ لا حقولُ هوية.",
  documented: "استثناء موثَّق في الملفّ نفسه: لغة الوثيقة (`<html lang>`) ولغة تنسيق التاريخ. غيابها عطلٌ في العرض لا نقصٌ يُرى.",
  clientBundle:
    "مكوّن عميل — نقلُه إلى `messages/ar.json` يشحن الملفّ كلّه في باندل مساره. الاستيراد لا يُشجَّر: `import ar from \"ar.json\"` يأتي بالكائن كاملاً، فمكسبُ «تعديل واحد» يُدفع ثمنه بايتات على كل زائر. الطريق الصحيح تمرير النصّ خاصّيةً من الأب السيرفر — تاسك منفصل، لا سطرٌ يُبدَّل. و`error.tsx` بلا أبٍ سيرفر أصلاً.",
  ops:
    "إشعار تشغيلي — يُرسَل إلى تلغرام الفريق، ولا يراه زائر. وملفّ الرسائل يقول عن نفسه «كل نصّ يراه الزائر»؛ إدخال رسائل الآلة فيه يُفقده معناه.",
  sharedApp:
    "مكوّن في `shared/` — يخدم الأدمن والكونسول ومدونتي معاً، و`messages/ar.json` ملفّ مدونتي وحدها. نقلُه يربط التطبيقات الثلاثة بملفّ رسائل تطبيقٍ واحد.",
  email:
    "ثوابت البريد المشتركة — `shared/lib/email/` و`constants/contact.ts`. الملفّ يخدم الأدمن والكونسول ومدونتي معاً، وتعليقه يقول صراحةً «Hardcoded on purpose — NEXT_PUBLIC_SITE_URL differs per app»: تحويلها إلى قراءة من القاعدة يجعل **كل قالب بريد** `async` في التطبيقات الثلاثة. و`EMAIL_BRAND_AR = \"مُدَوَّنَتِي\"` هو الإملاء الرسمي، والموضع الوحيد في المستودع الذي يحمله — فهو **تابعٌ لقرار `BRAND-SPELLING`** لا بندٌ مستقلّ.",
};

/**
 * جملة: **ثلاث** كلمات عربية فأكثر داخل نصّ مقتبَس — كتابةٌ لا قيمةُ حقل.
 * كان الحدّ أربعاً، فبقيت «مدونتي أحلى بحسابك» و«صفحة مدونتي» في ممرّ الشغل وهي كتابة.
 */
const ARABIC_SENTENCE = /["'`][^"'`\n]*?(?:[؀-ۿ]+[\s،:—-]+){2,}[؀-ۿ]+/u;

/**
 * جُمَل قصيرة يقطعها متغيّر (`اطلع على ${clientName} على مدونتي`)، فلا يراها كاشفُ الجُمَل
 * أعلاه: الكلمات العربية فيها متفرّقة حول `${…}`.
 *
 * لم أوسّع الكاشف حتى يبتلعها — توسيعُه إلى كلمتين يجرف تسميات حقيقية معه. راجعتُ الستّة
 * سطراً سطراً في ٢٩ أغسطس ٢٠٢٦، وكلّها نصٌّ يقرؤه الزائر: رسالة مشاركة · نصّ خطأ · نصّ
 * بديل لصورة · اسم مستخدم احتياطي. قائمةٌ مراجَعة، لا قاعدةٌ محنيّة حتى تقول صفراً.
 */
const PHASES = {
  "2": { n: "المرحلة ٢ — ما يصل جوجل", s: "مولّدات الميتا والبيانات المنظَّمة والخلاصة والخريطة. أعلى أثر: قيمة غلط هنا تُنشر على كل صفحة.", close: "أغيّر القيمة من الأدمن → أُفرّغ الكاش → تتغيّر حيّاً في <code>og:</code> و<code>JSON-LD</code>." },
  "3": { n: "المرحلة ٣ — ما يراه الزائر", s: "الهيدر والفوتر ونصوص الصفحات — ومنها <code>&lt;h1&gt;</code> الرئيسية المكتوب حرفياً.", close: "الاسم على الشاشة يطابق الاسم في البيانات المنظَّمة — وهذا نصّ جوجل صراحةً." },
  "4": { n: "المرحلة ٤ — البريد والفريق", s: "قوالب البريد وبيانات الفريق والاتصال.", close: "تغيير بريد أو عضو فريق من الأدمن بلا نشر." },
  keep: {
    n: "مقصود — يبقى",
    s: "قِيس، ونوقش، وقُرِّر بقاؤه. ليس شغلاً معلَّقاً ولا ديناً — كلّ سطر هنا معه سببُ بقائه. يبقى مكتوباً كي لا يُعاد فتح النقاش نفسه بعد شهر.",
    close: "لا يُقفل. يُعاد النظر فيه فقط لو تغيّر القرار.",
  },
};

// ── ٤ · المسح ───────────────────────────────────────────────────────────────
const files = SCOPE.flatMap((s) => walk(path.join(ROOT, s)));
const rows = [];

// احتياط: `x.col || "قيمة"` أو `x.col ?? "قيمة"` أو `x?.col?.trim() || "قيمة"`
const fallbackRe = new RegExp(`\\.(${settingsCols.join("|")})\\b[^;\\n]{0,60}?(?:\\|\\||\\?\\?)\\s*(["'\`][^"'\`\\n]{1,60}["'\`]|\\d+(?:\\.\\d+)?|true|false)`, "g");

for (const f of files) {
  const rel = path.relative(ROOT, f).replace(/\\/g, "/");
  const raw = fs.readFileSync(f, "utf8");
  const clean = blankComments(raw);
  const rawLines = raw.split(/\r?\n/);
  const isSource = /constants[\\/]brand\.ts$/.test(rel);

  clean.split(/\r?\n/).forEach((line, i) => {
    // `phase: "drop"` = خرج من هذا الجرد إلى بطاقةٍ على اللوحة الرئيسية — لا يُعدّ هنا أصلاً.
    const push = (o) =>
      o.phase === "drop"
        ? undefined
        : rows.push({ app: rel.split("/")[0], file: rel, line: i + 1, isSource, sample: rawLines[i].trim().slice(0, 160), ...o });

    // ٤أ · قيمة عمود مكتوبة حرفياً.
    // سطر التنسيق مستثنى هنا: `toLocaleDateString("ar-SA")` يطابق قيمة `inLanguage`
    // مصادفةً، وهو ليس بياناً — الصنف ⚪ أدناه هو مكانه الصحيح.
    const matchedVals = new Set();
    // سطر استيراد يحمل مساراً واسمَ مكوّن لا بياناً — `import { ModontyProfileHero } …`
    // كان يُعدّ إصابةً لأن اسم المكوّن يحوي «Modonty»، وهي اليوم قيمة `alternateName`.
    const isImport = /^\s*(?:import|export)\b[^;]*\bfrom\b|^\s*import\s+["']/.test(line);
    if (!isImport && !FORMATTING_LINE.test(line)) {
      for (const { col, val } of settingsValues) {
        if (!line.includes(val)) continue;
        // داخل نصّ مقتبَس، وككلمة قائمة بذاتها — لا جزءاً من معرّف مثل `ModontyProfileHero`
        // ولا من مسار مثل `@/app/(site)/modonty/…`.
        const quoted = new RegExp(`["'\`][^"'\`\\n]*(?<![\\p{L}\\p{N}_/-])${esc(val)}(?![\\p{L}\\p{N}_/-])`, "u");
        if (!quoted.test(line)) continue;
        matchedVals.add(val);
        const L = laneOf(rel, "settings", line, i + 1);
        push({ phase: L.lane, keepWhy: L.why, kind: "settings", kindName: `قيمة عمود — Settings.${col}`, sev: "high", owner: `Settings.${col}`, why: "القيمة نفسها موجودة في القاعدة، والكود يكتبها بيده بدل أن يقرأها.", hits: 1, values: [val.slice(0, 40)] });
        break; // أطول تطابق يكفي — لا يُعدّ السطر مرّتين
      }
    }

    // ٤ب · احتياط بعد || أو ??
    fallbackRe.lastIndex = 0;
    let m;
    while ((m = fallbackRe.exec(line))) {
      const lit = m[2].replace(/^["'`]|["'`]$/g, "");
      if (PROTOCOL_VALUES.has(lit) || lit.length < 2) continue;
      // `x ?? true` مبدّلُ سلوك لا بيانٌ منشور — مثل `telegramAdminMirrorAll`: غيابه يعني
      // «أرسل كل شيء»، وقلبه إلى `false` يُسكت تنبيهات العملاء. لا يُصلَح بقاعدة الغياب.
      if (lit === "true" || lit === "false") continue;
      const L2 = laneOf(rel, "fallback", line, i + 1);
      push({ phase: L2.lane, keepWhy: L2.why, kind: "fallback", kindName: `احتياط في الكود — Settings.${m[1]}`, sev: "high", owner: `Settings.${m[1]}`, why: "الاحتياط يجعل غياب البيان من القاعدة لا يُكتشف أبداً — يبقى الموقع يعرض قيمة الكود إلى الأبد.", hits: 1, values: [lit.slice(0, 40)] });
    }

    // ٤ج · الأصناف الإضافية
    for (const r of EXTRA) {
      if (isImport) continue;
      if (r.skipLine && r.skipLine(line)) continue;
      r.re.lastIndex = 0;
      let hits = line.match(r.re) || [];
      if (r.skip) hits = hits.filter((x) => !r.skip(x));
      // قيمة التقطها الفحص أعلاه بوصفها قيمة عمود لا تُعدّ ثانيةً هنا — «مدوّنتي» هي
      // قيمة `imageOwnerName`، فعدّها مرّتين يضخّم الرقم ويكسر ثقة القارئ فيه.
      hits = hits.filter((x) => !JSONLD_KEYWORDS.has(x) && ![...matchedVals].some((v) => x.includes(v)));
      if (!hits.length) continue;
      const L3 = laneOf(rel, r.k, line, i + 1);
      push({ phase: L3.lane, keepWhy: L3.why, kind: r.k, kindName: r.n, sev: r.sev, owner: r.owner, why: r.why, hits: hits.length, values: [...new Set(hits)].slice(0, 4) });
    }
  });
}

// ── ٥ · المقارنة والتجميع ───────────────────────────────────────────────────
const compare = {};
for (const c of COMPARE) {
  let n = 0;
  for (const f of walk(path.join(ROOT, c))) {
    const clean = blankComments(fs.readFileSync(f, "utf8"));
    for (const { val } of settingsValues) if (clean.includes(val)) n++;
    for (const r of EXTRA) { r.re.lastIndex = 0; n += (clean.match(r.re) || []).length; }
  }
  compare[c] = n;
}

const groupFiles = (rs) => {
  const byFile = new Map();
  for (const r of rs) {
    // `keepWhy` تُجمَّع بالملفّ+السبب: ملفٌّ قد يحمل سببين (جملة تحريرية ولغة تنسيق).
    const key = r.file + "|" + (r.keepWhy || "");
    if (!byFile.has(key)) byFile.set(key, { f: r.file, keepWhy: r.keepWhy, hits: 0, lines: [], kinds: new Set(), values: new Set(), isSource: false, sample: r.sample });
    const b = byFile.get(key);
    b.hits += r.hits; b.lines.push(r.line);
    b.kinds.add(r.kindName); (r.values || []).forEach((v) => b.values.add(v));
    if (r.isSource) b.isSource = true;
  }
  return [...byFile.values()]
    .map((b) => ({ ...b, lines: [...new Set(b.lines)].sort((x, y) => x - y), kinds: [...b.kinds].slice(0, 4), values: [...b.values].slice(0, 5) }))
    .sort((a, b) => b.hits - a.hits);
};

const phases = ["2", "3", "4", "keep"].map((p) => {
  const rs = rows.filter((r) => r.phase === p);
  return { p, ...PHASES[p], hits: rs.reduce((s, r) => s + r.hits, 0), fileCount: new Set(rs.map((r) => r.file)).size, files: groupFiles(rs) };
});

const byKind = new Map();
for (const r of rows) {
  const key = r.kind === "settings" || r.kind === "fallback" ? r.kind : r.kind;
  if (!byKind.has(key)) byKind.set(key, { k: key, name: r.kind === "settings" ? "قيمة عمود مكتوبة حرفياً" : r.kind === "fallback" ? "احتياط في الكود بعد ||" : r.kindName, sev: r.sev, owner: r.kind === "settings" || r.kind === "fallback" ? "Settings — أعمدة شتّى" : r.owner, why: r.why, hits: 0, rows: [] });
  const b = byKind.get(key);
  b.hits += r.hits; b.rows.push(r);
}
const kinds = [...byKind.values()]
  .map((v) => ({ ...v, fileCount: new Set(v.rows.map((r) => r.file)).size, cols: [...new Set(v.rows.map((r) => r.owner))].slice(0, 12), files: groupFiles(v.rows), rows: undefined }))
  .sort((a, b) => (a.sev === b.sev ? b.hits - a.hits : a.sev === "high" ? -1 : 1));

const work = phases.filter((p) => p.p !== "keep");
const out = {
  db: dbName,
  filesScanned: files.length,
  settingsColumns: settingsCols.length,
  valuesProbed: settingsValues.length,
  workHits: work.reduce((s, p) => s + p.hits, 0),
  workFiles: new Set(rows.filter((r) => r.phase !== "keep").map((r) => r.file)).size,
  totalHits: rows.reduce((s, r) => s + r.hits, 0),
  fileCount: new Set(rows.map((r) => r.file)).size,
  compare,
  phases,
  kinds,
};

fs.writeFileSync(path.join(ROOT, "documents/tasks/hardcoded-inventory.json"), JSON.stringify(out, null, 1));
console.log("القاعدة:", dbName, "| أعمدة Settings:", out.settingsColumns, "| قيم مميّزة بُحث عنها:", out.valuesProbed);
console.log("ملفات مفحوصة:", out.filesScanned);
console.log("الشغل:", out.workHits, "قيمة في", out.workFiles, "ملفاً  (الخام", out.totalHits, ")\n");
for (const p of phases) console.log(String(p.hits).padStart(5), p.n.padEnd(34), p.fileCount + " ملفاً");
console.log("\nحسب الصنف:");
for (const k of kinds) console.log(String(k.hits).padStart(5), (k.sev === "high" ? "🔴 " : k.sev === "low" ? "⚪ " : "   ") + k.name.padEnd(28), k.fileCount + " ملفاً");
