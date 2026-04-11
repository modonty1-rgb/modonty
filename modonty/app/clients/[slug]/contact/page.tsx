import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClientPageData } from "../helpers/client-page-data";
import { ContactForm } from "@/app/contact/components/contact-form";
import { auth } from "@/lib/auth";

interface ClientContactPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ClientContactPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getClientPageData(slug);
  if (!data) return { title: "غير موجود" };
  return {
    title: `تواصل مع ${data.client.name}`.slice(0, 51),
    description: `أرسل رسالة أو استفسار لـ ${data.client.name}`,
  };
}

export default async function ClientContactPage({ params }: ClientContactPageProps) {
  const { slug } = await params;

  const [data, session] = await Promise.all([
    getClientPageData(slug),
    auth(),
  ]);

  if (!data) {
    notFound();
  }

  const { client } = data;
  const defaultName = session?.user?.name ?? null;
  const defaultEmail = session?.user?.email ?? null;

  return (
    <div className="w-full">
      <section aria-labelledby="client-contact-heading" className="space-y-4">
        <h2
          id="client-contact-heading"
          className="text-xl font-semibold leading-snug text-foreground"
        >
          تواصل مع الشركة
        </h2>
        <p className="text-muted-foreground">
          أرسل رسالتك وسنقوم بالرد عليك في أقرب وقت ممكن.
        </p>
        <ContactForm clientId={client.id} defaultName={defaultName} defaultEmail={defaultEmail} />
      </section>
    </div>
  );
}
