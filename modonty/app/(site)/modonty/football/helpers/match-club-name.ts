/** Words every source adds around the name and nobody uses to tell clubs apart. */
const NOISE = new Set(["al", "fc", "sfc", "sc", "club", "saudi", "jeddah"]);

const core = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w && !NOISE.has(w))
    .join("");

function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = temp;
    }
  }
  return row[b.length];
}

/**
 * The value stored under the closest club name in `byName` — used both ways between our two
 * sources: API-Football's name → Wikipedia's Arabic name, and Wikipedia's name → API-Football's
 * crest.
 *
 * The sources spell clubs differently — «Al-Hilal Saudi FC» and «Al-Hilal», «Al Taawon» and
 * «Al-Taawoun», «Al-Qadisiyah FC» and «Al-Qadsiah» — and neither has an id the other knows.
 * So names are reduced to their core («hilal», «taawoun») and the closest wins, within two
 * letters; on a tie the entry listed first wins. No match returns null, and the caller falls
 * back rather than showing a wrong club.
 */
export function matchClubName(name: string, byName: Record<string, string>): string | null {
  const target = core(name);
  if (!target) return null;
  let best: { value: string; score: number } | null = null;
  for (const [candidateName, value] of Object.entries(byName)) {
    const candidate = core(candidateName);
    if (!candidate) continue;
    const score = candidate === target ? 0 : candidate.includes(target) || target.includes(candidate) ? 1 : distance(candidate, target);
    if (!best || score < best.score) best = { value, score };
  }
  return best && best.score <= 2 ? best.value : null;
}
