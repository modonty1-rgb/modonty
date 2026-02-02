"use server";

export async function createAuthor(data: {
  name: string;
  slug: string;
  jobTitle?: string;
  bio?: string;
  image?: string;
  imageAlt?: string;
  url?: string;
  email?: string;
  linkedIn?: string;
  twitter?: string;
  facebook?: string;
  sameAs?: string[];
  credentials?: string[];
  expertiseAreas?: string[];
  verificationStatus?: boolean;
  memberOf?: string[];
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
}) {
  return {
    success: false,
    error: "Creating new authors is not allowed. Only the Modonty author exists in the system.",
  };
}

