import { permanentRedirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Single-page rebuild: «الموقع والتواصل» is now a section on the main client page.
// 308 permanent redirect preserves SEO equity from the old sub-route.
export default async function ClientContactPage({ params }: PageProps) {
  const { slug } = await params;
  permanentRedirect(`/clients/${slug}`);
}
