"use server";

import { unstable_noStore as noStore } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// ─── Changelog ───

export async function getChangelogs() {
  noStore();
  const all = await db.changelog.findMany();
  return all.sort((a, b) => {
    const parse = (v: string) => v.replace(/^v/, "").split(".").map(Number);
    const [a1, a2, a3] = parse(a.version);
    const [b1, b2, b3] = parse(b.version);
    return (b1 - a1) || (b2 - a2) || (b3 - a3);
  });
}

export async function createChangelog(data: {
  version: string;
  title: string;
  items: Array<{ type: "fix" | "feature" | "improve"; text: string }>;
}) {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const changelog = await db.changelog.create({
    data: {
      version: data.version,
      title: data.title,
      items: data.items,
    },
  });
  return { success: true, changelog };
}

// ─── Admin Notes ───

export async function getAdminNotes() {
  return db.adminNote.findMany({
    include: { replies: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createAdminNote(data: {
  author: string;
  message: string;
  page?: string;
}) {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  if (!data.author?.trim() || !data.message?.trim()) {
    return { success: false, error: "Name and message are required" };
  }

  const note = await db.adminNote.create({
    data: {
      author: data.author,
      message: data.message,
      page: data.page || null,
    },
  });
  return { success: true, note };
}

export async function replyToNote(data: {
  noteId: string;
  author: string;
  message: string;
}) {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  if (!data.author?.trim() || !data.message?.trim()) {
    return { success: false, error: "Name and message are required" };
  }

  const reply = await db.adminNoteReply.create({
    data: {
      noteId: data.noteId,
      author: data.author,
      message: data.message,
    },
  });
  return { success: true, reply };
}
