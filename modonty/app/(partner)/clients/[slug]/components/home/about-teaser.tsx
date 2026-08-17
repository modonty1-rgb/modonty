import Link from "next/link";
import dynamicImport from "next/dynamic";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { IconAward } from "@/lib/icons";
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
 * «تعرّف عليه» — the first block after the hero, because the visitor's first question is
 * "who is this?": their intro video (large), their own words, credentials, a few facts,
 * the team's faces. Industry-neutral on purpose (doctor today, shop tomorrow).
 * Adapts to what the partner filled in the console: video + text · text only · or hidden.
 */
export function AboutTeaser({ site, videoUrl, videoPoster, base }: AboutTeaserProps) {
  const text = (site.description || site.seoDescription || "").trim();
  const credentials = site.credentials.filter((c) => c.name?.trim());
  const team = site.teamMembers.filter((m) => m.name?.trim());
  if (!text && !videoUrl && credentials.length === 0) return null;

  const facts: Array<[string, string]> = [];
  if (site.foundingDate) facts.push(["التأسيس", YEAR_FMT.format(site.foundingDate)]);
  if (site.legalForm) facts.push(["الكيان", LEGAL_FORM_AR[site.legalForm] ?? site.legalForm]);
  if (site.industry?.name) facts.push(["المجال", site.industry.name]);
  if (team.length > 0) facts.push(["الفريق", team.map((m) => m.name).slice(0, 4).join(" · ")]);

  return (
    <section className="mx-auto max-w-[1216px] px-4">
      <div className={`grid items-start gap-10 ${videoUrl ? "lg:grid-cols-[1.15fr_1fr] lg:gap-14" : ""}`}>
        {videoUrl ? (
          <div className="overflow-hidden rounded-lg bg-muted ring-1 ring-border">
            <ClientVideoEmbed url={videoUrl} poster={videoPoster} label={`تعرّف على ${site.name} في دقيقة`} />
          </div>
        ) : null}

        <div>
          <SectionHeading eyebrow="تعرّف عليه" title={site.name} />
          {text ? <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-foreground/85">{text}</p> : null}

          {credentials.length > 0 ? (
            <ul className="mt-6 space-y-2">
              {credentials.slice(0, 4).map((c) => (
                <li key={c.name} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <IconAward className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span>
                    <span className="text-foreground">{c.name}</span>
                    {c.authority || c.year ? (
                      <span className="text-muted-foreground"> — {[c.authority, c.year].filter(Boolean).join(" · ")}</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {facts.length > 0 ? (
            <dl className="mt-6 grid gap-x-10 sm:grid-cols-2">
              {facts.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-border py-2.5 text-sm">
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
            <Link href={`${base}/about`} className="inline-flex h-10 items-center rounded-full px-5 text-sm text-foreground ring-1 ring-inset ring-border hover:ring-primary">
              اقرأ عنه أكثر ›
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
