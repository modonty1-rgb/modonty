import { Suspense } from "react";

import { messages } from "@/lib/i18n/messages";
import { IconFolder } from "@/lib/icons";

import {
  ArticleHeader,
  ArticleFeaturedImage,
  ArticleFooter,
  ArticleCitations,
  ArticleTableOfContents,
} from "../index";
import { AskModoCard } from "../ask-modo-card/AskModoCard";
import { ReaderPartnerCard } from "../partner-card/ReaderPartnerCard";
import { Gallery } from "../gallery/GalleryLazy";
import { ReadMore } from "../read-more/ReadMore";
import { ReaderActions } from "../reader-actions/ReaderActions";
import { ReadingTools } from "../reading-tools/ReadingToolsLazy";
import { ArticleAudioPlayer } from "../audio-player/ArticleAudioPlayerLazy";
import { MobileSection } from "../mobile-section/MobileSection";
import { EngagementFab } from "../engagement-fab/EngagementFab";
import { PartnerCardMobile } from "../partner-card/PartnerCardMobile";
import { ReaderPartnerDetails } from "../partner-card/ReaderPartnerDetails";
import { ReaderComments } from "../comments/ReaderComments";
import { ReaderFaq } from "../faq/ReaderFaq";
import { ArticleBodyLinkTrackerLazy } from "../body-link-tracker/BodyLinkTrackerLazy";

import type { getArticlePageData } from "../../helpers/get-article-page-data";

type ArticlePageData = Awaited<ReturnType<typeof getArticlePageData>>;

interface ArticleMainColumnProps {
  data: ArticlePageData;
}

/**
 * The article column itself — everything between the two rails. Moved out of the page whole,
 * comments included: the reasoning above each block (why the tabs sit under the article, why the
 * summary precedes the image, why the outline bar pins) is the record of decisions taken with
 * measurements, and it belongs beside the markup it explains.
 *
 * Takes the page-data bundle as one prop rather than fifteen: this is a server component
 * composing server components, so nothing here crosses a serialization boundary.
 */
export function ArticleMainColumn({ data }: ArticleMainColumnProps) {
  const {
    article,
    featuredImage,
    outline,
    safeHtml,
    galleryImages,
    allTags,
    visibleTags,
    extraTags,
    keyPoints,
    readMoreTop,
    articleFaqsForJsonLd,
    platformSocialLinks,
  } = data;
  const copy = messages.article;

  return (
    <div className="w-full min-w-0">
      {/* MOBILE: the same four tabs, sticky under the navbar. Desktop draws them on the
          contents card in the rail instead — there is no rail on a phone. */}
      {/* MOBILE only: no rail on a phone, so the tabs ride the article column. */}
      {/* The five tabs used to open the page. They now sit under the article, where the
          actions they offer become possible (Khalid, 21 Aug — mobile refactor).
          Like, save, comment and share are things a reader does when they have FINISHED;
          nobody saves an article they have not read. In front of the first sentence they
          were 55px of the path to the answer and the loudest thing on the screen.
          «استمع» is a before-reading choice, so it did not follow them down — it moved
          into the outline bar instead, beside the reading tools. That bar sits exactly
          where the article starts AND pins while the reader scrolls, so the offer to
          listen is there at the moment it makes sense and stays reachable after it. */}
      <article>
        <ArticleHeader
          title={article.title}
          excerpt={article.excerpt}
          hasKeyPoints={keyPoints.length > 0}
          author={article.author}
          datePublished={article.datePublished}
          createdAt={article.createdAt}
          readingTimeMinutes={article.readingTimeMinutes}
          wordCount={article.wordCount}
          views={article._count.views}
          questionsCount={article._count.faqs}
          reviewer={
            article.client
              ? {
                  name: article.client.name,
                  slug: article.client.slug,
                  // `description` first: it is the one field that says what they DO
                  // («علاج آلام العمود الفقري…»). `slogan` is a brand line and on this
                  // partner it reads "Pain cure" — Latin, and it tells a reader nothing
                  // about why this name is worth trusting on this subject.
                  credential:
                    article.client.description?.trim() ||
                    article.client.businessBrief?.trim() ||
                    article.client.slogan?.trim() ||
                    null,
                }
              : null
          }
        />

        {/* MOBILE: client identity (engagement lives in the sticky top bar; conversion in the bottom bar) */}
        {article.client && (
          <PartnerCardMobile
            client={article.client}
            articleId={article.id}
            labels={copy.partner}
            // Same field, same order as the header's desktop byline — one merged block
            // on a phone instead of that line plus this card saying it twice.
            credential={
              article.client.description?.trim() ||
              article.client.businessBrief?.trim() ||
              article.client.slogan?.trim() ||
              null
            }
            // Only what the row does not already say: their channels, their number,
            // their site, and asking them about this article. The full card repeated the
            // logo, name, ✓, city and brief that are two lines above it — and its cover
            // image was 200px of artwork for a panel the reader opened to find a link.
            details={
              <Suspense fallback={<div className="h-11" aria-hidden />}>
                <ReaderPartnerDetails
                  client={article.client}
                  articleId={article.id}
                  articleTitle={article.title}
                  clientId={article.clientId}
                />
              </Suspense>
            }
          />
        )}

        {/* The summary sits ABOVE the image, not below it. It is the first thing on the
            page that answers anything, so it should not wait behind 412 pixels of
            artwork — the visitor gets the gist in the first screen and reads on by
            choice. Three sentences, one per opening section. */}
        {keyPoints.length > 0 && (
          <div className="mb-5 rounded-xl border border-primary/25 bg-primary/5 p-4">
            <p className="mb-2 text-sm font-bold text-primary">⚡ {copy.summary}</p>
            <ul className="space-y-1.5 ps-5 text-sm leading-relaxed text-foreground/85 [&>li]:list-disc">
              {keyPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {/* The image carried a second newsletter ask on mobile — a dark scrim over the
            bottom third with «جديد … في بريدك 🔔 · اشترك الآن ←». Gone with the strip
            button for the same reason, and the artwork is no longer half-covered. */}
        {featuredImage && (
          <ArticleFeaturedImage image={featuredImage} title={article.title} />
        )}

        {/* The audio card used to sit here. It scrolled out of reach the moment the
            reader started reading, and a second <audio> on the page could play over the
            tab's. The listen tab is the one player now. */}

        {/* MOBILE: the outline bar carries the reading tools (Khalid, 21 Aug) — both
            belong to the article body and nothing else, so they share one bar instead of
            the tools standing as a block of their own above the title.
            It pins at 56, directly under the navbar: it is now the only thing pinned over
            the article, since the action tabs stopped sticking.
            Sticky is the whole point — the tools used to sit still while the page moved,
            so from the middle of an 18,917px article the only way to reach the text size
            was to scroll all the way back to the top. */}
        <div className="sticky top-[var(--sticky-chrome)] z-30 mt-4 lg:hidden">
          <ArticleTableOfContents
            headings={outline.headings}
            collapsible
            // Only the listen tab rides the bar now (Khalid, 21 Aug): the text controls
            // moved into the corner button, where every control the reader owns sits
            // together and the bar goes back to being an outline with one offer on it.
            actions={
              <span className="flex shrink-0 items-center gap-1">
                <Suspense fallback={<div className="h-11 w-[188px]" aria-hidden />}>
                  <ReaderActions
                    articleId={article.id}
                    articleSlug={article.slug}
                    clientId={article.clientId}
                    likes={article._count.likes}
                    favorites={article._count.favorites}
                    audioUrl={article.audioUrl}
                    audioDurationSeconds={article.audioDurationSeconds}
                    labels={copy.actions}
                    show="engagement"
                    size="compact"
                  />
                </Suspense>
                <ArticleAudioPlayer
                  src={article.audioUrl}
                  slug={article.slug}
                  durationSeconds={article.audioDurationSeconds}
                  // Sized to the tools beside it, not to the old 48px tab row.
                  tabClassName="relative flex size-11 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl text-[9px] font-semibold leading-none shadow-sm transition-transform active:scale-[0.94] motion-reduce:active:scale-100"
                />
              </span>
            }
          />
        </div>

        {/* The reading tools ride the body, not the page (Khalid, 19 Aug). This wrapper
            starts where the text starts and ends where it ends, so the icons are simply
            below the fold until the reader reaches the article, and gone again once it
            is over — no observer, no state, no client component doing the deciding.
            `sticky` inside an `absolute` box that spans the body is the whole mechanism.
            Only from xl, where the margin is wide enough to stand in. */}
        <div className="relative">
          {/* An overlay the exact height of the article body: the corner button inside it
              is sticky, so it rides the reading and leaves when the reading ends. */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-end lg:hidden">
            <EngagementFab label={copy.actions.open} closeLabel={copy.actions.close}>
          <div className="flex flex-col items-center gap-2">
            {/* The text controls, in the `bare` column shape they were already built for
                — the boxed row is 106px wide and this stack is one tab across. */}
            <div className="rounded-2xl border border-border bg-card p-2 shadow-lg">
              <ReadingTools bare labels={copy.tools} />
            </div>
          </div>
        </EngagementFab>
          </div>
          <div className="absolute -start-14 top-0 hidden h-full xl:block" aria-hidden={false}>
            <div className="sticky top-[150px]">
              <ReadingTools bare labels={copy.tools} />
            </div>
          </div>

        <div
          id="article-content"
          // Typography ships lists with `list-style: none`, so an ordered list the
          // writer created rendered here as plain paragraphs — the reader lost the
          // sequence and Google got an <ol> with nothing to show. Markers sit in the
          // inline-start padding, hence `ps-*`: in Arabic the number belongs right.
          // `68ch`, not the full column: at 732px the line ran ~90 characters, and past
          // about 75 the eye loses the start of the next line on every return. The
          // heading, image and summary keep the full width — only the running text is
          // capped, which is the ordinary editorial shape.
          className="article-body prose prose-base md:prose-lg mt-6 max-w-[68ch] mb-8 text-right [&_h2]:text-right [&_h3]:text-right [&_h4]:text-right [&_li]:text-right [&_ol]:list-decimal [&_ol]:ps-6 [&_ul]:list-disc [&_ul]:ps-6 [&_li]:my-1"
          // Leading is the typography plugin's now (config: 1.8, and per-element
          // values for headings) — an inline 1.6 here would silently outrank it.
          style={{ direction: "rtl" }}
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
        </div>
        <ArticleBodyLinkTrackerLazy articleId={article.id} />

        {article.citations?.length ? (
          <div className="mb-8 [&_section]:my-0">
            <MobileSection title={copy.sections.citations} count={article.citations.length}>
              <ArticleCitations citations={article.citations} />
            </MobileSection>
          </div>
        ) : null}

        {/* First thing after the last sentence: the question. «عندك سؤال عن المقال؟»
            is never more alive than the second a reader finishes — it used to sit
            third here, behind tags and comments. */}
        {/* Desktop only (Khalid, 21 Aug): on a phone Modo already sits in the bottom
            bar, and this card was the same character asking the same question a second
            time. The bar's Modo now carries the article with it. */}
        <div className="hidden lg:block">
          <AskModoCard slug={article.slug} />
        </div>

        {/* Then who stands behind it, and how to reach them. The card that was in the
            rail lands here at full size, where the reader has a reason to act on it.
            Desktop only since the mobile refactor (Khalid, 21 Aug): on a phone the same
            card opens from the identity row above, and conversion sits in the bottom bar
            — three partner blocks in one column was the reader meeting one name three
            times and reading the third as an ad. */}
        {article.client && (
          <div className="mb-8 hidden lg:block">
            <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" aria-hidden />}>
              <ReaderPartnerCard
                client={article.client}
                articleId={article.id}
                articleTitle={article.title}
                clientId={article.clientId}
                cta={{ mode: article.client.ctaMode, label: article.client.ctaLabel, url: article.client.ctaUrl }}
              />
            </Suspense>
          </div>
        )}

        {/* Category badge + capped tags — AFTER the article, not before it. Tags are
            where you go once you have finished reading; in front of the first
            sentence they are one more block between the visitor and what they came
            for (measured: the first word of the article sat at y=1081). */}
        {(article.category || visibleTags.length > 0) && (
          <MobileSection title={copy.sections.tags} count={allTags.length}>
          <div className="mb-8 flex flex-wrap gap-2">
            {article.category && (
              <a
                href={`/categories/${article.category.slug}`}
                className="inline-flex max-lg:min-h-11 items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                <IconFolder className="h-3.5 w-3.5" />
                {article.category.name}
              </a>
            )}
            {visibleTags.map((t) => (
              <a key={t.id} href={`/tags/${t.slug}`} className="inline-flex max-lg:min-h-11 items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs text-primary">
                #{t.name}
              </a>
            ))}
            {extraTags > 0 && (
              <span className="inline-flex max-lg:min-h-11 items-center rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">+{extraTags} {copy.moreTagsSuffix}</span>
            )}
            {allTags.length > 0 && (
              <a href="/tags" className="inline-flex max-lg:min-h-11 items-center rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
                {copy.allTags}
              </a>
            )}
          </div>
          </MobileSection>
        )}

        {/* «معرض صور المقال» — one copy, every screen, in the reading flow. */}
        <div className="mb-8">
          <MobileSection title={copy.sections.gallery} count={galleryImages.length} defaultOpen>
            <Gallery images={galleryImages} fallbackText={article.client?.description} clientName={article.client?.name} />
          </MobileSection>
        </div>

        <Suspense fallback={<div className="h-11 rounded-xl bg-muted/40" aria-hidden />}>
          <ReaderFaq articleId={article.id} faqsCount={article._count.faqs} faqs={articleFaqsForJsonLd} />
        </Suspense>

        <div id="article-comments">
          <Suspense fallback={<div className="h-11 rounded-xl bg-muted/40" aria-hidden />}>
            <ReaderComments
              comments={article.comments}
              commentsCount={article._count.comments}
              articleId={article.id}
              articleSlug={article.slug}
              sectionTitle={copy.sections.comments}
            />
          </Suspense>
        </div>

        {/* CONSOLIDATED: one "اقرأ أيضاً" grid (replaces the 4 repetitive related sections) */}
        <MobileSection title={copy.sections.readMore} count={readMoreTop.length}>
          <ReadMore articleId={article.id} clientId={article.clientId ?? undefined} items={readMoreTop} />
        </MobileSection>

        {/* The «عن الكاتب» card used to stand on its own above this footer, and repeated
            what the footer already says — who reviewed it, and when. Khalid, 19 Aug: the
            publisher belongs IN the footer, as its second column. One block now answers
            «من كتبه ومن راجعه ومتى», instead of two stacked blocks answering it twice. */}
        <ArticleFooter
          client={article.client}
          author={article.author}
          platformSocialLinks={platformSocialLinks}
          dateModified={article.dateModified}
          lastReviewed={article.lastReviewed}
          contentDepth={article.contentDepth}
          license={article.license}
        />
      </article>
    </div>
  );
}
