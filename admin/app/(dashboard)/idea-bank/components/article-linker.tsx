"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { searchArticles, type ArticleHit } from "../actions/search-articles";
import { linkIdeaArticle } from "../actions/link-idea-article";

/**
 * «كُتبت ← اربط مقالها»: بحثٌ في المقالات المنشورة، والاختيار يجعل الفكرة «كُتبت» مربوطةً بمقالها،
 * فيظهر أثرها في تبويب «النتائج» بعد ٣٠ يوماً من نشره.
 */
export function ArticleLinker({ ideaId, defaultQuery }: { ideaId: string; defaultQuery: string }) {
  const [q, setQ] = useState(defaultQuery);
  const [hits, setHits] = useState<ArticleHit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (q.trim().length < 2) return setHits([]);
    const t = setTimeout(() => searchArticles({ q }).then(setHits), 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="space-y-2 rounded-md border border-dashed p-3" onClick={(e) => e.stopPropagation()}>
      <p className="text-sm font-semibold">كُتبت؟ اربطها بمقالها المنشور ليُقاس أثرها بعد ٣٠ يوماً</p>
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث في عناوين المقالات المنشورة…" className="h-9 max-w-md" aria-label="ابحث عن المقال" />
      {hits.length > 0 ? (
        <ul className="space-y-1">
          {hits.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    setError(null);
                    const r = await linkIdeaArticle({ id: ideaId, articleId: h.id });
                    if (!r.success) setError(r.error ?? "تعذّر الربط");
                    router.refresh();
                  })
                }
                className="text-start text-sm text-primary hover:underline disabled:opacity-50"
              >
                {h.title}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        q.trim().length >= 2 && <p className="text-xs text-muted-foreground">لا مقال منشور بهذا العنوان — جرّب كلمة أقصر.</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
