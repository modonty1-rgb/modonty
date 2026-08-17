import type { Metadata } from "next";

export const metadata: Metadata = { title: "استمع", description: "مقالات مدونتي الصوتية" };

export default function AudioArticlesPage() {
  return <main className="container mx-auto max-w-3xl px-4 py-8"><h1 className="text-2xl font-bold">استمع إلى المقالات</h1></main>;
}
