"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

export async function getUsers() {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function getUserById(id: string) {
  try {
    return await db.user.findUnique({ where: { id } });
  } catch (error) {
    return null;
  }
}

export async function createUser(data: {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  clientAccess?: string[];
  image?: string;
}) {
  try {
    if (!data.name || !data.email || !data.password || !data.role) {
      return { success: false, error: "Name, email, password, and role are required" };
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        clientAccess: data.clientAccess || [],
        image: data.image,
      },
    });
    revalidatePath("/users");
    return { success: true, user };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create user";
    return { success: false, error: message };
  }
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    clientAccess?: string[];
    image?: string;
  }
) {
  try {
    const updateData: {
      name?: string;
      email?: string;
      role?: UserRole;
      clientAccess?: string[];
      image?: string;
      password?: string;
    } = {
      name: data.name,
      email: data.email,
      role: data.role,
      clientAccess: data.clientAccess || [],
      image: data.image,
    };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/users");
    return { success: true, user };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update user";
    return { success: false, error: message };
  }
}

export async function deleteUser(id: string) {
  try {
    await db.user.delete({ where: { id } });
    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete user";
    return { success: false, error: message };
  }
}

export async function getClients() {
  try {
    return await db.client.findMany({ orderBy: { name: "asc" } });
  } catch (error) {
    return [];
  }
}
