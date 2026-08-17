import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconBriefcase } from "@/lib/icons";
import { getPartnerSite } from "../../helpers/get-partner-site";
import { PageFrame } from "../../components/page-frame";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const site = await getPartnerSite(decodeURIComponent(slug));
  if (!site) return { title: "غير موجود" };
  return {
    title: `خدمات ${site.name}`.slice(0, 51),
    description: `كل خدمات ${site.name}${site.addressCity ? ` في ${site.addressCity}` : ""} — واطلب اتصالاً مباشرة.`,
  };
}

/** «خدماته» — every service as a card; each one points at the request card on the home page. */
export default async function ClientServicesPage({ params }: PageProps) {
  const { slug } = await params;
  const site = await getPartnerSite(decodeURIComponent(slug));
  if (!site) notFound();
  const items = site.services.filter((s) => s.title?.trim());
  if (items.length === 0) notFound();
  const base = `/clients/${encodeURIComponent(site.slug)}`;

  return (
    <PageFrame siteName={site.name} base={base} eyebrow="ماذا يقدّم" title="خدماته">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => (
          <div key={s.title} className="rounded-2xl border border-border bg-card p-6">
            <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-2xl text-primary" aria-hidden>
              {s.icon?.trim() ? s.icon : <IconBriefcase className="h-6 w-6" />}
            </span>
            <h2 className="mt-4 text-lg font-bold text-foreground">{s.title}</h2>
            {s.description?.trim() ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p> : null}
            <Link href={`${base}#request`} className="mt-4 inline-block text-sm text-primary hover:underline underline-offset-4">
              اطلب هذه الخدمة ›
            </Link>
          </div>
        ))}
      </div>
    </PageFrame>
  );
}
