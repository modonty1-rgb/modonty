import ar from "@/messages/ar.json";

/**
 * Every visitor-facing string modonty writes itself, in one file — so changing a word is
 * one edit instead of six, and a second language later is a second file rather than a
 * hunt through JSX (Khalid, 2026-08-16).
 *
 * Deliberately NOT a runtime i18n system: no provider, no hook, no locale routing. The
 * JSON is imported at build time and read inside server components, so the page ships
 * zero extra JavaScript for it. When a second language is actually wanted, this same file
 * shape is what `next-intl` expects, and only the lookup changes.
 *
 * What does NOT belong here: anything the partner or the editor wrote — names,
 * descriptions, services, cities, article text. Those live in the database and need
 * language columns, not a message file.
 *
 * Extraction is page by page as the refactor reaches each one (Khalid: «page by page»);
 * `clients` and `booking` are done.
 */
export const messages = ar;

/** «مقال واحد» · «مقالان» · «٥ مقالات» · «١٢ مقالاً» — Arabic changes the noun with the number. */
export interface CountForms {
  one: string;
  two: string;
  few: string;
  many: string;
}

/**
 * Counts the way a person says them. `one` and `two` carry no digit on purpose — Arabic
 * says «مقال واحد», never «١ مقال».
 */
export function formatCount(count: number, forms: CountForms): string {
  if (count === 1) return forms.one;
  if (count === 2) return forms.two;
  const digits = count.toLocaleString("ar-SA");
  return count <= 10 ? `${digits} ${forms.few}` : `${digits} ${forms.many}`;
}

/** Fills `{name}` placeholders — the only templating a message file needs. */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}
