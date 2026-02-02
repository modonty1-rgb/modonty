import { type ReactElement } from "react";
import { OptimizedImage } from "@/components/OptimizedImage";
import Link from "@/components/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, CheckCircle2, Users, FileText, Eye, Linkedin, Twitter, Facebook } from "lucide-react";
import { ClientFollowButton } from "./client-follow-button";

interface ClientHeroProps {
  client: {
    id: string;
    name: string;
    slug: string;
    legalName?: string | null;
    logoMedia?: { url: string } | null;
    ogImageMedia?: { url: string } | null;
    twitterImageMedia?: { url: string } | null;
    url?: string | null;
    sameAs: string[];
    foundingDate?: Date | null;
  };
  stats: {
    followers: number;
    articles: number;
    totalViews: number;
  };
  initialIsFollowing?: boolean;
}

const getSocialPlatform = (url: string): { name: string; icon: ReactElement } | null => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('linkedin.com')) return { name: 'LinkedIn', icon: <Linkedin className="h-5 w-5" /> };
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return { name: 'Twitter', icon: <Twitter className="h-5 w-5" /> };
  if (lowerUrl.includes('facebook.com')) return { name: 'Facebook', icon: <Facebook className="h-5 w-5" /> };
  return null;
};

export function ClientHero({ client, stats, initialIsFollowing = false }: ClientHeroProps) {
  const coverImage = client.ogImageMedia?.url || client.twitterImageMedia?.url;
  const initials = client.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const socialLinks = client.sameAs
    .map(url => ({ url, platform: getSocialPlatform(url) }))
    .filter(link => link.platform !== null);

  return (
    <div className="relative w-full">
      {/* Cover Image */}
      <div className="relative w-full h-48 md:h-56 lg:h-64 bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden">
        {coverImage ? (
          <>
            <OptimizedImage
              src={coverImage}
              alt={`غلاف ${client.name}`}
              fill
              className="object-cover"
              priority
              fetchPriority="high"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1536px"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
        )}
      </div>

      {/* Content Container with Background Card */}
      <div className="container mx-auto max-w-[1128px] px-4">
        <div className="relative -mt-20 md:-mt-24">
          {/* White background card to prevent overlap */}
          <div className="bg-background rounded-lg shadow-lg p-4 md:p-6 border border-border">
            {/* Logo with shadow and border */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20 md:h-28 md:w-28 border-4 border-background shadow-xl bg-gradient-to-br from-primary/20 to-primary/40 flex-shrink-0">
                  <AvatarImage src={client.logoMedia?.url || undefined} alt={client.name} />
                  <AvatarFallback className="text-xl md:text-2xl font-bold text-primary">{initials}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                      {client.name}
                    </h1>
                    {/* Verified Badge - can be made conditional based on client verification status */}
                    <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-blue-500 flex-shrink-0" aria-label="موثق" />
                  </div>
                  {client.legalName && client.legalName !== client.name && (
                    <p className="text-sm md:text-base text-muted-foreground mt-1">
                      {client.legalName}
                    </p>
                  )}
                </div>
              </div>

              {/* CTA Buttons - Desktop */}
              <div className="hidden md:flex items-center gap-3">
                {client.url && (
                  <a href={client.url} target="_blank" rel="noopener noreferrer">
                    <Button size="default" className="gap-2">
                      <Globe className="h-4 w-4" />
                      زيارة الموقع
                    </Button>
                  </a>
                )}
                <ClientFollowButton
                  clientSlug={client.slug}
                  initialIsFollowing={initialIsFollowing}
                  initialFollowersCount={stats.followers}
                  variant="outline"
                  size="default"
                />
              </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-4 flex items-center gap-4 md:gap-6 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{stats.followers.toLocaleString('ar-SA')}</span>
                <span className="text-muted-foreground">متابع</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{stats.articles.toLocaleString('ar-SA')}</span>
                <span className="text-muted-foreground">مقال</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{stats.totalViews.toLocaleString('ar-SA')}</span>
                <span className="text-muted-foreground">مشاهدة</span>
              </div>
            </div>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="mt-3 flex items-center gap-4">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={link.platform!.name}
                  >
                    {link.platform!.icon}
                  </a>
                ))}
              </div>
            )}

            {/* CTA Buttons - Mobile */}
            <div className="flex md:hidden items-center gap-3 mt-4">
              {client.url && (
                <a href={client.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button size="default" className="gap-2 w-full">
                    <Globe className="h-4 w-4" />
                    زيارة الموقع
                  </Button>
                </a>
              )}
              <ClientFollowButton
                clientSlug={client.slug}
                initialIsFollowing={initialIsFollowing}
                initialFollowersCount={stats.followers}
                variant="outline"
                size="default"
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
