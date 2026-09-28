import { cacheLife, cacheTag } from "next/cache";

export interface FreeCourse {
  title: string;
  summary: string;
  url: string;
  minutes: number;
}

const CATALOG = "https://learn.microsoft.com/api/catalog/?locale=ar-sa&type=learningPaths";
const LIMIT = 6;

/**
 * Free Arabic learning paths from Microsoft Learn's public catalog API — no key, no charge, and
 * made for this: «Learning providers use the Learn Catalog API to pull catalog information and post
 * it in their customer learning experiences» (learn.microsoft.com/training/support/catalog-api).
 * Beginner paths with an Arabic title, most popular first (726 Arabic paths, 28 Sep 2026). Kept a
 * day; a failed call throws rather than caching an empty list.
 */
export async function getFreeCourses(): Promise<FreeCourse[]> {
  "use cache";
  cacheTag("education-free-courses");
  cacheLife("days");

  const res = await fetch(CATALOG);
  if (!res.ok) throw new Error(`Microsoft Learn catalog ${res.status}`);
  const { learningPaths = [] } = (await res.json()) as {
    learningPaths?: { title: string; summary?: string; url: string; duration_in_minutes?: number; levels?: string[]; popularity?: number }[];
  };
  return learningPaths
    .filter((p) => /[؀-ۿ]/.test(p.title) && p.levels?.includes("beginner"))
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
    .slice(0, LIMIT)
    .map((p) => ({ title: p.title, summary: p.summary ?? "", url: p.url, minutes: p.duration_in_minutes ?? 0 }));
}
