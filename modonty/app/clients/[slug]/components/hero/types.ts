export interface ClientHeroClient {
  id: string;
  name: string;
  slug: string;
  legalName?: string | null;
  businessBrief?: string | null;
  logoMedia?: { url: string } | null;
  ogImageMedia?: { url: string } | null;
  twitterImageMedia?: { url: string } | null;
  url?: string | null;
  sameAs: string[];
  foundingDate?: Date | null;
  industry?: { name: string } | null;
  addressCity?: string | null;
  addressRegion?: string | null;
  addressCountry?: string | null;
  commercialRegistrationNumber?: string | null;
}

export interface ClientHeroStats {
  followers: number;
  articles: number;
  totalViews: number;
}

export interface ClientHeroSocialLink {
  url: string;
  platform: { name: string; icon: React.ReactNode };
}
