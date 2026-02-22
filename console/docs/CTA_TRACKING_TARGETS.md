# CTA tracking targets

Which CTAs we track, where they live, and what each covers. This doc is the source of truth for the CTA click-tracking plan.

**Out of scope (not CTAs):** Like, dislike, and add to favorite are engagement/reaction events. They are tracked via ArticleLike, ArticleDislike, ArticleFavorite. Per best practice they are not counted as CTAs (CTA = next-step actions; like/fav = in-place reaction).

---


## 1. اقرأ المزيد (Read more)

| Field | Value |
|-------|--------|
| **Label** | اقرأ المزيد |
| **Type** | LINK |
| **Where** | Feed card (home, search, client feed, trending, etc.) |
| **File** | `modonty/components/feed/postcard/PostCardBody.tsx` |
| **Element** | Link to article |
| **Covers** | Click from feed card into the article (intent to read) |
| **Payload** | type: LINK, label: "اقرأ المزيد", targetUrl: `/articles/{slug}`, articleId, clientId |

---

## 2. اشترك (Subscribe)

| Field | Value |
|-------|--------|
| **Label** | اشترك |
| **Type** | BUTTON |
| **Where** | Article page sidebar (and mobile sidebar) — newsletter CTA |
| **File** | `modonty/app/articles/[slug]/components/sidebar/newsletter-cta.tsx` |
| **Element** | Submit button "اشترك" in newsletter form |
| **Covers** | Click to submit newsletter subscription (intent to subscribe) |
| **Payload** | type: BUTTON, label: "اشترك", targetUrl: current path, clientId, articleId (optional) |

---

## 3. Visit client page (client name link)

| Field | Value |
|-------|--------|
| **Label** | Client name (e.g. عميل الاسم) |
| **Type** | LINK |
| **Where** | Article page left sidebar — client card |
| **File** | `modonty/app/articles/[slug]/components/sidebar/article-client-card.tsx` |
| **Element** | Link to `/clients/{client.slug}` (client name + chevron) |
| **Covers** | Click from article to client/brand page |
| **Payload** | type: LINK, label: client.name, targetUrl: `/clients/{client.slug}`, articleId, clientId |

---

## 4. اسأل العميل (Ask client / Ask question)

| Field | Value |
|-------|--------|
| **Label** | اسأل العميل |
| **Type** | FORM |
| **Where** | Article page — client card (Ask Client dialog trigger) and mobile sidebar |
| **File** | `modonty/app/articles/[slug]/components/ask-client-dialog.tsx` |
| **Element** | Dialog trigger (open) or submit "إرسال السؤال" |
| **Covers** | Open “ask question” dialog or submit question (intent to ask) |
| **Payload** | type: FORM, label: "اسأل العميل", targetUrl: "#", articleId, clientId |

---

## 5. Comment (add comment)

| Field | Value |
|-------|--------|
| **Label** | تعليق / إرسال التعليق (or trigger label) |
| **Type** | FORM |
| **Where** | Article page — CommentFormDialog / CommentForm |
| **File** | `modonty/app/articles/[slug]/components/comment-form-dialog.tsx`, `comment-form.tsx` |
| **Element** | Dialog trigger or submit button |
| **Covers** | Intent to comment or submit comment |
| **Payload** | type: FORM, label: e.g. "تعليق", targetUrl: "#", articleId, clientId |

---

## 6. Share (مشاركة)

| Field | Value |
|-------|--------|
| **Label** | مشاركة (or per-platform: Twitter, LinkedIn, etc.) |
| **Type** | LINK or BUTTON |
| **Where** | Article page — share buttons |
| **File** | `modonty/app/articles/[slug]/components/article-share-buttons.tsx` |
| **Element** | Share icon/link per platform |
| **Covers** | Intent to share article |
| **Payload** | type: LINK, label: platform or "مشاركة", targetUrl: share URL, articleId, clientId |

---

## 7. More from client / Related article links

| Field | Value |
|-------|--------|
| **Label** | Article title or "المزيد من {client}" |
| **Type** | LINK |
| **Where** | Article page — MoreFromClient, RelatedArticles, ArticleManualRelated |
| **File** | `modonty/app/articles/[slug]/components/more-from-client.tsx`, `related-articles.tsx`, `article-manual-related.tsx` |
| **Element** | Link to another article `/articles/{slug}` |
| **Covers** | Click to another article (same client or related) |
| **Payload** | type: LINK, label: article title or section label, targetUrl: `/articles/{slug}`, articleId (current), clientId, optional relatedArticleId |

---

## 8. زيارة الموقع (Visit website) — client profile

| Field | Value |
|-------|--------|
| **Label** | زيارة الموقع |
| **Type** | LINK |
| **Where** | Client profile page — hero CTA |
| **File** | `modonty/app/clients/[slug]/components/hero/hero-cta.tsx` |
| **Element** | "زيارة الموقع" button (external link to client website) |
| **Covers** | Click to visit client's external website |
| **Payload** | type: LINK, label: "زيارة الموقع", targetUrl: client.url (external), clientId |

---

## Summary

| # | Label / CTA | Type | Location | Covered |
|---|-------------|------|----------|---------|
| 1 | اقرأ المزيد | LINK | Feed card | Yes |
| 2 | اشترك | BUTTON | Article sidebar newsletter | Yes |
| 3 | Visit client page | LINK | Article sidebar client card | Yes |
| 4 | اسأل العميل | FORM | Article — Ask Client dialog | Yes |
| 5 | Comment | FORM | Article — CommentFormDialog | Yes |
| 6 | Share (مشاركة) | LINK/BUTTON | Article — share buttons | Yes |
| 7 | More from client / Related links | LINK | Article — related sections | Yes |
| 8 | زيارة الموقع | LINK | Client profile hero | Yes |
