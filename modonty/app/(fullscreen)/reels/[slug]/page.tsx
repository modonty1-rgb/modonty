import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buildHreflangLanguages } from "@modonty/shared/lib/seo/build-hreflang-languages";
import { jsonLdHtml } from "@/lib/seo";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";
import { SITE_URL } from "@/constants";
import { IconVideo } from "@/lib/icons";

import { getReelBySlug } from "./data/get-reel-by-slug";
import { generateReelVideoJsonld } from "./helpers/generate-reel-video-jsonld";
import { ReelWatchPlayer } from "./components/reel-watch-player";

interface ReelPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * The standalone, indexable watch page for one reel.
 *
 * Unlike the `/reels` feed — an app surface kept out of the index — this is the URL Google keeps:
 * one clip, one page, one VideoObject. Indexable on purpose (`index: true`), the opposite of the
 * feed's `noindex`.
 */
export async function generateMetadata({ params }: ReelPageProps): Promise<Metadata> {
  const { slug } = await params;
  const reel = await getReelBySlug(decodeURIComponent(slug));
  if (!reel) return { title: "ريل غير موجود — مُدَوَّنَتِي" };

  const canonical = `${SITE_URL}/reels/${encodeURIComponent(reel.slug)}`;
  const { alternateLanguages } = await getPageSeoDefaults();
  const description =
    reel.description || `ريل من ${reel.clientName} على مُدَوَّنَتِي.`;

  // A video shares its cover, a picture shares itself.
  const shareImage = reel.posterUrl ?? reel.imageUrl;

  return {
    title: `${reel.title} — ${reel.clientName}`,
    description,
    alternates: {
      canonical,
      languages: buildHreflangLanguages(alternateLanguages, canonical, SITE_URL),
    },
    openGraph: {
      title: reel.title,
      description,
      url: canonical,
      // An image reel is not a video, and saying so would promise players a file that is a
      // still picture.
      type: reel.isVideo ? "video.other" : "article",
      // `posterUrl` is a video's cover and is null for an image reel — the share card for
      // every picture reel went out with no image at all until this fell back to the reel's
      // own file (measured 25 Aug 2026 on a freshly published image reel: og:image absent).
      ...(shareImage && { images: [{ url: shareImage, alt: reel.title }] }),
    },
    twitter: {
      card: shareImage ? "summary_large_image" : "summary",
      title: reel.title,
      description,
      ...(shareImage && { images: [shareImage] }),
    },
  };
}

export default async function ReelWatchPage({ params }: ReelPageProps) {
  const { slug } = await params;
  const reel = await getReelBySlug(decodeURIComponent(slug));
  if (!reel) notFound();

  const jsonld = generateReelVideoJsonld(reel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950">
      {jsonld && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonld) }} />
      )}

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4">
        <Link
          href="/reels"
          className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-black/40 px-4 py-1.5 text-sm font-bold text-white backdrop-blur transition hover:bg-black/60"
        >
          <IconVideo className="size-4" aria-hidden />
          كل الريلز
        </Link>
      </header>

      <div className="h-full p-3">
        <ReelWatchPlayer reel={reel} />
      </div>

      {/* Attribution below the header, above the clip's own gradient — the watch page carries the
          partner link the same way the feed does. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 mx-auto max-w-[420px] bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 pt-20">
        <Link
          href={`/clients/${reel.clientSlug}`}
          className="pointer-events-auto mb-2 flex w-fit items-center gap-2 rounded-full bg-white/10 py-1 pe-4 ps-1 backdrop-blur transition hover:bg-white/20"
        >
          <span className="text-sm font-bold text-white">{reel.clientName}</span>
        </Link>
        <h1 className="text-lg font-extrabold text-white">{reel.title}</h1>
        {reel.description && <p className="mt-1 text-sm text-neutral-300">{reel.description}</p>}
      </div>
    </div>
  );
}
