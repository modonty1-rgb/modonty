declare module "@marbec/web-auto-extractor" {
  /**
   * What `parse()` actually returns.
   *
   * The package ships no types of its own, so this file is hand-written — and it used to say
   * `parse(html: string): unknown[]`. It is not an array. That single wrong word made
   * `page-extractor.ts` guard its entire processing loop with `Array.isArray(...)`, which was
   * false every time, so the extractor silently reported no microdata and no RDFa on every
   * page it was ever given.
   *
   * Corrected against the INSTALLED package (@marbec/web-auto-extractor 2.2.1), two ways:
   *
   *   · its README states the output format:
   *       { "metatags": {}, "microdata": {}, "rdfa": {}, "jsonld": {}, "headings": {} }
   *
   *   · and running it on a page carrying JSON-LD + microdata + a meta tag printed:
   *       Array.isArray(parse()) = false
   *       keys = [metatags, microdata, rdfa, jsonld, headings, errors]
   *       jsonld = { Article: [ { "@context", "@type", "headline", "@location" } ] }
   *
   * Note `errors` — present in the real output and absent from the README. Anything reading
   * this result should read the object rather than assume the documented key list is complete.
   */
  export interface WebAutoExtractorResult {
    /** `{ "description": ["hello"] }` — one entry per meta name, values as an array. */
    metatags: Record<string, string[]>;
    /** `{ "Person": [ … ] }` — entities grouped by schema.org type. */
    microdata: Record<string, unknown[]>;
    rdfa: Record<string, unknown[]>;
    jsonld: Record<string, unknown[]>;
    headings: Record<string, unknown[]>;
    /** Undocumented in the README; observed in the real output. */
    errors?: unknown[];
  }

  export default class WebAutoExtractor {
    constructor(options?: {
      addLocation?: boolean;
      embedSource?: boolean | ("rdfa" | "microdata")[];
      skipEmptyHeadings?: boolean;
      skipLayoutElements?: boolean;
    });
    parse(html: string): WebAutoExtractorResult;
  }
}
