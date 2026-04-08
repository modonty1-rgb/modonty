import { generateSEOFileName, generateCloudinaryPublicId, isValidCloudinaryPublicId } from "../lib/utils/image-seo";

const tests = [
  // Arabic cases
  { alt: "ماهو نموذج العمل التجاري", title: "نموذج العمل", label: "100% Arabic alt + title" },
  { alt: "ماهو نموذج العمل التجاري", title: "", label: "100% Arabic alt, no title" },
  { alt: "", title: "نموذج العمل التجاري", label: "No alt, Arabic title" },

  // English cases
  { alt: "Business model canvas example", title: "Canvas", label: "English alt + title" },
  { alt: "SEO optimization guide", title: "", label: "English alt only" },

  // Mixed cases
  { alt: "SEO تحسين محركات البحث", title: "", label: "Mixed Arabic + English" },
  { alt: "Modonty مدونتي platform", title: "", label: "Mixed English + Arabic" },

  // Edge cases
  { alt: "", title: "", label: "Both empty" },
  { alt: "   ", title: "   ", label: "Whitespace only" },
  { alt: "a", title: "", label: "Single char" },
  { alt: "A very long alt text that describes the image in great detail including all the keywords and descriptions that someone might write when they are trying to be thorough about their image SEO optimization strategy for the year 2026", title: "", label: "Very long text" },

  // Special characters
  { alt: "Image #1 & best <photo>", title: "", label: "Special chars in alt" },
  { alt: "file-name_test.v2", title: "", label: "Dots and underscores" },

  // Original filename fallback
  { alt: "", title: "", originalFilename: "IMG_20260407_143022.jpg", label: "Fallback to original filename" },
];

console.log("=== Cloudinary Filename Generation Test ===\n");

let passed = 0;
let failed = 0;

for (const t of tests) {
  const filename = generateSEOFileName(t.alt, t.title, (t as { originalFilename?: string }).originalFilename);
  const publicId = generateCloudinaryPublicId(filename, "clients/69d163ba4e8bf3f470aff0e4");
  const valid = isValidCloudinaryPublicId(publicId);

  const icon = valid ? "✅" : "❌";
  console.log(`${icon} ${t.label}`);
  console.log(`   Input:     alt="${t.alt}" title="${t.title}"`);
  console.log(`   Filename:  ${filename}`);
  console.log(`   PublicId:  ${publicId}`);
  console.log(`   Valid:     ${valid}`);
  console.log(`   Length:    ${publicId.length} chars`);
  console.log();

  if (valid) passed++;
  else failed++;
}

console.log(`=== Results: ${passed} passed, ${failed} failed ===`);
