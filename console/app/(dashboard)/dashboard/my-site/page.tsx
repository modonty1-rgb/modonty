import { redirect } from "next/navigation";
import { getHomeData } from "@modonty/shared/lib/partner-site";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMySiteData } from "@/lib/my-site/get-my-site-data";
import { buildMissingData } from "@/lib/my-site/build-missing-data";
import { SiteBuilder } from "./components/site-builder";

export const dynamic = "force-dynamic";

export default async function MySitePage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const [data, home] = await Promise.all([getMySiteData(clientId), getHomeData(db, { id: clientId })]);
  if (!data || !home) redirect("/");

  // بلا عنوان صفحة: اسم الشاشة في السايدبار، والمساحة فوق للمعاينة (خالد ٣٠ أغسطس).
  return <SiteBuilder initial={data} missing={buildMissingData(home.data)} />;
}
