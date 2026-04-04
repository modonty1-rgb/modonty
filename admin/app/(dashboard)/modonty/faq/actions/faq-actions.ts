"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { previewPageSeo, savePageSeo } from "@/app/(dashboard)/modonty/setting/actions/generate-home-and-list-page-seo";

async function regenerateFaqSeoCache() {
  try {
    const preview = await previewPageSeo("faq");
    if (preview.success && preview.data) {
      await savePageSeo("faq", preview.data);
    }
  } catch {
    // Non-blocking — FAQ save should succeed even if SEO cache fails
  }
}

export async function getFAQs() {
  try {
    const faqs = await db.fAQ.findMany({
      orderBy: { position: "asc" },
    });
    return faqs;
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return [];
  }
}

export async function getActiveFAQs() {
  try {
    const faqs = await db.fAQ.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
    });
    return faqs;
  } catch (error) {
    console.error("Error fetching active FAQs:", error);
    return [];
  }
}

export async function getFAQById(id: string) {
  try {
    const faq = await db.fAQ.findUnique({
      where: { id },
    });
    return faq;
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    return null;
  }
}

export async function createFAQ(data: {
  question: string;
  answer: string;
  position?: number;
  isActive?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  lastReviewed?: Date;
  reviewedBy?: string;
  author?: string;
  upvoteCount?: number;
  answerCount?: number;
  dateCreated?: Date;
  datePublished?: Date;
  inLanguage?: string;
  speakable?: any;
  mainEntity?: any;
  createdBy?: string;
}) {
  try {
    if (!data.question?.trim()) return { success: false, error: "السؤال مطلوب" };
    if (!data.answer?.trim()) return { success: false, error: "الإجابة مطلوبة" };

    // Get max position if not provided
    let position = data.position;
    if (position === undefined) {
      const maxPosition = await db.fAQ.findFirst({
        orderBy: { position: "desc" },
        select: { position: true },
      });
      position = (maxPosition?.position ?? -1) + 1;
    }

    const faq = await db.fAQ.create({
      data: {
        question: data.question,
        answer: data.answer,
        position,
        isActive: data.isActive ?? true,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        lastReviewed: data.lastReviewed,
        reviewedBy: data.reviewedBy,
        author: data.author,
        upvoteCount: data.upvoteCount,
        answerCount: data.answerCount,
        dateCreated: data.dateCreated ?? new Date(),
        datePublished: data.datePublished,
        inLanguage: data.inLanguage ?? "ar",
        speakable: data.speakable,
        mainEntity: data.mainEntity,
        createdBy: data.createdBy,
      },
    });

    revalidatePath("/modonty/faq");
    revalidatePath("/help/faq");
    await revalidateModontyTag("faqs");
    await regenerateFaqSeoCache();
    return { success: true, faq };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create FAQ";
    return { success: false, error: message };
  }
}

export async function updateFAQ(
  id: string,
  data: {
    question?: string;
    answer?: string;
    position?: number;
    isActive?: boolean;
    seoTitle?: string;
    seoDescription?: string;
    lastReviewed?: Date;
    reviewedBy?: string;
    author?: string;
    upvoteCount?: number;
    answerCount?: number;
    dateCreated?: Date;
    datePublished?: Date;
    inLanguage?: string;
    speakable?: any;
    mainEntity?: any;
    updatedBy?: string;
  }
) {
  try {
    // Auto-update lastReviewed if content changed
    const updateData: any = { ...data };
    if (data.question || data.answer) {
      updateData.lastReviewed = new Date();
    }

    const faq = await db.fAQ.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/modonty/faq");
    revalidatePath("/help/faq");
    await revalidateModontyTag("faqs");
    await regenerateFaqSeoCache();
    return { success: true, faq };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update FAQ";
    return { success: false, error: message };
  }
}

export async function deleteFAQ(id: string) {
  try {
    await db.fAQ.delete({ where: { id } });
    revalidatePath("/modonty/faq");
    revalidatePath("/help/faq");
    await revalidateModontyTag("faqs");
    await regenerateFaqSeoCache();
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete FAQ";
    return { success: false, error: message };
  }
}

export async function reorderFAQs(ids: string[]) {
  try {
    const updates = ids.map((id, index) => ({
      where: { id },
      data: { position: index },
    }));

    await Promise.all(updates.map((update) => db.fAQ.update(update)));

    revalidatePath("/modonty/faq");
    revalidatePath("/help/faq");
    await revalidateModontyTag("faqs");
    await regenerateFaqSeoCache();
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reorder FAQs";
    return { success: false, error: message };
  }
}

export async function toggleFAQStatus(id: string) {
  try {
    const faq = await db.fAQ.findUnique({ where: { id }, select: { isActive: true } });
    if (!faq) {
      return { success: false, error: "FAQ not found" };
    }

    const updated = await db.fAQ.update({
      where: { id },
      data: { isActive: !faq.isActive },
    });

    revalidatePath("/modonty/faq");
    revalidatePath("/help/faq");
    await revalidateModontyTag("faqs");
    await regenerateFaqSeoCache();
    return { success: true, faq: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to toggle FAQ status";
    return { success: false, error: message };
  }
}

export async function updateLastReviewed(id: string) {
  try {
    const faq = await db.fAQ.update({
      where: { id },
      data: { lastReviewed: new Date() },
    });

    revalidatePath("/modonty/faq");
    revalidatePath("/help/faq");
    await revalidateModontyTag("faqs");
    await regenerateFaqSeoCache();
    return { success: true, faq };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update last reviewed";
    return { success: false, error: message };
  }
}

export async function bulkUpdatePositions(updates: Array<{ id: string; position: number }>) {
  try {
    await Promise.all(
      updates.map((update) =>
        db.fAQ.update({
          where: { id: update.id },
          data: { position: update.position },
        })
      )
    );

    revalidatePath("/modonty/faq");
    revalidatePath("/help/faq");
    await revalidateModontyTag("faqs");
    await regenerateFaqSeoCache();
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update positions";
    return { success: false, error: message };
  }
}
