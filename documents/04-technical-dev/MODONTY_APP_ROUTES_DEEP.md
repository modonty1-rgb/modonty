# Modonty App — Routes & API Reference

**Base URL**: `NEXT_PUBLIC_SITE_URL` (defaults to `https://modonty.com`)
**Framework**: Next.js App Router

## Global Shell

**Root Layout**: `modonty/app/layout.tsx`
- `lang="ar"`, `dir="rtl"`
- SessionProviderWrapper, TopNavWithFavorites, Footer
- MobileFooterWithFavorites, GTM
- SEO title template: `%s | مودونتي`

**Nested Layouts**:
- `modonty/app/clients/[slug]/layout.tsx` - Client pages: loads client, breadcrumb, ClientHero, ClientStickyProvider (tabs), GTMClientTracker, Suspense
- `modonty/app/users/profile/layout.tsx` - Profile pages: shared metadata

## Page Routes (User-Facing)

### Home & Discovery

| URL | File | Notes |
|-----|------|-------|
| `/` | `app/page.tsx` | Home feed; query: `?category=<slug>` filters by category |
| `/search` | `app/search/page.tsx` | Query: `q`, `page`, `type` (`all`/`articles`/`clients`), `sort_articles` (`newest`/`oldest`/`title`), `sort_clients` (`name-asc`/`articles-desc`/`newest`) |
| `/trending` | `app/trending/page.tsx` | Query: `?period=` (7/14/30 days; default 7) |

### Articles

| URL | File |
|-----|------|
| `/articles/[slug]` | Full content, sidebar, comments, interactions, JSON-LD |

### Categories

| URL | File |
|-----|------|
| `/categories` | Index with search, sort, view mode, featured filter |
| `/categories/[slug]` | Category articles + SEO/breadcrumbs |

### Clients (Brand Pages)

| URL | File | Content |
|-----|------|---------|
| `/clients` | Directory: hero, featured, industries, full list |
| `/clients/[slug]` | Client hub: feed, columns, tracking, engagement data |
| `/clients/[slug]/about` | About copy, contact, official data |
| `/clients/[slug]/contact` | Contact form |
| `/clients/[slug]/followers` | Followers list |
| `/clients/[slug]/likes` | Engagement stats (followers/favorites/likes counts) |
| `/clients/[slug]/mentions` | Mentions section |
| `/clients/[slug]/photos` | Photo gallery |
| `/clients/[slug]/reels` | Reels-style listing |
| `/clients/[slug]/reviews` | Reviews list |

### Legal & Marketing

| URL | File |
|-----|------|
| `/about` | About Modonty |
| `/contact` | Site-wide contact |
| `/help` | Help center landing |
| `/help/faq` | FAQ + structured data |
| `/help/feedback` | Feedback form |
| `/news` | Newsletter page |
| `/news/subscribe` | Newsletter signup |
| `/subscribe` | General signup |
| `/terms` | Terms and conditions |
| `/legal/privacy-policy` | Privacy policy |
| `/legal/cookie-policy` | Cookie policy |
| `/legal/copyright-policy` | Copyright policy |
| `/legal/user-agreement` | User agreement |

### Auth & Account

| URL | File | Notes |
|-----|------|-------|
| `/users/login` | Email/password + Google OAuth; query: `callbackUrl` (validated: must start with `/`) |
| `/users/register` | Redirects home if authenticated |
| `/users/profile` | Stats, activity; redirects to login if unauthenticated |
| `/users/profile/settings` | Tabs: profile, security, privacy, notifications (dynamic imports) |
| `/users/profile/liked` | Liked items (clients, articles, comments) |
| `/users/profile/disliked` | Disliked items |
| `/users/profile/favorites` | Favorited articles |
| `/users/profile/following` | Followed clients |
| `/users/profile/comments` | User's comments with moderation status |
| `/users/notifications` | Requires auth; query: `id` (selected notification), `tab` (`all`/`new`/`read`) |
| `/users/[id]` | Public profile (tries User by id, then Author by slug) |

## API Routes (`/api/*`)

### Auth

| Path | Methods | Purpose |
|------|---------|---------|
| `/api/auth/[...nextauth]` | NextAuth | Session, OAuth, credentials |

### Articles

| Path | Methods | Purpose |
|------|---------|---------|
| `/api/articles` | GET | Paginated: `page`, `limit`, `category`, `client`, `featured` |
| `/api/articles/featured` | GET | Featured articles |
| `/api/articles/[slug]/view` | POST | Record view |
| `/api/articles/[slug]/like` | POST, DELETE | Like/unlike |
| `/api/articles/[slug]/dislike` | POST, DELETE | Dislike/remove |
| `/api/articles/[slug]/favorite` | POST, DELETE | Favorite/unfavorite |
| `/api/articles/[slug]/share` | POST | Share tracking |
| `/api/articles/[slug]/comments` | GET, POST | List/create comments |
| `/api/articles/[slug]/comments/[commentId]` | POST | Comment action (reply, etc.) |
| `/api/articles/[slug]/chat` | POST | Article-scoped chat |
| `/api/articles/[slug]/interactions` | GET | Aggregated interaction state |

### Comments (Global)

| Path | Methods |
|------|---------|
| `/api/comments/[id]/like` | POST |
| `/api/comments/[id]/dislike` | POST |

### Categories

| Path | Methods | Purpose |
|------|---------|---------|
| `/api/categories` | GET | List/filter |
| `/api/categories/[slug]` | GET | Single category |
| `/api/categories/[slug]/analytics` | GET | Analytics |

### Clients

| Path | Methods | Purpose |
|------|---------|---------|
| `/api/clients` | GET | All clients with counts |
| `/api/clients/[slug]` | GET | Single client JSON |
| `/api/clients/[slug]/view` | POST | View tracking |
| `/api/clients/[slug]/follow` | GET, POST, DELETE | Follow state/actions |
| `/api/clients/[slug]/followers` | GET | Followers list |
| `/api/clients/[slug]/share` | POST | Share tracking |

### Users

| Path | Methods |
|------|---------|
| `/api/users/profile` | GET (auth) |
| `/api/users/notifications` | GET, PATCH (auth) |
