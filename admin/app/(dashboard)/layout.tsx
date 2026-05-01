import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/admin/sidebar";
import { Header } from "@/components/admin/header";
import { SidebarProvider } from "@/components/contexts/sidebar-context";

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // SessionProvider is hoisted to root layout (app/layout.tsx) — pre-hydrated with session.
  // We still call auth() here as the auth GATE for /dashboard tree (redirects unauthenticated users).
  let session;
  try {
    session = await auth();
  } catch (error) {
    console.error("Auth error in dashboard layout:", error);
    redirect("/login");
  }

  if (!session) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto scrollbar-thin">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
