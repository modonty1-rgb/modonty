import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const iconsDirectory = path.join(root, 'shared', 'components', 'icons');
const files = fs.readdirSync(iconsDirectory).filter((file) => file.startsWith('modonty-') && file.endsWith('.tsx'));
const failures = [];
let svgCount = 0;

for (const file of files) {
  const source = fs.readFileSync(path.join(iconsDirectory, file), 'utf8');
  const svgs = source.match(/<svg\b[^>]*>/g) ?? [];
  svgCount += svgs.length;

  for (const svg of svgs) {
    if (!/viewBox=/.test(svg)) failures.push(`${file}: missing viewBox`);
    if (!/width="1em"/.test(svg) || !/height="1em"/.test(svg)) failures.push(`${file}: missing scalable 1em dimensions`);
    if (!/aria-hidden="true"/.test(svg)) failures.push(`${file}: missing default aria-hidden`);
    if (/xmlns=/.test(svg)) failures.push(`${file}: redundant xmlns attribute`);
  }
}

if (failures.length) {
  console.error('Brand icon audit failed:\n' + failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log(`PASS: ${svgCount} Modonty inline SVG icons use scalable dimensions, viewBox, and decorative accessibility defaults.`);
