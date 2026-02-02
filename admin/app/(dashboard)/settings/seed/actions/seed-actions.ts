"use server";

import { db } from "@/lib/db";
import { runFullSeed, type SeedSummary } from "./seed-core";
import { generateArticleWithOpenAI } from "@/lib/openai-seed";
import { fetchArticleTitlesFromNewsAPI } from "@/lib/news-api-seed";
import { v2 as cloudinary } from "cloudinary";
import {
  generateSEOFileName,
  generateCloudinaryPublicId,
  isValidCloudinaryPublicId,
  optimizeCloudinaryUrl,
} from "@/lib/utils/image-seo";

interface RunSeedInput {
  articleCount: number;
  useOpenAI: boolean;
  industryBrief?: string;
  clearDatabase?: boolean;
  useNewsAPI?: boolean;
}

interface RunSeedResult {
  success: boolean;
  message?: string;
  error?: string;
  summary?: SeedSummary;
}

interface TestOpenAIResult {
  success: boolean;
  error?: string;
}

interface TestUnsplashResult {
  success: boolean;
  error?: string;
}

interface TestNewsAPIResult {
  success: boolean;
  error?: string;
}

interface TestClientCreationResult {
  success: boolean;
  error?: string;
  clientId?: string;
  clientName?: string;
  logoUrl?: string;
  logoCloudinaryPublicId?: string;
  logoCloudinaryVersion?: string;
  logoMediaId?: string;
  ogImageUrl?: string;
  ogImageCloudinaryPublicId?: string;
  ogImageCloudinaryVersion?: string;
  ogImageMediaId?: string;
  databaseVerified?: boolean;
}

export async function checkClientsExist(): Promise<{ exists: boolean; count: number }> {
  try {
    const count = await db.client.count();
    return { exists: count > 0, count };
  } catch (error) {
    console.error("Error checking clients:", error);
    return { exists: false, count: 0 };
  }
}

export async function testOpenAI(): Promise<TestOpenAIResult> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      error: "OPENAI_API_KEY is not configured on the server.",
    };
  }

  try {
    await generateArticleWithOpenAI({
      title: "اختبار اتصال OpenAI",
      category: "technical-seo",
      length: "short",
      language: "ar",
    });
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error while calling OpenAI.";
    console.error("Error in testOpenAI server action:", error);
    return {
      success: false,
      error: message,
    };
  }
}

export async function testUnsplash(): Promise<TestUnsplashResult> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY?.trim();
  
  if (!accessKey) {
    return {
      success: false,
      error: "UNSPLASH_ACCESS_KEY is not configured on the server. Please set it in your environment variables.",
    };
  }

  try {
    // Try /photos/random first (simpler endpoint for testing)
    const response = await fetch(
      `https://api.unsplash.com/photos/random?count=1`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    );

    if (!response.ok) {
      // If random fails, try search as fallback
      const searchResponse = await fetch(
        `https://api.unsplash.com/search/photos?query=test&per_page=1`,
        {
          headers: {
            Authorization: `Client-ID ${accessKey}`,
          },
        }
      );

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text().catch(() => "");
        let errorMessage = `Unsplash API error: ${searchResponse.status} ${searchResponse.statusText}`;
        
        if (searchResponse.status === 401) {
          errorMessage += ". Please verify that UNSPLASH_ACCESS_KEY is correct and is an Access Key (not Secret Key). You can get your Access Key from https://unsplash.com/developers";
        }
        
        return {
          success: false,
          error: errorMessage,
        };
      }

      const searchData = await searchResponse.json();
      if (searchData.results && searchData.results.length > 0) {
        return { success: true };
      }
    } else {
      const data = await response.json();
      if (data && (Array.isArray(data) ? data.length > 0 : true)) {
        return { success: true };
      }
    }

    return {
      success: false,
      error: "Unsplash API returned unexpected response format",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error while calling Unsplash API.";
    console.error("Error in testUnsplash server action:", error);
    return {
      success: false,
      error: message,
    };
  }
}

export async function testNewsAPI(): Promise<TestNewsAPIResult> {
  if (!process.env.NEWS_API_KEY) {
    return {
      success: false,
      error: "NEWS_API_KEY is not configured on the server.",
    };
  }

  try {
    // Try with a broader query first (technology is more likely to have Arabic results)
    try {
      await fetchArticleTitlesFromNewsAPI({
        language: "ar",
        pageSize: 1,
        query: "technology",
      });
      return { success: true };
    } catch (firstError) {
      // If that fails, try without a specific query (just language filter)
      try {
        await fetchArticleTitlesFromNewsAPI({
          language: "ar",
          pageSize: 1,
          query: "",
        });
        return { success: true };
      } catch (secondError) {
        // Return the first error with helpful context
        const message =
          firstError instanceof Error
            ? firstError.message
            : "Unexpected error while calling NewsAPI.";
        console.error("Error in testNewsAPI server action:", firstError);
        return {
          success: false,
          error:
            message +
            " Note: NewsAPI free tier may have limited Arabic content. Consider upgrading or using a different query.",
        };
      }
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error while calling NewsAPI.";
    console.error("Error in testNewsAPI server action:", error);
    return {
      success: false,
      error: message,
    };
  }
}

export async function testCreateClientWithMedia(): Promise<TestClientCreationResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const accessKey = process.env.UNSPLASH_ACCESS_KEY?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      success: false,
      error: "Cloudinary configuration missing. Please check CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, and NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.",
    };
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  try {
    // Delete all existing clients and media for clean test
    console.log("Cleaning up existing clients and media...");
    
    // First, unlink media from clients (set logoMediaId and ogImageMediaId to null)
    await db.client.updateMany({
      data: {
        logoMediaId: null,
        ogImageMediaId: null,
      },
    });

    // Delete all media records
    const mediaCount = await db.media.count();
    if (mediaCount > 0) {
      await db.media.deleteMany({});
      console.log(`Deleted ${mediaCount} media records`);
    }

    // Delete all clients
    const clientCount = await db.client.count();
    if (clientCount > 0) {
      await db.client.deleteMany({});
      console.log(`Deleted ${clientCount} client records`);
    }

    const industry = await db.industry.findFirst();
    if (!industry) {
      return {
        success: false,
        error: "No industry found. Please seed industries first.",
      };
    }

    const tierConfig = await db.subscriptionTierConfig.findFirst({
      where: { tier: "BASIC" },
    });

    if (!tierConfig) {
      return {
        success: false,
        error: "No subscription tier config found. Please seed subscription tiers first.",
      };
    }

    const testClientSlug = `test-client-${Date.now()}`;
    const client = await db.client.create({
      data: {
        name: "Test Client Full",
        slug: testClientSlug,
        legalName: "Test Client Full ش.م.م",
        url: `https://${testClientSlug}.example.com`,
        email: `info@${testClientSlug}.example.com`,
        phone: "+966501234567",
        seoTitle: "Test Client Full",
        seoDescription: "Test client for full media upload testing",
        industryId: industry.id,
        subscriptionTier: "BASIC",
        subscriptionStatus: "ACTIVE",
        paymentStatus: "PAID",
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        articlesPerMonth: tierConfig.articlesPerMonth,
        subscriptionTierConfigId: tierConfig.id,
      },
    });

    let logoUrl: string;
    let ogImageUrl: string;

    if (accessKey) {
      try {
        const unsplashLogo = await fetch(`https://api.unsplash.com/photos/random?query=logo&orientation=squarish`, {
          headers: { Authorization: `Client-ID ${accessKey}` },
        });
        if (unsplashLogo.ok) {
          const logoData = await unsplashLogo.json();
          logoUrl = logoData.urls?.regular || "https://picsum.photos/400/400?random=1";
        } else {
          logoUrl = "https://picsum.photos/400/400?random=1";
        }

        const unsplashOG = await fetch(`https://api.unsplash.com/photos/random?query=business&orientation=landscape`, {
          headers: { Authorization: `Client-ID ${accessKey}` },
        });
        if (unsplashOG.ok) {
          const ogData = await unsplashOG.json();
          ogImageUrl = ogData.urls?.regular || "https://picsum.photos/1200/630?random=2";
        } else {
          ogImageUrl = "https://picsum.photos/1200/630?random=2";
        }
      } catch {
        logoUrl = "https://picsum.photos/400/400?random=1";
        ogImageUrl = "https://picsum.photos/1200/630?random=2";
      }
    } else {
      logoUrl = "https://picsum.photos/400/400?random=1";
      ogImageUrl = "https://picsum.photos/1200/630?random=2";
    }

    const logoAltText = `Logo ${client.name}`;
    const logoSeoFileName = generateSEOFileName(logoAltText, "", "", undefined, true);
    const logoPublicId = generateCloudinaryPublicId(logoSeoFileName, "seed/client-logos");

    const logoUploadResult = await cloudinary.uploader.upload(logoUrl, {
      public_id: logoPublicId,
      resource_type: "image" as const,
      asset_folder: "seed/client-logos",
    });

    const logoCloudinaryUrl = logoUploadResult.secure_url || logoUploadResult.url;
    const logoOptimizedUrl = optimizeCloudinaryUrl(
      logoCloudinaryUrl,
      logoUploadResult.public_id,
      logoUploadResult.format || "png",
      "image"
    );

    const logoMedia = await db.media.create({
      data: {
        filename: `logo-${client.slug}.png`,
        url: logoOptimizedUrl,
        mimeType: "image/png",
        fileSize: logoUploadResult.bytes || Math.floor(Math.random() * 200000) + 50000,
        width: 400,
        height: 400,
        encodingFormat: "image/png",
        altText: logoAltText,
        title: logoAltText,
        clientId: client.id,
        type: "LOGO",
        cloudinaryPublicId: logoUploadResult.public_id,
        cloudinaryVersion: logoUploadResult.version?.toString(),
      },
    });

    const ogAltText = `OG Image ${client.name}`;
    const ogSeoFileName = generateSEOFileName(ogAltText, "", "", undefined, true);
    const ogPublicId = generateCloudinaryPublicId(ogSeoFileName, "seed/client-og-images");

    const ogUploadResult = await cloudinary.uploader.upload(ogImageUrl, {
      public_id: ogPublicId,
      resource_type: "image" as const,
      asset_folder: "seed/client-og-images",
    });

    const ogCloudinaryUrl = ogUploadResult.secure_url || ogUploadResult.url;
    const ogOptimizedUrl = optimizeCloudinaryUrl(
      ogCloudinaryUrl,
      ogUploadResult.public_id,
      ogUploadResult.format || "jpg",
      "image"
    );

    const ogMedia = await db.media.create({
      data: {
        filename: `og-${client.slug}.jpg`,
        url: ogOptimizedUrl,
        mimeType: "image/jpeg",
        fileSize: ogUploadResult.bytes || Math.floor(Math.random() * 500000) + 100000,
        width: 1200,
        height: 630,
        encodingFormat: "image/jpeg",
        altText: ogAltText,
        title: ogAltText,
        clientId: client.id,
        type: "OGIMAGE",
        cloudinaryPublicId: ogUploadResult.public_id,
        cloudinaryVersion: ogUploadResult.version?.toString(),
      },
    });

    await db.client.update({
      where: { id: client.id },
      data: {
        logoMediaId: logoMedia.id,
        ogImageMediaId: ogMedia.id,
      },
    });

    // Verify data was stored correctly in database
    const verifiedClient = await db.client.findUnique({
      where: { id: client.id },
      include: {
        logoMedia: true,
        ogImageMedia: true,
      },
    });

    const databaseVerified = !!(
      verifiedClient &&
      verifiedClient.logoMediaId === logoMedia.id &&
      verifiedClient.ogImageMediaId === ogMedia.id &&
      verifiedClient.logoMedia?.cloudinaryPublicId === logoUploadResult.public_id &&
      verifiedClient.ogImageMedia?.cloudinaryPublicId === ogUploadResult.public_id
    );

    return {
      success: true,
      clientId: client.id,
      clientName: client.name,
      logoUrl: logoOptimizedUrl,
      logoCloudinaryPublicId: logoUploadResult.public_id,
      logoCloudinaryVersion: logoUploadResult.version?.toString(),
      logoMediaId: logoMedia.id,
      ogImageUrl: ogOptimizedUrl,
      ogImageCloudinaryPublicId: ogUploadResult.public_id,
      ogImageCloudinaryVersion: ogUploadResult.version?.toString(),
      ogImageMediaId: ogMedia.id,
      databaseVerified,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error during client creation test.";
    console.error("Error in testCreateClientWithMedia server action:", error);
    return {
      success: false,
      error: message,
    };
  }
}

export async function runSeed(input: RunSeedInput): Promise<RunSeedResult> {
  if (process.env.NODE_ENV !== "development") {
    return {
      success: false,
      error: "Seeding can only be triggered in the development environment.",
    };
  }

  const safeCount = Math.max(3, Math.min(input.articleCount, 300));

  if (input.useOpenAI && !process.env.OPENAI_API_KEY) {
    return {
      success: false,
      error: "OPENAI_API_KEY is not configured on the server.",
    };
  }

  try {
    const summary = await runFullSeed({
      articleCount: safeCount,
      useOpenAI: input.useOpenAI,
      industryBrief: input.industryBrief,
      clearDatabase: input.clearDatabase,
      useNewsAPI: input.useNewsAPI || false,
    });

    return {
      success: true,
      summary,
      message: `Database cleared and seeded with ${summary.articles.total} articles (${summary.articles.published} published, ${summary.articles.draft} draft).`,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error while running the seed pipeline.";
    console.error("Error in runSeed server action:", error);
    return {
      success: false,
      error: message,
    };
  }
}

