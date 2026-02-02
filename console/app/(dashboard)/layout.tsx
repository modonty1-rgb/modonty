import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardLayoutClient } from "./components/dashboard-layout-client";
import { getPendingArticlesCount } from "./dashboard/articles/helpers/article-queries";
import { getPendingCommentsCount } from "./dashboard/comments/helpers/comment-queries";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await auth();
  } catch {
    redirect("/");
  }

  if (!session?.clientId) {
    redirect("/");
  }

  const clientId = (session as { clientId?: string }).clientId!;
  const clientName = (session as { clientName?: string }).clientName ?? "Client";

  const [pendingArticlesCount, pendingCommentsCount] = await Promise.all([
    getPendingArticlesCount(clientId),
    getPendingCommentsCount(clientId),
  ]);

  return (
    <DashboardLayoutClient
      clientName={clientName}
      pendingArticlesCount={pendingArticlesCount}
      pendingCommentsCount={pendingCommentsCount}
    >
      {children}
    </DashboardLayoutClient>
  );
}
