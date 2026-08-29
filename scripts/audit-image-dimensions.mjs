import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Refuse any image width/height that was not measured from the file the url points at.
 *
 * Every SEO generator below once declared a fixed pair — 1200x630, 1200x675, or a logo floored
 * up to 112 — on whatever image happened to pass through. Measured on production 27 Aug 2026,
 * the home page and /trending both advertised og:image 1200x630 for a 5000x2625 PNG.
 *
 * schema.org width/height describe the actual image, and Google's structured-data policy
 * forbids markup that misrepresents the page. og:image:width/height are OPTIONAL in the OGP
 * spec, so omitting a size is always legal — inventing one never is. A dimension may therefore
 * come from exactly two places: a Media row, or a crop this repo itself generated.
 *
 * The one allowed constant is the Bunny crop width, and it is allowed only while it still
 * equals what actually writes those files. That equality is asserted below, not assumed.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const GENERATORS = [
  'admin/lib/seo/knowledge-graph-generator.ts',
  'admin/app/(dashboard)/modonty/setting/helpers/build-taxonomy-page-jsonld.ts',
  'admin/app/(dashboard)/modonty/setting/helpers/build-trending-page-jsonld.ts',
  'admin/app/(dashboard)/modonty/setting/helpers/build-categories-page-jsonld.ts',
  'admin/lib/seo/listing-page-seo-generator.ts',
  'admin/app/(dashboard)/modonty/setting/helpers/build-meta-from-page.ts',
  'admin/app/(dashboard)/modonty/setting/helpers/build-meta-from-settings.ts',
  'admin/app/(dashboard)/authors/helpers/build-modonty-author-seo.ts',
  'shared/lib/seo/generate-organization-jsonld.ts',
  'shared/lib/seo/media/build-image-object.ts',
];

// The crop generator is the source of truth for the only constant a generator may declare.
const CROP_GENERATOR = 'admin/app/(dashboard)/media/actions/generate-aspect-crops.ts';
const ALLOWED_CONSTANT = 'BUNNY_CROP_WIDTH';

const failures = [];

// --- 1. The declared crop size must equal the size sharp actually writes -------------------
const cropSource = fs.readFileSync(path.join(root, CROP_GENERATOR), 'utf8');
const knowledgeGraph = fs.readFileSync(path.join(root, GENERATORS[0]), 'utf8');

const sharpWrites = {};
for (const match of cropSource.matchAll(
  /suffix:\s*BUNNY_ASPECT_SUFFIX\["([\d:]+)"\],\s*width:\s*(\d+),\s*height:\s*(\d+)/g,
)) {
  sharpWrites[match[1]] = { width: Number(match[2]), height: Number(match[3]) };
}

const declaredWidth = Number(knowledgeGraph.match(/const BUNNY_CROP_WIDTH = (\d+);/)?.[1]);
const factors = {};
for (const match of knowledgeGraph.matchAll(/"([\d:]+)":\s*(\d+)(?:\s*\/\s*(\d+))?/g)) {
  factors[match[1]] = match[3] ? Number(match[2]) / Number(match[3]) : Number(match[2]);
}

if (!declaredWidth || Object.keys(sharpWrites).length === 0) {
  failures.push(`${CROP_GENERATOR}: could not read the crop sizes to compare against`);
} else {
  for (const [ratio, actual] of Object.entries(sharpWrites)) {
    const claimedHeight = Math.round(declaredWidth * factors[ratio]);
    if (declaredWidth !== actual.width || claimedHeight !== actual.height) {
      failures.push(
        `knowledge-graph-generator declares ${ratio} as ${declaredWidth}x${claimedHeight}, ` +
          `but generate-aspect-crops writes ${actual.width}x${actual.height}`,
      );
    }
  }
}

// --- 2. No generator may declare a dimension from a bare number ----------------------------
const LITERAL_PATTERNS = [
  /\b(?:width|height)\s*:\s*\d+/i,
  /\b(?:width|height)\s*[:=][^;,\n]*(?:\?\?|\|\|)\s*\d+/i,
  /(?:WIDTH|HEIGHT)\s*=\s*\d+/,
  /\b(?:logoWidth|logoHeight)\s*=.*:\s*\d+/,
];

let scanned = 0;

for (const relative of GENERATORS) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  const lines = source.split(/\r?\n/);
  scanned += 1;

  // A width/height defaulting to a numeric constant in the same file is just as invented as
  // an inline number — resolve one level of that indirection before judging.
  const numericConstants = new Set();
  for (const match of source.matchAll(
    /const\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?::\s*number\s*)?=\s*\d+\s*;/g,
  )) {
    if (match[1] !== ALLOWED_CONSTANT) numericConstants.add(match[1]);
  }
  const constantPattern = numericConstants.size
    ? new RegExp(`\\b(?:width|height)\\s*[:=][^;,\\n]*\\b(?:${[...numericConstants].join('|')})\\b`, 'i')
    : null;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
    if (line.includes(ALLOWED_CONSTANT)) return; // verified against its source above
    const invented =
      LITERAL_PATTERNS.some((pattern) => pattern.test(line)) ||
      (constantPattern && constantPattern.test(line));
    if (invented) failures.push(`${relative}:${index + 1}: ${trimmed}`);
  });
}

if (failures.length) {
  console.error(
    'Image dimension audit failed — a size was declared that nothing measured:\n' +
      failures.map((failure) => `- ${failure}`).join('\n') +
      '\n\nFix by reading width/height from the Media row of the image the url points at, ' +
      'or by omitting the pair. Never restore a constant.',
  );
  process.exit(1);
}

console.log(
  `PASS: ${scanned} SEO image generators declare dimensions only from a Media row or from a ` +
    `crop this repo generates, and the declared crop size matches generate-aspect-crops.`,
);
