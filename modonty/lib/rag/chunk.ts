/**
 * Chunk article content for RAG retrieval.
 * Strips HTML and splits into ~512 token chunks (roughly 2000 chars).
 */

const CHARS_PER_TOKEN = 4;
const TARGET_CHARS_PER_CHUNK = 512 * CHARS_PER_TOKEN; // ~2048 chars

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Split text into chunks by paragraph/sentence boundaries.
 */
function splitIntoChunks(text: string): string[] {
  if (!text.trim()) return [];

  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());

  let current = "";
  for (const p of paragraphs) {
    if (current.length + p.length + 2 <= TARGET_CHARS_PER_CHUNK) {
      current = current ? `${current}\n\n${p}` : p;
    } else {
      if (current) chunks.push(current);
      if (p.length > TARGET_CHARS_PER_CHUNK) {
        const sentences = p.split(/(?<=[.!?。])\s+/);
        let sub = "";
        for (const s of sentences) {
          if (sub.length + s.length + 1 <= TARGET_CHARS_PER_CHUNK) {
            sub = sub ? `${sub} ${s}` : s;
          } else {
            if (sub) chunks.push(sub);
            sub = s;
          }
        }
        current = sub;
      } else {
        current = p;
      }
    }
  }
  if (current) chunks.push(current);

  return chunks;
}

/**
 * Chunk article HTML content for RAG.
 * Returns array of plain-text chunks.
 */
export function chunkArticleContent(html: string): string[] {
  const plain = stripHtml(html);
  return splitIntoChunks(plain);
}
