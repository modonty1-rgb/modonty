"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getSystemErrors() {
  return db.systemError.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      message: true,
      digest: true,
      path: true,
      method: true,
      routePath: true,
      routeType: true,
      source: true,
      createdAt: true,
    },
  });
}

export async function deleteSystemError(id: string) {
  await db.systemError.delete({ where: { id } });
  revalidatePath("/system-errors");
}

export async function clearAllSystemErrors() {
  await db.systemError.deleteMany({});
  revalidatePath("/system-errors");
}
