import { messages } from "@/lib/i18n/messages";

const t = messages.modonty.ai;

/**
 * Said once per page: that the Arabic lines are machine-translated, and the disclaimer Google requires
 * in its own words (docs.cloud.google.com/translate/attribution). The badge itself sits by each list.
 */
export function TranslationCredit() {
  return (
    <div className="space-y-1.5 px-1">
      <p className="text-xs leading-relaxed text-muted-foreground">{t.translatedNote}</p>
      <p dir="ltr" lang="en" className="text-start text-[10px] leading-snug text-muted-foreground/80">
        THIS SERVICE MAY CONTAIN TRANSLATIONS POWERED BY GOOGLE. GOOGLE DISCLAIMS ALL WARRANTIES RELATED TO THE TRANSLATIONS,
        EXPRESS OR IMPLIED, INCLUDING ANY WARRANTIES OF ACCURACY, RELIABILITY, AND ANY IMPLIED WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
      </p>
    </div>
  );
}
