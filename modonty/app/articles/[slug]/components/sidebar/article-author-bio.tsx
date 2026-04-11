import { cacheTag, cacheLife } from "next/cache";
import Link from "@/components/link";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IconChevronLeft } from "@/lib/icons";
import { SocialFacebookOutline } from "@/components/icons/facebook";
import { Linkedin } from "@/components/icons/linkedin";
import { Youtube } from "@/components/icons/youtube";
import { Twitter } from "@/components/icons/twitter";
import { Instagram } from "@/components/icons/instagram";
import { TiktokLogoLight } from "@/components/icons/tiktok";
import { RoundSnapchat } from "@/components/icons/snapchat";
import { db } from "@/lib/db";
import type { ComponentType, SVGProps } from "react";

const platformSocialIconClass =
  "inline-flex shrink-0 items-center justify-center p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const SOCIAL_CONFIG: { key: string; field: string; label: string; icon: IconComponent }[] = [
  { key: "facebook",  field: "facebookUrl",  label: "فيسبوك",      icon: SocialFacebookOutline },
  { key: "linkedin",  field: "linkedInUrl",  label: "لينكد إن",    icon: Linkedin },
  { key: "youtube",   field: "youtubeUrl",   label: "يوتيوب",      icon: Youtube },
  { key: "twitter",   field: "twitterUrl",   label: "إكس / تويتر", icon: Twitter },
  { key: "instagram", field: "instagramUrl", label: "انستغرام",    icon: Instagram },
  { key: "tiktok",    field: "tiktokUrl",    label: "تيك توك",     icon: TiktokLogoLight },
  { key: "snapchat",  field: "snapchatUrl",  label: "سناب شات",    icon: RoundSnapchat },
];

async function getPlatformSocialLinks(): Promise<{ key: string; href: string; label: string; icon: IconComponent }[]> {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");

  const settings = await db.settings.findFirst({
    select: {
      facebookUrl: true,
      linkedInUrl: true,
      youtubeUrl: true,
      twitterUrl: true,
      instagramUrl: true,
      tiktokUrl: true,
      snapchatUrl: true,
    },
  });

  if (!settings) return [];

  return SOCIAL_CONFIG
    .map(({ key, field, label, icon }) => ({ key, href: (settings as Record<string, string | null>)[field] ?? "", label, icon }))
    .filter(item => !!item.href);
}

interface ArticleAuthorBioProps {
  author: {
    name: string;
    slug: string | null;
    image: string | null;
    jobTitle: string | null;
    bio: string | null;
    credentials: string[];
    expertiseAreas: string[];
    linkedIn: string | null;
    twitter: string | null;
    facebook: string | null;
  };
}

export async function ArticleAuthorBio({ author }: ArticleAuthorBioProps) {
  const authorSocial: { key: string; href: string; label: string; icon: IconComponent }[] = [
    author.linkedIn ? { key: "author-linkedin", href: author.linkedIn, label: "لينكد إن الكاتب", icon: Linkedin } : null,
    author.twitter ? { key: "author-twitter", href: author.twitter, label: "إكس الكاتب", icon: Twitter } : null,
    author.facebook ? { key: "author-facebook", href: author.facebook, label: "فيسبوك الكاتب", icon: SocialFacebookOutline } : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  const platformSocial = await getPlatformSocialLinks();

  return (
    <section className="my-0" aria-labelledby="author-heading">
      <h2 id="author-heading" className="sr-only">عن الكاتب</h2>
      <Card className="min-w-0 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-muted/40 rounded-t-lg">
          <span className="text-xs font-semibold text-muted-foreground tracking-tight">عن الكاتب</span>
        </div>
        <div className="border-b border-border" />

        {/* Avatar + Name */}
        <div className="px-4 py-3 flex items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/20">
            <AvatarImage src={author.image ?? undefined} alt={author.name} />
            <AvatarFallback className="text-sm bg-primary text-primary-foreground font-semibold">
              {author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            {author.slug ? (
              <Link
                href={`/authors/${author.slug}`}
                className="text-sm font-semibold text-primary hover:text-primary/90 transition-colors truncate block"
              >
                {author.name}
              </Link>
            ) : (
              <span className="text-sm font-semibold truncate block">{author.name}</span>
            )}
            {author.jobTitle && (
              <p className="text-xs text-muted-foreground truncate">{author.jobTitle}</p>
            )}
          </div>
        </div>

        {/* Bio */}
        {author.bio && (
          <>
            <div className="border-t border-border" />
            <div className="px-4 py-2">
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{author.bio}</p>
            </div>
          </>
        )}

        {/* Social + CTA */}
        {(authorSocial.length > 0 || platformSocial.length > 0 || author.slug) && (
          <>
            <div className="border-t border-border" />
            <div className="px-4 py-2 flex items-center justify-between gap-2">
              <nav className="flex flex-wrap gap-0.5" aria-label="تابعنا على وسائل التواصل">
                {[...authorSocial, ...platformSocial].map(({ key, href, label, icon: Icon }) => (
                  <Link
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={platformSocialIconClass}
                    aria-label={label}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                ))}
              </nav>
              {author.slug && (
                <Button asChild size="sm" variant="outline" className="h-7 text-xs px-2 shrink-0">
                  <Link href={`/authors/${author.slug}`} className="inline-flex items-center gap-1">
                    صفحة الكاتب
                    <IconChevronLeft className="h-3 w-3 ltr:rotate-180" aria-hidden />
                  </Link>
                </Button>
              )}
            </div>
          </>
        )}
      </Card>
    </section>
  );
}
