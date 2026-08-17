import { IconFileCheck } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { messages } from "@/lib/i18n/messages";

interface TrustNoteProps {
  /** A named licence or accreditation — «ISO 9001», «عضوية الجمعية الأمريكية…». */
  credential?: string | null;
  /** He uploaded his official record image, without naming an accreditation. */
  hasVerifiedPapers?: boolean;
  className?: string;
}

/**
 * The paperwork we checked, in one line. A named credential always beats the generic
 * phrase, and the generic phrase beats silence — because «أثق فيه؟» is the second thing
 * every visitor asks and most partners have papers long before they have reviews
 * (measured 2026-08-16: 4 partners with papers, 0 with a single approved review).
 * Renders nothing when there is nothing verified — never a placeholder.
 */
export function TrustNote({ credential, hasVerifiedPapers, className }: TrustNoteProps) {
  const label = credential?.trim() || (hasVerifiedPapers ? messages.shared.badges.verifiedLicenseLabel : null);
  if (!label) return null;

  return (
    <span className={cn("inline-flex items-center gap-1 font-medium text-foreground", className)}>
      <IconFileCheck className="h-3.5 w-3.5 text-link-accent" aria-hidden />
      {label}
    </span>
  );
}
