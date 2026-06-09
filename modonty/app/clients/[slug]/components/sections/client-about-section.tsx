import { SectionCard } from "@/app/clients/[slug]/components/sections/section-card";

import { ClientVideoEmbed } from "./client-video-embed";

interface AboutCredential {
  name: string;
  authority: string | null;
  year: string | null;
  url: string | null;
}

interface AboutLegal {
  legalName?: string | null;
  commercialRegistrationNumber?: string | null;
  legalForm?: string | null;
  vatID?: string | null;
  numberOfEmployees?: string | null;
  foundingDate?: Date | null;
  knowsLanguage?: string[];
}

interface ClientAboutSectionProps {
  videoUrl?: string | null;
  aboutText?: string | null;
  credentials: AboutCredential[];
  legal: AboutLegal;
}

/** One labelled legal row: emoji icon + small label + bold value. */
function LegalRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 text-primary" aria-hidden>
        {icon}
      </span>
      <div>
        <span className="block text-[10.5px] font-bold text-muted-foreground">{label}</span>
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
  aboutText,
  credentials,
  legal,
}: ClientAboutSectionProps) {
  const foundingYear =
    legal.foundingDate != null ? String(new Date(legal.foundingDate).getFullYear()) : null;
  const languages =
    legal.knowsLanguage && legal.knowsLanguage.length > 0 ? legal.knowsLanguage.join("، ") : null;

  const legalRows: Array<{ icon: string; label: string; value: string }> = [
    legal.legalName ? { icon: "🏛️", label: "الاسم القانوني", value: legal.legalName } : null,
    legal.commercialRegistrationNumber
      ? { icon: "📄", label: "السجل التجاري", value: legal.commercialRegistrationNumber }
      : null,
    legal.legalForm ? { icon: "⚖️", label: "الشكل القانوني", value: legal.legalForm } : null,
    legal.vatID ? { icon: "🧾", label: "الرقم الضريبي", value: legal.vatID } : null,
    legal.numberOfEmployees
      ? { icon: "👥", label: "حجم الشركة", value: legal.numberOfEmployees }
      : null,
    foundingYear ? { icon: "🗓️", label: "سنة التأسيس", value: foundingYear } : null,
    languages ? { icon: "🌐", label: "اللغات", value: languages } : null,
  ].filter((row): row is { icon: string; label: string; value: string } => row !== null);

  const hasVideo = Boolean(videoUrl);
  const hasText = Boolean(aboutText);
  const hasCreds = credentials.length > 0;
  const hasLegal = legalRows.length > 0;

  if (!hasText && !hasVideo && !hasCreds && !hasLegal) return null;

  return (
    <SectionCard id="about" icon="🏢" title="عن الشركة">
      {hasVideo && <ClientVideoEmbed url={videoUrl!} label="▶ فيديو تعريفي" />}

      {hasText && (
        <p className="text-[13px] leading-[1.8] text-foreground">{aboutText}</p>
      )}

      {hasCreds && (
        <div className="mt-4 flex flex-wrap gap-2">
          {credentials.map((cred, i) => (
            <span
              key={`${cred.name}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-star/30 bg-star/10 px-[11px] py-1.5 text-[11.5px] font-bold text-foreground/80"
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
