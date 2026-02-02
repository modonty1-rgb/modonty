"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import type { RegisterFormData } from "../helpers/schemas/register-schema";

export async function registerUser(data: RegisterFormData) {
  try {
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return {
        success: false as const,
        error: "البريد الإلكتروني مستخدم بالفعل",
      };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "EDITOR",
      },
    });

    return { success: true as const };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false as const,
        error: "البريد الإلكتروني مستخدم بالفعل",
      };
    }

    console.error("Error registering user:", error);
    return {
      success: false as const,
      error: "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.",
    };
  }
}
