/**
 * Check live HTTP status of every URL in the Removal Queue.
 * Are they really 404/410? Or still 200?
 */

const URLS = [
  "https://www.modonty.com/articles/النموذج-الأولي-الأول-من-kosmera-سيعرض-عالميًا-في-ces-2026،-مع-إعادة-تعريف-سيارة-السوبر-الكهربائية-الذكية-البوابة-39",
  "https://www.modonty.com/articles/hizero-تستعرض-منظف-الأسطح-المتعددة-h100r-الجديد-بتقنية-التنظيف-بدون-شفط-ces2026-9",
  "https://www.modonty.com/articles/هواوي-كلاود-تحتفي-بشركائها-في-السعودية-وتستعرض-نمو-منظومة-الحوسبة-السحابية-62",
  "https://www.modonty.com/articles/أخبار-على-الهامش-الأسبوع-2-8-يناير-18",
  "https://www.modonty.com/articles/أومودا-وجايكو-الإمارات-تحتفل-بأوّل-موسم-أعياد-لها-في-الدولة-مع-عرض-حصري-ليوم-واحد-بمناسبة-عيد-الميلاد-ورأس-السنة-24",
  "https://www.modonty.com/articles/استثمارك-في-العقارات-مواد-البناء-وأهميتها",
  "https://www.modonty.com/articles/أخبار-على-الهامش-الأسبوع-2-8-يناير-10",
  "https://www.modonty.com/articles/النموذج-الأولي-الأول-من-kosmera-سيعرض-عالميًا-في-ces-2026،-مع-إعادة-تعريف-سيارة-السوبر-الكهربائية-الذكية-البوابة-23",
  "https://www.modonty.com/articles/أومودا-وجايكو-الإمارات-تحتفل-بأوّل-موسم-أعياد-لها-في-الدولة-مع-عرض-حصري-ليوم-واحد-بمناسبة-عيد-الميلاد-ورأس-السنة-16",
  "https://www.modonty.com/articles/شاهد-شبيه-بلاكبيري-يعود-بعد-سنوات-لمواجهة-التشتت-الرقمي-61",
];

async function check(url: string): Promise<{ status: number; xRobots: string | null; hasNoindex: boolean }> {
  const res = await fetch(url, {
    method: "GET",
    redirect: "manual",
    headers: { "User-Agent": "modonty-admin-check/1.0" },
  });
  let hasNoindex = false;
  if (res.status === 200) {
    const html = await res.text();
    hasNoindex = /<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html);
  }
  return {
    status: res.status,
    xRobots: res.headers.get("x-robots-tag"),
    hasNoindex,
  };
}

async function main() {
  console.log("# Live HTTP status of Removal Queue URLs\n");
  console.log("| # | Status | X-Robots-Tag | <meta noindex> | Verdict |");
  console.log("|---|---|---|---|---|");
  for (let i = 0; i < URLS.length; i++) {
    const url = URLS[i];
    try {
      const r = await check(url);
      const verdict =
        r.status === 410 ? "✅ 410 GONE — perfect" :
        r.status === 404 ? "✅ 404 — Google will deindex" :
        r.status === 200 && (r.hasNoindex || (r.xRobots ?? "").includes("noindex")) ? "⚠️ 200 + noindex" :
        r.status === 200 ? "❌ 200 OK — page still alive!" :
        `${r.status}`;
      console.log(`| ${i + 1} | ${r.status} | ${r.xRobots ?? "—"} | ${r.hasNoindex ? "yes" : "no"} | ${verdict} |`);
    } catch (e) {
      console.log(`| ${i + 1} | ERR | — | — | ${e instanceof Error ? e.message : "?"} |`);
    }
  }
}

main();
