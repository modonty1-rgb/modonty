import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NextImage from "next/image";
import { ClientCtaMode } from "@prisma/client";

import Link from "@/components/link";
import { IconChevronRight, IconCheck, IconClients } from "@/lib/icons";
import { BRAND_AVATAR_RADIUS } from "@/lib/brand-avatar";
import { stripCloudinaryTransforms } from "@/lib/image-utils";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { BookingForm } from "@/app/articles/[slug]/components/booking-form";
import type { BookingSource } from "@/app/articles/[slug]/actions/booking-actions";
import { getDisclaimerSections } from "@/app/articles/[slug]/helpers/booking-disclaimer";

const VALID_SOURCES: readonly BookingSource[] = [
  "article_dock",
  "article_card",
  "client_page",
  "client_list",
];

function resolveSource(raw: string | undefined): BookingSource {
  return VALID_SOURCES.includes(raw as BookingSource) ? (raw as BookingSource) : "client_page";
}

// Conversion page — no SEO value; keep it out of the index.
export const metadata: Metadata = {
  title: "احجز الآن",
  robots: { index: false, follow: true },
};

export default async function ClientBookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ source?: string; article?: string }>;
}) {
  const { slug: rawSlug } = await params;
  const { source: rawSource, article: articleId } = await searchParams;
  // Next passes Arabic slugs URL-encoded — decode to match the stored slug.
  const slug = decodeURIComponent(rawSlug);
  const source = resolveSource(rawSource);

  const client = await db.client.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      ctaMode: true,
      isYmyl: true,
      ymylCategory: true,
      logoMedia: { select: { url: true, altText: true } },
    },
  });

  // Booking exists only for FORM-mode clients — anything else is a 404.
  if (!client || client.ctaMode !== ClientCtaMode.FORM) {
    notFound();
  }

  const session = await auth();
  const user = session?.user
    ? { name: session.user.name ?? null, email: session.user.email ?? null }
    : null;

  const logoSrc = client.logoMedia?.url
    ? stripCloudinaryTransforms(client.logoMedia.url) ?? client.logoMedia.url
    : null;

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6" dir="rtl">
      <Link
        href={`/clients/${encodeURIComponent(client.slug)}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <IconChevronRight className="h-4 w-4" aria-hidden />
        رجوع إلى {client.name}
      </Link>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Header — provider identity + trust (logo + verified mark) */}
        <div className="flex flex-col items-center gap-3 border-b border-border bg-gradient-to-b from-primary/[0.07] to-transparent px-5 pb-5 pt-7 text-center">
          <span className="relative inline-block">
            <span
              className={cn(
                "grid size-20 place-items-center overflow-hidden bg-background shadow-md ring-2 ring-primary/40",
                BRAND_AVATAR_RADIUS
              )}
            >
              {logoSrc ? (
                <NextImage
                  src={logoSrc}
                  alt={client.logoMedia?.altText || client.name}
                  width={80}
                  height={80}
                  className="size-full object-contain p-2"
                  sizes="80px"
                />
              ) : (
                <IconClients className="size-9 text-primary" />
              )}
            </span>
            {/* Verified by Modonty */}
            <span
              className="absolute -bottom-0.5 -start-0.5 grid size-6 place-items-center rounded-full border-2 border-background bg-accent text-white"
              title="موثّق من مدوّنتي"
              aria-hidden
            >
              <IconCheck className="size-3.5" />
            </span>
          </span>
          <div>
            <h1 className="text-lg font-bold leading-tight">احجز موعدك مع {client.name}</h1>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              عبّي بياناتك ونوصل طلبك مباشرة — يردّون عادةً خلال ساعات العمل.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="p-5">
          <BookingForm
            clientId={client.id}
            articleId={articleId ?? null}
            source={source}
            clientName={client.name}
            user={user}
            submitLabel="تأكيد الحجز"
            requireDisclaimer={client.isYmyl}
            disclaimerSections={client.isYmyl ? getDisclaimerSections(client.ymylCategory) : undefined}
          />
        </div>
      </div>
    </div>
  );
}
