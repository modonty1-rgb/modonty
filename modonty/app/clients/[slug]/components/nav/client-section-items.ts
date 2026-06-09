export type SectionItem = { id: string; label: string };

/** Keep only sections whose anchor element actually exists in the DOM. */
export function filterPresentSections(
  items: SectionItem[],
  presentIds: ReadonlySet<string>
): SectionItem[] {
  return items.filter((item) => presentIds.has(item.id));
}
