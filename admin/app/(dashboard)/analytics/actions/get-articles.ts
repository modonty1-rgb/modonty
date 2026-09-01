"use server";

import { db } from "@/lib/db";

export async function getArticles() {
  try {
    return await db.article.findMany({
      where: {
        status: {
          in: ["DRAFT", "PUBLISHED", "ARCHIVED"],
        },
      },
      // بلا سقف: قائمة اختيار في شاشة التحليلات. سقفٌ صامت عند الألف يعني أن المقال
      // رقم ١٠٠١ يختفي من القائمة بلا رسالة، فيبدو غير موجود بدل أن يبدو غير معروض.
      // الحقول الأربعة خفيفة، والعدد اليوم ١٩٦ مقالاً.
      select: { id: true, title: true, slug: true, clientId: true },
      orderBy: { title: "asc" },
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

