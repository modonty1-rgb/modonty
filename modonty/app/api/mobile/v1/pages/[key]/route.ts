import { z } from "zod";

import { getAboutPageContent } from "@/app/(site)/about/helpers/about-content";
import { getPrivacyPolicyPageContent } from "@/app/(site)/legal/privacy-policy/helpers/privacy-policy-content";
import { getUserAgreementPageContent } from "@/app/(site)/legal/user-agreement/helpers/user-agreement-content";
import { getTermsPageContent } from "@/app/(site)/terms/helpers/terms-content";
import { messages } from "@/lib/i18n/messages";
import { fail, handle, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";
import { CONTENT_MESSAGES } from "@/lib/mobile-api/messages-content";

const keySchema = z.enum(["about", "privacy-policy", "user-agreement", "terms"]);
type PageKey = z.infer<typeof keySchema>;

interface StaticPage {
  title: string;
  html: string | null;
  updatedAt: Date | null;
}

/**
 * The three legal pages read their row and fall back to the built-in text when the row has no
 * content or the read fails — logged, exactly like `PrivacyPolicyContent` & co. in each page.tsx.
 */
async function readLegalPage(
  key: PageKey,
  read: () => Promise<{ title: string | null; content: string | null; updatedAt: Date } | null>,
  text: { fallbackTitle: string; fallbackContent: string },
): Promise<StaticPage> {
  let page: Awaited<ReturnType<typeof read>> = null;
  try {
    page = await read();
  } catch (error) {
    console.error(`[mobile-api:page:${key}] content read failed — serving the built-in text`, error);
  }
  return {
    title: page?.title || text.fallbackTitle,
    html: page?.content ? page.content : text.fallbackContent,
    updatedAt: page?.updatedAt ?? null,
  };
}

async function readPage(key: PageKey): Promise<StaticPage> {
  switch (key) {
    case "about": {
      // `/about` — the team's editorial HTML when there is any; no fallback text, no date
      // (`getAboutPageContent` selects none). Title from the row, empty when unset — as the page.
      const page = await getAboutPageContent();
      return { title: page?.title?.trim() || "", html: page?.content?.trim() ? page.content : null, updatedAt: null };
    }
    case "privacy-policy":
      return readLegalPage(key, getPrivacyPolicyPageContent, messages.privacyPolicy);
    case "user-agreement":
      return readLegalPage(key, getUserAgreementPageContent, messages.userAgreement);
    case "terms":
      return readLegalPage(key, getTermsPageContent, messages.terms);
  }
}

/**
 * C20 — GET /api/mobile/v1/pages/:key · public. key ∈ about | privacy-policy | user-agreement | terms.
 * The same content reads the pages render (each page's `helpers/*-content.ts`, cached under
 * `pages` / `legal`). `html` is the admin-authored HTML exactly as the web injects it — the web
 * renders it as-is (`dangerouslySetInnerHTML`, no sanitizer), so it arrives here as-is too.
 */
export const GET = handle("page", async (_request: Request, { params }: { params: Promise<{ key: string }> }) => {
  const parsed = keySchema.safeParse((await params).key);
  if (!parsed.success) return fail("NOT_FOUND", CONTENT_MESSAGES.pageNotFound);
  const key = parsed.data;
  const page = await readPage(key);
  return ok({ key, ...page }, PUBLIC_CACHE);
});
