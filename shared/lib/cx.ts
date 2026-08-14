/**
 * Tiny class joiner.
 *
 * Deliberately NOT `tailwind-merge`: this package must stay dependency-free so any app
 * in the repo can pull it in without inheriting a version conflict. Every component here
 * puts the caller's `className` last, so a caller override still wins by CSS order.
 */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
