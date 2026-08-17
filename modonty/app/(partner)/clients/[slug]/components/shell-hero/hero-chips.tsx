interface HeroChipsClient {
  foundingDate?: Date | null;
}

interface HeroChipsProps {
  client: HeroChipsClient;
}

/**
 * Founding-year trust cue under the tagline. Industry + location are intentionally
 * omitted — the tagline already carries them (getTagline), so repeating them as pills
 * was pure duplication. Hide-if-empty.
 */
export function HeroChips({ client }: HeroChipsProps) {
  const foundingYear = client.foundingDate
    ? new Date(client.foundingDate).getFullYear()
    : null;

  if (!foundingYear) return null;

  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-[11.5px] text-muted-foreground">
        🗓️ تأسست {foundingYear}
      </span>
    </div>
  );
}
