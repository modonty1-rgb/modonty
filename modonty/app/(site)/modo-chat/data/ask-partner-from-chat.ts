"use server";

import { z } from "zod";
import { ArticleStatus, ArticleFAQStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";

const schema = z.object({
  partnerSlug: z.string().min(1).max(200),
  question: z.string().min(5).max(1000),
});

/** Same ceiling the article form uses — one visitor cannot flood a partner's inbox. */
const MAX_PENDING_PER_VISITOR = 5;

import { stripHtmlTags } from "@modonty/shared/lib/strip-html-tags";

/**
 * Hands a question Modo could not answer to the partner who can.
 *
 * Khalid's idea (2026-08-18): «إذا السؤال طبّي، تشوف الدكتور المناسب… وردّ الدكتور يوصلك على
 * الإيميل». It closes the one hole left in the loop — the schema has expected a `chatbot` source
 * since it was written, and nothing ever produced one, so a question Modo failed on went to a web
 * search and evaporated while its owner sat in the console waiting for questions.
 *
 * The row lands in the same inbox as an article question, so the partner answers it the same way
 * and the asker gets the same email. Nothing new to learn, nothing new to maintain.
 *
 * It attaches to the partner's most recent article because `ArticleFAQ` hangs off an article —
 * that is a known compromise, and decision (د) in `ask-partner-loop.html` is about giving
 * partner-level questions a home of their own.
 */
export async function askPartnerFromChat(input: {
  partnerSlug: string;
  question: string;
}): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "سجّل دخولك عشان نوصّل سؤالك للشريك" };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "اكتب سؤالك بشكل أوضح (٥ أحرف على الأقل)" };
  }

  const name = session.user.name?.trim();
  const email = session.user.email?.trim();
  if (!name || !email) {
    return { success: false, error: "حسابك يفتقد الاسم أو البريد. حدّث ملفك ثم جرّب." };
  }

  const client = await db.client.findUnique({
    where: { slug: parsed.data.partnerSlug },
    select: {
      id: true,
      name: true,
      articles: {
        where: {
          status: ArticleStatus.PUBLISHED,
          OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
        },
        select: { id: true, slug: true, title: true },
        orderBy: [{ datePublished: "desc" }, { createdAt: "desc" }],
        take: 1,
      },
    },
  });

  const article = client?.articles[0];
  if (!client || !article) {
    return { success: false, error: "ما نقدر نوصّل سؤالك لهذا الشريك الآن." };
  }

  const pending = await db.articleFAQ.count({
    where: {
      submittedByEmail: email,
      status: ArticleFAQStatus.PENDING,
      answer: null,
    },
  });
  if (pending >= MAX_PENDING_PER_VISITOR) {
    return { success: false, error: "عندك ٥ أسئلة تنتظر ردّاً. انتظر الرد وبعدين اسأل من جديد." };
  }

  const last = await db.articleFAQ.findFirst({
    where: { articleId: article.id },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  try {
    await db.articleFAQ.create({
      data: {
        articleId: article.id,
        question: stripHtmlTags(parsed.data.question.trim()),
        answer: null,
        position: (last?.position ?? -1) + 1,
        status: ArticleFAQStatus.PENDING,
        // The value the schema has always expected — now something finally writes it.
        source: "chatbot",
        submittedByName: name,
        submittedByEmail: email,
      },
    });

    notifyTelegram(client.id, "askClientQuestion", {
      title: `سؤال من مودو · ${article.title}`,
      body: `${name}: ${parsed.data.question.trim()}`,
      meta: { "البريد": email },
      link: { label: "الرد من اللوحة", url: "https://console.modonty.com/dashboard/questions" },
    }).catch(() => {});

    return { success: true };
  } catch (error) {
    console.error("[askPartnerFromChat]", error);
    return { success: false, error: "تعذّر إرسال سؤالك. جرّب بعد شوي." };
  }
}
