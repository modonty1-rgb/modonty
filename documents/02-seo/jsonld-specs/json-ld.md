Recommendation: Hybrid approach (recommended)
Store both, but with a smart fallback strategy.
Advantages
Performance
Faster page rendering: no metadata generation on every request
Reduced database queries: no need to fetch client/author/category relations for metadata
Lower CPU usage: no computation during page render
Better scalability: handles high traffic better
Consistency
Predictable: what you see in admin preview = what appears on frontend
SEO stability: metadata doesn't change between renders
No race conditions: metadata is locked at save time
Developer experience
Easier debugging: can inspect stored metadata in DB
Clear separation: generation logic in one place (save time)
Better testing: can test metadata generation independently
Current state
JSON-LD is already cached (you're already doing this)
Article page already uses cached JSON-LD (line 180-186 in beta/app/articles/[slug]/page.tsx)
This extends the same pattern to metadata
Disadvantages
Storage overhead
Additional JSON field in database (~1-2KB per article)
Impact: minimal (MongoDB handles JSON well)
Staleness risk
If article data changes, stored metadata might be outdated
Solution: regenerate metadata when article is updated
Cache invalidation complexity
Need to regenerate when:
Article is updated
Client name/logo changes (affects metadata)
Author name changes (affects metadata)
Category name changes (affects metadata)
Solution: add regeneration triggers on related data changes
Migration complexity
Need to:
Add new field to schema
Migrate existing articles (generate metadata for old articles)
Handle articles without stored metadata (fallback)
Type safety
JSON field loses TypeScript type checking
Solution: validate JSON structure when storing/reading
Version compatibility
If Next.js Metadata format changes, stored data might be incompatible
Solution: add version field + migration logic
Recommended approach: Hybrid with fallback
// In generateMetadata()export async function generateMetadata({ params }): Promise<Metadata> { const article = await db.article.findUnique({ where: { slug }, select: { nextjsMetadata: true, // NEW: stored metadata // ... minimal fields for fallback } }); // 1. Use stored metadata if available and valid if (article?.nextjsMetadata) { try { const stored = article.nextjsMetadata as Metadata; // Validate it's not too old (optional) return stored; } catch { // Invalid JSON, fall through to generation } } // 2. Fallback: Generate on-the-fly (current behavior) return generateMetadataFromSEO({ ... });}
Benefits of hybrid
Best of both worlds: fast when cached, works when not
Backward compatible: existing articles work immediately
Progressive enhancement: new articles get caching, old ones generate
Safe: always has fallback if stored data is invalid
Implementation strategy
Phase 1: Add field and generate on save
Add nextjsMetadata Json? to Article schema
Generate and save metadata in createArticle()
Generate and save metadata in updateArticle()
Article page uses stored metadata if available
Phase 2: Migration (optional)
Background job to generate metadata for existing articles
Run during low-traffic periods
Phase 3: Cache invalidation
Regenerate metadata when:
Article is updated
Client name/logo changes (affects all client articles)
Author name changes (affects all author articles)
Final recommendation
Yes, proceed with the hybrid approach.
Reasons:
JSON-LD caching is already working
Performance benefits are significant
Fallback ensures safety
Aligns with Next.js best practices (pre-generate when possible)
Low risk: if stored data is invalid, fallback works
Should I proceed with this hybrid approach?
