import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PageContentEditor } from "./components/page-content-editor";

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
      introVideoMedia: {
        select: {
          mp4Url: true,
          thumbnailUrl: true,
          durationSec: true,
          title: true,
          description: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          محتوى الموقع
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">مرتَّب حسب الصفحة اللي يظهر فيها. كل قسم اختياري.</p>
      </header>

      <PageContentEditor
        initial={{
          services: client?.services ?? [],
          teamMembers: client?.teamMembers ?? [],
          achievements: client?.achievements ?? [],
          credentials: client?.credentials ?? [],
          introVideoUrl: client?.introVideoUrl ?? null,
          introVideo: client?.introVideoMedia ?? null,
        }}
      />
    </div>
  );
}
