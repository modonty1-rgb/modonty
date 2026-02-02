import { NextRequest, NextResponse } from 'next/server';
import { publishArticle } from '@/app/(dashboard)/articles/actions/publish-action/publish-article';
import type { ArticleFormData } from '@/lib/types/form-types';

/**
 * POST /api/articles/publish
 * Publishes article from form data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formData } = body as {
      formData: ArticleFormData;
    };

    if (!formData) {
      return NextResponse.json(
        { success: false, error: 'Missing formData in request body' },
        { status: 400 }
      );
    }

    const result = await publishArticle(formData);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Publish article error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to publish article',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}