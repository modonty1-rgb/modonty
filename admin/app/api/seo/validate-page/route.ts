/**
 * API Route: Full Page Validation
 *
 * POST/GET /api/seo/validate-page
 *
 * Query params:
 * - type: 'article' | 'client' | 'category' | 'user'
 * - id: identifier (slug or id)
 * - baseUrl?: optional base URL (defaults to NEXT_PUBLIC_SITE_URL)
 *
 * Returns: FullPageValidationResult
 */

import { NextRequest, NextResponse } from "next/server";
import { validateFullPage } from "@/lib/seo/page-validator";
import type { PageType, ValidationOptions } from "@/lib/seo/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pageType = searchParams.get("type") as PageType;
    const identifier = searchParams.get("id") || searchParams.get("slug") || searchParams.get("identifier");
    const baseUrl = searchParams.get("baseUrl") || undefined;

    // Validate inputs
    if (!pageType) {
      return NextResponse.json(
        { error: "Missing required parameter: type" },
        { status: 400 }
      );
    }

    if (!identifier) {
      return NextResponse.json(
        { error: "Missing required parameter: id, slug, or identifier" },
        { status: 400 }
      );
    }

    if (!["article", "client", "category", "user"].includes(pageType)) {
      return NextResponse.json(
        { error: "Invalid page type. Must be: article, client, category, or user" },
        { status: 400 }
      );
    }

    // Prepare options
    const options: ValidationOptions = {
      baseUrl,
      includeMetadata: true,
    };

    // Validate page
    const result = await validateFullPage(pageType, identifier, options);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Page validation error:", error);
    return NextResponse.json(
      {
        error: "Failed to validate page",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type: pageType, id: identifier, slug, identifier: altIdentifier, baseUrl, ...options } = body;

    // Validate inputs
    if (!pageType) {
      return NextResponse.json(
        { error: "Missing required field: type" },
        { status: 400 }
      );
    }

    const finalIdentifier = identifier || slug || altIdentifier;
    if (!finalIdentifier) {
      return NextResponse.json(
        { error: "Missing required field: id, slug, or identifier" },
        { status: 400 }
      );
    }

    if (!["article", "client", "category", "user"].includes(pageType)) {
      return NextResponse.json(
        { error: "Invalid page type. Must be: article, client, category, or user" },
        { status: 400 }
      );
    }

    // Prepare validation options
    const validationOptions: ValidationOptions = {
      baseUrl,
      includeMetadata: true,
      ...options,
    };

    // Validate page
    const result = await validateFullPage(pageType, finalIdentifier, validationOptions);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Page validation error:", error);
    return NextResponse.json(
      {
        error: "Failed to validate page",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
