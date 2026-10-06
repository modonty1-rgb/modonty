# Content and reader-question flow

## Purpose

The mobile console is one client surface in the same product flow as the admin and the public Modonty site. It must not merge editorial FAQs with questions sent by readers.

## Shared record

Both flows use `ArticleFAQ` in `shared/prisma/schema/schema.prisma`.

| Field | Meaning |
|---|---|
| `source` | Identifies the origin: `manual`, `user`, or `chatbot`. |
| `answer` | Exists for editorial FAQs; may be empty for a reader question until the client replies. |
| `status` | `PENDING`, `PUBLISHED`, or `REJECTED`. |

## Editorial FAQ — content team

1. The admin content form writes a complete question and answer for the article.
2. The row is `source = manual` and starts as `PENDING`.
3. In the client article-review flow, the client accepts the existing answer or rejects that FAQ.
4. Acceptance makes the row `PUBLISHED`; rejection makes it `REJECTED`.
5. The public article renders only `PUBLISHED` FAQs with a non-empty answer.

This review belongs inside the article-review experience alongside the rendered HTML and citations. It is separate from article approval: approving the article changes `AWAITING_APPROVAL` to `SCHEDULED`, but does not publish pending FAQs.

## Reader question — public visitor or Modo

1. A signed-in reader asks from a published public article, or Modo creates a question.
2. The row is `source = user` or `source = chatbot`, starts as `PENDING`, and can have no answer.
3. The client sees it in the questions inbox, not in the editorial-FAQ review list.
4. The client either writes an answer and publishes it, or rejects it.
5. Publishing writes the answer, changes the row to `PUBLISHED`, revalidates the public article, and notifies the reader when identity data exists.

### Data visible to the owning client

The reader-question inbox may show the question, `submittedByName`, `submittedByEmail`, `source`, the linked article title and slug, `status`, any existing answer, and `createdAt` / `updatedAt`. The email is private account data: it is returned only from the authenticated audience API for the owning client and never from the public article or editorial-FAQ review API.

## API and mobile requirements

- The article-detail API must return `source`, `submittedByName`, and `submittedByEmail` for every FAQ row before the mobile UI can classify it.
- Editorial FAQ actions must be limited to `source = manual` and use the FAQ's stored answer.
- Reader-question actions must be limited to `source = user | chatbot`; publishing requires a non-empty client answer.
- The mobile article screen owns article approval and request-changes. The audience/questions screen owns reader-question handling.
- Citations remain visible only when the client/article meets the existing YMYL rule and citation data exists.

## Existing-system references

- Admin editorial FAQ creation: `admin/app/(dashboard)/articles/components/faq-builder.tsx` and `admin/app/(dashboard)/articles/actions/articles-actions/mutations/create-article.ts`.
- Public rendering condition: `modonty/app/(site)/articles/[slug]/data/get-article-faqs.ts`.
- Reader submission: `modonty/components/client/submit-ask-client.ts`.
- Console editorial FAQ area: `console/app/(dashboard)/dashboard/faqs`.
- Console reader-question inbox: `console/app/(dashboard)/dashboard/questions`.
- Shared answer publisher: `console/lib/faq/publish-faq-answer.ts`.

## Known risk — do not change without an explicit fix task

The admin article-update mutation currently deletes every `ArticleFAQ` for the article before recreating its content-form FAQs. Because it does not filter `source`, it can remove reader questions too. This is a discovered issue, not fixed by the mobile work.
