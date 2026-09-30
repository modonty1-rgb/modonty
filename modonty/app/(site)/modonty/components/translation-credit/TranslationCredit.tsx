/**
 * Said once per page: the page's own line on what is machine-translated, and the disclaimer Google
 * requires in its own words (docs.cloud.google.com/translate/attribution). The badge itself sits by
 * each translated list. Used by every sector page that shows Google-translated text.
 */
export function TranslationCredit({ note }: { note: string }) {
  return (
    <div className="space-y-1.5 px-1">
      <p className="text-xs leading-relaxed text-muted-foreground">{note}</p>
      <p dir="ltr" lang="en" className="text-start text-xs leading-snug text-muted-foreground/80">
        THIS SERVICE MAY CONTAIN TRANSLATIONS POWERED BY GOOGLE. GOOGLE DISCLAIMS ALL WARRANTIES RELATED TO THE TRANSLATIONS,
        EXPRESS OR IMPLIED, INCLUDING ANY WARRANTIES OF ACCURACY, RELIABILITY, AND ANY IMPLIED WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
      </p>
    </div>
  );
}
