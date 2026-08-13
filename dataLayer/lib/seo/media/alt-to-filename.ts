// Turn an image's alt text into the descriptive part of its file name.
//
// Why the alt text and not a composed name: the alt is the most accurate description of the
// image we will ever have — the writer wrote it looking at the picture. Google's own example
// of a good file name is exactly this shape (`my-new-black-kitten.jpg`), and deriving one from
// the other means a good alt produces a good file name with no second field to fill in.
//
// Weight, stated honestly so nobody over-invests here: Google calls the file name "very light
// clues about the subject matter" while alt text is "the most important attribute". This
// function exists to stop file names being meaningless hashes, not because the name will move
// a ranking on its own.
//
// Pure and framework-free on purpose: the save action and the bulk maintenance job must derive
// the SAME name from the same alt, or the two paths drift and a repair run starts renaming
// files the editor already named.
//
// Character classes are written as \u escapes, not literal Arabic: the literal form mixes RTL
// text into a regex and makes the source unreadable and unsafely editable.

/**
 * Arabic diacritics + tatweel. DELETED, not turned into a separator: tatweel sits INSIDE a
 * word (الــعناية), so hyphenating it split the
 * word in two — caught in testing.
 */
const ARABIC_MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;

/**
 * Characters that break a URL path, plus punctuation that only makes a name ugly.
 *
 * The dash family (‐-―, −) is here deliberately: an em dash is legal in a URL
 * but percent-encodes on the way out, so `a — b` read as `a-%E2%80%94-b` in the address bar.
 * Every dash variant collapses to a plain hyphen.
 */
const UNSAFE =
  /[\\/?#%&+:*"'<>|@!,;.…()[\]{}«»“”‘’،؛؟‐-―−\s]+/g;

/**
 * The longest descriptive part we allow — the same 125 the alt text itself allows, so a full
 * alt is never cut on its way to becoming a name.
 *
 * Neither limit that matters is ours: Bunny documents 6,000 characters for a name plus its
 * path, and Google publishes no number at all ("short, but descriptive"). It was 80, an
 * invented ceiling that silently dropped the tail of a long description.
 *
 * Cutting is the worse failure of the two available: if a name is long, Google shortens it
 * with an ellipsis in the results card and nothing is lost; if WE cut it, the words are gone
 * from the URL for good. `sanitizeBunnyBase` in bunny.ts carries the same number — raise one
 * without the other and the preview promises a name the file will not get.
 */
export const MAX_FILE_BASE = 125;

/**
 * `null` when the alt text yields nothing usable (empty, or only punctuation). The caller must
 * treat that as "do not rename" — never as "rename to a default", which is how every image
 * without alt text would end up sharing one name.
 */
export function altToFileBase(alt: string | null | undefined): string | null {
  if (typeof alt !== "string") return null;

  const base = alt
    .normalize("NFKC")
    .replace(ARABIC_MARKS, "")
    .trim()
    .replace(UNSAFE, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    // Lowercase the Latin part only — Arabic has no case, and a mixed-case name invites the
    // classic bug where two systems disagree about whether the URL is case-sensitive.
    .toLowerCase()
    .slice(0, MAX_FILE_BASE)
    // Slicing can leave a trailing hyphen mid-word; trim again after the cut.
    .replace(/-+$/g, "");

  return base.length > 0 ? base : null;
}
