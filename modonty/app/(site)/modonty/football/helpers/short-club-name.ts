/**
 * «نادي الهلال» → «الهلال» · «النادي الأهلي (السعودية)» → «الأهلي» · «نادي الفيصلي لكرة القدم» → «الفيصلي».
 *
 * Wikidata labels are encyclopedia titles; a table row reads the way fans say the name.
 */
export function shortClubName(label: string): string {
  return label
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/^(النادي|نادي)\s+/, "")
    .replace(/\s+(السعودي|لكرة القدم)$/, "")
    .replace(/\s+/g, " ")
    .trim();
}
