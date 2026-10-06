import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const application = resolve(here, "..");
const documentation = resolve(application, "documentation");
const documentName = process.argv[2] ?? "BRD-console-mobile";

if (!/^[a-z0-9-]+$/i.test(documentName)) {
  throw new Error("Document name may contain only letters, numbers, and hyphens.");
}

const source = resolve(documentation, "md", `${documentName}.md`);
const output = resolve(documentation, "html", `${documentName}.html`);

const markdown = await readFile(source, "utf8");
const html = await readFile(output, "utf8");

// The HTML is a self-contained, offline-readable view of the Markdown source. This
// changes only the embedded source payload, retaining its approved presentation.
const markdownPayload = /const markdown = [\s\S]*?;\r?\nconst esc=/;

if (!markdownPayload.test(html)) {
  throw new Error("HTML template has no replaceable Markdown payload.");
}

const updated = html.replace(
  markdownPayload,
  `const markdown = ${JSON.stringify(markdown)};\nconst esc=`
);

if (updated === html) {
  console.log(`${documentName}.html is already synchronized with its Markdown source.`);
} else {
  await writeFile(output, updated, "utf8");
  console.log(`Synchronized ${documentName}.html from its Markdown source.`);
}
