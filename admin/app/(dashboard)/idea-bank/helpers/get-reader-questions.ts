import { db } from "@/lib/db";

/**
 * **مودو** و**أسئلة القرّاء** — ما سأله جمهور مدونتي نفسه (خالد ١٥ أكتوبر ٢٠٢٦: «فين تميّزنا وقوّتنا؟»).
 * تبويبان لا واحد (خالد: «مودو لوحده وأسئلة القرّاء لوحدهم — القارئ يسأل صاحب المقال»):
 *
 * - **مودو** — المساعد:
 *   - لم يجب: سؤالٌ خارج ما نعرفه (`outOfScope`) — مقالٌ مفقود بلسان القارئ.
 *   - حوّل: أحاله لمكانٍ آخر (`redirect`) — مقالٌ يجيب عنه يبقي القارئ عندنا.
 *   - من محادثة: سؤالٌ حوّله مودو إلى سؤالٍ تحت مقال (`source: chatbot`).
 * - **أسئلة القرّاء** — سؤالٌ كتبه قارئ تحت مقال لصاحبه (`source: user`)، وهل أجاب صاحب المقال.
 *
 * تُقرأ من القاعدة مباشرةً — لا رادار ولا توكن. الأسئلة المتطابقة تُجمع بعدد مرّاتها. معلومةٌ لا قرار.
 */
export type ReaderQuestionSource = "chat_unanswered" | "chat_redirect" | "chat_faq" | "article";
export type QuestionAudience = "modo" | "readers";

export type ReaderQuestion = {
  id: string;
  question: string;
  source: ReaderQuestionSource;
  count: number;
  lastAskedAt: string;
  /** أين سُئل: عنوان المقال أو القسم أو الصناعة. */
  context: string | null;
  /** لسؤالٍ تحت مقال: هل أجاب صاحب المقال (null لأسئلة المحادثة). */
  answered: boolean | null;
};

const DAYS = 60;
// بيانات التجربة موسومة («تجربة» · «تست» · TEST) — لا تُعرض سؤالاً حقيقياً
const TEST_LABEL = /تجربة|تجربه|تست|\btest\b/i;

const norm = (q: string) =>
  q
    .toLowerCase()
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[إأآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

/** سؤالٌ يُقرأ: فيه ثلاث كلمات أو ١٢ حرفاً على الأقل، وليس رقماً ولا وسم تجربة. */
const isReal = (q: string) => {
  const n = norm(q);
  return !TEST_LABEL.test(q) && !/^\d+$/.test(n.replace(/\s/g, "")) && (n.split(" ").length >= 3 || n.length >= 12);
};

const slug = (s: string) => s.replace(/-/g, " ");

export async function getReaderQuestions(audience: QuestionAudience): Promise<ReaderQuestion[]> {
  const since = new Date(Date.now() - DAYS * 86400_000);
  const [chats, faqs] = await Promise.all([
    audience === "modo"
      ? db.chatbotMessage.findMany({
          where: { createdAt: { gte: since }, outcome: { in: ["outOfScope", "redirect"] } },
          select: { userQuery: true, outcome: true, industrySlug: true, categorySlug: true, articleSlug: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 3000,
        })
      : Promise.resolve([]),
    db.articleFAQ.findMany({
      where: { createdAt: { gte: since }, source: audience === "modo" ? "chatbot" : "user" },
      select: { question: true, status: true, createdAt: true, article: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 3000,
    }),
  ]);

  const groups = new Map<string, ReaderQuestion>();
  const add = (question: string, source: ReaderQuestionSource, at: Date, context: string | null, answered: boolean | null) => {
    if (!isReal(question)) return;
    const id = `${source}:${norm(question)}`;
    const g = groups.get(id);
    if (g) {
      g.count += 1;
      if (at.toISOString() > g.lastAskedAt) g.lastAskedAt = at.toISOString();
      if (answered) g.answered = true; // أُجيب مرّةً = أُجيب
      return;
    }
    groups.set(id, { id, question: question.trim().slice(0, 300), source, count: 1, lastAskedAt: at.toISOString(), context, answered });
  };

  for (const c of chats) {
    const where = c.articleSlug ? `مقال: ${slug(c.articleSlug)}` : c.categorySlug ? `قسم: ${slug(c.categorySlug)}` : c.industrySlug ? `صناعة: ${slug(c.industrySlug)}` : null;
    add(c.userQuery, c.outcome === "outOfScope" ? "chat_unanswered" : "chat_redirect", c.createdAt, where, null);
  }
  for (const f of faqs) {
    add(f.question, audience === "modo" ? "chat_faq" : "article", f.createdAt, f.article?.title ?? null, audience === "modo" ? null : f.status === "PUBLISHED");
  }

  return [...groups.values()].sort((a, b) => b.count - a.count || b.lastAskedAt.localeCompare(a.lastAskedAt));
}
