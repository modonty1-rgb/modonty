"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";

function optimizeAvatarUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  const match = url.match(
    /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)((?:v\d+\/)?.+)$/
  );
  if (!match) return url;
  const [, base, path] = match;
  const cleanPath = path.replace(/\/?(f_\w+|q_\w+|w_\d+|h_\d+|c_\w+|g_\w+),?/g, "");
  return `${base}f_auto,q_auto,w_200,h_200,c_fill,g_face/${cleanPath}`;
}

export async function getUsers() {
  try {
    const users = await db.user.findMany({
      where: { role: "ADMIN" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return users;
  } catch {
    return [];
  }
}

export async function getUserById(id: string) {
  try {
    return await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });
  } catch {
    return null;
  }
}

export async function createUser(data: {
  name?: string;
  email?: string;
  password?: string;
  image?: string;
}) {
  try {
    const session = await auth(); if (!session) return { success: false, error: "Unauthorized" };
    if (!data.name || !data.email || !data.password) {
      return { success: false, error: "Name, email, and password are required" };
    }

    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return { success: false, error: "This email is already registered" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "ADMIN",
        image: optimizeAvatarUrl(data.image),
      },
    });
    revalidatePath("/users");
    return { success: true };
  } catch {
    return { success: false, error: "Could not create the account. Please try again." };
  }
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    password?: string;
    image?: string;
  }
) {
  try {
    const session = await auth(); if (!session) return { success: false, error: "Unauthorized" };
    if (data.email) {
      const existing = await db.user.findUnique({ where: { email: data.email } });
      if (existing && existing.id !== id) {
        return { success: false, error: "This email is already used by another account" };
      }
    }

    const updateData: {
      name?: string;
      email?: string;
      image?: string | null;
      password?: string;
    } = {
      name: data.name,
      email: data.email,
      image: optimizeAvatarUrl(data.image),
    };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    await db.user.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/users");
    return { success: true };
  } catch {
    return { success: false, error: "Could not update the account. Please try again." };
  }
}

export async function deleteUser(id: string) {
  try {
    const session = await auth(); if (!session) return { success: false, error: "Unauthorized" };
    const adminCount = await db.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return { success: false, error: "Cannot remove the last admin. At least one admin must exist." };
    }

    await db.user.delete({ where: { id } });
    revalidatePath("/users");
    return { success: true };
  } catch {
    return { success: false, error: "Could not remove the account. Please try again." };
  }
}
