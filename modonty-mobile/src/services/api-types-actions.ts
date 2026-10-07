/**
 * Wire types for the reader API — group D: interaction writes, «me» V2, topic alerts, Modo chat.
 * Routes live under `modonty/app/api/mobile/v1/**`; every request body and `data` payload below is
 * derived from the route's Zod schema and the server function it calls (paths are relative to the
 * monorepo root; `:N` = line).
 *
 * Conventions (same as `api-types.ts`):
 *  - `Date` on the server → ISO `string` here (NextResponse.json → JSON.stringify).
 *  - Prisma enums → string-literal unions (`shared/prisma/schema/schema.prisma`).
 *  - A server field that is `undefined` is dropped by JSON.stringify → optional here; `null` stays `null`.
 *  - Success → `{ data: <payload> }` · failure → `{ error: { code, message, details? } }`
 *    (`modonty/lib/mobile-api/http.ts`). Messages are Arabic.
 *
 * Headers used below:
 *  - Bearer = `Authorization: Bearer <accessToken>`.
 *  - Device = `X-Device-Id: <8–64 chars [A-Za-z0-9-]>` (`modonty/lib/mobile-api/device.ts`).
 *
 * Standalone on purpose: no imports.
 */

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Shared literals
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** schema.prisma:117-122 */
export type CommentStatusWire = "PENDING" | "APPROVED" | "REJECTED" | "DELETED";

/** schema.prisma:167-176 */
export type SharePlatformWire =
  | "FACEBOOK"
  | "TWITTER"
  | "LINKEDIN"
  | "WHATSAPP"
  | "EMAIL"
  | "COPY_LINK"
  | "PRINT"
  | "OTHER";

/** schema.prisma:145-151 */
export type CtaTypeWire = "BUTTON" | "LINK" | "FORM" | "BANNER" | "POPUP";

/** modonty/lib/users/alert-topics.ts:11-53 */
export type AlertTopicId = "football" | "ai" | "entrepreneurship" | "education" | "entertainment" | "health";

/** modonty/lib/users/alert-topics.ts:57-63 (no SMS) */
export type AlertChannelId = "email" | "whatsapp";

/** `components/shared/booking-form/booking-actions.ts` BookingSource */
export type BookingSourceWire = "article_dock" | "article_card" | "client_page" | "client_list";

/** `{ ok: true }` — tracking endpoints that only acknowledge. */
export interface OkData {
  ok: boolean;
}

export interface CommentAuthorWire {
  id: string;
  name: string | null;
  image: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// E2 — POST /articles/:id/dislike (toggle) · Bearer
// route: modonty/app/api/mobile/v1/articles/[ref]/dislike/route.ts:9,33 · lib/articles/dislike-article-as.ts
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface DislikeBody {
  /** The article slug (revalidated on the web). 1–200 chars. */
  slug: string;
}

export interface DislikeData {
  disliked: boolean;
  likesCount: number;
  dislikesCount: number;
}

/** Alias — the name `src/services/api.ts` already imports. */
export type DislikeResult = DislikeData;

// ─────────────────────────────────────────────────────────────────────────────────────────────
// E5 — POST /comments/:id/replies · POST /comments/:id/like · Bearer
// routes: comments/[id]/replies/route.ts:13,61 · comments/[id]/like/route.ts:12,45
// lib/comments/submit-reply-as.ts · lib/comments/like-comment-as.ts
// The parent/comment must be APPROVED (what C6 shows); the article is read from it.
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface ReplyCreateBody {
  /** Optional — the server uses the article's own slug. */
  slug?: string;
  /** 1–1000 chars after trim (`lib/comments/validate-comment.ts:28-32`); 422 otherwise. */
  content: string;
}

/** 201 */
export interface ReplyCreateData {
  reply: {
    id: string;
    content: string;
    /** Always "PENDING" until the partner approves. */
    status: CommentStatusWire;
    createdAt: string;
    parentId: string | null;
    author: CommentAuthorWire | null;
  };
  /** «وصل ردّك — يظهر بعد مراجعة الشريك.» */
  message: string;
}

export interface CommentLikeBody {
  /** Optional — the server uses the article's own slug. */
  slug?: string;
}

export interface CommentLikeData {
  liked: boolean;
  /** Recounted from CommentLike rows. */
  likesCount: number;
  dislikesCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// E10 — GET · POST · DELETE /partners/:slug/favorite · Bearer
// route: partners/[ref]/favorite/route.ts:12 · lib/clients/{get-client-favorite-state,favorite-client-as,unfavorite-client-as}.ts
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface PartnerFavoriteData {
  favorited: boolean;
  /** Total saves of this partner. */
  count: number;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// E11 — POST /partners/:slug/share · public + Device · Bearer optional
// route: partners/[ref]/share/route.ts:11,37 · lib/analytics/record-client-share.ts
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface PartnerShareBody {
  platform: SharePlatformWire;
}

export type PartnerShareData = OkData;

// ─────────────────────────────────────────────────────────────────────────────────────────────
// E12 — POST /partners/:slug/reviews · Bearer   (+ C13 GET /partners/:slug/reviews · public)
// route: partners/[ref]/reviews/route.ts:11,25,30,56 · lib/clients/post-client-review-as.ts
// helpers: app/(partner)/clients/[slug]/helpers/client-reviews.ts:11-24
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface ReviewCreateBody {
  /** Integer 1–5 («اختر تقييمك بالنجوم»). */
  rating: number;
  /** 3–2000 chars after trim. */
  comment: string;
}

/**
 * 201. A second submit edits the reader's review and sends it back to PENDING.
 * Errors: 404 partner · 403 «ما تقدر تقيّم نشاطك التجاري بنفسك.» · 422 rule text.
 */
export interface ReviewCreateData {
  status: "PENDING";
  reviewId: string;
  /** «تم إرسال تقييمك. سيظهر بعد الموافقة من الشركة.» */
  message: string;
}

/** GET ?limit (1–50, default 20) */
export interface PartnerReviewsData {
  reviews: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    author: CommentAuthorWire | null;
  }[];
  /** Average of APPROVED ratings, 0 when none. */
  averageRating: number;
  reviewCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// E13 — POST /partners/:slug/questions · POST /articles/:id/questions · Bearer
// routes: partners/[ref]/questions/route.ts:11,46 · articles/[ref]/questions/route.ts:11,47
// lib/clients/submit-client-page-question-as.ts · lib/articles/submit-ask-client-as.ts
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface QuestionCreateBody {
  /** 10–2000 chars. */
  question: string;
  /** Optional — the account's name wins (web rule). Defaults to the account's. */
  name?: string;
  /** Optional — the account's email wins (web rule). Defaults to the account's. */
  email?: string;
}

/**
 * 201. Errors: 404 · 409 «الحد الأقصى 5 أسئلة معلقة…» · 422 rule text /
 * «حسابك يفتقد الاسم أو البريد…».
 */
export type QuestionCreateData = OkData;

// ─────────────────────────────────────────────────────────────────────────────────────────────
// E15 — POST /partners/:id/whatsapp-lead · public + Device
// route: partners/[ref]/whatsapp-lead/route.ts:12,57 · lib/booking/record-whatsapp-lead-for.ts
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface WhatsappLeadBody {
  /** Default "client_page". */
  source?: BookingSourceWire;
  /** The article the tap came from; absent → credited to this device's recent read of the partner. */
  articleId?: string | null;
  /**
   * The app's visit id (≤64 chars [A-Za-z0-9._:-]). One lead per device × partner × sessionId;
   * absent → one per device × partner × UTC day.
   */
  sessionId?: string;
}

export interface WhatsappLeadData {
  /** false = already recorded for this visit (deduped). */
  recorded: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// E18 — reels: comments · replies · comment like · share
// routes: reels/[ref]/comments/route.ts:36,68 · reel-comments/[id]/replies/route.ts:14,54 ·
//         reel-comments/[id]/like/route.ts:26 · reels/[ref]/share/route.ts:11,32
// lib/reels/{submit-reel-comment-as,submit-reel-comment-reply-as,toggle-reel-comment-like-as,track-reel-share-as}.ts
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** POST /reels/:id/comments · Bearer */
export interface ReelCommentCreateBody {
  /** 1–1000 chars after trim. */
  content: string;
}

/** 201 */
export interface ReelCommentCreateData {
  commentId: string;
  status: "PENDING";
  /** «وصل تعليقك — يظهر بعد مراجعة الشريك» */
  message: string;
}

/** POST /reel-comments/:id/replies · Bearer (parent must be APPROVED) */
export interface ReelReplyCreateBody {
  content: string;
}

/** 201 */
export interface ReelReplyCreateData {
  replyId: string;
  status: "PENDING";
  /** «وصل ردّك — يظهر بعد مراجعة الشريك» */
  message: string;
}

/** POST /reel-comments/:id/like (toggle) · Bearer — no body. */
export interface ReelCommentLikeData {
  liked: boolean;
  likesCount: number;
}

/** POST /reels/:id/share · public + Device · Bearer optional. GA4 only, no row. */
export interface ReelShareBody {
  /** "native" = OS share sheet opened · "clipboard" = link copied. */
  platform: "native" | "clipboard";
}

/** `ok:false` = the analytics call failed (logged); the reader is not affected. */
export type ReelShareData = OkData;

// ─────────────────────────────────────────────────────────────────────────────────────────────
// E19 — POST /newsletter · POST /partners/:id/subscribe · public + Device
// routes: newsletter/route.ts:28 · partners/[ref]/subscribe/route.ts:12,42
// lib/newsletter/subscribe-to-newsletter.ts · lib/newsletter/subscribe-to-client-newsletter.ts
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface NewsletterBody {
  /** Valid email ≤254. 422 «البريد الإلكتروني غير صحيح». */
  email: string;
}

/** 429 «محاولات كثيرة. جرّب بعد شوي.» (5/hour per IP, same bucket as the web). */
export interface NewsletterData {
  subscribed: true;
  alreadySubscribed: boolean;
  /** «تم الاشتراك بنجاح» | «تم الاشتراك مسبقاً» */
  message: string;
}

export interface PartnerSubscribeBody {
  email: string;
}

/** 429 «حاول مرة أخرى لاحقاً» (5/hour per email). */
export interface PartnerSubscribeData {
  subscribed: true;
  alreadySubscribed: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// E20 — POST /contact · public + Device · Bearer optional (links the message to the reader)
// route: contact/route.ts:13,49 · lib/contact/accept-contact-message.ts · lib/contact/save-contact-message.ts
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface ContactBody {
  /** All four required («جميع الحقول مطلوبة»). */
  name: string;
  email: string;
  subject: string;
  /** ≤5000 */
  message: string;
  /** Address a partner's support inbox. */
  clientId?: string;
}

/** 201. 429 «لقد تجاوزت الحد المسموح به. يرجى المحاولة بعد ساعة.» (3/hour per IP). */
export interface ContactData {
  sent: true;
  /** «تم إرسال الرسالة بنجاح» */
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// E7 — PATCH /analytics/:id · public + Device (row must belong to this device: E6's analyticsId)
// route: analytics/[id]/route.ts:33 · lib/analytics/update-article-analytics.ts
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface AnalyticsPatchBody {
  timeOnPage?: number; // ≥0
  scrollDepth?: number; // 0–100
  bounced?: boolean;
  lcp?: number; // ≥0
  cls?: number; // ≥0
  inp?: number; // ≥0
}

/** 403 when the row was created by another device. */
export type AnalyticsPatchData = OkData;

// ─────────────────────────────────────────────────────────────────────────────────────────────
// T2 — POST /track/cta-click · POST /track/link-click · public + Device · Bearer optional
// routes: track/cta-click/route.ts:31 · track/link-click/route.ts:9,36
// lib/analytics/record-cta-click.ts · lib/analytics/record-article-link-click.ts
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface CtaClickBody {
  type: CtaTypeWire;
  label?: string; // ≤300
  /** ≤2048; tel:/mailto:/# allowed. */
  targetUrl?: string;
  articleId?: string;
  clientId?: string;
  timeOnPage?: number;
  scrollDepth?: number; // 0–100
}

export interface LinkClickBody {
  articleId: string;
  linkUrl: string; // 1–2048
  linkText?: string; // ≤500
  isExternal?: boolean;
}

export type TrackClickData = OkData;

// ─────────────────────────────────────────────────────────────────────────────────────────────
// A9 — PATCH /me · Bearer
// route: me/route.ts:84,111 · lib/users/update-profile-as.ts ·
// rules: app/(site)/users/profile/settings/helpers/schemas/settings-schemas.ts (profileSchema)
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface ProfilePatchBody {
  /** 2–100 chars. */
  name: string;
  /** ≤500. Omitted → cleared (web behaviour). */
  bio?: string;
  /** Hosted http(s) URL from POST /me/avatar; never `data:`. Omitted/null → cleared. */
  image?: string | null;
}

/** Same `user` shape as A8 (`modonty/lib/mobile-api/reader-profile.ts`). */
export interface ProfilePatchData {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    bio: string | null;
    createdAt: string;
    hasPassword: boolean;
    phone: string | null;
  };
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// A10 — POST /me/avatar · Bearer · multipart/form-data field `file`
// route: me/avatar/route.ts:29 · lib/users/upload-user-avatar.ts
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** 201. ≤4 MB, JPG/PNG/WebP by file signature; 422 with `details.reason` = missing|too_large|bad_type. */
export interface AvatarData {
  url: string;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// A11 — POST /me/password · Bearer
// route: me/password/route.ts:24,82 · lib/users/change-password-as.ts · lib/users/create-password-as.ts
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface PasswordBody {
  /** Required when the account already has a password (A8 `hasPassword`). */
  currentPassword?: string;
  /** Web `passwordField` rule. */
  newPassword: string;
  confirmPassword: string;
}

/**
 * 403 «كلمة المرور الحالية غير صحيحة» (counts against the login limit; 429 + Retry-After when
 * blocked). On success every OTHER app session is revoked; the current tokens keep working.
 */
export interface PasswordData {
  ok: true;
  /** true = first password created (Google/Apple-only account). */
  created: boolean;
  revokedSessions: number;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// A12 — GET · PUT /me/alerts · Bearer
// route: me/alerts/route.ts:17,40 · lib/users/get-alert-settings-as.ts · lib/users/update-alert-settings-as.ts
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** GET data, and PUT data (fresh after save). */
export interface AlertPrefs {
  email: string | null;
  /** E.164 */
  phone: string | null;
  marketingEmails: boolean;
  /** A topic present = on, with its channels. */
  topics: Partial<Record<AlertTopicId, AlertChannelId[]>>;
}

/** PUT body — `alertsInput` (lib/users/update-alert-settings-as.ts). */
export interface AlertPrefsBody {
  marketingEmails: boolean;
  /** Per topic the chosen channels; empty list = off. Unknown ids are dropped. */
  topics: Partial<Record<AlertTopicId, AlertChannelId[]>>;
  /** Dial code without "+" (default "966") or "other" when `phone` is fully international. */
  phoneDial?: string;
  /** Required when any topic uses "whatsapp". */
  phone?: string;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// A13 — GET /me/liked · /me/disliked · /me/comments · /me/bookings · /me/reels · /me/activity · Bearer
// app/(site)/users/profile/helpers/profile-*.ts · app/(fullscreen)/reels/data/get-my-reels.ts
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** GET /me/liked?limit (1–50, default 20) — profile-liked.ts:6-21 */
export interface MeLikedData {
  items: {
    id: string;
    type: "client" | "article" | "comment";
    likedAt: string;
    item: {
      id: string;
      name?: string;
      title?: string;
      slug: string;
      description?: string | null;
      excerpt?: string | null;
      image?: string;
      imageAlt?: string | null;
      client?: { name: string; slug: string };
    };
  }[];
}

/** GET /me/disliked?limit (1–50, default 20) — profile-disliked.ts:6-30 */
export interface MeDislikedData {
  items: {
    id: string;
    type: "client" | "article" | "comment";
    dislikedAt: string;
    item: {
      id: string;
      name?: string;
      title?: string;
      slug?: string;
      description?: string | null;
      excerpt?: string | null;
      content?: string;
      image?: string;
      imageAlt?: string | null;
      client?: { name: string; slug: string };
      author?: CommentAuthorWire;
      article?: { id: string; title: string; slug: string; client: { name: string; slug: string } };
      commentCreatedAt?: string;
    };
  }[];
}

export interface PaginationWire {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** GET /me/comments?page&limit (1–50, default 10) — profile-comments.ts:7-33 */
export interface MeCommentsData {
  comments: {
    id: string;
    content: string;
    createdAt: string;
    status: Exclude<CommentStatusWire, "DELETED">;
    article: { id: string; title: string; slug: string; client: { name: string; slug: string } };
    likesCount: number;
    dislikesCount: number;
    repliesCount: number;
  }[];
  pagination: PaginationWire;
}

/** GET /me/bookings?limit (1–50, default 20) — profile-bookings.ts:4-13 */
export interface MeBookingsData {
  items: {
    id: string;
    status: string;
    /** null for WhatsApp leads */
    phone: string | null;
    message: string | null;
    preferredAt: string | null;
    createdAt: string;
    client: { name: string; slug: string; logo: string | null };
    article: { title: string; slug: string } | null;
  }[];
}

/** GET /me/reels?kind=LIKE|FAVORITE (default LIKE, max 60) — get-my-reels.ts:6-13 */
export interface MeReelsData {
  items: {
    id: string;
    /** null when the reel has no slug yet. */
    slug: string | null;
    title: string;
    imageUrl: string | null;
    clientName: string;
  }[];
}

/** GET /me/activity?page&limit (1–50, default 10) — profile-activity.ts:3-27 */
export interface MeActivityData {
  activities: {
    type: "comment" | "like_article" | "like_comment" | "favorite_article" | "follow_client";
    /** Arabic sentence, e.g. «أعجبك مقال "…"». */
    content: string;
    /** Web path (`/articles/<slug>`, `/clients/<slug>`, `#comment-<id>`). */
    link?: string;
    timestamp: string;
  }[];
  pagination: PaginationWire;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// V3 — POST /topic-alerts · Bearer
// route: topic-alerts/route.ts:9,26 · lib/users/enable-topic-alert-as.ts
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface TopicAlertBody {
  topic: AlertTopicId;
}

export interface TopicAlertData {
  topic: AlertTopicId;
  enabled: true;
  /** true = was already on; its channels were kept. */
  alreadyEnabled: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// V3 — POST /chat · GET /chat/history · Bearer (no anonymous trial in the app)
// routes: chat/route.ts · chat/history/route.ts:8,23
// app/(site)/modo-chat/data/{guard-chat-request,answer-chat-turn,stream-answer-response,get-chat-history}.ts
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** guard-chat-request.ts chatBodySchema + answer-chat-turn.ts scopeSchema */
export interface ChatBody {
  /** 1–20 turns; content ≤2000; the last "user" turn is the question. No "system" role. */
  messages: { role: "user" | "assistant"; content: string }[];
  /** Default true → NDJSON stream when the answer is generated (see `ChatStreamFrame`). */
  stream?: boolean;
  /** 24-hex; absent on the first turn (the server mints one). */
  conversationId?: string;
  /** One of the two is required (400 «لازم تحدّد مجالاً أو موضوعاً»). */
  industrySlug?: string;
  categorySlug?: string;
}

export interface ChatPartner {
  name: string;
  slug: string;
  canBook: boolean;
  whyRecommended: string;
  logo: string | null;
  city: string | null;
  credential: string | null;
  isVerified: boolean;
}

export interface ChatArticleRef {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  client: { id?: string; name: string; slug: string };
}

/**
 * Enveloped JSON (`{ data }`) when `stream:false`, or when the turn ends early (partners redirect /
 * no sources). Errors: 429 + Retry-After (20/hour · 100/day per account · site cap), 404 scope,
 * 422 invalid body.
 */
export type ChatData =
  | { conversationId: string; type: "message"; text: string; partners?: ChatPartner[] }
  | {
      conversationId: string;
      type: "noSources";
      message: string;
      suggestedArticle?: ChatArticleRef;
      partners?: ChatPartner[];
    };

/**
 * `stream:true` with a generated answer: NOT enveloped. `Content-Type: application/x-ndjson`, one
 * JSON object per line (stream-answer-response.ts).
 */
export type ChatStreamFrame =
  | { type: "ping" }
  | { type: "delta"; text: string }
  | {
      type: "done";
      conversationId: string;
      /** The saved ChatbotMessage id. */
      messageId?: string;
      sourceArticles?: ChatArticleRef[];
      partners?: ChatPartner[];
    }
  | { type: "error"; error: string };

/** GET /chat/history?limit (1–50, default 20)&cursor (24-hex) — get-chat-history.ts */
export interface ChatHistoryData {
  messages: {
    id: string;
    conversationId: string | null;
    userQuery: string;
    assistantResponse: string;
    /** schema.prisma ChatbotMessage.scopeType */
    scopeType: "article" | "industry" | "category" | string;
    scopeLabel: string | null;
    articleSlug: string | null;
    categorySlug: string | null;
    industrySlug: string | null;
    /** "outOfScope" | "redirect" | "stream" | "error" */
    outcome: string;
    /** "web" | "db" | null */
    source: string | null;
    webSources?: unknown[];
    createdAt: string;
  }[];
  nextCursor: string | null;
}
