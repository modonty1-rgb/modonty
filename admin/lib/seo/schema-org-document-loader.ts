import * as jsonld from "jsonld";

import schemaOrgContext from "./schema-org-context.json";

/**
 * The `@context` URLs our JSON-LD declares, served from disk instead of the network.
 *
 * schema.org publishes the same document at several URLs and jsonld.js keys its cache on the
 * exact string it is given, so every spelling we emit has to be listed or it falls through to
 * the network again.
 */
/**
 * النوع مأخوذ من `RemoteDocument["document"]` نفسه لا مكتوباً بيدي — فلو تغيّر ملفّ
 * الأنواع في ترقية قادمة، يتغيّر هذا معه ولا يسكت.
 */
type LoadedDocument = Awaited<ReturnType<NonNullable<jsonld.Options.DocLoader["documentLoader"]>>>["document"];

const LOCAL_CONTEXTS: Record<string, LoadedDocument> = {
  "https://schema.org": schemaOrgContext,
  "https://schema.org/": schemaOrgContext,
  "http://schema.org": schemaOrgContext,
  "http://schema.org/": schemaOrgContext,
  "https://schema.org/docs/jsonldcontext.json": schemaOrgContext,
};

/**
 * `jsonld.documentLoaders` موجود في المكتبة وغير معرَّف في `@types/jsonld@1.5.15` — فحصٌ
 * لا تخمين: الاستدعاء يعمل وقت التشغيل (٨٤٩ مللي ثانية لجلب سياق schema.org الحقيقي،
 * وهو زمن شبكة لا ذاكرة)، بينما `tsc` يرفضه. فالنقص في ملفّ الأنواع لا في المكتبة.
 *
 * التوصيف هنا يصف الموجود ولا يخترعه، ومحصورٌ في السطر الذي يحتاجه — لا `any` على الوحدة
 * كلّها، كي يبقى بقيّة استعمال `jsonld` مفحوصاً بالمترجم.
 */
type DocumentLoaderFn = jsonld.Options.DocLoader["documentLoader"];
const documentLoaders = (jsonld as unknown as {
  documentLoaders: { node: () => NonNullable<DocumentLoaderFn> };
}).documentLoaders;

const networkLoader = documentLoaders.node();

/**
 * Document loader for every jsonld.js call in this app.
 *
 * Why it exists (measured 28 Aug 2026): `jsonld.expand()` dereferences `"@context":
 * "https://schema.org"` over the wire. Proven by running it twice — an unresolvable context
 * fails with "Dereferencing a URL did not result in a valid JSON-LD object", and the real
 * schema.org context resolved in 849 ms, which is network time, not memory time.
 *
 * That put a third-party host on the publish path: `jsonld-storage.ts` calls `normalizeJsonLd`
 * while generating an article's JSON-LD, so an outage at schema.org — or a laptop briefly off
 * the network — surfaced to the editor as "فشل توليد بيانات السيو" on a save that was
 * otherwise perfectly valid. It also charged every single save that latency.
 *
 * The bundled copy is the unmodified document from https://schema.org/docs/jsonldcontext.json
 * (3080 terms). It is NOT trimmed: a hand-written minimal context would expand only the terms
 * someone remembered to include, and silently mis-expand the rest.
 *
 * Anything that is not schema.org still goes to the network — this closes the hot path, it does
 * not ban remote contexts.
 */
export const schemaOrgDocumentLoader: jsonld.Options.DocLoader["documentLoader"] = async (
  url,
  options
) => {
  const local = LOCAL_CONTEXTS[url];
  if (local) {
    // توثيق jsonld.js يكتبها `contextUrl: null`، لكن `RemoteDocument` في
    // `@types/jsonld@1.5.15` يعرّفها `contextUrl?: Url | undefined` — فلا يقبل `null`.
    // و`undefined` يسلك نفس السلوك وقت التشغيل: المكتبة تختبر وجود القيمة لا نوعها،
    // والاثنان زائفان. فالمكتوب هنا هو ما يقبله المترجم ويعنيه التوثيق معاً.
    return { contextUrl: undefined, document: local, documentUrl: url };
  }
  return networkLoader(url, options);
};
