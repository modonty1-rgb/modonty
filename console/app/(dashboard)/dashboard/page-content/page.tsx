import { redirect } from "next/navigation";
import { getHomeData } from "@modonty/shared/lib/partner-site";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildPageView, type BlockView } from "@/lib/my-site/build-page-view";
import { BLOCKS_PAGES, type BlocksPage } from "@/lib/my-site/page-keys";
import { PageContentEditor } from "./components/page-content-editor";

export const dynamic = "force-dynamic";

export default async function PageContentPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  // متوازيان: قراءة صفّ التحرير وقراءة ما يراه الزائر لا يعتمد أحدهما على الآخر.
  const [client, home] = await Promise.all([
    db.client.findUnique({
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
    }),
    getHomeData(db, { id: clientId }),
  ]);
  if (!home) redirect("/");

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
        views={
          Object.fromEntries(
            BLOCKS_PAGES.map((p) => [p, buildPageView(home.data, p)])
          ) as Record<BlocksPage, BlockView[]>
        }
        chrome={{
          name: home.data.name,
          logoUrl: home.data.hero.logoUrl,
          phone: home.data.phone,
          hero: {
            slogan: home.data.hero.slogan,
            description: home.data.hero.description,
            coverUrl: home.data.hero.coverUrl,
          },
        }}
      />
    </div>
  );
}
