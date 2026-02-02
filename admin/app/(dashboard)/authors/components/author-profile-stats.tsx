"use client";

import { AnalticCard } from "@/components/shared/analtic-card";
import { SEOScoreOverall } from "@/components/shared/seo-doctor";
import { FileText, CheckCircle2, Edit, Share2 } from "lucide-react";
import Link from "next/link";
import { AuthorWithRelations } from "@/lib/types";

interface AuthorProfileStatsProps {
  author: AuthorWithRelations;
  stats: {
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    archivedArticles: number;
    seoScore: number;
    socialProfilesCount: number;
    eetatSignalsCount: number;
  };
}

export function AuthorProfileStats({ author, stats }: AuthorProfileStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <Link href={`/articles?authorId=${author.id}`} className="block h-full">
        <AnalticCard
          title="Total Articles"
          value={stats.totalArticles}
          icon={FileText}
          description="All articles by this author"
          className="h-full"
        />
      </Link>
      <Link href={`/articles?authorId=${author.id}&status=PUBLISHED`} className="block h-full">
        <AnalticCard
          title="Published"
          value={stats.publishedArticles}
          icon={CheckCircle2}
          description="Live articles"
          className="h-full"
        />
      </Link>
      <Link href={`/articles?authorId=${author.id}&status=DRAFT`} className="block h-full">
        <AnalticCard
          title="Drafts"
          value={stats.draftArticles}
          icon={Edit}
          description="In progress"
          className="h-full"
        />
      </Link>
      <div className="h-full">
        <AnalticCard
          title="Social Profiles"
          value={stats.socialProfilesCount}
          icon={Share2}
          description="Profiles linked for E-E-A-T"
          className="h-full"
        />
      </div>
      <div className="h-full">
        <SEOScoreOverall value={stats.seoScore} className="h-full" />
      </div>
    </div>
  );
}
