import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PageContentEditor } from "./components/page-content-editor";
import { Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PageContentPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const client = await db.client.findUnique({
    where: { id: clientId },
    select: {
      services: true,
      teamMembers: true,
      achievements: true,
      credentials: true,
      introVideoUrl: true,
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          محتوى صفحتك
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          الخدمات والإنجازات والفريق والاعتمادات وفيديو التعريف — تظهر في صفحتك على
          مودونتي.
        </p>
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          <p className="text-xs leading-relaxed text-foreground">
            كل قسم اختياري — املأ اللي يخصّك. الصفوف الفارغة تُتجاهل تلقائياً. بعد
            الحفظ يتحدّث محتوى صفحتك وبيانات Google المهيكلة.
          </p>
        </div>
      </header>

      <PageContentEditor
        initial={{
          services: client?.services ?? [],
          teamMembers: client?.teamMembers ?? [],
          achievements: client?.achievements ?? [],
          credentials: client?.credentials ?? [],
          introVideoUrl: client?.introVideoUrl ?? null,
        }}
      />
    </div>
  );
}
