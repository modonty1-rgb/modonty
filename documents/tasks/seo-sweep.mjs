/**
 * مسح السيو — يفتح صفحات مدونتي الحيّة ويعدّ المخالفات. صفرٌ في كل سطر = لم ينكسر شيء.
 *
 *   node documents/tasks/seo-sweep.mjs                 # على السيرفر المحلي
 *   node documents/tasks/seo-sweep.mjs https://…       # على أي عنوان آخر
 *
 * قراءة فقط: طلبات HTTP لا غير — لا قاعدة، لا كتابة، لا مساس بالإنتاج.
 *
 * كل فحص هنا وُلد من بطاقة أُغلقت، ومعه نصّه الرسمي. الغرض أن يعرف خالد بنفسه
 * أن المغلق ما زال مغلقاً — بأمر واحد، بلا أن يسأل أحداً.
 */

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");

const PAGES = [
  "/", "/articles", "/clients", "/categories", "/tags", "/industries",
  "/trending", "/help/faq", "/about", "/terms", "/contact", "/trust",
  "/legal/privacy-policy", "/legal/cookie-policy",
];

const get = async (path) => {
  const res = await fetch(BASE + encodeURI(path), {
    headers: { "user-agent": "Googlebot/2.1 (+http://www.google.com/bot.html)" },
    signal: AbortSignal.timeout(120000),
  });
  return { status: res.status, html: await res.text() };
};

/** JSON-LD وحده — ما يقرأه الروبوت. */
const ldOf = (html) =>
  [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1]).join("");

/** HTML المرئي — بلا سكربتات ولا أنماط: ما يقرأه الإنسان. */
const visibleOf = (html) =>
  html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");

const BRAND = /مدونتي|مُدَوَّنَتِي|مدوّنتي|Modonty/gi;

const counters = {
  websiteOutsideHome: { n: 0, label: "عقدة WebSite خارج الرئيسية", why: "Google · Site names: «The WebSite structured data must be on the home page of the site»" },
  personNodes: { n: 0, label: "عقد Person للمنصّة", why: "المنصّة منظّمة لا شخصاً" },
  objectIdAsName: { n: 0, label: "معرّف قاعدة يُبثّ كاسم", why: "‏٢٤ محرفاً ستّ عشريّاً في حقل الاسم = تسريب معرّف" },
  searchAction: { n: 0, label: "SearchAction الموقوفة", why: "أوقفتها جوجل في نوفمبر ٢٠٢٤" },
  rawArabicUrls: { n: 0, label: "روابط بعربي غير مرمَّز", why: "RFC 3986 §2.5 + Google · URL structure", of: 0 },
  hiddenDeclared: { n: 0, label: "بريد/هاتف مُعلَن وغير مرئي", why: "Google · sd-policies: «Don't mark up content that is not visible to readers of the page»" },
  brandTwiceInTitle: { n: 0, label: "عناوين فيها اسم الموقع مرّتين", why: "Google · Title links: «include just your site name … at the beginning or end»" },
  latinBrandInLd: { n: 0, label: "«Modonty» لاتينية في JSON-LD", why: "الاسم اللاتيني مكانه alternateName وحده" },
};

const failures = [];   // تفاصيل لكل مخالفة، لتُفتح مباشرةً لا لتُبحث
const broken = [];     // صفحات لم ترجع 200

console.log(`── مسح السيو · ${BASE} · ${PAGES.length} صفحة ──\n`);

for (const path of PAGES) {
  let page;
  try {
    page = await get(path);
  } catch (error) {
    broken.push(`${path} — ${error instanceof Error ? error.message : String(error)}`);
    continue;
  }
  if (page.status !== 200) {
    broken.push(`${path} — HTTP ${page.status}`);
    continue;
  }

  const ld = ldOf(page.html);
  const visible = visibleOf(page.html);

  if (path !== "/") {
    const n = (ld.match(/"@type":"WebSite"/g) || []).length;
    if (n) { counters.websiteOutsideHome.n += n; failures.push(`WebSite × ${n} على ${path}`); }
  }

  const persons = (ld.match(/"@type":"Person"/g) || []).length;
  if (persons) { counters.personNodes.n += persons; failures.push(`Person × ${persons} على ${path}`); }

  for (const m of ld.matchAll(/"name":"([0-9a-f]{24})"/g)) {
    counters.objectIdAsName.n++;
    failures.push(`معرّف كاسم على ${path}: ${m[1]}`);
  }

  const sa = (ld.match(/SearchAction/g) || []).length;
  if (sa) { counters.searchAction.n += sa; failures.push(`SearchAction × ${sa} على ${path}`); }

  for (const m of ld.matchAll(/"(?:url|@id|contentUrl|image|logo|thumbnailUrl|mainEntityOfPage)":"(https?:\/\/[^"]+)"/g)) {
    counters.rawArabicUrls.of++;
    if (/[؀-ۿ]/.test(m[1])) {
      counters.rawArabicUrls.n++;
      failures.push(`رابط غير مرمَّز على ${path}: ${m[1].slice(0, 70)}`);
    }
  }

  // كل بريد أو هاتف تعلنه البيانات المنظَّمة يجب أن يراه الزائر على نفس الصفحة.
  const declared = [...new Set([...ld.matchAll(/"(?:email|telephone)":"([^"]+)"/g)].map((m) => m[1]))];
  for (const value of declared) {
    if (!visible.includes(value)) {
      counters.hiddenDeclared.n++;
      failures.push(`مُعلَن وغير مرئي على ${path}: ${value}`);
    }
  }

  const latin = (ld.match(/"name":"Modonty"/g) || []).length;
  if (latin) { counters.latinBrandInLd.n += latin; failures.push(`اسم لاتيني في JSON-LD على ${path}`); }

  const title = (page.html.match(/<title[^>]*>([^<]*)<\/title>/) || [, ""])[1];
  if ((title.match(BRAND) || []).length > 1) {
    counters.brandTwiceInTitle.n++;
    failures.push(`عنوان مكرَّر على ${path}: ${title}`);
  }
}

let bad = 0;
for (const c of Object.values(counters)) {
  const ok = c.n === 0;
  if (!ok) bad++;
  const value = c.of !== undefined ? `${c.n} من ${c.of}` : String(c.n);
  console.log(`  ${ok ? "✓" : "✗"} ${c.label.padEnd(34)} ${value}`);
  if (!ok) console.log(`      ↳ ${c.why}`);
}

if (failures.length) {
  console.log("\n── التفاصيل ──");
  failures.slice(0, 30).forEach((f) => console.log("   • " + f));
  if (failures.length > 30) console.log(`   … و${failures.length - 30} أخرى`);
}

if (broken.length) {
  console.log("\n── صفحات لم ترجع 200 ──");
  broken.forEach((b) => console.log("   ✗ " + b));
}

const clean = bad === 0 && broken.length === 0;
console.log(`\n${clean ? "✅ كل الفحوص صفر — لم ينكسر شيء." : `⚠️ ${bad} فحصاً بغير صفر · ${broken.length} صفحة لم ترجع 200.`}`);
process.exit(clean ? 0 : 1);
