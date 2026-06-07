import { redirect } from "next/navigation";
import { ShieldCheck, AlertTriangle } from "lucide-react";

import { YmylCategory } from "@prisma/client";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { YmylSection } from "../profile/components/ymyl-section";

export const dynamic = "force-dynamic";

export default async function VerificationPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) return null;

  const client = await db.client.findUnique({
    where: { id: clientId },
    select: {
      name: true,
      isYmyl: true,
      ymylCategory: true,
      ymylData: true,
      addressCountry: true,
    },
  });

  // Guard direct URL access for non-YMYL clients — the sidebar link is hidden anyway.
  if (!client || !client.isYmyl) {
    redirect("/dashboard");
  }

  // Licensing authorities for THIS client's country + category, from the
  // admin-managed Reference Data. Empty until the client sets their country.
  const authorities =
    client.addressCountry && client.ymylCategory
      ? await db.licensingAuthority.findMany({
          where: {
            isActive: true,
            countryCode: client.addressCountry,
            category: client.ymylCategory as YmylCategory,
          },
          orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
          select: { code: true, nameAr: true },
        })
      : [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          التوثيق المهني
        </h1>
        <p className="text-muted-foreground mt-1">
          أكمل بيانات توثيقك المهني لتفعيل نشر مقالاتك.
        </p>
      </header>

      {/* Prominent gate CTA — this verification blocks article publishing */}
      <div className="flex items-start gap-4 rounded-xl border border-amber-300 bg-amber-50 p-5 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-amber-900">
              هذا التوثيق مطلوب قبل نشر مقالاتك الطبية / القانونية / المالية
            </h2>
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          </div>
          <p className="text-sm leading-relaxed text-amber-800">
            مجالك يتطلب إثبات مصداقيتك المهنية لـ Google قبل أن ننشر محتواك. أكمل
            الحقول بالأسفل الآن — كلما كانت بياناتك أوضح، زادت ثقة محركات البحث في
            مقالاتك وارتفع ترتيبها.
          </p>
        </div>
      </div>

      <YmylSection
        isYmyl={client.isYmyl}
        ymylCategory={client.ymylCategory}
        ymylData={(client.ymylData ?? null) as Record<string, unknown> | null}
        country={client.addressCountry}
        authorities={authorities}
      />
    </div>
  );
}
