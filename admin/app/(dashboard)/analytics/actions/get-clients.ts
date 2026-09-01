"use server";

import { db } from "@/lib/db";

export async function getClients() {
  try {
    // بلا سقف: هذه قائمة اختيار في شاشة التحليلات، وسقفٌ صامت عند الألف يعني أن
    // العميل رقم ١٠٠١ يختفي من القائمة بلا رسالة — لا يراه أحد حتى يشتكي صاحبه.
    // الحقول الثلاثة خفيفة (معرّف واسم وسلاغ)، والعدد اليوم ٣٧ عميلاً.
    return await db.client.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    return [];
  }
}

