import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { IconLike, IconSaved, IconUsers } from "@/lib/icons";

const quickLinks = [
  { href: "/users/profile/favorites", label: "المحفوظات", icon: IconSaved },
  { href: "/users/profile/liked", label: "الإعجابات", icon: IconLike },
  { href: "/users/profile/following", label: "تتابع", icon: IconUsers },
];

const accountBenefits = [
  "عروض وخصومات",
  "هدايا وسحوبات",
  "فرص حجز مميزة",
  "عروض على مقاسك",
] as const;

// Server component: it only reads the session and picks one of two static layouts —
// no browser behaviour, so nothing here needs to hydrate (Next auth guide, "Auth checks
// in leaf components"). Reading the cookie makes it dynamic, and its <Suspense> in
// LeftSidebar keeps the rest of the page in the static shell. The catch mirrors
// SessionProviderWrapper: a stale/undecryptable cookie renders the signed-out card.
export async function UserCard() {
  const session = await auth().catch(() => null);
  const user = session?.user;

  if (!user) {
    // A plain card like every other one in the rail — no gradient, no glow (Khalid, 2026-08-16).
    return (
      <section className="rounded-lg bg-card p-3 ring-1 ring-primary/10 lg:p-4">
        <h2 className="text-base font-medium leading-snug text-foreground">مدونتي أحلى بحسابك</h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">عروض وفرص من شركاء مدونتي.</p>
        <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 lg:mt-3 lg:gap-y-2">
          {accountBenefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-1.5 text-[11px] font-normal leading-4 text-foreground/90">
              <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
              {benefit}
            </li>
          ))}
        </ul>
        {/* buttonVariants keeps the anchor's link role; <Button asChild> would force
            role="button" over it. shadcn docs, "As Link". */}
        <Link href="/users/register" className={buttonVariants({ className: "mt-3 min-h-11 w-full lg:mt-4" })}>إنشاء حساب</Link>
      </section>
    );
  }

  const fallback = user.name?.charAt(0) || user.email?.charAt(0) || "م";
  return (
    <section aria-label="ملفك الشخصي" className="overflow-hidden rounded-lg bg-card ring-1 ring-border">
      <div className="h-12 bg-gradient-to-bl from-primary via-secondary to-primary lg:h-14" aria-hidden />
      <div className="px-3 pb-3 text-center sm:px-5 sm:pb-4">
        <div className="-mt-7 flex flex-col items-center gap-1 lg:-mt-8">
          <Avatar className="size-14 border-4 border-card lg:size-16">
            <AvatarImage src={user.image || undefined} alt={user.name || ""} className="object-cover" />
            <AvatarFallback className="bg-primary text-lg font-bold text-primary-foreground">{fallback}</AvatarFallback>
          </Avatar>
          <Link href="/users/profile" className="mb-1 text-xs font-normal text-link hover:underline">شوف ملفك</Link>
        </div>
        <h2 className="mt-1.5 truncate text-base font-medium text-foreground lg:mt-2">{user.name || "مستخدم مدونتي"}</h2>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">ملفك واهتماماتك في مدونتي</p>
        <div className="mt-3 grid grid-cols-3 divide-x divide-x-reverse divide-border border-t pt-2.5 lg:mt-4 lg:pt-3">
          {quickLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex min-h-11 flex-col items-center justify-center gap-1 text-xs text-muted-foreground transition-colors sm:hover:text-link">
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
