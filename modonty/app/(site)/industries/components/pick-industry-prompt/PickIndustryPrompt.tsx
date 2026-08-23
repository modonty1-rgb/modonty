import { ModontySearchMark } from "@/components/icons/modonty-search-mark";

/**
 * What a phone shows on the base `/industries` page before a field is picked. Born on
 * `/articles` (22 Aug: «no industry, no article») and moved HERE the next day, when Khalid
 * split the two pages by intent: `/articles` opens with every article, and choosing a sector
 * became this page's whole job — so this is where the choice greets the visitor.
 *
 * The combined feed still RENDERS into the HTML; this card covers it for the reader only.
 * That is the whole reason it is hidden with a class instead of skipped on the server:
 * Google crawls with a phone user-agent, and a page that truly emitted nothing would be
 * indexed as nothing. The reader gets the choice, the crawler keeps the list.
 *
 * The copy names NO taxonomy word (Khalid, 22 Aug — he read «مجالاً» on the live screen and
 * it did not land). «مجال» is our filing word, not the reader's; the card asks him what he
 * wants to read and points up at tiles that explain themselves.
 */
export function PickIndustryPrompt() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
      <ModontySearchMark className="mx-auto size-12 text-muted-foreground" aria-hidden />
      <p className="mt-4 text-sm font-bold text-foreground">وش تحب تقرأ؟</p>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        اختر من فوق، وتطلع لك المقالات هنا.
      </p>
    </div>
  );
}
