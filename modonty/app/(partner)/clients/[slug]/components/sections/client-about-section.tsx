import { SectionCard } from "./section-card";
import { buildLegalRows, type AboutLegal } from "../../helpers/build-legal-rows";

import { ClientVideoEmbed } from "./client-video-embed";

interface AboutCredential {
  name: string;
  authority: string | null;
  year: string | null;
  url: string | null;
}

interface ClientAboutSectionProps {
  videoUrl?: string | null;
  /** Bunny cover — only our own videos have one; an external link never did. */
  videoPoster?: string | null;
  aboutText?: string | null;
  credentials: AboutCredential[];
  legal: AboutLegal;
}

/** One labelled legal row: emoji icon + small label + bold value. */
function LegalRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 text-[hsl(var(--primary-ink,var(--primary)))]" aria-hidden>
        {icon}
      </span>
      <div>
        <span className="block text-xs font-bold text-muted-foreground">{label}</span>
        <span className="text-[13px] font-bold text-foreground">{value}</span>
      </div>
    </div>
  );
}

/**
 * «عن الشركة» section — intro video (lazy facade) + about paragraph + credential
 * chips + official legal data rows. Each piece is hidden when its data is
 * absent; the whole section returns null when there is nothing to show.
 */
export function ClientAboutSection({
  videoUrl,
  videoPoster,
  aboutText,
  credentials,
  legal,
}: ClientAboutSectionProps) {
  const legalRows = buildLegalRows(legal);

  const hasVideo = Boolean(videoUrl);
  const hasText = Boolean(aboutText);
  const hasCreds = credentials.length > 0;
  const hasLegal = legalRows.length > 0;

  if (!hasText && !hasVideo && !hasCreds && !hasLegal) return null;

  return (
    <SectionCard id="about" icon="🏢" title="عن الشركة">
      {hasVideo && <ClientVideoEmbed url={videoUrl!} poster={videoPoster ?? null} label="▶ فيديو تعريفي" />}

      {hasText && (
        <p className="text-[13px] leading-[1.8] text-foreground">{aboutText}</p>
      )}

      {hasCreds && (
        <div className="mt-4 flex flex-wrap gap-2">
          {credentials.map((cred, i) => (
            <span
              key={`${cred.name}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-star/30 bg-star/10 px-[11px] py-1.5 text-xs font-bold text-foreground/80"
            >
              🏅 {cred.name}
              {cred.authority && <span> · {cred.authority}</span>}
            </span>
          ))}
        </div>
      )}

      {hasLegal && (
        <div className="mt-4 flex flex-col gap-3">
          {legalRows.map((row) => (
            <LegalRow key={row.label} icon={row.icon} label={row.label} value={row.value} />
          ))}
        </div>
      )}
    </SectionCard>
  );
}
