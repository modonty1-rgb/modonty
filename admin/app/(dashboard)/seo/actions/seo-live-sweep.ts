"use server";

/**
 * فحص السيو الحيّ — يفتح صفحات مدونتي ويعدّ المخالفات. صفرٌ في كل عدّاد = لم ينكسر شيء.
 *
 * لماذا يعيش هنا لا في الطرفية: خالد (٢٩ أغسطس) — «ليش وظيفة خاصة في الأدمن؟». المنطق
 * نفسه في `documents/tasks/seo-sweep.mjs`، لكن الطرفية شرطٌ عليه: يفتحها، يكتب أمراً،
 * يقرأ نصّاً أبيض. الزرّ أصدق — والأهمّ أنّه من هنا يفحص **الإنتاج** لا السيرفر المحلي.
 *
 * كل عدّاد وُلد من بطاقة أُغلقت، ويحمل نصّه الرسمي كي تُقرأ المخالفة مع قاعدتها لا وحدها.
 *
 * قراءة فقط: طلبات HTTP لا غير — لا قاعدة، لا كتابة.
 */

import { auth } from "@/lib/auth";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";

const PATHS = [
  "/", "/articles", "/clients", "/categories", "/tags", "/industries",
  "/trending", "/help/faq", "/about", "/terms", "/contact", "/trust",
  "/legal/privacy-policy", "/legal/cookie-policy",
] as const;

/**
 * مهلة كل صفحة، وهي مختلفة بين الهدفين لسبب مقيس:
 * الإنتاج يخدم صفحةً مبنيّةً سلفاً فثلاثون ثانية سخاء. أمّا السيرفر المحلي فيترجم الصفحة
 * عند أول طلب — وفي أول تشغيل للوحة انتهت مهلة `/` عند ٣٠ ثانية وسقطت من الفحص (١٣ من ١٤).
 * مهلةٌ ضيّقة هنا تُنتج «صفحة لم ترجع 200» وهي سليمة، وذاك إنذارٌ كاذب.
 */
const PAGE_TIMEOUT_MS = { production: 30_000, local: 120_000 } as const;

export interface SweepCheck {
  key: string;
  label: string;
  /** النصّ الرسمي الذي تخالفه هذه الحالة — يُعرض فقط حين يسقط الفحص. */
  source: string;
  count: number;
  /** المقام حين يكون العدّ نسبةً (روابط عربية من مجموع الروابط). */
  outOf?: number;
}

export interface SweepResult {
  ok: boolean;
  baseUrl: string;
  pagesChecked: number;
  checks: SweepCheck[];
  /** سطر لكل مخالفة: أين، وما هي — كي تُفتح مباشرةً لا تُبحث. */
  details: string[];
  /** صفحات لم ترجع 200، وهي عطلٌ قبل أي فحص. */
  broken: string[];
  error?: string;
}

const ldOf = (html: string) =>
  [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1])
    .join("");

/** ما يقرأه الإنسان: بلا سكربتات ولا أنماط. */
const visibleOf = (html: string) =>
  html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");

const BRAND = /مدونتي|مُدَوَّنَتِي|مدوّنتي|Modonty/gi;

/**
 * @param target "production" يقرأ `Settings.siteUrl` — وهو ما يهمّ فعلاً؛
 *               "local" يفحص السيرفر المحلي أثناء التطوير.
 */
export async function runSeoLiveSweep(target: "production" | "local"): Promise<SweepResult> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  let baseUrl = "http://localhost:3000";
  if (target === "production") {
    const settings = await getAllSettings();
    const configured = settings?.siteUrl?.trim();
    if (!configured) {
      return {
        ok: false, baseUrl: "", pagesChecked: 0, checks: [], details: [], broken: [],
        error: "عنوان الموقع فارغ في الإعدادات — املأ siteUrl قبل فحص الإنتاج.",
      };
    }
    baseUrl = configured.replace(/\/$/, "");
  }

  const checks: SweepCheck[] = [
    { key: "websiteOutsideHome", label: "عقدة WebSite خارج الرئيسية", count: 0,
      source: "Google · Site names: «The WebSite structured data must be on the home page of the site»" },
    { key: "personNodes", label: "عقد Person للمنصّة", count: 0,
      source: "المنصّة منظّمة لا شخصاً — عقدة Person تجعل جوجل يبني كياناً بشرياً" },
    { key: "objectIdAsName", label: "معرّف قاعدة يُبثّ كاسم", count: 0,
      source: "‏٢٤ محرفاً ستّ عشريّاً في حقل الاسم = تسريب معرّف داخلي" },
    { key: "searchAction", label: "SearchAction الموقوفة", count: 0,
      source: "أوقفت جوجل صندوق البحث في نتائجها — نوفمبر ٢٠٢٤" },
    { key: "rawArabicUrls", label: "روابط بعربي غير مرمَّز", count: 0, outOf: 0,
      source: "RFC 3986 §2.5 + Google · URL structure — الشكل المرمَّز هو الموصى به" },
    { key: "hiddenDeclared", label: "بريد/هاتف مُعلَن وغير مرئي", count: 0,
      source: "Google · sd-policies: «Don't mark up content that is not visible to readers of the page»" },
    { key: "brandTwiceInTitle", label: "عناوين فيها اسم الموقع مرّتين", count: 0,
      source: "Google · Title links: «include just your site name at the beginning or end of each title»" },
    { key: "latinBrandInLd", label: "«Modonty» لاتينية في JSON-LD", count: 0,
      source: "الاسم اللاتيني مكانه alternateName وحده — Google · Organization" },
  ];
  const at = (key: string) => checks.find((c) => c.key === key)!;

  const details: string[] = [];
  const broken: string[] = [];

  for (const path of PATHS) {
    let html: string;
    try {
      const res = await fetch(baseUrl + encodeURI(path), {
        headers: { "user-agent": "Googlebot/2.1 (+http://www.google.com/bot.html)" },
        signal: AbortSignal.timeout(PAGE_TIMEOUT_MS[target]),
        cache: "no-store",
      });
      if (res.status !== 200) { broken.push(`${path} — HTTP ${res.status}`); continue; }
      html = await res.text();
    } catch (error) {
      broken.push(`${path} — ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }

    const ld = ldOf(html);
    const visible = visibleOf(html);

    if (path !== "/") {
      const n = (ld.match(/"@type":"WebSite"/g) || []).length;
      if (n) { at("websiteOutsideHome").count += n; details.push(`WebSite × ${n} على ${path}`); }
    }

    const persons = (ld.match(/"@type":"Person"/g) || []).length;
    if (persons) { at("personNodes").count += persons; details.push(`Person × ${persons} على ${path}`); }

    for (const m of ld.matchAll(/"name":"([0-9a-f]{24})"/g)) {
      at("objectIdAsName").count++;
      details.push(`معرّف كاسم على ${path}: ${m[1]}`);
    }

    const sa = (ld.match(/SearchAction/g) || []).length;
    if (sa) { at("searchAction").count += sa; details.push(`SearchAction × ${sa} على ${path}`); }

    const urls = at("rawArabicUrls");
    for (const m of ld.matchAll(/"(?:url|@id|contentUrl|image|logo|thumbnailUrl|mainEntityOfPage)":"(https?:\/\/[^"]+)"/g)) {
      urls.outOf = (urls.outOf ?? 0) + 1;
      if (/[؀-ۿ]/.test(m[1])) {
        urls.count++;
        details.push(`رابط غير مرمَّز على ${path}: ${m[1].slice(0, 70)}`);
      }
    }

    // كل بريد أو هاتف تعلنه البيانات المنظَّمة يجب أن يراه الزائر على نفس الصفحة.
    const declared = [...new Set([...ld.matchAll(/"(?:email|telephone)":"([^"]+)"/g)].map((m) => m[1]))];
    for (const value of declared) {
      if (!visible.includes(value)) {
        at("hiddenDeclared").count++;
        details.push(`مُعلَن وغير مرئي على ${path}: ${value}`);
      }
    }

    const latin = (ld.match(/"name":"Modonty"/g) || []).length;
    if (latin) { at("latinBrandInLd").count += latin; details.push(`اسم لاتيني في JSON-LD على ${path}`); }

    const title = (html.match(/<title[^>]*>([^<]*)<\/title>/) || [, ""])[1];
    if ((title.match(BRAND) || []).length > 1) {
      at("brandTwiceInTitle").count++;
      details.push(`عنوان مكرَّر على ${path}: ${title}`);
    }
  }

  return {
    ok: checks.every((c) => c.count === 0) && broken.length === 0,
    baseUrl,
    pagesChecked: PATHS.length - broken.length,
    checks,
    details: details.slice(0, 40),
    broken,
  };
}
