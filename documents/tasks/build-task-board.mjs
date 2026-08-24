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

const OVERRIDES = JSON.parse(fs.readFileSync(path.join(here, "task-overrides.json"), "utf8"));

const enriched = TASKS.map(t => {
  const segs = segments(t.d || "");
  const o = OVERRIDES[t.id] || {};
  const sum = o.sum || cut(segs.slice(0, 2).map(s => (s.label ? s.label + ": " : "") + s.text).join(" · "), 230);
  let ask = o.ask || null;
  if (!ask && t.who === "k") {
    const seg = segs.find(s => ASK_RE.test(s.label)) || segs.find(s => ASK_RE.test(s.text.slice(0, 80)));
    if (seg) ask = cut((seg.label && !/^(دليل|الدليل)$/.test(seg.label) ? seg.label + ": " : "") + seg.text, 260);
  }
  return { ...t, sum, ask, board: boardName[t.b] || t.b };
});

const isDone = (t) => t.tab === "done";
const allOpen = enriched.filter(t => !isDone(t));
const done = enriched.filter(isDone);
// بنود «تحديث البيانات» (file:"data") تخرج للوحة مستقلة DATA-REFACTOR.html
const dataOpen = allOpen.filter(t => t.file === "data");
const open = allOpen.filter(t => t.file !== "data");
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
    const text = 'documents/tasks/' + location.pathname.split('/').pop() + '#' + card.dataset.id;
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
@media (prefers-color-scheme: light){:root{--bg:#f6f7fb;--panel:#fff;--card:#fff;--line:#e4e6ee;--fg:#141722;--mut:#5b6472;--dim:#8a93a3;
--amber:#b45309;--red:#be123c;--green:#15803d;--blue:#1d4ed8;--violet:#6d28d9;--cyan:#0e7490;--k:#b45309;--c:#1d4ed8}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.65 Tajawal,system-ui,sans-serif}
a{color:inherit}code{font:12px ui-monospace,monospace;background:var(--panel);padding:1px 5px;border-radius:4px;border:1px solid var(--line)}
header.top{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--line);padding:12px 16px}
.wrap{max-width:1120px;margin:0 auto}
h1{font-size:18px;margin:0 0 8px}
.tools{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.tools input{flex:1;min-width:220px;height:40px;border-radius:10px;border:1px solid var(--line);background:var(--panel);color:var(--fg);padding:0 12px;font:inherit}
.chip{height:34px;border-radius:999px;border:1px solid var(--line);background:var(--panel);color:var(--mut);padding:0 12px;font:inherit;font-size:13px;cursor:pointer}
.chip[aria-pressed="true"]{background:var(--fg);color:var(--bg);border-color:var(--fg)}
/* شريط التبويبات — تطبيق واحد في المرّة. الاختيار الواحد هو المقصود: الخلط بين التطبيقات هو ما كان يُتيه. */
.apptabs{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0 10px;border-bottom:2px solid var(--line);padding-bottom:0}
.apptab{position:relative;display:flex;align-items:center;gap:7px;height:42px;padding:0 16px;border:0;border-bottom:3px solid transparent;margin-bottom:-2px;background:none;color:var(--mut);font:inherit;font-size:14px;font-weight:600;cursor:pointer;border-radius:8px 8px 0 0}
.apptab:hover{background:var(--panel);color:var(--fg)}
.apptab b{font-size:12px;font-weight:800;min-width:22px;padding:2px 6px;border-radius:999px;background:var(--line);color:var(--mut)}
.apptab[aria-selected="true"]{color:var(--fg);border-bottom-color:currentColor;background:var(--panel)}
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
/* شريط لوني رفيع أعلى البطاقة — إشارة ثانية لمن لا يميّز الفروق الخفيفة في الخلفية */
.card{position:relative}
.card::before{content:"";position:absolute;inset-block-start:0;inset-inline:0;height:2px;background:var(--line)}
.card[data-apps~="shared"]::before,.card[data-apps~="dataLayer"]::before{background:var(--green)}
.card[data-apps~="console"]::before{background:var(--cyan)}
.card[data-apps~="admin"]::before{background:var(--blue)}
.card[data-apps~="modonty"]::before{background:var(--violet)}
/* البند الجاري الآن: خلفية حمراء صريحة — خالد يلمحه من أول نظرة بلا قراءة (٢٤ أغسطس) */
.card[data-running="1"]{background:color-mix(in srgb,var(--red) 16%,var(--card));border-color:var(--red);border-inline-start:4px solid var(--red);box-shadow:0 0 0 1px color-mix(in srgb,var(--red) 30%,transparent)}
.card[data-running="1"] .id{background:var(--red);color:#fff;border-color:var(--red)}
.tag.running{background:var(--red);color:#fff;border-color:var(--red);font-weight:700}
.hd{display:flex;gap:8px;align-items:flex-start}
.id{font:700 11px ui-monospace,monospace;color:var(--dim);background:var(--panel);border:1px solid var(--line);padding:2px 6px;border-radius:6px;white-space:nowrap;margin-top:3px}
.copy{margin-inline-start:auto;flex:none;width:28px;height:28px;border-radius:8px;border:1px solid var(--line);background:var(--panel);color:var(--mut);font-size:13px;cursor:pointer;line-height:1}
.copy:hover{color:var(--fg);border-color:var(--fg)}.copy.ok{color:var(--green);border-color:var(--green)}
.t{font-weight:700;font-size:15px;line-height:1.45;flex:1;min-width:0}
.meta{display:flex;flex-wrap:wrap;gap:6px;font-size:12px;color:var(--mut)}
.tag{border:1px solid var(--line);border-radius:999px;padding:1px 8px}
.tag.app-modonty{color:var(--violet)}.tag.app-admin{color:var(--blue)}.tag.app-console{color:var(--cyan)}.tag.app-dataLayer{color:var(--green)}
.tag.tab-now{background:var(--amber);color:#141722;border-color:var(--amber);font-weight:700}
.tag.ease-go{background:color-mix(in srgb,var(--amber) 20%,transparent);border-color:var(--amber);color:var(--amber);font-weight:700}
.tag.ease-1{border-color:var(--green);color:var(--green)}
.tag.ease-2{border-color:var(--blue);color:var(--blue)}
.tag.ease-3{border-color:var(--red);color:var(--red)}
.sum{font-size:13.5px;color:var(--mut);margin:0;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
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
  // بند مؤجَّل عمداً إلى ما قبل الدمج — يُوسم كي لا يُقرأ تأخيرُه إهمالاً.
  const lastTag = t.last ? `<span class="tag last-before-merge">🏁 قبل الدمج مع main</span>` : "";
  // شارة «جاهز لوكيل»: بند فُحص حجمه ولا يحتاج قراراً — الرقم هو ترتيب التنفيذ المقترح.
  const agentTag = t.agent
    ? `<span class="tag ${t.agentKind === "قياس" ? "agent-measure" : "agent"}">🤖 وكيل ${t.agent}${t.agentKind === "قياس" ? " · قياس" : ""}</span>`
    : "";
  return `<article class="card" data-id="${esc(t.id)}" data-sev="${esc(t.sev)}" data-who="${esc(t.who)}" data-tab="${esc(t.tab)}" data-board="${esc(t.b)}" data-apps="${esc((t.app||[]).join(" "))}"${t.agent ? ` data-agent="${t.agent}"` : ""}${t.last ? " data-last=\"1\"" : ""}${t.area ? ` data-area="${esc(t.area)}"` : ""}${t.running ? ' data-running="1"' : ""}>
  <div class="hd"><span class="id">${esc(t.id)}</span><div class="t">${t.t}</div><button class="copy" type="button" title="نسخ مرجع البند (للّصق في الشات)" aria-label="نسخ مرجع البند ${esc(t.id)}">⧉</button></div>
  <div class="meta">${lastTag}${agentTag}${runningTag}${easeTag}<span class="tag tab-${esc(t.tab)}">${tabL}</span><span class="tag">${sevL}</span>${apps}<span class="tag">${esc(t.board)}</span>${t.date ? `<span>${esc(t.date)}</span>` : ""}</div>
  <p class="sum">${esc(t.sum)}</p>
  ${ask}
  <details><summary>التفاصيل الكاملة</summary><div class="full">${t.d || ""}</div></details>
</article>`;
}

// أقسام الشغل الموضوعية. البطاقة تحمل `sec` في `task-data.json`؛ وما لم يُوسم بعد يُشتقّ من
// بورده الأصلي، وما لا ينطبق عليه شيء ينزل «بنود أخرى» — قسم صريح خير من بطاقة تختفي.
const SECTIONS = [
  { k: "visible", n: "🔴 كسر يراه الزائر", s: "شيء مكسور على الشاشة الآن — يسبق كل تحسين." },
  { k: "seo", n: "🔍 سيو", s: "ما يجلب زائراً جديداً من البحث." },
  { k: "reels", n: "🎬 الطلّات", s: "الصفحة وربطها بباقي الموقع." },
  { k: "analytics", n: "📊 قياس وتتبّع", s: "بلا رقم لا نعرف هل نجح ما بنيناه." },
  { k: "ui", n: "🎨 واجهة وتجربة", s: "ما يراه الزائر ويستعمله." },
  { k: "code", n: "🧱 بنية الكود", s: "ريفاكتور وتوحيد — بلا أثر مباشر على الزائر." },
  { k: "qa", n: "🧪 فحص وجودة", s: "مسارات لم تُختبر بعد." },
  { k: "other", n: "بنود أخرى — دوري", s: "لم تُصنَّف بعد؛ تُنقل إلى قسمها عند فتح مرحلتها." },
];
const SEC_FROM_BOARD = { seo: "seo", fs: "code", mediaimg: "visible", bunny: "visible", bugs: "visible" };
const secOf = (t) => t.sec || SEC_FROM_BOARD[t.b] || "other";

const groups = [
  { k: "decide", n: "يحتاج قرارك", s: "الأسهل أولاً: ⚡ = كلمة «ابدأ» تكفي · 🤔 سهل = نعم/لا · 🤔 قصير = جواب سطر · 🤔 جلسة = نقاش. كلود لا يبدأ قبل كلمتك.", f: t => t.who === "k" && t.tab !== "ref" },
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
  items.sort((a, b) =>
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
const APP_TABS = [
  { k: "modonty", n: "مدونتي" },
  { k: "partner", n: "صفحة الشريك" },
  { k: "admin", n: "الأدمن" },
  { k: "console", n: "الكونسول" },
  { k: "dataLayer", n: "المشترك والقاعدة" },
  { k: "__none", n: "بلا تطبيق" },
  { k: "__merge", n: "🏁 قبل الدمج" },
  { k: "__all", n: "الكل" },
];
// حصريّ لا مزدوج (خالد، ٢٤ أغسطس: «still duplicate in modonty»): بطاقة صفحة الشريك تخرج من
// تبويب تطبيقها. البطاقة التي تظهر في تبويبين تُعدّ مرّتين وتُقرأ كبندين — وهذا نقيض سبب التبويب.
const inTab = (t, k) =>
  k === "__all" ? true
  : k === "__merge" ? !!t.last
  : t.last ? false
  : k === "partner" ? t.area === "partner"
  : t.area === "partner" ? false
  : k === "__none" ? !(t.app || []).length
  : (t.app || []).includes(k);
// المراجع ليست مهامّ (طرق قياس ومفاتيح وخرائط) — إدخالها في العدّاد يضخّم الباقي
// بـ٣٦ بنداً لا يُعمل فيها شيء (خالد، ٢٤ أغسطس: «only the remaining and open»).
const tabCount = (k) => open.filter(t => t.tab !== "ref" && (k === "__merge" || !t.last) && inTab(t, k)).length;
const appTabsHTML = APP_TABS
  .map(a => `<button class="apptab" role="tab" data-app="${a.k}" aria-selected="${a.k === "modonty"}" title="${tabCount(a.k)} بنداً مفتوحاً في ${a.n} — الرقم الكهرماني فوق يعدّ ما ينتظر قرارك منها وحدها">${a.n}<b>${tabCount(a.k)}</b></button>`)
  .join("");
const boardHTML = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>لوحة مدونتي — ${openWork.length} بنداً مفتوحاً</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body>
<header class="top"><div class="wrap">
<h1>لوحة الشغل — ${openWork.length} بنداً مفتوحاً <span style="color:var(--dim);font-weight:500;font-size:13px">· و${lastWork.length} في «قبل الدمج» · تحديث البيانات في <a href="DATA-REFACTOR.html">DATA-REFACTOR.html</a> · المنجز في <a href="TASK-ARCHIVE.html">TASK-ARCHIVE.html</a></span></h1>
<!-- لا صفّ إحصاءات إطلاقاً (خالد، ٢٤ أغسطس: «only the counter for what remain, no حشو»).
     كانت عشرون رقماً على الشاشة، ثم واحد بارز مع مطويّة — وكلّها ما زالت حشواً فوق ما يلزم.
     أرقام التبويبات وحدها تقول ما بقي، وعناوين الأقسام تقول توزيعه. الباقي كان يشرح لا يفيد. -->
<div class="apptabs" role="tablist" aria-label="التطبيقات">${appTabsHTML}</div>
<div class="tools"><input id="q" type="search" placeholder="ابحث بالكلمة أو رقم البند…" aria-label="بحث">
<button class="chip" data-sev="critical high" aria-pressed="false">الحرج والمهم فقط</button>
<button class="chip" data-agent="1" aria-pressed="false">🤖 الجاهز لوكيل (${open.filter(t => t.agent).length})</button></div>
</div></header>
<main class="wrap">
${sections.filter(g => g.items.length).map(g => `<section class="grp" data-grp="${g.k}"><h2>${g.n} <span class="n" data-count>${g.items.length}</span></h2><p>${g.s}</p>${g.collapsed ? `<details><summary>اعرض ${g.items.length} مرجعاً</summary>` : ""}<div class="grid">${g.items.map(cardHTML).join("\n") || '<div class="empty">لا شيء هنا.</div>'}</div>${g.collapsed ? "</details>" : ""}</section>`).join("\n")}
</main>
<footer>بيانات البطاقات كما هي (التفاصيل الكاملة داخل كل بطاقة) — الملخّص و«المطلوب منك» مستخلَصان. تحديث البيانات: <a href="DATA-REFACTOR.html">DATA-REFACTOR.html</a> · المنجز: <a href="TASK-ARCHIVE.html">TASK-ARCHIVE.html</a>.</footer>
<script>
(() => {
  const q = document.getElementById('q'); const chips = [...document.querySelectorAll('.chip')];
  const tabs = [...document.querySelectorAll('.apptab')];
  const cards = [...document.querySelectorAll('.card')];
  // التبويب الفعّال يُخزَّن محلياً: يفتح خالد الملف فيجد آخر تطبيق كان فيه، لا الافتراضي كل مرّة.
  let app = 'modonty';
  try { const s = localStorage.getItem('taskboard-app'); if (s && tabs.some(t => t.dataset.app === s)) app = s; } catch {}
  const matchApp = (c) => {
    // «الكل» يعني كل الشغل المفتوح — لا يشمل «قبل الدمج»، تماماً كما تستثنيه شارته.
    // قبل ٢٤ أغسطس كان يعرضها ولا يعدّها: ٧١ في الشارة و٨٥ على الشاشة.
    if (app === '__all') return !c.dataset.last;
    // تبويب «قبل الدمج» حصريّ: بنوده تخرج من كل تبويب آخر كي لا تُعدّ مرّتين
    if (app === '__merge') return !!c.dataset.last;
    if (c.dataset.last) return false;
    if (app === 'partner') return c.dataset.area === 'partner';
    // بطاقة الشريك لا تظهر في تبويب تطبيقها — حصريّة كي لا تُعدّ مرّتين
    if (c.dataset.area === 'partner') return false;
    const list = (c.dataset.apps || '').split(' ').filter(Boolean);
    return app === '__none' ? list.length === 0 : list.includes(app);
  };
  const apply = () => {
    const term = q.value.trim().toLowerCase();
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
  q.addEventListener('input', apply);
  chips.forEach(c => c.addEventListener('click', () => { c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); apply(); }));
  tabs.forEach(t => t.addEventListener('click', () => {
    app = t.dataset.app;
    try { localStorage.setItem('taskboard-app', app); } catch {}
    apply(); window.scrollTo({ top: 0, behavior: 'smooth' });
  }));
  apply(); // يطبّق التبويب المحفوظ فور الفتح
  // رابط مباشر ‎#ID: يفتح تفاصيل البطاقة — ويقفز إلى «الكل» أوّلاً وإلا بقيت مخفيّة خلف تبويب آخر.
  if (location.hash) {
    const el = document.querySelector('.card[data-id="' + CSS.escape(location.hash.slice(1)) + '"]');
    if (el) {
      // بطاقة «قبل الدمج» أو بطاقة مرجع لن يفتحها «الكل» بعد اليوم — يُختار لها تبويبها،
      // والمرجع يُكشف بكتابة معرّفه في البحث لأن هذا هو شرط ظهوره.
      if (!matchApp(el) || el.dataset.tab === 'ref') {
        app = el.dataset.last ? '__merge' : '__all';
        if (el.dataset.tab === 'ref') q.value = el.dataset.id;
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

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "TASK.html"), boardHTML);
fs.writeFileSync(path.join(outDir, "TASK-ARCHIVE.html"), archiveHTML);
fs.writeFileSync(path.join(outDir, "DATA-REFACTOR.html"), dataHTML);
const missing = sections[0].items.filter(t => !t.ask).map(t => t.id);
console.log(JSON.stringify({ open: open.length, data: dataOpen.length, done: done.length, total: open.length + dataOpen.length + done.length, decide: kCount, dataIds: dataOpen.map(t => t.id), missingAsk: missing.length, missingIds: missing, sizes: { board: boardHTML.length, archive: archiveHTML.length, data: dataHTML.length } }, null, 1));
