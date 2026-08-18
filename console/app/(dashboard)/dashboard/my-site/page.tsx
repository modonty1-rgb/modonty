import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getMySiteData } from "./helpers/get-my-site-data";
import { MySiteEditor } from "./components/my-site-editor";

export const dynamic = "force-dynamic";

export default async function MySitePage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const data = await getMySiteData(clientId);
  if (!data) redirect("/");

  const savedAt = data.updatedAt
    ? new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" }).format(
        data.updatedAt,
      )
    : null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">إعدادات الموقع</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          اللون والهيدر والفوتر — يظهر في كل صفحات موقعك.
          {savedAt && <span className="text-xs"> · آخر حفظ: {savedAt}</span>}
        </p>
      </header>

      <MySiteEditor initial={data} />
    </div>
  );
}
