import { cn } from "@/lib/utils";

import { SectionCard } from "./section-card";
import { ClientReviewForm } from "./client-review-form";

interface ReviewAuthor {
  name: string | null;
  image: string | null;
}

interface ClientReview {
  id: string;
  rating: number;
  comment: string;
  author: ReviewAuthor;
}

interface ClientReviewsSectionProps {
  reviews: ClientReview[];
  averageRating: number;
  reviewCount: number;
  googleUrl?: string | null;
  slug: string;
  isLoggedIn: boolean;
}

/** Five star glyphs, gold-filled up to `rating`, muted for the rest. */
function Stars({ rating, className }: { rating: number; className?: string }) {
  const filled = Math.round(rating);
  return (
    <span className={cn("inline-flex tracking-[1px] text-[12px]", className)} aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < filled ? "text-star" : "text-muted-foreground/40"}>
          ★
        </span>
      ))}
    </span>
  );
}

/**
 * The mockup `.rev` reviews block — an aggregate row (avg · stars · count) then
 * one row per review (avatar · name · stars · comment), and a dashed Google CTA.
 * Pure Server Component. Always visible — visitors can add a review (login-gated)
 * even before the first one exists.
 */
export function ClientReviewsSection({
  reviews,
  averageRating,
  reviewCount,
  googleUrl,
  slug,
  isLoggedIn,
}: ClientReviewsSectionProps) {
  return (
    <SectionCard id="reviews" icon="⭐" title="آراء العملاء">
      {reviewCount === 0 && (
        <p className="text-[12.5px] text-muted-foreground">
          لا توجد تقييمات بعد — كن أول من يقيّم هذه الشركة.
        </p>
      )}

      {reviewCount > 0 && (
        <div className="mb-3.5 flex items-center gap-2 text-xs">
          <span className="text-[19px] font-black text-foreground">
            {averageRating.toFixed(1)}
          </span>
          <Stars rating={averageRating} />
          <span className="text-muted-foreground" aria-hidden>
            من {reviewCount} تقييم
          </span>
          <span className="sr-only">
            متوسط التقييم {averageRating.toFixed(1)} من 5 بناءً على {reviewCount} تقييم
          </span>
        </div>
      )}

      {reviews.map((review) => {
        const name = review.author.name?.trim() || "مستخدم";
        const initial = name.charAt(0);

        return (
          <div
            key={review.id}
            className="mb-2.5 rounded-md border bg-muted/40 p-3.5 last:mb-0"
          >
            <div className="mb-1.5 flex items-center gap-2.5">
              <span
                className="grid h-[33px] w-[33px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-foreground to-accent text-[13px] font-extrabold text-white"
                aria-hidden
              >
                {initial}
              </span>
              <span className="text-[12.5px] font-extrabold text-foreground">
                {name}
              </span>
              <Stars rating={review.rating} className="ms-auto" />
            </div>
            <p className="text-[12.5px] leading-relaxed text-foreground">
              {review.comment}
            </p>
          </div>
        );
      })}

      {googleUrl && (
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mt-3 flex items-center justify-center gap-1.5 rounded-md border border-dashed bg-muted/40 p-2.5 text-[12.5px] font-extrabold text-foreground transition-colors hover:bg-card"
        >
          <span className="text-[14px] font-black" aria-hidden>
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC04]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </span>
          اقرأ كل تقييماتنا على Google ↗
        </a>
      )}

      <ClientReviewForm slug={slug} isLoggedIn={isLoggedIn} />
    </SectionCard>
  );
}
