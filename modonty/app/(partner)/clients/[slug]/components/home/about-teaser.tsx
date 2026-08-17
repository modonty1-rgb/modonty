import Link from "next/link";
import dynamicImport from "next/dynamic";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import type { PartnerSite } from "../../helpers/get-partner-site";
import { SectionHeading } from "./section-heading";

// Video only mounts a player on click; the poster is server HTML.
const ClientVideoEmbed = dynamicImport(
  () => import("../sections/client-video-embed").then((m) => ({ default: m.ClientVideoEmbed })),
  { ssr: true },
);

interface AboutTeaserProps {
  site: PartnerSite;
  /** Ours first, the legacy external link only while one still exists. */
  videoUrl: string | null;
  videoPoster: string | null;
  base: string;
}

const YEAR_FMT = new Intl.DateTimeFormat("ar-SA", { year: "numeric" });

const LEGAL_FORM_AR: Record<string, string> = {
  "One-Person Company": "شركة الشخص الواحد",
  LLC: "ذات مسؤولية محدودة",
  "Sole Proprietorship": "مؤسسة فردية",
};

/**
 * «من هو» — the description, a video if he has one, four facts, and the team as faces.
 * The full story, credentials and team live on /about; this is the taste.
 */
export function AboutTeaser({ site, videoUrl, videoPoster, base }: AboutTeaserProps) {
  const text = (site.description || site.seoDescription || "").trim();
  if (!text && !videoUrl) return null;

  const facts: Array<[string, string]> = [];
  if (site.foundingDate) facts.push(["التأسيس", YEAR_FMT.format(site.foundingDate)]);
  if (site.legalForm) facts.push(["الكيان", LEGAL_FORM_AR[site.legalForm] ?? site.legalForm]);
  if (site.industry?.name) facts.push(["المجال", site.industry.name]);
  const team = site.teamMembers.filter((m) => m.name?.trim());
  if (team.length > 0) facts.push(["الفريق", team.map((m) => m.name).slice(0, 4).join(" · ")]);

  return (
    <section className="mx-auto max-w-[1216px] px-4">
      <div className={`grid items-center gap-10 ${videoUrl ? "lg:grid-cols-[1fr_1.1fr] lg:gap-14" : ""}`}>
        {videoUrl ? (
          <div className="overflow-hidden rounded-3xl bg-muted">
            <ClientVideoEmbed url={videoUrl} poster={videoPoster} label={`فيديو تعريفي — ${site.name}`} />
          </div>
        ) : null}
        <div>
          <SectionHeading eyebrow="من هو" title={site.name} />
          {text ? <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-muted-foreground">{text}</p> : null}
          {facts.length > 0 ? (
            <dl className="mt-6 grid gap-x-10 sm:grid-cols-2">
              {facts.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-border py-2.5 text-sm last:border-0 sm:[&:nth-last-child(2)]:border-0">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <div className="mt-6 flex items-center gap-4">
            {team.some((m) => m.photoUrl) ? (
              <span className="flex" aria-hidden>
                {team.filter((m) => m.photoUrl).slice(0, 4).map((m, i) => (
                  <span key={m.name} className={`relative size-10 overflow-hidden rounded-full bg-muted ring-2 ring-background ${i > 0 ? "-ms-3" : ""}`}>
                    <OptimizedImage media={asMedia(m.photoUrl!)} alt="" fill loading="lazy" sizes="40px" className="object-cover" />
                  </span>
                ))}
              </span>
            ) : null}
            <Link href={`${base}/about`} className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm text-foreground hover:border-primary">
              اقرأ عنه أكثر ›
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
