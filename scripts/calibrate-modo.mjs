// Calibrates Modo's reranker thresholds against real Arabic questions.
//
// Why: the vendor states relevance scores are query-dependent and NOT comparable across queries,
// and prescribes calibrating on 30–50 representative questions. Until this runs, every threshold
// in the route is a guess.
//
// It stops at RETRIEVAL — no generation — so the whole run costs one embed + one rerank per
// question instead of a full answer. Development server only (`/modo-chat/api/calibrate` 404s
// in production).
//
// Usage: node scripts/calibrate-modo.mjs [--limit N]

import { readFileSync } from "node:fs";

const BASE = process.env.MODO_BASE ?? "http://localhost:3000";
const QUESTIONS_MD = "modonty/app/(site)/modo-chat/documentation/calibration-questions.md";

function loadQuestions() {
  const rows = [];
  for (const line of readFileSync(QUESTIONS_MD, "utf8").split("\n")) {
    const m = line.match(/^\|\s*[٠-٩0-9]+\s*\|\s*(.+?)\s*\|\s*(نعم|لا|هويّة)\s*\|/);
    if (m) rows.push({ question: m[1], expected: m[2] });
  }
  return rows;
}

/**
 * The threshold that best separates «should answer» from «should not», by simple accuracy.
 *
 * Only questions belonging to THE SCOPE BEING MEASURED count. Scoring another industry's
 * questions against this corpus and calling the misses "threshold errors" is a category mistake:
 * a question about e-commerce SHOULD score zero here. Measured 2026-08-18, including them
 * dragged the recommended threshold from ~0.7 down to 0.08 — an answer to the wrong question.
 */
function bestThreshold(scored, inScopeCount) {
  const judged = scored.slice(0, inScopeCount).filter((r) => !r.identity && r.expected !== "هويّة");
  let best = { value: 0, correct: -1, falseYes: 0, falseNo: 0 };

  for (let t = 0; t <= 1.0001; t += 0.01) {
    let correct = 0, falseYes = 0, falseNo = 0;
    for (const r of judged) {
      const answers = (r.topRerankScore ?? 0) >= t;
      const should = r.expected === "نعم";
      if (answers === should) correct++;
      else if (answers) falseYes++;
      else falseNo++;
    }
    // Ties go to the HIGHER threshold: at equal accuracy, staying silent beats answering off a
    // weak chunk — silence falls through to a partner card, a bad answer spends earned trust.
    if (correct >= best.correct) best = { value: Number(t.toFixed(2)), correct, falseYes, falseNo };
  }
  return { ...best, total: judged.length };
}

async function main() {
  const limitArg = process.argv.indexOf("--limit");
  const limit = limitArg > -1 ? Number(process.argv[limitArg + 1]) : Infinity;

  const { industries } = await fetch(`${BASE}/modo-chat/api/industries`).then((r) => r.json());
  const scope = industries?.[0];
  if (!scope) { console.error("لا يوجد مجال فيه شركاء."); process.exit(1); }

  const questions = loadQuestions().slice(0, limit);
  console.log(`المجال: ${scope.name} (${scope.slug}) · الأسئلة: ${questions.length}\n`);

  // Six at a time: the endpoint paces itself against the vendor's rate limit, which returned
  // HTTP 429 when all 35 questions were sent in one go (measured 2026-08-18).
  const BATCH = 6;
  const all = [];
  let data = {};
  for (let i = 0; i < questions.length; i += BATCH) {
    const slice = questions.slice(i, i + BATCH);
    const n = Math.floor(i / BATCH) + 1;
    const of = Math.ceil(questions.length / BATCH);
    process.stdout.write(`  دفعة ${n}/${of} …`);

    const res = await fetch(`${BASE}/modo-chat/api/calibrate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions: slice.map((q) => q.question), industrySlug: scope.slug }),
    });
    if (!res.ok) {
      console.error(`\nفشل: HTTP ${res.status} — ${(await res.text()).slice(0, 200)}`);
      process.exit(1);
    }
    data = await res.json();
    all.push(...data.results);
    console.log(" تمّت");
  }

  const scored = all.map((r, i) => ({ ...r, expected: questions[i].expected }));

  console.log(`مقالات: ${data.articles} · مقاطع: ${data.chunks}\n`);
  console.log("المتوقَّع | الدرجة  | مقاطع | السؤال");
  console.log("─".repeat(78));
  for (const r of scored) {
    const score = r.identity ? "هويّة " : String(r.topRerankScore ?? 0).padEnd(6);
    console.log(`${r.expected.padEnd(7)} | ${score} | ${String(r.docsCount ?? "-").padEnd(5)} | ${r.question.slice(0, 44)}`);
  }

  // The first table in the questions file is the measured scope; the rest are other industries,
  // kept in the run so we can see they score near zero — but excluded from the threshold maths.
  const IN_SCOPE = 15;
  const best = bestThreshold(scored, IN_SCOPE);
  console.log("\n" + "═".repeat(78));
  console.log(`أفضل عتبة مقيسة (على ${IN_SCOPE} سؤالاً داخل النطاق): ${best.value}`);
  console.log(`أصابت ${best.correct} من ${best.total} · أجاب وما كان يفترض: ${best.falseYes} · صمت وكان يفترض يجيب: ${best.falseNo}`);
  console.log("العتبة الحالية في الكود: RERANK_MIN_SCORE = 0.3");
}

main().catch((e) => { console.error(e); process.exit(1); });
