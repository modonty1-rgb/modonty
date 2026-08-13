"use client";

import Link from "@/components/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/components/providers/SessionContext";
import { IconLike, IconSaved, IconUsers } from "@/lib/icons";

const quickLinks = [
  { href: "/users/profile/favorites", label: "المحفوظات", icon: IconSaved },
  { href: "/users/profile/liked", label: "الإعجابات", icon: IconLike },
  { href: "/users/profile/following", label: "تتابع", icon: IconUsers },
];

const accountBenefits = [
  "عروض وخصومات من العملاء",
  "هدايا وسحوبات",
  "فرص حجز مميزة",
  "عروض تناسب اهتماماتك",
] as const;

export function HomeUserProfileCard() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) {
    return (
      <section className="relative overflow-hidden rounded-[1.35rem] border border-primary/30 bg-gradient-to-bl from-primary/25 via-card to-card p-4 shadow-[0_18px_34px_-28px_rgba(48,48,255,0.9)]">
        <span className="absolute -top-12 -start-10 h-28 w-28 rounded-full bg-accent/15 blur-2xl" aria-hidden />
        <h2 className="relative text-base font-bold leading-snug text-foreground">تجربة مدونتي أفضل بحسابك</h2>
        <p className="relative mt-1 text-xs leading-5 text-muted-foreground">عروض وفرص من عملاء مدونتي.</p>
        <ul className="relative mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
          {accountBenefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-1.5 text-[11px] font-semibold leading-4 text-foreground/90">
              <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
              {benefit}
            </li>
          ))}
        </ul>
        <Link href="/users/register" className="relative mt-4 block w-full rounded-xl bg-primary px-3 py-2.5 text-center text-sm font-bold text-primary-foreground shadow-[0_12px_24px_-14px_rgba(48,48,255,1)] transition-colors hover:bg-primary/90">أنشئ حسابًا</Link>
      </section>
    );
  }

  const fallback = user.name?.charAt(0) || user.email?.charAt(0) || "م";
  return (
    <section aria-label="ملفك الشخصي" className="overflow-hidden rounded-2xl border border-primary/10 bg-card shadow-[0_10px_30px_-22px_rgba(14,6,90,0.45)]">
      <div className="h-14 bg-gradient-to-bl from-primary via-secondary to-primary" aria-hidden />
      <div className="px-4 pb-4 text-center sm:px-5">
        <div className="-mt-8 flex flex-col items-center gap-1">
          <Avatar className="h-16 w-16 border-4 border-card shadow-sm">
            <AvatarImage src={user.image || undefined} alt={user.name || ""} className="object-cover" />
            <AvatarFallback className="bg-primary text-lg font-bold text-primary-foreground">{fallback}</AvatarFallback>
          </Avatar>
          <Link href="/users/profile" className="mb-1 text-xs font-semibold text-primary hover:underline">عرض الملف</Link>
        </div>
        <h2 className="mt-2 truncate text-base font-bold text-foreground">{user.name || "مستخدم مدونتي"}</h2>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">ملفك واهتماماتك في مدونتي</p>
        <div className="mt-4 grid grid-cols-3 divide-x divide-x-reverse divide-border border-t pt-3">
          {quickLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary">
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
