# Modonty app — routes & API (deep reference)

**App:** `modonty/` (Next.js App Router)  
**Source of truth:** folder layout under `modonty/app/`  
**Base URL (prod default):** `NEXT_PUBLIC_SITE_URL` → falls back to `https://modonty.com` in root layout metadata.

---

## 1. Global shell (all pages)

| File | Role |
|------|------|
| `modonty/app/layout.tsx` | Root layout: `lang="ar"` `dir="rtl"`, `SessionProviderWrapper`, `TopNavWithFavorites`, footer, `MobileFooterWithFavorites`, GTM, default SEO title template `%s \| مودونتي`. |

Nested layouts:

| File | Wraps |
|------|--------|
| `modonty/app/clients/[slug]/layout.tsx` | All `/clients/[slug]/*` routes: loads client via `getClientPageData`, 404 if missing; breadcrumb; `ClientHero`; `ClientStickyProvider` (tabs); `GTMClientTracker` with client context; `Suspense` around children. |
| `modonty/app/users/profile/layout.tsx` | `/users/profile/*`: shared profile SEO metadata only; children pass through. |

---

## 2. Page routes (user-facing)

Dynamic segments are **placeholders** (e.g. `[slug]`, `[id]`).

### 2.1 Core feed & discovery

| URL | File | Purpose & notes |
|-----|------|-------------------|
| `/` | `app/page.tsx` | **Home feed:** articles via `getArticles` + `FeedContainer`; SEO from `getHomePageSeo`. **Query:** `?category=<slug>` filters by category. |
| `/search` | `app/search/page.tsx` | **Search** articles and/or clients. **Query:** `q`, `page`, `type` (`all` \| `articles` \| `clients`), `sort_articles` (`newest` \| `oldest` \| `title`), `sort_clients` (e.g. `name-asc`, `articles-desc`, `newest`, …). Metadata reflects query. |
| `/trending` | `app/trending/page.tsx` | **Trending articles** (server-rendered). **Query:** `?period=` → `7` \| `14` \| `30` (days; invalid → 7). SEO from `getTrendingPageSeo`. |
| `/articles/[slug]` | `app/articles/[slug]/page.tsx` | **Single article:** full content, interactions, SEO/JSON-LD; not-found handling for missing article. |

### 2.2 Categories

| URL | File | Purpose & notes |
|-----|------|-------------------|
| `/categories` | `app/categories/page.tsx` | **Category index:** search, sort, view mode, featured filter via `parseCategorySearchParams`; SEO from `getCategoriesPageSeo`. |
| `/categories/[slug]` | `app/categories/[slug]/page.tsx` | **One category:** listing + SEO/breadcrumbs from category record. |

### 2.3 Clients (brands / tenant pages)

| URL | File | Purpose & notes |
|-----|------|-------------------|
| `/clients` | `app/clients/page.tsx` | **Clients directory:** hero, featured, industries, full list; SEO from `getClientsPageSeo`. |
| `/clients/[slug]` | `app/clients/[slug]/page.tsx` | **Client hub:** main feed (`ClientPageFeed`), left/right columns, view tracking, reviews/followers/engagement data; uses `generateStaticParams` for all client slugs. |
| `/clients/[slug]/about` | `.../about/page.tsx` | Company/about copy, `ClientAbout`, `ClientContact`, `ClientOfficialData`. |
| `/clients/[slug]/contact` | `.../contact/page.tsx` | **Contact form** for that client (`ContactForm`); pre-fills name/email from session if present. |
| `/clients/[slug]/followers` | `.../followers/page.tsx` | **Followers list** (`ClientFollowersList`). |
| `/clients/[slug]/likes` | `.../likes/page.tsx` | **Engagement stats:** followers / favorites / article likes counts (empty state if none). |
| `/clients/[slug]/mentions` | `.../mentions/page.tsx` | **Mentions** section for the client. |
| `/clients/[slug]/photos` | `.../photos/page.tsx` | **Photos** gallery (`ClientPhotosPreview`). |
| `/clients/[slug]/reels` | `.../reels/page.tsx` | **Reels-style** listing derived from client articles (video-style cards). |
| `/clients/[slug]/reviews` | `.../reviews/page.tsx` | **Reviews** list (`getClientReviewsBySlug`). |

### 2.4 Marketing, legal, help

| URL | File | Purpose |
|-----|------|---------|
| `/about` | `app/about/page.tsx` | About Modonty (“من نحن”). |
| `/contact` | `app/contact/page.tsx` | Site-wide contact. |
| `/help` | `app/help/page.tsx` | Help center landing. |
| `/help/faq` | `app/help/faq/page.tsx` | FAQ (+ FAQ structured data). |
| `/help/feedback` | `app/help/feedback/page.tsx` | Feedback form. |
| `/news` | `app/news/page.tsx` | News / newsletter content page. |
| `/news/subscribe` | `app/news/subscribe/page.tsx` | Newsletter signup (news flow). |
| `/subscribe` | `app/subscribe/page.tsx` | General newsletter signup. |
| `/terms` | `app/terms/page.tsx` | Terms and conditions (may pull CMS/settings content). |
| `/legal/privacy-policy` | `app/legal/privacy-policy/page.tsx` | Privacy policy. |
| `/legal/cookie-policy` | `app/legal/cookie-policy/page.tsx` | Cookie policy. |
| `/legal/copyright-policy` | `app/legal/copyright-policy/page.tsx` | Copyright / IP policy. |
| `/legal/user-agreement` | `app/legal/user-agreement/page.tsx` | User agreement. |

### 2.5 Auth & account

| URL | File | Purpose & notes |
|-----|------|-------------------|
| `/users/login` | `app/users/login/page.tsx` | **Login** (client): email/password + Google OAuth; `callbackUrl` query (must start with `/` or forced to `/`). |
| `/users/register` | `app/users/register/page.tsx` | **Register**; redirects home if already authenticated. |
| `/users/profile` | `app/users/profile/page.tsx` | **My profile** (client): stats, activity; redirects to login if unauthenticated. |
| `/users/profile/settings` | `.../settings/page.tsx` | **Settings** tabs: profile, security, privacy, notifications (dynamic imports, partial SSR off for some panels). |
| `/users/profile/liked` | `.../liked/page.tsx` | **Liked items** (clients, articles, comments). |
| `/users/profile/disliked` | `.../disliked/page.tsx` | **Disliked items**. |
| `/users/profile/favorites` | `.../favorites/page.tsx` | **Favorited articles**. |
| `/users/profile/following` | `.../following/page.tsx` | **Followed clients** (+ follow button). |
| `/users/profile/comments` | `.../comments/page.tsx` | **User’s comments** on articles (with moderation status). |
| `/users/notifications` | `app/users/notifications/page.tsx` | **Notifications** (server): requires auth; **Query:** `id` (selected notification), `tab` (`all` \| `new` \| `read`); loads `contactMessage` detail when applicable. |
| `/users/[id]` | `app/users/[id]/page.tsx` | **Public profile:** tries `User` by `id` first, then `Author` by `slug` matching `id`; author/article SEO patterns. |

---

## 3. API routes (`/api/*`)

Convention: Route Handlers in `modonty/app/api/**/route.ts`. Below: **path** and **HTTP methods** (from exports).

### 3.1 Auth

| Path | Methods | Role |
|------|---------|------|
| `/api/auth/[...nextauth]` | *NextAuth* | Session, OAuth, credentials, etc. |

### 3.2 Articles

| Path | Methods | Role |
|------|---------|------|
| `/api/articles` | GET | Paginated articles: query `page`, `limit`, `category`, `client`, `featured`. |
| `/api/articles/featured` | GET | Featured articles. |
| `/api/articles/[slug]/view` | POST | Record article view. |
| `/api/articles/[slug]/like` | POST, DELETE | Like / unlike article. |
| `/api/articles/[slug]/dislike` | POST, DELETE | Dislike / remove dislike. |
| `/api/articles/[slug]/favorite` | POST, DELETE | Favorite / unfavorite. |
| `/api/articles/[slug]/share` | POST | Share event / payload. |
| `/api/articles/[slug]/comments` | GET, POST | List / create comments. |
| `/api/articles/[slug]/comments/[commentId]` | POST | Comment sub-action (e.g. reply — verify in file). |
| `/api/articles/[slug]/chat` | POST | Article-scoped chat (e.g. AI). |
| `/api/articles/[slug]/interactions` | GET | Aggregated interaction state. |

### 3.3 Comments (global)

| Path | Methods | Role |
|------|---------|------|
| `/api/comments/[id]/like` | POST | Like a comment. |
| `/api/comments/[id]/dislike` | POST | Dislike a comment. |

### 3.4 Categories

| Path | Methods | Role |
|------|---------|------|
| `/api/categories` | GET | List/filter categories. |
| `/api/categories/[slug]` | GET | Single category payload. |
| `/api/categories/[slug]/analytics` | GET | Category analytics. |

### 3.5 Clients

| Path | Methods | Role |
|------|---------|------|
| `/api/clients` | GET | All clients with counts (matches directory data source). |
| `/api/clients/[slug]` | GET | Single client JSON. |
| `/api/clients/[slug]/view` | POST | Client profile view tracking. |
| `/api/clients/[slug]/follow` | GET, POST, DELETE | Follow state / follow / unfollow. |
| `/api/clients/[slug]/followers` | GET | Followers list API. |
| `/api/clients/[slug]/share` | POST | Share tracking / payload for client page. |

### 3.6 Users

| Path | Methods | Role |
|------|---------|------|
| `/api/users/[id]` | GET | Public user/author profile API. |
| `/api/users/[id]/stats` | GET | Profile stats. |
| `/api/users/[id]/activity` | GET | Activity feed. |
| `/api/users/[id]/liked` | GET | Liked items. |
| `/api/users/[id]/disliked` | GET | Disliked items. |
| `/api/users/[id]/favorites` | GET | Favorites. |
| `/api/users/[id]/following` | GET | Following clients. |
| `/api/users/[id]/comments` | GET | User comments. |
| `/api/users/[id]/settings` | GET, PUT | Profile/settings. |
| `/api/users/[id]/settings/password` | POST | Password change/create. |
| `/api/users/[id]/accounts` | GET | Linked accounts (OAuth). |

### 3.7 Notifications

| Path | Methods | Role |
|------|---------|------|
| `/api/notifications` | GET | List notifications (for bell / client UI). |
| `/api/notifications/[id]/read` | PATCH | Mark one notification read. |

### 3.8 Contact, newsletters, subscribers

| Path | Methods | Role |
|------|---------|------|
| `/api/contact` | POST | Site contact form submission. |
| `/api/subscribe` | POST | General subscribe. |
| `/api/news/subscribe` | POST | News newsletter subscribe. |
| `/api/subscribers` | POST | Subscriber capture (implementation-specific). |

### 3.9 Tracking & revalidation

| Path | Methods | Role |
|------|---------|------|
| `/api/track/cta-click` | POST | CTA click analytics. |
| `/api/track/article-link-click` | POST | Outbound link click from article. |
| `/api/track/analytics/[id]` | PATCH | Generic analytics update by id. |
| `/api/revalidate/tag` | POST | ISR revalidate by tag (protected usage). |
| `/api/revalidate/article` | POST | Revalidate article caches. |

### 3.10 Chatbot & navigation

| Path | Methods | Role |
|------|---------|------|
| `/api/chatbot/chat` | POST | Chat completion/message. |
| `/api/chatbot/history` | GET | Conversation history. |
| `/api/chatbot/topics` | GET | Topic list. |
| `/api/navigation` | GET | Nav/menu payload for header. |
| `/api/suggestions/articles` | GET | Suggested articles (query-driven). |

---

## 4. Quick lookup: “which file implements URL X?”

- Replace `modonty.com` with your dev origin (e.g. `http://localhost:3000`).
- **Pages** map 1:1 to `app/.../page.tsx` paths (omit `page.tsx`, use folders).
- **API** map 1:1 to `app/api/.../route.ts`.

---

## 5. Maintenance notes

- Adding a **new page**: create `modonty/app/<segment>/page.tsx` (and `layout.tsx` only if shared chrome is needed).
- **Client section** shared UI lives under `modonty/app/clients/[slug]/components/`, `helpers/`, etc. (route-local).
- This document was generated from the repository structure; if routes drift, diff against `glob **/page.tsx` and `glob **/route.ts` under `modonty/app`.

---

*Last aligned to app tree as of commit workspace state (modonty `app/` routes).*
