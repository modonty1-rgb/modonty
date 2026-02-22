import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const TAB_TO_SEGMENT: Record<string, string> = {
  intake: "intake",
  competitors: "competitors",
  keywords: "keywords",
};

export default async function SeoPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const params = await searchParams;
  const tab = params.tab?.toLowerCase();
  const segment = tab && TAB_TO_SEGMENT[tab] ? TAB_TO_SEGMENT[tab] : "intake";
  redirect(`/dashboard/seo/${segment}`);
}
