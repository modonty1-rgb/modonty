import { redirect } from "next/navigation";
import { getHomeData } from "@modonty/shared/lib/partner-site";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMySiteData } from "@/lib/my-site/get-my-site-data";
import { buildMissingData } from "@/lib/my-site/build-missing-data";
import { isBlocksPage } from "@/lib/my-site/page-keys";
import { SiteBuilder } from "./components/site-builder";

export const dynamic = "force-dynamic";

export default async function MySitePage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const [data, home, sp] = await Promise.all([getMySiteData(clientId), getHomeData(db, { id: clientId }), searchParams]);
  if (!data || !home) redirect("/");

  // بلا عنوان صفحة: اسم الشاشة في السايدبار، والمساحة فوق للمعاينة (خالد ٣٠ أغسطس).
  // `?p=` — «شوف النتيجة» in «محتوى الموقع» opens the builder on the page being edited.
  // The h1 is for screen readers and the page outline only — no visible title, as decided above.
  return (
    <>
      <h1 className="sr-only">تصميم الموقع</h1>
      <SiteBuilder initial={data} missing={buildMissingData(home.data)} initialPage={isBlocksPage(sp.p) ? sp.p : "home"} />
    </>
  );
}
