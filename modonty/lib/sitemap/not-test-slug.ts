import { isFixtureSlug } from "./is-fixture-slug";

export function notTestSlug<T extends { slug: string }>(e: T): boolean {
  return !isFixtureSlug(e.slug);
}
