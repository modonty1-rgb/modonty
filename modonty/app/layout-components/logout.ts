import { signOut } from "next-auth/react";

export async function handleLogout() {
  try {
    // 1. Clear any custom localStorage items
    if (typeof window !== "undefined") {
      localStorage.removeItem("app-preferences");
    }

    // 2. Sign out with NextAuth (clears cookies automatically)
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });

    // 3. Clear browser cache (aggressive)
    if (typeof window !== "undefined" && "caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
  } catch (error) {
    console.error("Logout error:", error);
    await signOut({ callbackUrl: "/", redirect: true });
  }
}
