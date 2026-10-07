import type { ArticleFAQStatus } from "@prisma/client";

export interface VisitorQuestionWithDetails {
  id: string;
  question: string;
  answer: string | null;
  status: ArticleFAQStatus;
  source: string | null;
  submittedByName: string | null;
  submittedByEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
  article: {
    id: string;
    title: string;
    slug: string;
  };
}
