// Generator for the decision board. Source of truth = task-data.json (boards + tasks) next to this
// file; overrides (short summaries / "المطلوب منك") = task-overrides.json.
// Run from documents/tasks:  node build-task-board.mjs  → rewrites TASK.html + TASK-ARCHIVE.html
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, "$1"));
const outDir = process.argv[2] || here;
const DATA = JSON.parse(fs.readFileSync(path.join(here, "task-data.json"), "utf8"));
const TASKS = DATA.tasks;
const BOARDS = DATA.boards;
const boardName = Object.fromEntries(BOARDS.map(b => [b.k, b.n.replace(/^[^\p{L}\p{N}]+/u, "").trim()]));

const strip = (s) => (s || "").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const cut = (s, n) => { if (s.length <= n) return s; const c = s.slice(0, n); const i = Math.max(c.lastIndexOf("."), c.lastIndexOf("·"), c.lastIndexOf("؛"), c.lastIndexOf("—")); return (i > n * 0.5 ? c.slice(0, i + 1) : c).trim() + (i > n * 0.5 ? "" : "…"); };

// Split a description into labeled segments: <b>label:</b> text
function segments(d) {
  const out = [];
  const re = /<b>([^<]{1,60}?)(?::|：)<\/b>/g;
  let m, last = null;
  while ((m = re.exec(d))) {
    if (last) out.push({ label: last.label, text: strip(d.slice(last.end, m.index)) });
    last = { label: m[1].trim(), end: m.index + m[0].length };
  }
  if (last) out.push({ label: last.label, text: strip(d.slice(last.end)) });
  if (!out.length) out.push({ label: "", text: strip(d) });
  return out.filter(s => s.text);
}
const ASK_RE = /قرار|المطلوب|الخيار|بانتظار|يُسأل|سؤال|تختار|قرّر|بيدك|دورك/;

// وصف البطاقة HTML مقصود (<b> <code> <br>)، لكن ذكر كلمة <script> في نصّ بطاقة
// يفتح عنصر سكربت حقيقياً فيبتلع بقيّة الصفحة ويعطّل جافاسكربت اللوحة كلّها
// (حصل في بطاقة SEOADM-RAW: زرّ النسخ توقّف وخرج خطأ Unexpected token في الكونسول).
const noScript = (s) => (s || "").replace(/<(\/?)script/gi, "&lt;$1script");

const OVERRIDES = JSON.parse(fs.readFileSync(path.join(here, "task-overrides.json"), "utf8"));

const enriched = TASKS.map(t => {
  const segs = segments(t.d || "");
  const o = OVERRIDES[t.id] || {};
  const sum = o.sum || cut(segs.slice(0, 2).map(s => (s.label ? s.label + ": " : "") + s.text).join(" · "), 230);
  let ask = o.ask || t.ask || null;
  if (!ask && t.who === "k") {
    const seg = segs.find(s => ASK_RE.test(s.label)) || segs.find(s => ASK_RE.test(s.text.slice(0, 80)));
    if (seg) ask = cut((seg.label && !/^(دليل|الدليل)$/.test(seg.label) ? seg.label + ": " : "") + seg.text, 260);
  }
  return { ...t, sum, ask, board: boardName[t.b] || t.b };
});

const SEC_FROM_BOARD_EARLY = { seo: "seo" };
const isDone = (t) => t.tab === "done";
const allOpen = enriched.filter(t => !isDone(t));
const done = enriched.filter(isDone);
// بنود «تحديث البيانات» (file:"data") تخرج للوحة مستقلة DATA-REFACTOR.html
const dataOpen = allOpen.filter(t => t.file === "data");
// سيو مدونتي كلّه يخرج إلى لوحة مستقلّة SEO.html (خالد ٢٤ أغسطس: «أبغى أركّز ١٠٠٪ على السيو، هو قلب مدونتي»).
// نقل لا نسخ: البطاقة إمّا هنا وإمّا هناك. المراجع تبقى في اللوحة الرئيسية.
const isSeoCard = (t) => t.file !== "data" && t.tab !== "ref" && (t.sec || SEC_FROM_BOARD_EARLY[t.b]) === "seo" && (t.app || []).includes("modonty");
const seoOpen = allOpen.filter(isSeoCard);
const open = allOpen.filter(t => t.file !== "data" && !isSeoCard(t));
// الشغل الحقيقي: بلا بطاقات المرجع وبلا «قبل الدمج» — وهو الرقم الذي تعرضه شارات التبويبات.
// العنوان كان يقول `open.length` فيعدّ ٣٦ بطاقة مرجع بنوداً مفتوحة: ١٢١ مقابل ٧١ على الشاشة.
const openWork = open.filter(t => t.tab !== "ref" && !t.last);
const lastWork = open.filter(t => t.tab !== "ref" && t.last);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const json = (v) => JSON.stringify(v).replace(/<\/script/gi, "<\\/script");

// زرّ ⧉ على كل بطاقة: ينسخ مرجعاً جاهزاً للّصق في شات كلود (ID — العنوان · الملخّص · المطلوب · الرابط)
const COPY_JS = `
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.copy'); if (!btn) return;
    const card = btn.closest('.card');
    // مرجع فقط — كلود يفتح البطاقة بنفسه من الملف (خالد ٢٣ أغسطس)
    const n = card.querySelector('.num');
    const text = (n ? 'بند ' + n.textContent + ' — ' : '') + 'documents/tasks/' + location.pathname.split('/').pop() + '#' + card.dataset.id;
    const done = () => { btn.classList.add('ok'); btn.textContent = '✓'; setTimeout(() => { btn.classList.remove('ok'); btn.textContent = '⧉'; }, 1200); };
    const fallback = () => { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); done(); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(fallback);
    else fallback();
  });
`;

const CSS = `
:root{--bg:#0f1013;--panel:#17181d;--card:#1d1e24;--line:#2c2d36;--fg:#f3f4f6;--mut:#9aa3b2;--dim:#6b7280;
--amber:#f6ae31;--red:#ff6b7f;--green:#4ade80;--blue:#60a5fa;--violet:#a78bfa;--cyan:#22d3ee;--k:#f6ae31;--c:#60a5fa;}
/* الوضع الفاتح كان يبدّل الأسطح فقط ويترك ألوان التطبيقات كما هي — وهي باستيل مصمَّم لخلفية
   داكنة. النتيجة: رقم التبويب النشط بتباين ١٫٦٩–٢٫٥٤ على الأبيض (مقيس ٢٤ أغسطس)، أي غير مقروء.
   فلكل لون نسخته الغامقة هنا، وكلّها فوق ٤٫٥:١ على الأبيض. */
/* خالد (٢٩ أغسطس): «خليها دارك مود». كانت اللوحة تتبع نظام ويندوز، وهو على الفاتح
   عنده — فتنقلب بيضاء بلا أن يطلبها. الداكن ثابت الآن، ولا يتغيّر بتغيّر إعداد النظام.
   الكتلة محفوظة تحت مُحدِّد لا يُطابَق تلقائياً: من أرادها يوماً يضيف data-theme="light"
   على <html> — ولا تعود بتغيّر النظام وحده. */
:root[data-theme="light"]{--bg:#f6f7fb;--panel:#fff;--card:#fff;--line:#e4e6ee;--fg:#141722;--mut:#5b6472;--dim:#8a93a3;
--amber:#b45309;--red:#be123c;--green:#15803d;--blue:#1d4ed8;--violet:#6d28d9;--cyan:#0e7490;--k:#b45309;--c:#1d4ed8}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.65 Tajawal,system-ui,sans-serif}
a{color:inherit}code{font:12px ui-monospace,monospace;background:var(--panel);padding:1px 5px;border-radius:4px;border:1px solid var(--line)}
header.top{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--line);padding:12px 16px}
.wrap{max-width:1120px;margin:0 auto}
h1{font-size:18px;margin:0 0 8px}
.tools{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.tools input{flex:1;min-width:220px;height:40px;border-radius:10px;border:1px solid var(--line);background:var(--panel);color:var(--fg);padding:0 12px;font:inherit}
.chip{height:34px;border-radius:999px;border:1px solid var(--line);background:var(--panel);color:var(--mut);padding:0 12px;font:inherit;font-size:13px;cursor:pointer}
.chip[aria-pressed="true"]{background:var(--fg);color:var(--bg);border-color:var(--fg)}
/* قائمة التبويبات — تطبيق واحد في المرّة. الاختيار الواحد هو المقصود: الخلط بين التطبيقات هو ما كان يُتيه.
   صارت عموداً جانبياً بأمر خالد (٣٠ أغسطس): «القائمة هذي جيبها سايدبار». سببه أن الأسماء
   السبعة في سطر أفقي كانت تُقرأ ككلمات متلاصقة، وكل بحث عن تبويب يبدأ بمسح السطر كلّه.
   العمود يجعلها قائمةً تُمسح بالعين مرّة واحدة، والعدّاد في نهاية كل سطر على استقامة واحدة. */
body{padding-inline-start:212px}
.apptabs{position:fixed;inset-inline-start:0;top:0;bottom:0;width:212px;z-index:10;display:flex;flex-direction:column;gap:4px;padding:16px 10px;background:var(--panel);border-inline-end:1px solid var(--line);overflow-y:auto}
.apptab{position:relative;display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;height:40px;padding:0 12px;border:0;border-inline-start:3px solid transparent;background:none;color:var(--mut);font:inherit;font-size:14px;font-weight:600;cursor:pointer;border-radius:8px;text-align:start}
.apptab:hover{background:var(--bg);color:var(--fg)}
.apptab b{font-size:12px;font-weight:800;min-width:22px;padding:2px 6px;border-radius:999px;background:var(--line);color:var(--mut)}
.apptab[aria-selected="true"]{color:var(--fg);border-inline-start-color:currentColor;background:var(--bg)}
@media (max-width:900px){body{padding-inline-start:0}
.apptabs{position:static;width:auto;flex-direction:row;flex-wrap:wrap;border-inline-end:0;border-bottom:1px solid var(--line)}
.apptab{width:auto}}
/* كان: background:currentColor مع color:var(--bg) على نفس العنصر — وقيمة currentColor تُحسب من
   لون العنصر النهائي، فصارت الخلفية بلون النصّ تماماً واختفى رقم التبويب النشط (خالد رآه دائرةً
   فاضية، ٢٤ أغسطس). الآن: تظليل شفّاف من لون التبويب، والنصّ يبقى بلونه. */
.apptab[aria-selected="true"] b{background:var(--bg);color:inherit;box-shadow:inset 0 0 0 1.5px currentColor}
.apptab[data-app="modonty"][aria-selected="true"]{color:var(--violet)}
.apptab[data-app="admin"][aria-selected="true"]{color:var(--blue)}
.apptab[data-app="console"][aria-selected="true"]{color:var(--cyan)}
.apptab[data-app="dataLayer"][aria-selected="true"]{color:var(--green)}
.apptab[data-app="partner"][aria-selected="true"]{color:var(--amber)}
.apptab[data-app="__merge"][aria-selected="true"]{color:var(--dim)}
.grp.hidden{display:none}
/* بند «قبل الدمج» — مؤجَّل بقرار، لا متأخّر بإهمال. يبقى مرئياً لكنه يهدأ في الأسفل. */
.card[data-last]{opacity:.72;border-inline-start:4px solid var(--dim)}
.card[data-last]:hover{opacity:1}
.tag.step-tag{background:var(--accent,#0d6efd);color:#fff;font-weight:800;letter-spacing:.02em}
.tag.last-before-merge{background:transparent;color:var(--dim);border:1px dashed var(--dim);font-weight:700}
/* الجاهز لوكيل — بند فحصتُه وأعرف حجمه، ولا يحتاج قراراً من خالد. الحافّة الخضراء تكفي لتمييزه من بعيد. */
.card[data-agent]{border-inline-start:4px solid var(--green)}
.tag.agent{background:var(--green);color:#04140c;font-weight:800}
.tag.agent-measure{background:transparent;color:var(--green);border:1px solid var(--green);font-weight:700}
main{padding:16px}
section.grp{margin:0 0 28px}
.grp>h2{font-size:16px;margin:0 0 4px;display:flex;align-items:center;gap:10px}
.grp>h2 .n{font-size:12px;color:var(--mut);font-weight:500}
.grp>p{margin:0 0 12px;color:var(--mut);font-size:13px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:12px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px;display:flex;flex-direction:column;gap:8px;min-width:0}
.card[data-sev="critical"]{border-inline-start:4px solid var(--red)}.card[data-sev="high"]{border-inline-start:4px solid var(--amber)}
.card[data-sev="normal"]{border-inline-start:4px solid var(--blue)}.card[data-sev="ok"],.card[data-sev="idea"]{border-inline-start:4px solid var(--line)}
/* خلفية البطاقة حسب التطبيق — خالد يعرف نطاق البند من لونه قبل ما يقرأ (٢٤ أغسطس).
   الترتيب مقصود: مدونتي آخر قاعدة فتغلب لو كان البند على أكثر من تطبيق، لأنها النطاق الحالي. */
.card[data-apps~="shared"],.card[data-apps~="dataLayer"]{background:color-mix(in srgb,var(--green) 7%,var(--card))}
.card[data-apps~="console"]{background:color-mix(in srgb,var(--cyan) 7%,var(--card))}
.card[data-apps~="admin"]{background:color-mix(in srgb,var(--blue) 7%,var(--card))}
.card[data-apps~="modonty"]{background:color-mix(in srgb,var(--violet) 9%,var(--card))}
/* تنفيذ كودكس المكتمل يبقى أخضر بصرياً حتى قبل أن ينقل كلود البطاقة إلى الأرشيف. */
.card[data-codex-done="1"]{background:color-mix(in srgb,var(--green) 20%,var(--card));border-color:color-mix(in srgb,var(--green) 65%,var(--line))}
.card[data-codex-done="1"]::before{background:var(--green)}
/* شريط لوني رفيع أعلى البطاقة — إشارة ثانية لمن لا يميّز الفروق الخفيفة في الخلفية */
.card{position:relative}
.card::before{content:"";position:absolute;inset-block-start:0;inset-inline:0;height:2px;background:var(--line)}
.card[data-apps~="shared"]::before,.card[data-apps~="dataLayer"]::before{background:var(--green)}
.card[data-apps~="console"]::before{background:var(--cyan)}
.card[data-apps~="admin"]::before{background:var(--blue)}
.card[data-apps~="modonty"]::before{background:var(--violet)}
/* البند الجاري الآن: خلفية حمراء صريحة — خالد يلمحه من أول نظرة بلا قراءة (٢٤ أغسطس) */
.tag.next-release{background:color-mix(in srgb,#8b5cf6 18%,transparent);color:#a78bfa;border-color:color-mix(in srgb,#8b5cf6 45%,transparent)}
.card[data-next="1"]{opacity:.85}
.card[data-running="1"]{background:color-mix(in srgb,var(--red) 16%,var(--card));border-color:var(--red);border-inline-start:4px solid var(--red);box-shadow:0 0 0 1px color-mix(in srgb,var(--red) 30%,transparent)}
.card[data-running="1"] .id{background:var(--red);color:#fff;border-color:var(--red)}
.tag.running{background:var(--red);color:#fff;border-color:var(--red);font-weight:700}
/* المعرّف في سطر مستقلّ: كان يجلس بجانب العنوان بـnowrap، فمعرّف طويل مثل
   SEOADM-ARTICLES-LISTING-DENIED يعصر العنوان في عمود بعرض ٦٠px (خالد ٢٤ أغسطس: «bad ux، كيف أقرأ»). */
.hd{display:flex;gap:8px;align-items:center;justify-content:space-between}
.id{font:700 11px ui-monospace,monospace;color:var(--dim);background:var(--panel);border:1px solid var(--line);padding:2px 6px;border-radius:6px;white-space:nowrap;direction:ltr;max-width:100%;overflow:hidden;text-overflow:ellipsis}
.num{flex:none;min-width:26px;height:26px;padding:0 6px;border-radius:8px;background:var(--amber);color:#141722;font-weight:800;font-size:14px;display:inline-flex;align-items:center;justify-content:center;font-variant-numeric:tabular-nums}
.copy{margin-inline-start:auto;flex:none;width:28px;height:28px;border-radius:8px;border:1px solid var(--line);background:var(--panel);color:var(--mut);font-size:13px;cursor:pointer;line-height:1}
.copy:hover{color:var(--fg);border-color:var(--fg)}.copy.ok{color:var(--green);border-color:var(--green)}
.t{font-weight:700;font-size:16px;line-height:1.5;min-width:0}
.meta{display:flex;flex-wrap:wrap;gap:6px;font-size:12px;color:var(--mut)}
.tag{border:1px solid var(--line);border-radius:999px;padding:1px 8px}
.tag.app-modonty{color:var(--violet)}.tag.app-admin{color:var(--blue)}.tag.app-console{color:var(--cyan)}.tag.app-dataLayer{color:var(--green)}
.tag.tab-now{background:var(--amber);color:#141722;border-color:var(--amber);font-weight:700}
.tag.ease-go{background:color-mix(in srgb,var(--amber) 20%,transparent);border-color:var(--amber);color:var(--amber);font-weight:700}
.tag.ease-1{border-color:var(--green);color:var(--green)}
.tag.ease-2{border-color:var(--blue);color:var(--blue)}
.tag.ease-3{border-color:var(--red);color:var(--red)}
.sum{font-size:13.5px;color:var(--mut);margin:0;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
/* الشرح البشري (خالد ٢٤ أغسطس: «أبغى أفهم كبشر») — أربعة أسطر ثابتة قبل أي تفصيل تقني */
.plain{display:flex;flex-direction:column;gap:5px;font-size:13.5px;line-height:1.7}
.plain b{color:var(--fg)}.plain>div{color:var(--mut)}
.plain .files{display:flex;flex-wrap:wrap;gap:4px;align-items:center}.plain .files code{font-size:11px;direction:ltr}
/* ملاحظات المراجعة العكسية (خالد ٢٤ أغسطس: «سجّل ملاحظاتك الجديدة في نفس الكرت باللون الأحمر») —
   ما اكتشفه مراجع مستقلّ حاول تكذيب البطاقة: ثبت / نزل / سقط، والسبب. */
.prod{border-radius:10px;padding:8px 10px;font-size:13.5px;color:var(--fg);border:1px solid var(--line);background:var(--panel)}
.prod .when{color:var(--dim);font-size:12px}
.prod[data-state="yes"]{background:color-mix(in srgb,var(--red) 14%,transparent);border-color:color-mix(in srgb,var(--red) 50%,transparent)}
.prod[data-state="no"]{background:color-mix(in srgb,var(--green) 12%,transparent);border-color:color-mix(in srgb,var(--green) 45%,transparent)}
.prod[data-state="admin"]{background:color-mix(in srgb,var(--amber) 10%,transparent);border-color:color-mix(in srgb,var(--amber) 40%,transparent)}
.review{background:color-mix(in srgb,var(--red) 12%,transparent);border:1px solid color-mix(in srgb,var(--red) 45%,transparent);border-radius:10px;padding:8px 10px;font-size:13.5px;color:var(--fg)}
.review b{color:var(--red)}.review ul{margin:4px 0 0;padding-inline-start:18px}.review li{margin:3px 0}
/* ملاحظة كودكس (مراجع مستقلّ ثانٍ) — تبقى ظاهرة بجانب حكمي حتى يقارن خالد بنفسه */
.codex{background:color-mix(in srgb,var(--blue) 10%,transparent);border:1px solid color-mix(in srgb,var(--blue) 40%,transparent);border-inline-start:4px solid var(--blue);border-radius:10px;padding:8px 10px;font-size:13px;color:var(--fg);display:flex;flex-direction:column;gap:3px}
.codex>b{color:var(--blue)}.codex .src{font-size:11.5px;color:var(--dim)}.codex .src a{color:var(--blue)}
.codex-work{margin:7px -2px 3px;padding:8px 10px;border-radius:8px;background:color-mix(in srgb,var(--blue) 20%,transparent);border:1px solid color-mix(in srgb,var(--blue) 55%,transparent);font-size:13.5px;line-height:1.7}.codex-work b{color:var(--blue)}
.codex[data-verdict="wrong"]{border-inline-start-color:var(--red)}.codex[data-verdict="mixed"]{border-inline-start-color:var(--amber)}.codex[data-verdict="confirmed"]{border-inline-start-color:var(--green)}
.ask{background:color-mix(in srgb,var(--amber) 14%,transparent);border:1px solid color-mix(in srgb,var(--amber) 45%,transparent);border-radius:10px;padding:8px 10px;font-size:13.5px}
.ask b{color:var(--amber)}
.ask.missing{border-style:dashed;color:var(--mut)}
details{margin-top:2px}summary{cursor:pointer;font-size:12.5px;color:var(--blue);list-style:none;display:inline-flex;gap:6px;align-items:center;min-height:28px}
summary::before{content:"▸";transition:transform .15s}details[open]>summary::before{transform:rotate(90deg)}
.full{font-size:13.5px;color:var(--fg);border-top:1px solid var(--line);margin-top:8px;padding-top:8px;word-break:break-word}
.full b{color:var(--fg)}.full code{white-space:pre-wrap}
.empty{color:var(--dim);font-size:13px;padding:10px;border:1px dashed var(--line);border-radius:10px}
.hidden{display:none!important}
footer{color:var(--dim);font-size:12px;padding:20px 16px;text-align:center}
`;

function cardHTML(t) {
  const apps = (t.app || []).map(a => `<span class="tag app-${a}">${a}</span>`).join("");
  const tabL = { now: "الآن", next: "التالي", open: "مفتوح", ref: "مرجع", idea: "فكرة", done: "منجز" }[t.tab] || t.tab;
  const sevL = { critical: "حرج", high: "مهم", normal: "عادي", ok: "هادئ", idea: "فكرة" }[t.sev] || t.sev;
  // رمز نوع البند: ⚡ = ينتظر «ابدأ» فقط · 🤔 = قرار (بحجمه)
  const easeTag = t.tab === "done" ? "" :
    t.go ? `<span class="tag ease-go">⚡ قل «ابدأ»</span>` :
    t.ease === 1 ? `<span class="tag ease-1">🤔 قرار سهل</span>` :
    t.ease === 2 ? `<span class="tag ease-2">🤔 قرار قصير</span>` :
    t.ease === 3 ? `<span class="tag ease-3">🤔 يحتاج جلسة</span>` : "";
  const ask = t.who === "k" ? (t.ask ? `<div class="ask"><b>المطلوب منك:</b> ${esc(t.ask)}</div>` : `<div class="ask missing"><b>المطلوب منك:</b> لم يُصَغ بعد — افتح التفاصيل.</div>`) : "";
  const runningTag = t.running ? `<span class="tag running">⏳ جارٍ الآن</span>` : "";
  // Who holds this card, and whether it is waiting on Claude. Four workers share one branch,
  // so a card with no visible owner is a card two of them may pick up (Khalid, 25 Aug 2026).
  //
  // `ready: true` is the ONLY field a worker writes: it means "I finished, audit me". The card
  // turns green so Claude can check that one immediately instead of waiting for a whole batch.
  const OWNERS = { codex: "كودكس", agent2: "وكيل ٢", agent3: "وكيل ٣", agent4: "وكيل ٤", claude: "كلود", copilot: "كوبايلوت" };
  const ownerTag = t.owner && t.tab !== "done" ? `<span class="tag owner owner-${t.owner}">👷 ${OWNERS[t.owner] || t.owner}</span>` : "";
  const readyTag = t.ready && t.tab !== "done" ? `<span class="tag ready">✅ خلص — بانتظار تدقيق كلود</span>` : "";
  // The banner sits at the TOP of the card, above the title — the one place a state is read
  // without hunting. `ready` wins over `working`: a worker who finished but forgot to clear
  // the start flag is finished, and the green must not be hidden behind an amber.
  // المراجعة العكسية (خالد، ٢٨ أغسطس): البطاقة تحت الفحص تحمل شريطها الخاصّ وتصعد لأعلى
  // اللوحة، والملاحظات تنزل داخلها، ولا تُوسم «نجت» إلا باعتماده هو. فالوسم الأزرق يعني
  // «شغّال عليها الآن»، لا حكماً — والحكم أخضر أو أحمر، وكلاهما بيد خالد لا بيدي.
  const AUDIT_BANNER = {
    wip: `<div class="state st-audit">🔎 تحت المراجعة العكسية الآن</div>`,
    pass: `<div class="perfect-badge"><span class="pb-mark">💯</span><span class="pb-txt">سليمة ١٠٠٪<small>هوجمت ولم تسقط · بدليل خام ومصدر رسمي</small></span></div>`,
    fail: `<div class="state st-fail">🔴 سقطت في النقد العكسي — الملاحظة أدناه، والقرار قرارك</div>`,
    stamped: `<div class="perfect-badge stamped"><span class="pb-mark">🏅</span><span class="pb-txt">معتمَدة منك<small>مقفلة نهائياً</small></span></div>`,
  };
  const auditBanner = t.audit ? (AUDIT_BANNER[t.audit.state] ?? "") : "";
  const stateBanner = t.tab === "done" ? ""
    : t.ready ? `<div class="state st-ready">✅ خلص — بانتظار تدقيق كلود</div>`
    : t.working ? `<div class="state st-working">🔨 تحت الشغل الآن — ${OWNERS[t.owner] || t.owner || "؟"}</div>`
    : "";
  // بند مؤجَّل عمداً إلى ما قبل الدمج — يُوسم كي لا يُقرأ تأخيرُه إهمالاً.
  const lastTag = t.last ? `<span class="tag last-before-merge">🏁 قبل الدمج مع main</span>` : "";
  // بندٌ مؤجَّل بقرار إلى الدورة القادمة — يُوسم كي لا يُقرأ تأجيلُه إهمالاً.
  const nextTag = t.next ? `<span class="tag next-release">📦 الإصدار الجاي</span>` : "";
  // شارة الخطوة: ترتيبٌ إجباريّ داخل سلسلة، لا اقتراحَ أولوية. تُقرأ من `step`.
  const stepTag = t.step
    ? `<span class="tag step-tag" title="ترتيب إجباري — لا تبدأ هذه قبل ما قبلها">الخطوة ${t.step}${t.stepOf ? ` من ${t.stepOf}` : ""}</span>`
    : "";
  // شارة «جاهز لوكيل»: بند فُحص حجمه ولا يحتاج قراراً — الرقم هو ترتيب التنفيذ المقترح.
  const agentTag = t.agent
    ? `<span class="tag ${t.agentKind === "قياس" ? "agent-measure" : "agent"}">🤖 وكيل ${t.agent}${t.agentKind === "قياس" ? " · قياس" : ""}</span>`
    : "";
  return `<article class="card" data-id="${esc(t.id)}" data-sev="${esc(t.sev)}" data-who="${esc(t.who)}" data-tab="${esc(t.tab)}" data-board="${esc(t.b)}" data-apps="${esc((t.app||[]).join(" "))}"${t.agent ? ` data-agent="${t.agent}"` : ""}${t.last ? " data-last=\"1\"" : ""}${t.next ? " data-next=\"1\"" : ""}${t.area ? ` data-area="${esc(t.area)}"` : ""}${isSession(t) ? ' data-session="1"' : ""}${t.running ? ' data-running="1"' : ""}${t.owner ? ` data-owner="${esc(t.owner)}"` : ""}${t.ready && t.tab !== "done" ? ' data-ready="1"' : ""}${t.working && !t.ready && t.tab !== "done" ? ' data-working="1"' : ""}${t.codex?.done ? ' data-codex-done="1"' : ""}${t.n ? ` data-n="${t.n}"` : ""}${t.prod ? ` data-prod="${esc(t.prod.state)}"` : ""}${t.audit ? ` data-audit="${esc(t.audit.state)}"` : ""}${t.audit?.fix ? ' data-fixed="1"' : ""}>
  <div class="hd">${t.n ? `<span class="num" title="رقم البند — قل «بند ${t.n}» في الشات">${t.n}</span>` : ""}<span class="id">${esc(t.id)}</span><button class="copy" type="button" title="نسخ مرجع البند (للّصق في الشات)" aria-label="نسخ مرجع البند ${esc(t.id)}">⧉</button></div>
  ${auditBanner}${stateBanner}
  <div class="t">${t.t}</div>
  <div class="meta">${stepTag}${readyTag}${ownerTag}${lastTag}${nextTag}${agentTag}${runningTag}${easeTag}<span class="tag tab-${esc(t.tab)}">${tabL}</span><span class="tag">${sevL}</span>${apps}<span class="tag">${esc(t.board)}</span>${t.date ? `<span>${esc(t.date)}</span>` : ""}</div>
  ${t.prod ? `<div class="prod" data-state="${esc(t.prod.state)}"><b>${{ yes: "🌐 موجود على الإنتاج", no: "🌐 غير موجود على الإنتاج", admin: "🌐 جذره في الأدمن — لا يُقاس من الخارج", nm: "🌐 لم يُقَس على الإنتاج" }[t.prod.state]}:</b> ${esc(t.prod.ev)} <span class="when">(${esc(t.prod.base)} · ${esc(t.prod.when)})</span></div>` : ""}
  ${t.review?.length ? `<div class="review"><b>🔴 حكمي بعد المراجعة العكسية:</b><ul>${t.review.map(r => `<li>${esc(r)}</li>`).join("")}</ul></div>` : ""}
  ${t.audit ? `<div class="audit" data-state="${esc(t.audit.state)}">
    <b>${{ wip: "🔎 المراجعة العكسية — جارية", pass: "💯 المراجعة العكسية — نجت بلا انتقاد", fail: "🔴 المراجعة العكسية — سقطت", stamped: "🏅 معتمَدة منك بعد النقد" }[t.audit.state]}</b>
    ${t.audit.attack ? `<div class="a-attack"><b>حاولتُ إسقاطها بـ:</b> ${esc(t.audit.attack)}</div>` : ""}
    ${t.audit.findings?.length ? `<ul>${t.audit.findings.map(f => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}
    ${t.audit.raw ? `<pre>${esc(t.audit.raw)}</pre>` : ""}
    ${t.audit.sources?.length ? `<div class="src"><b>المصادر الرسمية:</b> ${t.audit.sources.map(s => s[1] ? `<a href="${esc(s[1])}" target="_blank" rel="noopener">${esc(s[0])}</a>` : `<span>${esc(s[0])}</span>`).join(" · ")}</div>` : ""}
    ${t.audit.state === "wip" ? `<div class="a-wait">⏳ القياس جارٍ.</div>` : ""}
    ${t.audit.state === "pass" ? `<div class="a-wait">✋ تنتقل إلى «معتمَد» بكلمتك أنت وحدك.</div>` : ""}
    ${t.audit.state === "fail" && !t.audit.fix ? `<div class="a-wait">✋ لم ألمس الكود — الإصلاح قرارك.</div>` : ""}
    ${t.audit.when ? `<div class="when">${esc(t.audit.when)}</div>` : ""}
    ${t.audit.fix ? `<div class="afix">
      <b>🛠️ أُصلحت — بانتظار تعميدك</b>
      ${t.audit.fix.what?.length ? `<ul>${t.audit.fix.what.map(w => `<li>${esc(w)}</li>`).join("")}</ul>` : ""}
      ${t.audit.fix.raw ? `<pre>${esc(t.audit.fix.raw)}</pre>` : ""}
      ${t.audit.fix.files?.length ? `<div class="src"><b>الملفات:</b> ${t.audit.fix.files.map(f => `<code>${esc(f)}</code>`).join(" · ")}</div>` : ""}
      ${t.audit.fix.when ? `<div class="when">${esc(t.audit.fix.when)}</div>` : ""}
    </div>` : ""}
  </div>` : ""}
  ${t.codex ? `<div class="codex" data-verdict="${esc(t.codex.verdict)}"><b>🔵 كودكس (مراجع مستقلّ) — ${esc(t.codex.label)}:</b><div><b>الكود:</b> ${esc(t.codex.evidence)}</div><div><b>ملاحظته:</b> ${esc(t.codex.note)}</div>${t.codex.work ? `<div class="codex-work"><b>${t.codex.done ? "✅ تنفيذ كودكس:" : "📝 ملاحظة كودكس:"}</b> ${esc(t.codex.work)}</div>` : ""}${t.codex.sources?.length ? `<div class="src">${t.codex.sources.map(s => s[1] ? `<a href="${esc(s[1])}" target="_blank" rel="noopener">${esc(s[0])}</a>` : `<span>${esc(s[0])}</span>`).join(" · ")}</div>` : ""}</div>` : ""}
  ${t.plain ? `<div class="plain">
    <div><b>المشكلة:</b> ${esc(t.plain.p)}</div>
    <div><b>ليش تهمّنا:</b> ${esc(t.plain.x)}</div>
    <div><b>الحلّ:</b> ${esc(t.plain.s)}</div>
    ${t.plain.f?.length ? `<div class="files"><b>الملفات:</b> ${t.plain.f.map(f => `<code>${esc(f)}</code>`).join(" ")}</div>` : ""}
  </div>` : `<p class="sum">${esc(t.sum)}</p>`}
  ${ask}
  <details><summary>التفاصيل الكاملة</summary><div class="full">${noScript(t.d)}</div></details>
</article>`;
}

// أقسام الشغل الموضوعية. البطاقة تحمل `sec` في `task-data.json`؛ وما لم يُوسم بعد يُشتقّ من
// بورده الأصلي، وما لا ينطبق عليه شيء ينزل «بنود أخرى» — قسم صريح خير من بطاقة تختفي.
const SECTIONS = [
  { k: "visible", n: "🔴 كسر يراه الزائر", s: "شيء مكسور على الشاشة الآن — يسبق كل تحسين." },
  { k: "seo", n: "🔍 سيو", s: "ما يجلب زائراً جديداً من البحث." },
  { k: "ai", n: "🤖 الذكاء الاصطناعي", s: "ظهورنا داخل إجابات ChatGPT وPerplexity وجوجل — طبقة مستقلّة عن السيو: نرتّب في البحث ولا يُستشهد بنا في الإجابة." },
  { k: "reels", n: "🎬 الطلّات", s: "الصفحة وربطها بباقي الموقع." },
  { k: "analytics", n: "📊 قياس وتتبّع", s: "بلا رقم لا نعرف هل نجح ما بنيناه." },
  { k: "ui", n: "🎨 واجهة وتجربة", s: "ما يراه الزائر ويستعمله." },
  { k: "code", n: "🧱 بنية الكود", s: "ريفاكتور وتوحيد — بلا أثر مباشر على الزائر." },
  { k: "qa", n: "🧪 فحص وجودة", s: "مسارات لم تُختبر بعد." },
  { k: "other", n: "بنود أخرى — دوري", s: "لم تُصنَّف بعد؛ تُنقل إلى قسمها عند فتح مرحلتها." },
];
const SEC_FROM_BOARD = { seo: "seo", fs: "code", mediaimg: "visible", bunny: "visible", bugs: "visible" };
const secOf = (t) => t.sec || SEC_FROM_BOARD[t.b] || "other";

// تبويب الموضوع = قسم واحد، لا قسمان (خالد ٣٠ أغسطس: «رتب لي الـtab تبع صفحة العميل حسب
// السهولة»). قبلها كانت بطاقاته تتوزّع على «يحتاج قرارك» وأقسام الموضوع، فيُرتَّب كلٌّ على
// حدة ولا تُقرأ قائمة واحدة من الأسهل للأصعب. وضعُها أوّلاً يجعلها حصريّة كما هي في `inTab`.
const AREA_SECTIONS = [
  // خالد ١ سبتمبر: «اعمل تاب سمّيه الذكاء الاصطناعي وكل ما يخصّه ودّيه هناك». وُضع في
  // `AREA_SECTIONS` لا في `SECTIONS` لأن الأخيرة تستثني `who === "k"` فتذهب بطاقة القرار
  // إلى «يحتاج قرارك» ويفرغ التبويب. الموضوع هنا يسبق الحالة كما في بقيّة تبويبات المواضيع.
  // «الفواتير» تبويب مستقلّ بأمر خالد (٢ سبتمبر): ثلاثة مزوّدين بثلاثة نماذج مختلفة
  // (اشتراك · فاتورة تُخصم · رصيد ينفد)، فلا يجمعها بند تحت «الإنتاج». الوسم: area: "billing".
  { k: "sec-billing", n: "💳 الفواتير", area: "billing" },
  { k: "sec-ai", n: "🤖 الذكاء الاصطناعي", area: "ai" },
  { k: "sec-partner", n: "🏢 صفحة العميل", area: "partner" },
  { k: "sec-autolink", n: "🔗 الربط الداخلي", area: "autolink" },
  { k: "sec-deploy", n: "🚀 بعد النشر", area: "deploy" },
  { k: "sec-jbrseo", n: "🔗 جبر سيو", area: "jbrseo" },
];
const EASE_LEGEND = "الأسهل أولاً: ⚡ = كلمة «ابدأ» تكفي · 🤔 سهل = نعم/لا · 🤔 قصير = جواب سطر · 🤔 جلسة = نقاش.";

const groups = [
  // `next`/`last` يسبقان الموضوع في `inTab`، فيسبقانه هنا أيضاً — وإلا بقيت البطاقة
  // المنقولة إلى «الإصدار الجاي» مرسومةً داخل صندوق موضوعها، وافترق الصندوق عن التبويب.
  ...AREA_SECTIONS.map(a => ({ k: a.k, n: a.n, s: EASE_LEGEND, f: t => t.area === a.area && t.tab !== "ref" && !t.next && !t.last })),
  { k: "decide", n: "يحتاج قرارك", s: EASE_LEGEND + " كلود لا يبدأ قبل كلمتك.", f: t => t.who === "k" && t.tab !== "ref" },
  // ── شغلي أنا، مجمَّعاً بالموضوع لا بالحالة (خالد، ٢٤ أغسطس: «جمعهم حسب السكشن —
  // اللي يخصّ السيو في سكشن واللي يخصّ الواجهة في سكشن، عشان نبتدي حسب الأولوية»).
  // «الآن/التالي/مفتوح» كانت تقول متى أبدأ ولا تقول في ماذا — والقرار يحتاج الثانية.
  // الترتيب هنا هو ترتيب الأولوية: ما يراه الزائر مكسوراً، ثم ما يجلب زائراً، ثم الباقي.
  ...SECTIONS.map(s => ({ k: s.k, n: s.n, s: s.s, f: t => t.who !== "k" && secOf(t) === s.k })),
  { k: "ref", n: "مراجع — لا مهامّ", s: "طرق قياس ومفاتيح وخرائط. تُفتح عند الحاجة.", f: t => t.tab === "ref", collapsed: true },
];
const seen = new Set();
const sections = groups.map(g => {
  const items = open.filter(t => !seen.has(t.id) && g.f(t));
  items.forEach(t => seen.add(t.id));
  const sevRank = { critical: 0, high: 1, normal: 2, ok: 3, idea: 4 };
  // الأسهل أولاً: ⚡«قل ابدأ» ثم القرار السهل فالقصير فالجلسات؛ الشدّة تفصل داخل المستوى الواحد
  const easeRank = (t) => t.go ? 0 : (t.ease ?? 9);
  // `last` ينزل تحت الكل مهما كانت شدّته: بنود «قبل الدمج مع main» لا تُعمل الآن، فوجودها في
  // الأعلى يزاحم ما يُعمل اليوم (خالد، ٢٤ أغسطس: «move both to the bottom»).
  // `step` يسبق كل ترتيب آخر (خالد ٣٠ أغسطس: «خطوات بترتيب منطقي عشان ما أقدّم خطوة على خطوة»).
  // الشدّة والسهولة تقولان «بأيّها أبدأ»؛ وهنا الترتيب إجباريّ لا اختياريّ — تقديمُ خطوة يفسد التي قبلها.
  items.sort((a, b) =>
    (a.step ?? 99) - (b.step ?? 99) ||
    (a.last ? 1 : 0) - (b.last ? 1 : 0) ||
    easeRank(a) - easeRank(b) ||
    (sevRank[a.sev] ?? 9) - (sevRank[b.sev] ?? 9)
  );
  return { ...g, items };
});
const leftovers = open.filter(t => !seen.has(t.id));
if (leftovers.length) console.error("UNGROUPED", leftovers.map(t => t.id + ":" + t.tab + ":" + t.who).join(" "));

const kCount = sections[0].items.length;
const appsAll = ["modonty", "admin", "console", "dataLayer"];

// ── تبويبات التطبيقات ───────────────────────────────────────────────
// خالد (٢٤ أغسطس): «رتّب الملف تبات — مدونتي تاب والأدمن تاب والكونسول تاب، أنا تايه».
// السبب: ١٣٧ بنداً من أربعة تطبيقات في عمود واحد لا يُقرأ. التبويب يفصلها فصلاً حقيقياً.
// الافتراضي «مدونتي» لأنها المرحلة الجارية — وتبويب «الكل» موجود كي لا يختفي شيء عن العين.
// «صفحة الشريك» تبويب موضوع لا تبويب تطبيق (خالد، ٢٤ أغسطس). سببه أن شغلها متناثر: قرارات
// تصميم وريفاكتور جوّال وباني موقع وتقييمات ومراجعات جوجل — كلّها تخصّ سطحاً واحداً يقرأه
// الزائر، ولا يجمعها عمود «مدونتي» لأنه يجمع كل شيء. البطاقة تظهر في تبويبها وفي تبويب تطبيقها.
// خالد (٢٩ أغسطس): «البار اللي فوق متوّهني». كانت ثمانية تبويبات تسأل «أي تطبيق؟» — وهو
// سؤال المبرمج لا سؤال صاحب العمل. صاحب العمل يسأل «مين دوره الآن؟». فصارت ثلاثة تجيبه،
// و«الكل» يبقى كي لا يختفي شيء. نفس العلاج الذي نجح على لوحة السيو قبلها بساعات.
const APP_TABS = [
  { k: "__decide", n: "① قرارك" },
  { k: "__mine", n: "② دوري" },
  // «صفحة العميل» رجع تبويباً بأمر خالد (٢٩ أغسطس): «فيها شغل كتير هنشتغله». الوسم
  // `area: "partner"` كان موجوداً من ٢٤ أغسطس ومعطَّلاً بعد تبسيط البار — أُعيد تفعيله فقط.
  // «الذكاء الاصطناعي» تبويب مستقلّ بأمر خالد (١ سبتمبر): «اعمل تاب سمّيه الذكاء الاصطناعي
  // وكل ما يخصّه ودّيه هناك». موضوعٌ قائم بذاته: نرتّب في البحث ولا يُستشهد بنا في الإجابة،
  // فهو ليس فرعاً من السيو. الوسم: area: "ai".
  { k: "billing", n: "💳 الفواتير" },
  { k: "ai", n: "🤖 الذكاء الاصطناعي" },
  { k: "partner", n: "🏢 صفحة العميل" },
  // «الربط الداخلي» تبويب مستقلّ بأمر خالد (٣٠ أغسطس): «اعمل لي تاب للأوتولينك».
  // موضوع واحد يمسّ ١٩٠ مقالاً ويتفرّع إلى محرّر وشاشة دفعة وخطوة صيانة — فمكانه تبويب لا صفّ.
  { k: "autolink", n: "🔗 الربط الداخلي" },
  // «الإصدار الجاي» (خالد ٢٩ أغسطس): بندٌ متّفق عليه ولن يُعمل في هذه الدورة. يخرج من
  // «قرارك» و«دوري» كي لا يزاحم ما يُعمل اليوم، ولا يُحذف كي لا يُنسى. الوسم: next: true
  { k: "__next", n: "📦 الإصدار الجاي" },
  { k: "__merge", n: "🏁 قبل الدمج" },
  // «بعد النشر» (خالد ٣٠ أغسطس): «حط لي الخطوات عشان أنا ما أنسى أي خطوة». شغلٌ لا يُنفَّذ
  // إلا على الإنتاج بعد وصول الكود، وكان مبعثراً بين «قرارك» و«قبل الدمج» — والثاني خطأ:
  // البطاقة التي تُنفَّذ بعد الدمج ليست حاجزاً أمامه. الوسم: area: "deploy"
  { k: "deploy", n: "🚀 بعد النشر" },
  // «جبر سيو» (خالد ٣٠ أغسطس): «افتح لي Tab سميه جبر SEO واديني التقرير اللي هناك».
  // ضمّ مستودعات جبر سيو وتوحيد السكيما — موضوع قائم بذاته، لا يُخلط بشغل مدونتي.
  { k: "jbrseo", n: "🔗 جبر سيو" },
  // «أفكار» (خالد ٣٠ أغسطس): ما لم يُقرَّر بعدُ أنه سيُعمل — يخرج من «قرارك» كي لا
  // يزاحم قراراً على شغلٍ قائم، ويبقى مرئياً كي لا يُنسى. الوسم: sev === "idea"
  // «الجلسة القادمة» (خالد ٣٠ أغسطس): ما لا يُحسم برسالة — يحتاج جلوساً ونقاشاً.
  // وسمُه في العنوان نفسه منذ البداية: «💬 جلسة ·».
  { k: "__session", n: "💬 الجلسة القادمة" },
  { k: "__ideas", n: "💡 أفكار" },
  { k: "__all", n: "الكل" },
];
// حصريّ لا مزدوج (خالد، ٢٤ أغسطس: «still duplicate in modonty»): بطاقة صفحة الشريك تخرج من
// تبويب تطبيقها. البطاقة التي تظهر في تبويبين تُعدّ مرّتين وتُقرأ كبندين — وهذا نقيض سبب التبويب.
/** تبويبات الموضوع: مفتاح التبويب = قيمة `area` على البطاقة. حصريّة — البطاقة الموسومة
 *  بموضوعٍ لا تظهر في «قرارك» ولا «دوري» كي لا تُعدّ مرّتين. */
const AREA_TABS = ["billing", "ai", "partner", "autolink", "deploy", "jbrseo"];
/** «جلسة» ليست حقلاً بل وسمٌ في العنوان كُتب هكذا منذ البداية — نقرأه بدل تكرار البيانات. */
const isSession = (t) => /💬\s*جلسة/.test(t.t || "");
const inTab = (t, k) =>
  k === "__all" ? true
  : k === "__next" ? !!t.next
  : t.next ? false
  : k === "__merge" ? !!t.last
  : t.last ? false
  // «قرارك» = ما ينتظر كلمته هو · «دوري» = ما أنفّذه بلا انتظار. لا ثالث بينهما،
  // فكل بطاقة في واحد منهما لا في اثنين — والعدّادان يجمعان الكل بلا تكرار.
  // «صفحة العميل» قبل «قرارك» و«دوري» عمداً: التبويب لا يجمع الشغل إن كانت بطاقاته
  // تُلتقط قبله. ستّ منها `who === "k"` — بالترتيب القديم كانت تبقى في «قرارك» ولا يصل
  // إليها التبويب أبداً، فيقول العدّاد صفراً وفيه تسعة.
  // تبويبات الموضوع تُقرأ من `area` — واحدة عامّة تخدم «صفحة العميل» و«الربط الداخلي» وما يأتي
  : AREA_TABS.includes(k) ? t.area === k
  : AREA_TABS.includes(t.area) ? false
  // «أفكار» بعد «قبل الدمج» و«صفحة العميل» عمداً: بطاقةٌ تحمل وسم الفكرة وهي في الوقت
  // نفسه حاجزُ دمجٍ أو شغلُ صفحة العميل تبقى حيث يُبحث عنها — الفكرة صفةٌ فيها لا مكانُها.
  // «الجلسة القادمة» بعد تبويبات الموضوع: بطاقةُ صفحة العميل التي تحتاج جلسة تبقى مع
  // أخواتها — الموضوع هو ما يُشتغل عليه، والجلسة صفةٌ فيه.
  : k === "__session" ? isSession(t)
  : isSession(t) ? false
  : k === "__ideas" ? t.sev === "idea"
  : t.sev === "idea" ? false
  : k === "__decide" ? t.who === "k"
  : k === "__mine" ? t.who !== "k"
  : k === "__none" ? !(t.app || []).length
  : (t.app || []).includes(k);
// المراجع ليست مهامّ (طرق قياس ومفاتيح وخرائط) — إدخالها في العدّاد يضخّم الباقي
// بـ٣٦ بنداً لا يُعمل فيها شيء (خالد، ٢٤ أغسطس: «only the remaining and open»).
const tabCount = (k) => open.filter(t => t.tab !== "ref" && (k === "__merge" || !t.last) && inTab(t, k)).length;
const appTabsHTML = APP_TABS
  .map(a => `<button class="apptab" role="tab" data-app="${a.k}" aria-selected="${a.k === "__decide"}" title="${tabCount(a.k)} بنداً مفتوحاً في ${a.n} — الرقم الكهرماني فوق يعدّ ما ينتظر قرارك منها وحدها">${a.n}<b>${tabCount(a.k)}</b></button>`)
  .join("");
const boardHTML = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>لوحة مدونتي — ${openWork.length} بنداً مفتوحاً</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body>
<div class="apptabs" role="tablist" aria-label="التبويبات">${appTabsHTML}</div>
<header class="top"><div class="wrap">
<h1>لوحة الشغل — ${openWork.length} بنداً مفتوحاً <span style="color:var(--dim);font-weight:500;font-size:13px">· و${lastWork.length} في «قبل الدمج» · <b>سيو مدونتي (${seoOpen.length}) في <a href="SEO.html">SEO.html</a></b> · تحديث البيانات في <a href="DATA-REFACTOR.html">DATA-REFACTOR.html</a> · المنجز في <a href="TASK-ARCHIVE.html">TASK-ARCHIVE.html</a></span></h1>
<!-- لا صفّ إحصاءات إطلاقاً (خالد، ٢٤ أغسطس: «only the counter for what remain, no حشو»).
     كانت عشرون رقماً على الشاشة، ثم واحد بارز مع مطويّة — وكلّها ما زالت حشواً فوق ما يلزم.
     أرقام التبويبات وحدها تقول ما بقي، وعناوين الأقسام تقول توزيعه. الباقي كان يشرح لا يفيد.
     ولا حقل بحث (خالد ٣٠ أغسطس: «البحث أنا ما أحتاجه») — التبويبات صارت هي طريق الوصول،
     وكشفُ بطاقة مرجع عبر الرابط المباشر يتكفّل به forcedId في السكربت بدل كتابة معرّفها. -->
<div class="tools">
<button class="chip" data-sev="critical high" aria-pressed="false">الحرج والمهم فقط</button>
<button class="chip" data-agent="1" aria-pressed="false">🤖 الجاهز لوكيل (${open.filter(t => t.agent).length})</button></div>
</div></header>
<main class="wrap">
${sections.filter(g => g.items.length).map(g => `<section class="grp" data-grp="${g.k}"><h2>${g.n} <span class="n" data-count>${g.items.length}</span></h2><p>${g.s}</p>${g.collapsed ? `<details><summary>اعرض ${g.items.length} مرجعاً</summary>` : ""}<div class="grid">${g.items.map(cardHTML).join("\n") || '<div class="empty">لا شيء هنا.</div>'}</div>${g.collapsed ? "</details>" : ""}</section>`).join("\n")}
</main>
<footer>بيانات البطاقات كما هي (التفاصيل الكاملة داخل كل بطاقة) — الملخّص و«المطلوب منك» مستخلَصان. تحديث البيانات: <a href="DATA-REFACTOR.html">DATA-REFACTOR.html</a> · المنجز: <a href="TASK-ARCHIVE.html">TASK-ARCHIVE.html</a>.</footer>
<script>
(() => {
  const chips = [...document.querySelectorAll('.chip')];
  const tabs = [...document.querySelectorAll('.apptab')];
  // بديل حقل البحث المحذوف: معرّفٌ واحد يُفرَض عند فتح رابط مباشر لبطاقة مرجع — وهو
  // الاستعمال الوحيد الذي كان البحث يخدمه بعد أن صارت التبويبات طريق الوصول.
  let forcedId = '';
  const cards = [...document.querySelectorAll('.card')];
  // التبويب الفعّال يُخزَّن محلياً: يفتح خالد الملف فيجد آخر تطبيق كان فيه، لا الافتراضي كل مرّة.
  // الافتراضي «قرارك»: هو التبويب الوحيد الذي يحتاج خالد أن يفعل فيه شيئاً.
  // كان 'modonty' — واسمُ تبويبٍ حُذف يجعل كل التبويبات غير محدَّدة والقائمة شبه فارغة.
  let app = '__decide';
  try { const s = localStorage.getItem('taskboard-app'); if (s && tabs.some(t => t.dataset.app === s)) app = s; } catch {}
  const matchApp = (c) => {
    // «الكل» يعني كل الشغل المفتوح — لا يشمل «قبل الدمج»، تماماً كما تستثنيه شارته.
    // قبل ٢٤ أغسطس كان يعرضها ولا يعدّها: ٧١ في الشارة و٨٥ على الشاشة.
    if (app === '__all') return !c.dataset.last;
    // تبويب «قبل الدمج» حصريّ: بنوده تخرج من كل تبويب آخر كي لا تُعدّ مرّتين
    if (app === '__next') return !!c.dataset.next;
    if (c.dataset.next) return false;
    if (app === '__merge') return !!c.dataset.last;
    if (c.dataset.last) return false;
    // التبويبان الجديدان يقرآن data-who لا data-apps. غيابهما هنا جعل العدّاد يقول
    // ٢٦ والقائمة تحته فارغة — الرقم يُحسب وقت البناء والتصفية تعمل في المتصفّح،
    // فافترقا (خالد ٢٩ أغسطس: «سارت فاضية، وفوق في العدّاد ستة وعشرين»).
    // نفس ترتيب inTab في البناء حرفياً — «صفحة العميل» أوّلاً ثم «قرارك»/«دوري».
    // أي اختلاف بين الترتيبين يفرّق العدّاد عن القائمة، وهو عطل ٢٩ أغسطس بعينه.
    // نفس قائمة تبويبات الموضوع في البناء حرفياً — أي اختلاف يفرّق العدّاد عن القائمة
    const AREAS = ${JSON.stringify(AREA_TABS)};
    if (AREAS.includes(app)) return c.dataset.area === app;
    // بطاقة الموضوع لا تظهر في تبويب آخر — حصريّة كي لا تُعدّ مرّتين
    if (AREAS.includes(c.dataset.area)) return false;
    if (app === '__session') return !!c.dataset.session;
    if (c.dataset.session) return false;
    if (app === '__ideas') return c.dataset.sev === 'idea';
    if (c.dataset.sev === 'idea') return false;
    if (app === '__decide') return c.dataset.who === 'k';
    if (app === '__mine') return c.dataset.who !== 'k';
    const list = (c.dataset.apps || '').split(' ').filter(Boolean);
    return app === '__none' ? list.length === 0 : list.includes(app);
  };
  const apply = () => {
    const term = forcedId.toLowerCase();
    const sevOnly = chips.find(c => c.dataset.sev)?.getAttribute('aria-pressed') === 'true';
    const agentOnly = chips.find(c => c.dataset.agent)?.getAttribute('aria-pressed') === 'true';
    tabs.forEach(t => t.setAttribute('aria-selected', String(t.dataset.app === app)));
    cards.forEach(c => {
      let ok = matchApp(c);
      // بطاقات المرجع ليست شغلاً مفتوحاً، والشارة لا تعدّها — فلا تُرسم إلا لمن يبحث عنها
      // بالاسم. قبل ٢٤ أغسطس كانت تُرسم ولا تُعدّ: ٢٢ في شارة مدونتي و٢٧ بطاقة تحتها.
      if (ok && c.dataset.tab === 'ref' && !term) ok = false;
      if (ok && term) ok = (c._s ||= c.textContent.toLowerCase()).includes(term) || c.dataset.id.toLowerCase().includes(term);
      if (ok && sevOnly) ok = /critical|high/.test(c.dataset.sev);
      if (ok && agentOnly) ok = !!c.dataset.agent;
      c.classList.toggle('hidden', !ok);
    });
    // قسم بلا بطاقات مرئية يختفي كلّه — العنوان الفارغ ضجيج، وخالد جاء يقرأ لا يتصفّح.
    // والعدّادات في الأعلى تتبع التبويب: رقمان مختلفان لنفس الشيء على شاشة واحدة هو أصل التيه.
    document.querySelectorAll('.grp').forEach(g => {
      const n = g.querySelectorAll('.card:not(.hidden)').length;
      g.querySelector('[data-count]').textContent = n;
      g.classList.toggle('hidden', n === 0);
      const stat = document.querySelector('[data-stat="' + g.dataset.grp + '"]');
      if (stat) stat.textContent = n;
    });
  };
  chips.forEach(c => c.addEventListener('click', () => { c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); apply(); }));
  tabs.forEach(t => t.addEventListener('click', () => {
    app = t.dataset.app;
    forcedId = ''; // الخروج من بطاقة مرجع فُتحت برابط مباشر — وإلا بقي التبويب مقصوراً عليها
    try { localStorage.setItem('taskboard-app', app); } catch {}
    apply(); window.scrollTo({ top: 0, behavior: 'smooth' });
  }));
  apply(); // يطبّق التبويب المحفوظ فور الفتح
  // رابط مباشر ‎#ID: يفتح تفاصيل البطاقة — ويقفز إلى «الكل» أوّلاً وإلا بقيت مخفيّة خلف تبويب آخر.
  if (location.hash) {
    const el = document.querySelector('.card[data-id="' + CSS.escape(decodeURIComponent(location.hash.slice(1))) + '"]');
    if (el) {
      // بطاقة «قبل الدمج» أو بطاقة مرجع لن يفتحها «الكل» بعد اليوم — يُختار لها تبويبها،
      // والمرجع يُكشف بفرض معرّفه لأن هذا هو شرط ظهوره.
      if (!matchApp(el) || el.dataset.tab === 'ref') {
        app = el.dataset.last ? '__merge' : '__all';
        if (el.dataset.tab === 'ref') forcedId = el.dataset.id;
        apply();
      }
      el.querySelector('details').open = true;
      el.scrollIntoView({ block: 'center' });
    }
  }
${COPY_JS}
})();
</script></body></html>`;

const archiveHTML = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>أرشيف المنجز — ${done.length} بنداً</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body>
<header class="top"><div class="wrap"><h1>أرشيف المنجز — ${done.length} بنداً <span style="color:var(--dim);font-weight:500;font-size:13px">· اللوحة المفتوحة: <a href="TASK.html">TASK.html</a></span></h1>
<div class="tools"><input id="q" type="search" placeholder="ابحث في المنجز…" aria-label="بحث"></div></div></header>
<main class="wrap"><section class="grp"><div class="grid">${done.map(cardHTML).join("\n")}</div></section></main>
<script>
(() => { const q = document.getElementById('q'); const cards = [...document.querySelectorAll('.card')];
  q.addEventListener('input', () => { const t = q.value.trim().toLowerCase(); cards.forEach(c => c.classList.toggle('hidden', !!t && !((c._s ||= c.textContent.toLowerCase()).includes(t) || c.dataset.id.toLowerCase().includes(t)))); });
  if (location.hash) { const el = document.querySelector('.card[data-id="' + CSS.escape(location.hash.slice(1)) + '"]'); if (el) { el.querySelector('details').open = true; el.scrollIntoView({ block: 'center' }); } }
${COPY_JS}
})();
</script></body></html>`;

// ── DATA-REFACTOR.html — بنود تحديث البيانات (قاعدة/أدمن، لا كود) ──
const sevRankD = { critical: 0, high: 1, normal: 2, ok: 3, idea: 4 };
const dataGroups = [
  { n: "بيدك أو بيد الفريق", s: "إدخال أو تصحيح بيانات على الإنتاج — قرارك أو ضغطتك.", items: dataOpen.filter(t => t.who === "k") },
  { n: "دوري", s: "تصحيح بيانات أنفّذه أنا متى قلت «ابدأ».", items: dataOpen.filter(t => t.who !== "k") },
].map(g => ({ ...g, items: [...g.items].sort((a, b) => ((a.go ? 0 : a.ease ?? 9) - (b.go ? 0 : b.ease ?? 9)) || (sevRankD[a.sev] ?? 9) - (sevRankD[b.sev] ?? 9)) }));

const dataHTML = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>تحديث البيانات — ${dataOpen.length} بنداً</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body>
<header class="top"><div class="wrap">
<h1>تحديث البيانات — شغل على القاعدة لا على الكود <span style="color:var(--dim);font-weight:500;font-size:13px">· اللوحة الرئيسية: <a href="TASK.html">TASK.html</a> · آخر بناء ٢٣ أغسطس ٢٠٢٦</span></h1>
<div class="stats"><span class="stat"><b>${dataGroups[0].items.length}</b>بيدك</span><span class="stat"><b>${dataGroups[1].items.length}</b>دوري</span><span class="stat"><b>${dataOpen.length}</b>الإجمالي</span></div>
<div class="tools"><input id="q" type="search" placeholder="ابحث بالكلمة أو رقم البند…" aria-label="بحث"></div>
</div></header>
<main class="wrap">
${dataGroups.filter(g => g.items.length).map(g => `<section class="grp"><h2>${g.n} <span class="n" data-count>${g.items.length}</span></h2><p>${g.s}</p><div class="grid">${g.items.map(cardHTML).join("\n")}</div></section>`).join("\n")}
</main>
<footer>هذه اللوحة تخصّ إدخال وتصحيح البيانات فقط — بنود الكود في <a href="TASK.html">TASK.html</a>.</footer>
<script>
(() => { const q = document.getElementById('q'); const cards = [...document.querySelectorAll('.card')];
  q.addEventListener('input', () => { const t = q.value.trim().toLowerCase(); cards.forEach(c => c.classList.toggle('hidden', !!t && !((c._s ||= c.textContent.toLowerCase()).includes(t) || c.dataset.id.toLowerCase().includes(t)))); document.querySelectorAll('.grp').forEach(g => { g.querySelector('[data-count]').textContent = g.querySelectorAll('.card:not(.hidden)').length; }); });
  if (location.hash) { const el = document.querySelector('.card[data-id="' + CSS.escape(location.hash.slice(1)) + '"]'); if (el) { el.querySelector('details').open = true; el.scrollIntoView({ block: 'center' }); } }
${COPY_JS}
})();
</script></body></html>`;

// ── SEO.html — لوحة سيو مدونتي وحدها ──
// الترتيب: ما ينتظر قرار خالد أوّلاً، ثم ما يُصلَح في مدونتي بشدّته، ثم ما جذره في مولّد الأدمن.
const sevRankS = { critical: 0, high: 1, normal: 2, ok: 3, idea: 4 };
const bySev = (a, b) => (sevRankS[a.sev] ?? 9) - (sevRankS[b.sev] ?? 9);
// خالد (٢٤ أغسطس): «رتّبه حسب الأولوية حسب القسم وابدأ بالأسهل للأصعب — التسلسل المنطقي مهم».
// المراحل تسلسل تنفيذ لا تصنيف: الأدمن يُصلَح أساسُه (المرحلة ٣) قبل مولّداته (٤) قبل تجديده (٥)،
// وإلا أعدنا التوليد على أساس مكسور. حقل `phase` + `ord` على كل بطاقة (سكربت seo-phases).
const SEO_PHASES = [
  { k: 0, n: "٠ · قرارك أولاً — يفتح الطريق", s: "أربع كلمات منك تفكّ ما بعدها. كلود لا يبدأ قبل كلمتك." },
  { k: 1, n: "١ · سطر واحد في مدونتي", s: "إصلاحات صغيرة معزولة بلا اعتماد على شيء — تُقفل في جلسة واحدة وتُقاس بأمر curl." },
  { k: 2, n: "٢ · الخريطة والزحف", s: "ما يقرّر أي صفحات يراها جوجل أصلاً: sitemap · robots · الروابط الداخلية · الترقيم · المحتوى على السيرفر." },
  { k: 3, n: "٣ · أساس الأدمن — قبل أي إعادة توليد", s: "الحرّاس والسكيمات والروابط والافتراضيات. لو أعدنا التوليد قبل هذه المرحلة، خزّنّا الأعطال نفسها من جديد." },
  { k: 4, n: "٤ · المولّدات — ما يدخل البلوب", s: "JSON-LD والميتاداتا المخزَّنة: SearchAction · @id · القيم المختلَقة · الأبعاد · hreflang. بعدها إعادة توليد شاملة واحدة." },
  { k: 5, n: "٥ · التواريخ والتجديد", s: "متى يُعاد التوليد ومتى يُفرَّغ الكاش وما يبصم التاريخ — صحّة خطّ الأنابيب نفسه." },
  { k: 6, n: "٦ · البوّابات والمقيّمات", s: "ما يمنع النشر وما يصادق عليه — تُصلَح آخراً لأنها تقيس ما سبق." },
  { k: 7, n: "٧ · مراقبة ومرجع", s: "بنود تُراقَب لا تُصلَح الآن، والبطاقات القديمة، والملحق الخام." },
];
const byOrd = (a, b) => (a.ord ?? 99) - (b.ord ?? 99) || bySev(a, b);
// خالد (٢٤ أغسطس، ليلاً): «اعمل تاب جديد واللي أنت وكودكس متّفقين عليه ١٠٠٪ حطّه فيه عشان نبدأ نشتغل عليه؛
// الخلاف نرجع نناقشه بعدين». الاتفاق = كودكس «مثبت» + شدّتي ليست «مراقبة» + ليس قراراً معلّقاً.
// `owner: "codex"` wins over every other lane: a card handed to Codex must appear in ONE
// place, or two of us pick it up and edit the same file on the same branch (Khalid, 25 Aug —
// Codex works this list in parallel while Claude takes the heavy cards).
//
// الممرّات تُسمّى بما تعنيه لخالد: **ماذا أفعل بهذه البطاقة؟** — لا بحكم مراجع خارجي.
// كانت البطاقة بلا حكم من كودكس تسقط في «فيه خلاف»، وبطاقةٌ كتبتُها أنا اليوم تظهر تحت
// خلافٍ لم يحدث. والحكم `archive`/`wrong`/`outside` يعني «ليست عطلاً» لا «متنازَع عليها».
// «ليست عطلاً» كان تبويباً واحداً يخلط ثلاثة أشياء مختلفة، فبدا الجردُ المرجعيّ والادّعاءُ
// الساقط والشغلُ المؤجَّل شيئاً واحداً منتهياً — وخالد سأل «وش تقصد؟» وكان محقّاً.
// التصنيف الآن **مكتوب على البطاقة** في حقل `park`، لا مستنتَجاً من حكم مراجع خارجي.
const PARKED_VERDICTS = new Set(["archive", "wrong", "outside"]);
const isParked = (t) => Boolean(t.park) || PARKED_VERDICTS.has(t.codex?.verdict) || t.sev === "ok";
const seoLane = (t) =>
  t.owner ? t.owner
  : (t.phase === 0 || t.who === "k") ? "decide"
  : isParked(t) ? "parked"
  : "work";
const SEO_LANES = [
  // أربعة تبويبات لا سبعة، والأهمّ أوّلاً. سبعةٌ جعلت «قرارك» — وهو التبويب الوحيد الذي
  // يفعل فيه خالد شيئاً — سادسَ زرّ في السطر، وفرّقت ثلاثة أصناف لا شغل في أيٍّ منها
  // على ثلاثة أزرار بثلاثة أسماء. الترتيب الآن يجيب سؤالاً واحداً: مَن الدور عليه؟
  { k: "decide", n: "① قرارك", s: "ينتظر كلمتك — لا يبدأ قبلها. هذا هو التبويب الوحيد الذي يحتاج منك فعلاً." },
  { k: "work", n: "② دوري", s: "عطلٌ حقيقي أُصلحه أنا بلا انتظار: أفتحه، أصلحه، أقفله، وأنتقل." },
  // هذا التبويب لا يفترض أن يظهر. خالد ٢٨ أغسطس: «الـHTML لي، والـMD لك» — واللوحة تجيب
  // سؤالاً واحداً: مَن الدور عليه؟ فبطاقةٌ لا شغل فيها ليست جواباً، بل ضجيج على شاشته.
  // مكانها `TECH-NOTES.md` (شواهد القبر) أو ملفّ مستقلّ (المراجع الضخمة).
  // ظهورُه = بطاقةٌ تسرّبت: تُنقل إلى الماركداون ثم تُحذف من `task-data.json`.
  { k: "parked", n: "⚠️ تسرّبت — مكانها ماركداون", s: "بطاقات لا شغل فيها لأحد: فُحصت وسقطت · مراجع · تحتاج فرزاً. مكانها <code>documents/tasks/TECH-NOTES.md</code> لا هذه اللوحة. ظهور هذا التبويب معناه أن كلود نسي النقل." },
  { k: "agreed", n: "متّفق عليه ١٠٠٪", s: "كلود وكودكس على كلمة واحدة: العطل مثبت والحلّ واضح. هذا اللي نشتغل عليه الآن — بترتيب المراحل، والأسهل أوّل كل مرحلة." },
  { k: "codex", n: "كودكس · صفحات الموقع", s: "صفحات مدونتي العامّة — <code>modonty/app/(site)/**</code>. أربعة عمّال على فرع واحد، والفصل بينهم <b>بالمنطقة لا بالملف</b>: من التزم بمنطقته لا يلتقي بأحد. كلّهم ممنوعون من إغلاق البطاقات — كلود يدقّق ويقفل، و«الدليل قبل الحكم» سارية على الجميع." },
  { k: "agent2", n: "وكيل ٢ · الأدمن", s: "شاشات الأدمن ونماذجه ومسارات الحفظ — `admin/app/(dashboard)/**`. لا يلمس `admin/lib/seo` (وكيل ٤) ولا `modonty/` (كودكس ووكيل ٣)." },
  { k: "agent3", n: "وكيل ٣ · الشريك", s: "صفحات الشريك ومكوّناتها — `modonty/app/(partner)/**`. منطقة مستقلّة عن صفحات الموقع العامّة التي يشتغل عليها كودكس." },
  { k: "agent4", n: "وكيل ٤ · البيانات المنظَّمة", s: "بُناة JSON-LD والمحقّقات والمقيّمات — `admin/lib/seo/**` عدا المولّدات التي يملكها كلود. عائلة واحدة: هوية الكيان وصحّة ما يُبثّ." },
  { k: "claude", n: "كلود · بيدي", s: "البطاقات التي أنفّذها بنفسي: <code>shared/</code> والمولّدات والبوّابات الأمنية وأي بند يمسّ عدّة تطبيقات. كانت تسقط في ممرّ بلا زرّ فلا تُرى — أُصلح ٢٥ أغسطس." },
  { k: "copilot", n: "كوبايلوت · الأدمن المعزول", s: "بطاقات مستقلّة تماماً عن ملفّات كلود وكودكس: التحقّق من المدخلات، حارس القصّ، ترتيب التوليد قبل تفريغ الكاش. تعليماته في <code>documents/tasks/COPILOT-PROMPT.md</code> — وكلود وحده يقفل." },
  { k: "disputed", n: "فيه خلاف", s: "كودكس قال «جزئي» أو «غلط» أو «خارج السيو» أو «غير مثبت». ما نلمسه إلا بعد ما نخلّص المتّفق عليه — نناقشه بنداً بنداً." },
  { k: "reports", n: "تقارير", s: "جرد مقيس بالكامل — كود الإنتاج + قياس حيّ + قراءة القاعدة + المصدر الرسمي. ليست مهامّ: هذه هي الأرضية التي تُبنى عليها المهامّ." },
  // خالد، ٢٨ أغسطس ٢٠٢٦، بعد ما كشف بند BRAND-SPELLING أن اسم الماركة يعيش في الكود:
  // «اعمل جرداً كاملاً لكل ما هو هارد كود — ليس هذا وحده». التبويب يُبنى من مسح آليّ
  // (`scan-hardcoded.mjs`) لا من قراءة يدوية، فيُعاد تشغيله فيتحدّث الرقم بلا اجتهاد.
  { k: "hardcoded", n: "🔒 هارد كود", s: "الشغل المتبقّي وحده — قيم بيانات مكتوبة في الكود بدل أن تُقرأ من القاعدة. مرتّبة <b>بالمرحلة</b> (أين نفتح المحرّر) لا بالصنف. ما قُرِّر بقاؤه انتقل إلى تبويب «مقصود»." },
  // خالد، ٢٨ أغسطس: «اللي قرّرنا يبقى، انقله لتبويب ثاني، وخلّ هذا التبويب لللي تشتغل عليه».
  // ممرٌّ منفصل لأن خلطهما يجعل الرقم يكذب: بندٌ قُرِّر بقاؤه ليس ديناً مؤجَّلاً.
  { k: "kept", n: "✋ مقصود — يبقى", s: "قِيس، ونوقش، وقُرِّر بقاؤه. ليس شغلاً معلَّقاً — كل سطر هنا معه <b>سببُ بقائه</b>، مكتوباً كي لا يُعاد فتح النقاش نفسه بعد شهر." },
  // خالد، ٢٨ أغسطس ٢٠٢٦: «اعمل جرد كامل في المدونة وكونسل وأدمن، فين البرومبت هذه إحنا
  // بنستخدمها، عشان أنا أبغى أحولها كلها تقرأ من الداتابيز… عبارة عن كروت».
  { k: "prompts", n: "🤖 البرومبت", s: "كل نصّ يُملى على نموذج ذكاء اصطناعي في المستودع — بطاقةٌ لكلٍّ: أين يعيش، مَن يناديه، ما متغيّراته، وماذا ينكسر لو غاب. الهدف: تحويلها كلها لتُقرأ من القاعدة وتُحرَّر من الأدمن." },
  // المراجعة العكسية (خالد، ٢٨ أغسطس): «خلص» لم تعد كومة واحدة. البطاقة تنتقل بين أربع
  // حالات، وثلاثة تبويبات منها فوق كي يُرى الدور على مَن. وأنا أنقل إلى «سليمة» و«تعميدك»
  // فقط — النقل إلى «معتمَد» بكلمة خالد وحدها.
  { k: "perfect", n: "💯 خلص ١٠٠٪", s: "هاجمتُ إغلاقها محاولاً <b>إسقاطه</b> لا تأكيده، على الفرع ببيانات الإنتاج المُزامَنة، ومعي المصدر الرسمي — <b>وفشل الهجوم</b>. صفر انتقاد." },
  { k: "needsok", n: "✋ محتاج تعميدك", s: "الهجوم <b>نجح</b>: وجدتُ عطلاً قائماً بدليل خام وجذر مسمّى.<br><b style='color:#4ade80'>🟩 البطاقة الخضراء = أصلحتُها فعلاً، وتنتظر كلمتك.</b> اقرأ كتلة «أُصلحت» في آخرها، فإن اقتنعت قل لي «اعتمد» ومعها رقم البطاقة، فتنتقل إلى «🏅 معتمَد».<br><b style='color:#f87171'>🟥 البطاقة الحمراء = لم أُصلحها بعد</b> — إمّا تحتاج قرارك، أو لم يجئ دورها. والأخضر مرفوع لأعلى القائمة." },
  { k: "stamped", n: "🏅 معتمَد منك", s: "ختمتَها أنت بعد قراءة النقد. هذه وحدها التي تُحسب مقفلةً نهائياً." },
  { k: "shipped", n: "✅ خلص — لم تُراجَع بعد", s: "أُغلقت سابقاً ولم تمرّ على النقد العكسي بعد. بقاؤها هنا يعني: <b>لم تُثبَت، ولم تسقط</b>." },
];
const REPORTS = DATA.reports || [];

// ── جرد الهارد كود ─────────────────────────────────────────────────────────
// يُقرأ من ناتج `scan-hardcoded.mjs`. الملفّ غائب؟ التبويب لا يظهر — بدل جدول فارغ
// يوحي أن المستودع نظيف. الرقم الوحيد الصادق هو رقمٌ قِيس، لا رقمٌ افتُرض.
const hcPath = path.join(here, "hardcoded-inventory.json");
const HC = fs.existsSync(hcPath) ? JSON.parse(fs.readFileSync(hcPath, "utf8")) : null;

// ── جرد البرومبت ───────────────────────────────────────────────────────────
// من ناتج `scan-prompts.mjs`، وهو يتحقّق من كل مدخل عند كل تشغيل (الملفّ · النصّ
// المرجعي · نقطة الدخول)، فلا يعرض بطاقةً لبرومبت انزاح أو حُذف.
const prPath = path.join(here, "prompts-inventory.json");
const PR = fs.existsSync(prPath) ? JSON.parse(fs.readFileSync(prPath, "utf8")) : null;

const APP_AR = { modonty: "مدونتي", admin: "الأدمن", console: "الكونسول", shared: "المشترك" };

const promptsHTML = !PR ? "" : `<article class="report">
  <h3>البرومبت — ${PR.live} حيّاً في ${Object.keys(PR.byApp).length} تطبيقين</h3>
  <p class="when">${Object.entries(PR.byApp).map(([a, n]) => `${APP_AR[a] ?? a} ${n}`).join(" · ")} · الكونسول صفر · المزوّدون: ${PR.providers.join(" · ")} · ${PR.chars.toLocaleString("ar-SA")} محرفاً · ${esc(PR.storage ?? "")} · يُعاد بأمر <code>node documents/tasks/scan-prompts.mjs</code></p>
  <p class="outcome"><b>الهدف: كلها تُقرأ من القاعدة وتُحرَّر من الأدمن.</b> البرومبت سياسة وأسلوب لا منطق — يتغيّر بالذوق لا بالمتطلّبات، فتعديله لا يفترض أن يمرّ بنشر. وتكلفته صفر على الزائر: يُقرأ مرّة على السيرفر قبل نداء النموذج، والنداء أصلاً يضرب القاعدة وينتظر النموذج مئات الملّي ثانية.</p>
  ${PR.problems.length ? `<p class="state st-working">⚠️ ${PR.problems.length} تحذيراً من التحقّق: ${PR.problems.map(esc).join(" · ")}</p>` : ""}
  <div class="pgrid">
  ${PR.rows.map(r => `<div class="pcard">
    <div class="ph"><code class="pkey">${esc(r.key)}</code><span class="ptag app-${r.app}">${APP_AR[r.app] ?? r.app}</span><span class="ptag">${esc(r.provider)}</span><span class="ptag">${r.lang === "ar" ? "عربي" : "إنجليزي"}</span></div>
    <p class="psurface">${esc(r.surface)}</p>
    <p class="pwhat">${esc(r.what)}</p>
    <dl class="pmeta">
      <dt>مكان النصّ</dt><dd><code>ai_prompts</code> · مفتاح <code>${esc(r.key)}</code> · ${r.promptLines} سطراً · ${r.chars} محرفاً</dd>
      <dt>مَن يناديه</dt><dd>${(r.callers ?? r.entry ?? []).map(e => `<code>${esc(e)}</code>`).join("<br>")}</dd>
      <dt>المتغيّرات</dt><dd>${r.requiredVars.length ? r.requiredVars.map(v => `<code>{${esc(v)}}</code>`).join(" · ") : "<span class=\"dim\">بلا متغيّرات</span>"}<br><span class="dim">الحفظ من الأدمن يُرفض إن نقص واحد منها.</span></dd>
      <dt>لو غاب الصفّ</dt><dd class="prisk">${esc(r.onEmpty)}</dd>
      ${r.note ? `<dt>ملاحظة</dt><dd>${esc(r.note)}</dd>` : ""}
    </dl>
  </div>`).join("")}
  </div>

  <h4>الهيكل المقترح — جدول <code>AiPrompt</code> في السكيما المشتركة</h4>
  <div class="tw"><table>
    <thead><tr><th>الحقل</th><th>لماذا</th></tr></thead>
    <tbody>
      <tr><td><code>key</code> فريد</td><td>المفاتيح السبعة أعلاه كما هي — <code>modo.identity</code> · <code>admin.image.article</code> …</td></tr>
      <tr><td><code>app</code> · <code>title</code> · <code>body</code></td><td>مَن يملكه، واسم بشري في الشاشة، والنصّ نفسه.</td></tr>
      <tr><td><code>requiredVars[]</code></td><td><b>العقد.</b> الحفظ يُرفض لو نقص متغيّر، والرسالة تسمّيه — وإلا فقد البرومبت سياقه بصمت بعد تعديل بريء.</td></tr>
      <tr><td><code>isActive</code> · <code>updatedAt</code> · <code>updatedById</code></td><td>مَن عدّل ومتى — وأنت طلبت أن تراجعها.</td></tr>
    </tbody></table></div>
  <p>وثلاثة شروط لازمة، بدونها النقل ينقلب علينا: <b>١ ·</b> الصفّ الناقص <b>يوقف النداء</b> ويسجّل خطأ نظام — لا يُشغَّل نموذجٌ بلا تعليمات، لأن مخرَجه حينها أسوأ من برومبت قديم. <b>٢ ·</b> المتغيّرات يُتحقَّق منها عند الحفظ. <b>٣ ·</b> كاش يُفرَّغ عند الحفظ، وإلا صار كل سؤال قراءةَ قاعدة.</p>

  <h4>مكسب جانبي — سبعة بنود هارد كود تسقط معها</h4>
  <p>ثابتا <code>BRAND_AR</code>/<code>BRAND_EN</code> باقيان في الكود <b>بمستهلكٍ واحد: برومبتات مودو الثلاثة</b> (مقيس). فيوم ينتقل البرومبت إلى القاعدة، يُحذف الثابتان ومُعيدا تصديرهما — ٧ بنود + ٨ أسطر برومبت = <b>١٥ بنداً يُغلقون بتاسك واحد</b>.</p>

  <h4>كود ميت — لا يدخل الهيكل</h4>
  ${PR.dead.map(d => `<p><code>${esc(d.file)}</code> — <b>${d.prompts} برومبتات في ${d.lines} سطراً، وصفر مستورد.</b> الستّة كلها بصفر مستهلك: ${d.exports.map(x => `<code>${esc(x)}</code>`).join(" · ")}. ${esc(d.why)} <b>يُحذف بأمرك.</b></p>`).join("")}
</article>`;

// ممرّ «مقصود» — ما قُرِّر بقاؤه، مجمَّعاً بسبب البقاء لا بالملفّ: القارئ يريد أن يعرف
// **لماذا** بقيت هذه السطور، لا أين هي. الملفّات تحت كل سبب لمن أراد أن يتحقّق.
const keptHTML = (() => {
  const kept = HC?.phases.find((p) => p.p === "keep");
  if (!kept || !kept.files.length) return "";
  const byWhy = new Map();
  for (const f of kept.files) {
    const why = f.keepWhy || "بلا سبب مسجَّل — يُراجَع.";
    if (!byWhy.has(why)) byWhy.set(why, []);
    byWhy.get(why).push(f);
  }
  return `<article class="report">
  <h3>مقصود — ${kept.hits} سطراً في ${kept.fileCount} ملفاً</h3>
  <p class="when">قُرِّر بقاؤها ٢٨ أغسطس ٢٠٢٦ · يُعاد بناؤها بأمر <code>node documents/tasks/scan-hardcoded.mjs</code></p>
  <p class="outcome"><b>هذا ليس ديناً ولا شغلاً مؤجَّلاً.</b> كل سطر هنا قِيس ونوقش وقُرِّر بقاؤه، وسببه مكتوب معه — فلا يُعاد فتح النقاش نفسه بعد شهر، ولا يتضخّم رقم الشغل بما ليس شغلاً.</p>
  ${[...byWhy.entries()].map(([why, files]) => `<section><h4>${esc(why.split("—")[0].trim())} — ${files.reduce((s, f) => s + f.hits, 0)} سطراً</h4>
    <p>${esc(why)}</p>
    <div class="tw"><table>
      <thead><tr><th>الملفّ</th><th>الأسطر</th><th>كم</th></tr></thead>
      <tbody>${files.sort((a, b) => b.hits - a.hits).map(f => `<tr>
        <td><code>${esc(f.f)}</code></td>
        <td><code>${f.lines.slice(0, 12).join(", ")}${f.lines.length > 12 ? ` +${f.lines.length - 12}` : ""}</code></td>
        <td>${f.hits}</td></tr>`).join("")}
      </tbody></table></div></section>`).join("")}
</article>`;
})();

// الترتيب بالمرحلة لا بالصنف. خالد، ٢٨ أغسطس: «رتب لي الملفّ عشان نفهم حنشتغل فين»
// — الصنف يقول ما نوع العطل، والمرحلة تقول أين نفتح المحرّر. والثاني هو ما يُخطَّط عليه.
// ورقم واحد فقط في الصدر (`workHits`)؛ الخام يُذكر مرّةً في سطر واحد كي لا يتنقّل الرقم.
const hardcodedHTML = !HC ? "" : `<article class="report">
  <h3>أين نشتغل — ${HC.workHits} قيمة في ${HC.workFiles} ملفاً</h3>
  <p class="when">مسح آليّ على ${HC.filesScanned} ملفّ <code>.ts/.tsx</code> في <code>modonty/</code> و<code>shared/</code> · مقيساً على صفّ <code>Settings</code> الحيّ في <code>${esc(HC.db)}</code> · يُعاد بأمر <code>node documents/tasks/scan-hardcoded.mjs</code></p>
  <p class="outcome"><b>الرقم واحد ولا يتغيّر: ${HC.workHits}.</b> المسح الخام يرجع ${HC.totalHits}، والفرق (${HC.totalHits - HC.workHits}) لغة تنسيق أرقام وتواريخ — ليست بياناً عن العمل، ومدرَجة أسفل الصفحة للاكتمال وحدها.</p>
  <p class="lead"><b>ليس جرد براند — جرد الإعدادات كلّها.</b> السكربت يقرأ صفّ <code>Settings</code> بأعمدته الـ${HC.settingsColumns}، يأخذ منه <b>${HC.valuesProbed}</b> قيمة نصّية مميّزة، ويبحث عن كل واحدة حرفياً في الكود. فأي عمود يُضاف غداً يدخل الجرد وحده بلا تعديل السكربت.</p>
  <p class="lead"><b>يلتقط شكلين:</b> <b>(١) قيمة مطابقة</b> — نصّ الصفّ نفسه مكتوب في الكود. <b>(٢) احتياط بعد <code>||</code></b> — <code>settings?.x || "قيمة"</code>، وهو <b>الأخطر</b>: يجعل غياب البيان من القاعدة لا يُكتشف أبداً، فيبقى الموقع يعرض قيمة الكود إلى الأبد. ومعهما أصناف لا يملكها <code>Settings</code> بعدُ وهي بيانات بلا شكّ: تهجئات الماركة · بريد الفريق · الإحداثيات · الأسعار.</p>

  <section><h4>الخطّة — ست مراحل، وترتيبها إجباري</h4>
  <div class="tw"><table>
    <thead><tr><th>المرحلة</th><th>الشغل</th><th>الحجم</th><th>يُقفل بـ</th></tr></thead>
    <tbody>
      <tr><td><b>٠ · البوّابة</b></td><td>حقول إدخال في الأدمن لهوية الموقع — اليوم <code>settings/system/components/system-form.tsx:39-52</code> جدول عرض بلا حقل إدخال واحد. <b>يحتاج عموداً جديداً <code>alternateName</code></b> (تغيير سكيما · <code>prisma db push</code> على الإنتاج بيد خالد).</td><td>—</td><td>أغيّر الاسم من الأدمن وأراه في القاعدة.</td></tr>
      <tr><td><b>١ · القيمة</b></td><td><code>siteName = "مدونتي"</code> · <code>alternateName = "Modonty"</code> — من الأدمن لا من سكربت.</td><td>—</td><td>الصفّ يحمل القيمتين.</td></tr>
      ${HC.phases.filter(p => p.p !== "keep").map(p => `<tr><td><b>${esc(p.n.replace("المرحلة ", "").replace(" — ", " · "))}</b></td><td>${p.s}</td><td><b>${p.hits}</b> قيمة · ${p.fileCount} ملفاً</td><td>${p.close}</td></tr>`).join("")}
      <tr><td><b>٥ · الحارس</b></td><td>هذا المسح يصير فحصاً قبل الدفع برقم مرجعي — أي زيادة توقف الدفع. القاعدة التي تُخالَف باستمرار تتحوّل إلى فحص، لا إلى تذكير.</td><td>—</td><td>دفعة تجريبية بقيمة جديدة تُرفض.</td></tr>
    </tbody></table></div></section>

  ${HC.phases.filter(p => p.p !== "keep").map(p => `<section><h4>${esc(p.n)} — ${p.hits} قيمة في ${p.fileCount} ملفاً</h4>
    <p>${p.s}</p>
    <div class="tw"><table>
      <thead><tr><th>الملفّ</th><th>الأسطر</th><th>كم</th><th>ما فيه</th></tr></thead>
      <tbody>${p.files.map(f => `<tr>
        <td><code>${esc(f.f)}</code>${f.isSource ? ' <b>← المصدر</b>' : ""}</td>
        <td><code>${f.lines.slice(0, 12).join(", ")}${f.lines.length > 12 ? ` +${f.lines.length - 12}` : ""}</code></td>
        <td>${f.hits}</td>
        <td>${esc(f.kinds.join(" · "))}${f.values.length ? ` — <code>${esc(f.values.join(" · ").slice(0, 70))}</code>` : ""}</td></tr>`).join("")}
      </tbody></table></div></section>`).join("")}

  <section><h4>حسب الصنف — أي نوع مخالفة، ومَن يملك القيمة</h4>
  <div class="tw"><table>
    <thead><tr><th>الصنف</th><th>كم</th><th>ملفات</th><th>الأعمدة المصابة</th><th>ليش تهمّ</th></tr></thead>
    <tbody>${HC.kinds.map(k => `<tr>
      <td>${k.sev === "high" ? "🔴 " : k.sev === "low" ? "⚪ " : ""}<b>${esc(k.name)}</b></td>
      <td>${k.hits}</td><td>${k.fileCount}</td>
      <td><code>${esc((k.cols || [k.owner]).join(" · ").slice(0, 220))}</code></td>
      <td>${esc(k.why)}</td></tr>`).join("")}
    </tbody></table></div></section>

  <section><h4>ما هو مستبعَد عمداً — وكلٌّ لسبب</h4>
  <p>كلمات JSON-LD المحجوزة (<code>@id</code> · <code>@type</code>) نحوٌ لا بيانات · <code>x-default</code> و<code>UTF-8</code> و<code>summary_large_image</code> وأخواتها ثوابت بروتوكول لا قيماً تجارية · <code>next.config.ts</code> قائمة سماح أمنية يغيّرها مهندس بنشر لا خالد من الأدمن · التعليقات لا تصل زائراً ولا زاحفاً · <code>placeholder</code> نصّ واجهة · بذور الاختبار لا تُقدَّم على الموقع · نقاط نهاية المشاركة والتضمين آليّةٌ لا محتوى · الأعمدة الداخلية (<code>id</code> · <code>singletonKey</code> · المعرّفات) لا يراها زائر · القيم أقصر من أربعة محارف لأن مطابقتها صدفةٌ لا دليل.</p>
  <p>للمقارنة، نفس القواعد على التطبيقات الأخرى: <b>admin ${HC.compare.admin ?? "—"}</b> · <b>console ${HC.compare.console ?? "—"}</b>. الأدمن هو <b>مصدر</b> البيانات لا مستهلكها، فوجود القيم فيه ليس بالضرورة عطلاً — بينما وجودها في مدونتي يعني أن المستهلك يتجاوز القاعدة.</p></section>
</article>`;

// A closed report keeps every word of its inventory — that is the point of the tab — but the
// outcome has to be visible in the first line. Khalid opened one at the top, saw the original
// finding, and read it as "not updated" (25 Aug 2026). The closure was there, eight sections
// down. A verdict at the bottom of a long page is a verdict nobody reads.
const reportHTML = (r) => `<article class="report" id="report-${esc(r.id)}">
  <h3>${r.n ? `<span class="num">${r.n}</span>` : ""}${esc(r.title)}${r.status === "closed" ? `<span class="rstate">أُغلق${r.closedOn ? ` · ${esc(r.closedOn)}` : ""}</span>` : ""}</h3>
  <p class="when">${esc(r.when)} · المصدر: ${esc(r.base)}</p>
  ${r.outcome ? `<p class="outcome">${noScript(r.outcome)}</p>` : ""}
  ${r.lead ? `<p class="lead">${r.lead}</p>` : ""}
  ${(r.sections || []).map(s => `<section><h4>${esc(s.h)}</h4>
    ${s.body ? `<div>${noScript(s.body)}</div>` : ""}
    ${s.table ? `<div class="tw"><table><thead><tr>${s.table.head.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${s.table.rows.map(row => `<tr>${row.map(c => `<td>${noScript(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : ""}
  </section>`).join("")}
</article>`;
const seoLanes = SEO_LANES.map(l => {
  if (l.k === "reports") return { ...l, count: REPORTS.length, reports: REPORTS, groups: [] };
  // العدّاد على الزرّ = الشغل، لا الخام. زرٌّ يقول ٢١٣ وصفحةٌ تقول ١٢٨ هو نفس
  // الالتباس الذي شكا منه خالد: «مرة تقولي رقم وتديني رقم تاني».
  if (l.k === "hardcoded") return { ...l, count: HC ? HC.workHits : 0, html: hardcodedHTML, groups: [] };
  // ممرّ البرومبت أُزيل ٢٩ أغسطس بأمر خالد: «موضوع البرومبت هذا كله خلاص محلول».
  // والقياس يوافقه — prompts-inventory.json: problems: [] · dead: []. الرقم ٧ جردٌ
  // للبرومبتات الحيّة في جدول ai_prompts، لا شغلٌ مفتوح. الجرد يبقى في الملفّ
  // ويُحدَّث بـscan-prompts.mjs، لكنه لا يأخذ زرّاً على شاشة خالد.
  if (l.k === "prompts") return { ...l, count: 0, html: "", groups: [] };
  if (l.k === "kept") {
    const kept = HC?.phases.find((p) => p.p === "keep");
    return { ...l, count: kept ? kept.hits : 0, html: keptHTML, groups: [] };
  }
  // ثلاثة ممرّات المراجعة العكسية — البطاقة في واحد منها فقط، فالرقم لا يكذب.
  if (l.k === "perfect" || l.k === "needsok" || l.k === "stamped") {
    const want = { perfect: "pass", needsok: "fail", stamped: "stamped" }[l.k];
    const items = enriched.filter(t => isSeoCard(t) && isDone(t) && t.audit?.state === want);
    // البطاقة المُصلَحة تبقى هنا حتى يعتمدها خالد — فالعدّاد وحده لا يتحرّك، وهذا أربكه
    // (٢٨ أغسطس: «العدّاد زي ما هو»). فيُعلَن الرقمان: كم بقي، وكم منها أُصلح وينتظر ختمه.
    // والمُصلَح يصعد لأعلى القائمة كي لا يُبحث عنه.
    const fixed = items.filter(t => t.audit?.fix);
    const ordered = [...fixed, ...items.filter(t => !t.audit?.fix)];
    return {
      ...l,
      count: items.length,
      fixed: fixed.length,
      groups: items.length ? [{ k: l.k, n: l.n, s: "", items: ordered }] : [],
    };
  }
  if (l.k === "shipped") {
    // المنجَز لا يُحذف من الوعي — يُنقل. الأحدث أولاً، ومجموعة لكل يوم إغلاق.
    // وما مرّ على النقد خرج من هنا إلى ممرّه — فالعدّاد هنا = ما لم يُراجَع بعد.
    const REVIEWED = new Set(["pass", "fail", "stamped"]);
    const all = enriched.filter(t => isSeoCard(t) && isDone(t) && !REVIEWED.has(t.audit?.state));
    // البطاقة تحت المراجعة تصعد لأعلى اللوحة في مجموعتها الخاصّة (خالد، ٢٨ أغسطس:
    // «اللي إنت شغال عليه ترفعه ليا فوق»)، فلا يُبحث عنها بين مئة وإحدى عشرة.
    const wip = all.filter(t => t.audit?.state === "wip");
    const shipped = all.filter(t => t.audit?.state !== "wip");
    const byDay = new Map();
    for (const t of shipped) {
      const k = t.date || "قبل ذلك";
      if (!byDay.has(k)) byDay.set(k, []);
      byDay.get(k).push(t);
    }
    const groups = [...byDay.entries()]
      // الأحدث أولاً: التواريخ عربية فلا تُقارن كنصّ — الترتيب بأول ظهور معكوساً، و«قبل ذلك» أخيراً.
      .sort((a, b) => (a[0] === "قبل ذلك") - (b[0] === "قبل ذلك"))
      .map(([day, items]) => ({ k: "day-" + day, n: day, s: "", items }));
    if (wip.length) {
      groups.unshift({
        k: "audit-wip",
        n: "🔎 تحت المراجعة العكسية الآن",
        s: "أشتغل على هذه البطاقة الآن: أحاول <b>إسقاط</b> إغلاقها لا تأكيده. كل ملاحظة تنزل داخلها بناتجها الخام ومصدرها الرسمي — <b>ولا تُلوَّن خضراء أو حمراء حتى تعتمدها أنت</b>.",
        items: wip,
      });
    }
    return { ...l, count: shipped.length + wip.length, groups };
  }
  const items = seoOpen.filter(t => seoLane(t) === l.k);
  const active = items.filter(t => t.running || (t.working && !t.ready)).sort(byOrd);
  const queued = items.filter(t => !active.includes(t));
  const groups = SEO_PHASES.map(p => ({ ...p, items: queued.filter(t => (t.phase ?? 7) === p.k).sort(byOrd) })).filter(g => g.items.length);
  if (active.length) groups.unshift({ k: "active", n: "🔴 جارٍ الآن", s: "البطاقة النشطة في الأعلى دائماً حتى انتهاء التحقق.", items: active });
  return { ...l, count: items.filter(t => !t.ready).length, groups };
})
  // ممرّ فارغ = تبويب يُضغط فيظهر لا شيء. كانت اللوحة تعرض أحد عشر تبويباً وأربعة فقط
  // فيها بطاقات — ممرّات وكلاء انتهت جلساتهم. التبويب يظهر إذا كان فيه شيء، ولا يظهر إذا خلا.
  // «خلص» وحده يبقى دائماً — سجلّ الإنجاز لا يُخفى. و«تقارير» فقد تثبيته ٢٨ أغسطس: جرد
  // بلا شغل فيه مكانه ماركداون لا لوحة خالد، فتبويبٌ فارغ اسمه «تقارير ٠» زرٌّ ميت على شاشته.
  // ممرّات المراجعة تبقى ظاهرة ولو فارغة: الصفر هنا معلومة («ولا بطاقة أخذت تعميدك بعد»)،
  // لا فراغ يُخفى. أمّا ممرّات الشغل فتختفي حين تفرغ كي لا تزحم السطر.
  // كل ممرّ فارغ يختفي — بلا استثناء. كانت ثلاثة ممرّات أصفار تبقى ظاهرة بحجّة أن
  // «الصفر معلومة»، فصار السطر سبعة أزرار أربعةٌ منها لا شغل فيها. خالد (٢٩ أغسطس):
  // «هذه القائمة ملخبطاني، موتراني». الزرّ الذي لا يفتح على شيء ليس معلومة، هو ضجيج.
  .filter(l => l.count > 0);
// رقم قصير ثابت لكل بند سيو، ليقول خالد «بند ٧» بدل معرّف طويل (٢٥ أغسطس).
// يُكتب مرّة في task-data.json ولا يتغيّر بعدها مهما أُعيد الترتيب أو أُغلقت بطاقات —
// الرقم المتغيّر يجعل الإشارة في الشات تدلّ على بطاقة أخرى بعد أسبوع.
{
  const srcById = new Map(TASKS.map(t => [t.id, t]));
  let next = Math.max(0, ...TASKS.map(t => t.n || 0));
  const fresh = seoLanes.flatMap(l => l.groups.flatMap(g => g.items)).filter(t => !t.n);
  fresh.forEach(t => { t.n = ++next; srcById.get(t.id).n = t.n; });
  if (fresh.length) {
    fs.writeFileSync(path.join(here, "task-data.json"), JSON.stringify(DATA, null, 2) + "\n");
    console.log(`أرقام سيو جديدة: ${fresh.length} (حتى ${next})`);
  }
}
const seoHigh = seoOpen.filter(t => /critical|high/.test(t.sev)).length;

// Progress, stated once and honestly. The lane badges count only what is left in each lane,
// so a day of real work moved twelve cards out and every visible number stayed where it was —
// Khalid, 25 Aug 2026: «we do a lot but the number still». A board that cannot show progress
// makes the work look stalled to the person paying for it.
//
// `closedToday` uses the card's own `date`, which is written at closing time, so it counts
// what was actually finished rather than what was touched.
// `enriched` already holds open AND done, so this is the whole set — concatenating `done`
// on top counted every closed card twice and showed "30 of 124" where the truth was 17 of 117.
const seoAll = enriched.filter(isSeoCard);
// بطاقات على بورد `seo` لكنها لا تمرّ `isSeoCard`، فتختفي من هذه اللوحة بلا أثر. سببان
// مشروعان — إدخال بيانات (`file:"data"` → DATA-REFACTOR.html) أو أنّها لا تمسّ مدونتي
// (`app` بلا "modonty" → TASK.html) — لكن الاختفاء الصامت جعل عدّي من الملفّ يخالف ما على
// شاشة خالد، فسأل «كيف اثنتان وثلاثون؟». الاختفاء يبقى، والسطر في الرأس يقول أين ذهبت.
const seoElsewhere = enriched
  .filter(t => t.b === "seo" && !isSeoCard(t) && !isDone(t))
  .map(t => ({ ...t, dest: t.file === "data" ? "DATA-REFACTOR.html" : "TASK.html" }));
const seoClosed = seoAll.length - seoOpen.length;
const seoPercent = seoAll.length ? Math.round((seoClosed / seoAll.length) * 100) : 0;

// The badge names its DATE rather than saying "today", so it can never claim a stale count
// is from today.
//
// It used to be a hand-written constant with "update it when a new working day starts" next
// to it. It was left on ٢٥ أغسطس while ٣٠ cards closed on ٢٧ — the badge was truthful about
// which day it named and useless about the work. A rule I keep forgetting becomes a
// computation: the last working day IS the newest date any closed card carries.
//
// Arabic dates cannot be compared as strings, so they are parsed. An unparseable date sorts
// last rather than throwing — a malformed `date` on one card must not blank the whole badge.
const AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const arDigits = (s) => s.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
const dateKey = (s) => {
  const m = /^\s*([٠-٩\d]+)\s+(\S+)\s+([٠-٩\d]+)\s*$/.exec(s || "");
  if (!m) return -Infinity;
  const month = AR_MONTHS.indexOf(m[2]);
  if (month < 0) return -Infinity;
  return Number(arDigits(m[3])) * 10000 + month * 100 + Number(arDigits(m[1]));
};
const LAST_WORKING_DAY = seoAll
  .filter(t => isDone(t) && dateKey(t.date) > -Infinity)
  .reduce((best, t) => (dateKey(t.date) > dateKey(best) ? t.date : best), "");
const seoClosedThatDay = LAST_WORKING_DAY
  ? seoAll.filter(t => isDone(t) && t.date === LAST_WORKING_DAY).length
  : 0;
const SEO_TABS_CSS = `.report{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px 20px;margin:14px 0}
.report h3{margin:0 0 4px;font-size:19px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.state{margin:2px 0 8px;padding:7px 11px;border-radius:9px;font-size:12.5px;font-weight:700;letter-spacing:.1px}
.state.st-working{background:rgba(246,174,49,.16);color:#f6ae31;border:1px solid rgba(246,174,49,.45)}
.state.st-ready{background:rgba(34,197,94,.18);color:#4ade80;border:1px solid rgba(34,197,94,.5)}
.card[data-working="1"]{background:linear-gradient(180deg,rgba(246,174,49,.10),rgba(246,174,49,.03));border-color:rgba(246,174,49,.5)}
.card[data-ready="1"]{background:linear-gradient(180deg,rgba(34,197,94,.13),rgba(34,197,94,.05));border-color:rgba(34,197,94,.55);box-shadow:0 0 0 1px rgba(34,197,94,.2)}
.tag.ready{background:rgba(34,197,94,.2);color:#4ade80;border-color:rgba(34,197,94,.45);font-weight:700}
.tag.owner{font-weight:700}
.tag.owner-codex{background:rgba(96,165,250,.16);color:#60a5fa;border-color:rgba(96,165,250,.4)}
.tag.owner-agent2{background:rgba(167,139,250,.16);color:#a78bfa;border-color:rgba(167,139,250,.4)}
.tag.owner-agent3{background:rgba(34,211,238,.16);color:#22d3ee;border-color:rgba(34,211,238,.4)}
.tag.owner-agent4{background:rgba(246,174,49,.16);color:#f6ae31;border-color:rgba(246,174,49,.4)}
.progress{display:flex;align-items:center;gap:12px;margin:8px 0 2px}
.progress .bar{flex:1;height:7px;border-radius:999px;background:var(--line);overflow:hidden}
.progress .bar span{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#22c55e,#4ade80)}
.progress .pnums{font-size:12.5px;color:var(--mut);white-space:nowrap}
.progress .pnums b{color:var(--fg)}
.progress .today{font-style:normal;margin-inline-start:10px;padding:2px 9px;border-radius:999px;background:rgba(34,197,94,.14);color:#4ade80;border:1px solid rgba(34,197,94,.3);font-weight:600}
.report .rstate{font-size:11.5px;font-weight:600;padding:2px 9px;border-radius:999px;background:rgba(16,185,129,.14);color:#34d399;border:1px solid rgba(16,185,129,.3)}
.report .outcome{margin:0 0 10px;padding:10px 13px;border-radius:10px;background:rgba(16,185,129,.07);border:1px solid rgba(16,185,129,.22);font-size:13.5px;line-height:1.75}
.report .when{color:var(--dim);font-size:12.5px;margin:0 0 10px}
.report .lead{margin:0 0 14px;font-size:14.5px}
.report h4{margin:16px 0 6px;font-size:15px;color:var(--amber)}
.report section>div{font-size:14px;line-height:1.85}
.report pre{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:10px 12px;overflow-x:auto;font-size:12.5px;direction:ltr;text-align:left;margin:8px 0}
.report .tw{overflow-x:auto}
.report table{border-collapse:collapse;width:100%;font-size:13px;margin:6px 0}
.report th,.report td{border:1px solid var(--line);padding:7px 9px;text-align:start;vertical-align:top}
.report th{background:var(--panel);font-weight:700}
.report .src{margin-top:8px;font-size:12.5px}
.perfect-badge{display:flex;align-items:center;gap:11px;margin:4px 0 9px;padding:11px 15px;border-radius:12px;background:linear-gradient(135deg,rgba(34,197,94,.22),rgba(34,197,94,.07));border:2px solid rgba(34,197,94,.6);box-shadow:0 0 0 1px rgba(34,197,94,.15)}
.perfect-badge .pb-mark{font-size:30px;line-height:1}
.perfect-badge .pb-txt{display:flex;flex-direction:column;font-size:19px;font-weight:800;letter-spacing:.2px;color:#4ade80}
.perfect-badge .pb-txt small{font-size:11.5px;font-weight:500;color:var(--mut);letter-spacing:0;margin-top:2px}
.perfect-badge.stamped{background:linear-gradient(135deg,rgba(246,174,49,.22),rgba(246,174,49,.07));border-color:rgba(246,174,49,.65)}
.perfect-badge.stamped .pb-txt{color:#f6ae31}
.card[data-audit="stamped"]{border-color:rgba(246,174,49,.5)}
.state.st-audit{background:rgba(96,165,250,.16);color:#60a5fa;border:1px solid rgba(96,165,250,.5)}
.state.st-pass{background:rgba(34,197,94,.18);color:#4ade80;border:1px solid rgba(34,197,94,.5)}
.state.st-fail{background:rgba(248,113,113,.16);color:#f87171;border:1px solid rgba(248,113,113,.5)}
.card[data-audit="wip"]{background:linear-gradient(180deg,rgba(96,165,250,.12),rgba(96,165,250,.03));border-color:rgba(96,165,250,.55);box-shadow:0 0 0 1px rgba(96,165,250,.22)}
.card[data-audit="pass"]{border-color:rgba(34,197,94,.45)}
.card[data-audit="fail"]{background:linear-gradient(180deg,rgba(248,113,113,.10),rgba(248,113,113,.02));border-color:rgba(248,113,113,.55)}
.audit{margin:8px 0 0;padding:9px 12px;border-radius:10px;font-size:13px;line-height:1.8;border:1px solid var(--line);background:var(--panel)}
.audit[data-state="wip"]{border-color:rgba(96,165,250,.35);background:rgba(96,165,250,.06)}
.audit[data-state="pass"]{border-color:rgba(34,197,94,.35);background:rgba(34,197,94,.06)}
.audit[data-state="fail"]{border-color:rgba(248,113,113,.4);background:rgba(248,113,113,.07)}
.audit ul{margin:6px 0 0;padding-inline-start:18px}.audit li{margin:3px 0}
/* شارة «جاهزة لختمك»: لون صلب لا شفّاف — التبويب المختار خلفيّته برتقالية، والشفّاف عليها
   يصير طيناً لا يُقرأ (خالد، ٢٨ أغسطس). فتُقرأ على التبويبين بنفس الوضوح. */
.lane .n.fixed{background:#15803d;color:#fff;border:1px solid #22c55e;font-weight:700;letter-spacing:0}
.lane[aria-selected="true"] .n.fixed{background:#14532d;border-color:#4ade80}
.card[data-audit="fail"][data-fixed="1"]{background:linear-gradient(180deg,rgba(34,197,94,.10),rgba(34,197,94,.02));border-color:rgba(34,197,94,.5)}
.afix{margin:9px -12px -9px;padding:9px 12px;border-top:1px solid rgba(34,197,94,.35);background:rgba(34,197,94,.08);border-radius:0 0 10px 10px}
.afix>b{color:#4ade80}
.afix code{font-size:11px;background:rgba(0,0,0,.25);padding:1px 5px;border-radius:4px;direction:ltr;display:inline-block}
.audit .a-attack{margin-top:5px;color:var(--mut)}
.audit .a-wait{margin-top:7px;font-weight:700;color:#60a5fa}
.audit pre{background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:8px 10px;overflow-x:auto;font-size:12px;direction:ltr;text-align:left;margin:7px 0;white-space:pre-wrap}
.audit .src{margin-top:7px;font-size:12.5px}
.audit .when{margin-top:5px;color:var(--dim);font-size:12px}
.pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:12px;margin:12px 0 4px}
.pcard{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:13px 15px}
.pcard .ph{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:7px}
.pcard .pkey{font-size:13px;font-weight:700;color:var(--amber);background:none;padding:0}
.pcard .ptag{font-size:11px;padding:2px 8px;border-radius:999px;border:1px solid var(--line);color:var(--mut);background:var(--card)}
.pcard .ptag.app-modonty{background:rgba(34,197,94,.14);color:#4ade80;border-color:rgba(34,197,94,.35)}
.pcard .ptag.app-admin{background:rgba(167,139,250,.14);color:#a78bfa;border-color:rgba(167,139,250,.35)}
.pcard .psurface{margin:0 0 4px;font-size:14px;font-weight:600}
.pcard .pwhat{margin:0 0 9px;font-size:13px;color:var(--mut);line-height:1.7}
.pcard .pmeta{margin:0;display:grid;grid-template-columns:auto 1fr;gap:4px 10px;font-size:12.5px;line-height:1.65}
.pcard .pmeta dt{color:var(--dim);white-space:nowrap}
.pcard .pmeta dd{margin:0;min-width:0;overflow-wrap:anywhere}
.pcard .pmeta code{font-size:11.5px}
.pcard .prisk{color:#f6ae31}
.pcard .warn{color:#f87171}
.pcard .dim{color:var(--dim)}
.elsewhere{margin:10px 0 0;padding:9px 12px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--dim);font-size:12.5px;line-height:1.75}.elsewhere b{color:var(--txt)}.elsewhere code{font-size:12px}
.lanes{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap}.lane{border:1px solid var(--line);background:var(--card);color:var(--txt);border-radius:10px;padding:8px 14px;font:inherit;font-weight:700;cursor:pointer}.lane[aria-selected="true"]{background:var(--amber);color:#141722;border-color:var(--amber)}.lane .n{opacity:.7;font-weight:500;margin-inline-start:4px}[data-lane].hidden{display:none}`;

const seoHTML = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>سيو مدونتي — ${seoOpen.length} بنداً</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
<style>${CSS}${SEO_TABS_CSS}</style></head><body>
<header class="top"><div class="wrap">
<h1>سيو مدونتي — ${seoOpen.length} بنداً مفتوحاً <span style="color:var(--dim);font-weight:500;font-size:13px">· ${seoHigh} مهمّاً · ثماني مراحل بترتيب التنفيذ، والأسهل أوّل كل مرحلة · التقرير: <a href="../modonty/seo/SEO-AUDIT-2026-08-24.html">SEO-AUDIT-2026-08-24.html</a> · باقي الشغل: <a href="TASK.html">TASK.html</a></span></h1>
<div class="progress">
  <div class="bar"><span style="width:${seoPercent}%"></span></div>
  <div class="pnums">
    <b>${seoClosed}</b> أُغلق من <b>${seoAll.length}</b> · ${seoPercent}%
    ${seoClosedThatDay ? `<em class="today">${LAST_WORKING_DAY}: ${seoClosedThatDay}</em>` : ""}
  </div>
</div>
${seoElsewhere.length ? `<p class="elsewhere">وفيه <b>${seoElsewhere.length}</b> بطاقة سيو ما تظهر هنا لأن مكانها لوحة ثانية — ${
  [["DATA-REFACTOR.html", "إدخال بيانات"], ["TASK.html", "ما تمسّ صفحات مدونتي"]]
    .map(([f, why]) => { const ids = seoElsewhere.filter(t => t.dest === f); return ids.length ? `<a href="${f}">${f}</a> (${why}): ${ids.map(t => `<code>${esc(t.id)}</code>`).join(" · ")}` : ""; })
    .filter(Boolean).join(" — ")
}. هذا السطر موجود لأن عدّ البطاقات من الملفّ كان يعطي رقماً أكبر ممّا على الشاشة، فيبدو أن اللوحة ناقصة وهي ليست كذلك.</p>` : ""}
<div class="lanes" role="tablist">${seoLanes.map((l, i) => `<button class="lane" role="tab" data-lane-btn="${l.k}" aria-selected="${i === 0}">${l.n}<span class="n">${l.count}</span></button>`).join("")}</div>
<!-- No search box here on purpose. Khalid, 25 Aug 2026: "I will not search, I want final
     result" — this board is read to decide what to do next, not to look something up. A box
     nobody types in is a row of empty pixels above the thing they came for. The two filters
     stay: they narrow the list without asking for input. -->
<div class="tools">
<button class="chip" data-sev="critical high" aria-pressed="false">المهمّ فقط</button>
<button class="chip" id="prodOnly" aria-pressed="false">مؤكَّد على الإنتاج فقط</button></div>
</div></header>
<main class="wrap">
${seoLanes.map((l, i) => `<div data-lane="${l.k}" class="${i ? "hidden" : ""}"><p style="color:var(--dim);margin:14px 0 4px">${l.s}</p>
${l.html || ""}
${(l.reports || []).map(reportHTML).join("\n")}
${l.groups.map(g => `<section class="grp" data-grp="${g.k}"><h2>${g.n} <span class="n" data-count>${g.items.length}</span></h2><p>${g.s}</p><div class="grid">${g.items.map(cardHTML).join("\n")}</div></section>`).join("\n")}</div>`).join("\n")}
</main>
<footer>هذه اللوحة تخصّ سيو مدونتي وحده — نُقلت بطاقاته من <a href="TASK.html">TASK.html</a> نقلاً لا نسخاً. المنجز في <a href="TASK-ARCHIVE.html">TASK-ARCHIVE.html</a>.</footer>
<script>
(() => { const chip = document.querySelector('.chip'); const prodChip = document.getElementById('prodOnly'); const cards = [...document.querySelectorAll('.card')];
  // The search input is gone (see the note above the toolbar), so this reads the two chips
  // only. Leaving the old \`q.value\` read here would throw on the first click and take both
  // chips down with it — a removed control has to leave its handler too, not just the markup.
  const apply = () => { const sevOnly = chip.getAttribute('aria-pressed') === 'true'; const prodOnly = prodChip.getAttribute('aria-pressed') === 'true';
    cards.forEach(c => { let ok = true; if (sevOnly) ok = /critical|high/.test(c.dataset.sev); if (ok && prodOnly) ok = c.dataset.prod === 'yes'; c.classList.toggle('hidden', !ok); });
    document.querySelectorAll('.grp').forEach(g => { const n = g.querySelectorAll('.card:not(.hidden)').length; g.querySelector('[data-count]').textContent = n; g.classList.toggle('hidden', n === 0); }); };
  [chip, prodChip].forEach(b => b.addEventListener('click', () => { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); apply(); }));
  const showLane = (k) => { document.querySelectorAll('[data-lane]').forEach(l => l.classList.toggle('hidden', l.dataset.lane !== k)); document.querySelectorAll('[data-lane-btn]').forEach(b => b.setAttribute('aria-selected', b.dataset.laneBtn === k)); try { localStorage.setItem('seo-lane', k); } catch {} };
  document.querySelectorAll('[data-lane-btn]').forEach(b => b.addEventListener('click', () => showLane(b.dataset.laneBtn)));
  try { const s = localStorage.getItem('seo-lane'); if (s && document.querySelector('[data-lane="' + s + '"]')) showLane(s); } catch {}
  if (location.hash) { const h = location.hash.slice(1);
    const el = document.querySelector(/^\\d+$/.test(h) ? '.card[data-n="' + h + '"]' : '.card[data-id="' + CSS.escape(h) + '"]');
    if (el) { showLane(el.closest('[data-lane]').dataset.lane); el.querySelector('details').open = true; el.scrollIntoView({ block: 'center' }); } }
${COPY_JS}
})();
</script></body></html>`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "SEO.html"), seoHTML);
fs.writeFileSync(path.join(outDir, "TASK.html"), boardHTML);
fs.writeFileSync(path.join(outDir, "TASK-ARCHIVE.html"), archiveHTML);
fs.writeFileSync(path.join(outDir, "DATA-REFACTOR.html"), dataHTML);
const missing = sections[0].items.filter(t => !t.ask).map(t => t.id);
console.log(JSON.stringify({ open: open.length, data: dataOpen.length, done: done.length, total: open.length + dataOpen.length + done.length, decide: kCount, dataIds: dataOpen.map(t => t.id), missingAsk: missing.length, missingIds: missing, sizes: { board: boardHTML.length, archive: archiveHTML.length, data: dataHTML.length } }, null, 1));
