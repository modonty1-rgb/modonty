import Link from "@/components/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { SocialFacebookOutline } from "@/components/icons/facebook";
import { Linkedin } from "@/components/icons/linkedin";
import { Youtube } from "@/components/icons/youtube";
import { Twitter } from "@/components/icons/twitter";
import { Instagram } from "@/components/icons/instagram";
import { TiktokLogoLight } from "@/components/icons/tiktok";
import { RoundSnapchat } from "@/components/icons/snapchat";
import type { ComponentType, SVGProps } from "react";

const platformSocialIconClass =
  "inline-flex shrink-0 items-center justify-center p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

function getPlatformSocialLinks(): { key: string; href: string; label: string; icon: IconComponent }[] {
  const items: { key: string; href: string | undefined; label: string; icon: IconComponent }[] = [
    { key: "facebook", href: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL, label: "فيسبوك", icon: SocialFacebookOutline },
    { key: "linkedin", href: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_URL, label: "لينكد إن", icon: Linkedin },
    { key: "youtube", href: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE_URL, label: "يوتيوب", icon: Youtube },
    { key: "twitter", href: process.env.NEXT_PUBLIC_SOCIAL_TWITTER_X_URL, label: "إكس / تويتر", icon: Twitter },
    { key: "instagram", href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL, label: "انستغرام", icon: Instagram },
    { key: "tiktok", href: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK_URL, label: "تيك توك", icon: TiktokLogoLight },
    { key: "snapchat", href: process.env.NEXT_PUBLIC_SOCIAL_SNAPCHAT_URL, label: "سناب شات", icon: RoundSnapchat },
  ];
  return items.filter((item): item is typeof item & { href: string } => !!item.href);
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

export function ArticleAuthorBio({ author }: ArticleAuthorBioProps) {
  const platformSocial = getPlatformSocialLinks();

  return (
    <section className="my-8 md:my-12" aria-labelledby="author-heading">
      <Card className="overflow-hidden border-t-4 border-t-primary hover:shadow-md transition-shadow">
        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
          <h2 id="author-heading" className="sr-only">
            عن الكاتب
          </h2>
          <div className="-mt-2">
            <Avatar className="h-20 w-20 ring-2 ring-primary/30 shadow-md">
              <AvatarImage src={author.image ?? undefined} alt={author.name} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col gap-1">
            {author.slug ? (
              <Link
                href={`/users/${author.slug}`}
                className="text-lg font-semibold text-primary hover:text-primary/90 transition-colors"
              >
                {author.name}
              </Link>
            ) : (
              <span className="text-lg font-semibold text-foreground">{author.name}</span>
            )}
            {author.jobTitle && (
              <p className="text-sm text-muted-foreground">{author.jobTitle}</p>
            )}
          </div>
          {author.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              {author.bio}
            </p>
          )}
          {platformSocial.length > 0 && (
            <nav
              className="flex flex-nowrap justify-center gap-1.5 text-muted-foreground overflow-x-auto min-w-0"
              aria-label="تابعنا على وسائل التواصل"
            >
              {platformSocial.map(({ key, href, label, icon: Icon }) => (
                <Link
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={platformSocialIconClass}
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </Link>
              ))}
            </nav>
          )}
          <Button
            asChild
            size="sm"
            className="w-full max-w-[200px] mt-1 bg-primary text-primary-foreground hover:bg-primary/90"
            variant="default"
          >
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-1"
            >
              صفحة الكاتب
              <ChevronLeft className="h-4 w-4 ltr:rotate-180" aria-hidden />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
