interface ArticlesHeaderProps {
  /** Page number, so the `h1` on `?page=3` is not a duplicate of the one on page one. */
  page: number;
}

/**
 * The page's name, at the top of the phone — the same treatment `/modonty` opens with
 * (Khalid, 22 Aug: «add title like modonty page at the top»): a 28px black line with the
 * brand's teal rule beside it, and one sentence under it aimed at a reader.
 *
 * This is the page's ONLY `h1`. The archive used to hide one inside the list; two would be
 * two names for one page. It stays in the markup on the desktop as `sr-only`, where Khalid
 * removed the visible title strip on 19 Aug — a page with no `h1` loses its name in search
 * results and leaves a screen reader with nothing to announce.
 */
export function ArticlesHeader({ page }: ArticlesHeaderProps) {
  return (
    <header className="min-[1240px]:sr-only">
      <h1 className="relative ps-3 text-[28px] font-black leading-[1.15] tracking-tight text-foreground before:absolute before:inset-y-1 before:start-0 before:w-[3px] before:rounded-full before:bg-accent">
        {page > 1 ? `المقالات — صفحة ${page.toLocaleString("ar-SA")}` : "المقالات"}
      </h1>
      {/* Aimed at someone who came to read, not at someone deciding whether to buy — the
          same reading `/modonty`'s promise line was rewritten under on 22 Aug. */}
      <p className="mt-1.5 ps-3 text-[15px] leading-[1.75] text-foreground/85">
        اقرأ اللي يهمّك — بأقلام أهل التخصص.
      </p>
    </header>
  );
}
