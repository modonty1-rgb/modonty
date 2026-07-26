import { Braces, Tags } from "lucide-react";

// Read-only technical view for the single Modonty author record — the raw JSON-LD + meta tags
// the page actually emits (what Google sees). Both are auto-generated on save from Settings +
// the SEO snippet, so this panel is purely for verification. Same data the shared reference
// technical page shows for other entities, inlined here since the author is one record.

function prettyJson(value: unknown): string | null {
  if (value == null) return null;
  try {
    if (typeof value === "string") return JSON.stringify(JSON.parse(value), null, 2);
    return JSON.stringify(value, null, 2);
  } catch {
    return typeof value === "string" ? value : null;
  }
}

function CodePanel({
  icon: Icon,
  title,
  subtitle,
  text,
  empty,
}: {
  icon: typeof Braces;
  title: string;
  subtitle: string;
  text: string | null;
  empty: string;
}) {
  return (
    <details open className="rounded-lg border bg-card">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 px-4 py-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold leading-tight">{title}</span>
          <span className="block text-[11px] text-muted-foreground">{subtitle}</span>
        </span>
      </summary>
      {text ? (
        <pre
          dir="ltr"
          className="max-h-[420px] overflow-auto border-t bg-slate-950 p-3.5 text-left font-mono text-[12px] leading-relaxed text-slate-200"
        >
          {text}
        </pre>
      ) : (
        <p className="border-t px-4 py-3 text-xs text-muted-foreground">{empty}</p>
      )}
    </details>
  );
}

export function AuthorSeoTechnical({
  nextjsMetadata,
  jsonLdStructuredData,
}: {
  nextjsMetadata: unknown;
  jsonLdStructuredData: string | null;
}) {
  const meta = prettyJson(nextjsMetadata);
  const jsonLd = prettyJson(jsonLdStructuredData);

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold">Technical output</h2>
        <span className="rounded-full border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
          what Google sees · auto-generated
        </span>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <CodePanel
          icon={Braces}
          title="JSON-LD"
          subtitle="Structured data (Organization / rich results)"
          text={jsonLd}
          empty="No JSON-LD stored yet — save the author to generate it."
        />
        <CodePanel
          icon={Tags}
          title="Meta tags"
          subtitle="Title, description, Open Graph, Twitter"
          text={meta}
          empty="No meta stored yet — save the author to generate it."
        />
      </div>
    </section>
  );
}
