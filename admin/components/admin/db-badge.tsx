import { Database } from "lucide-react";

/**
 * Names the database this admin instance is talking to, in the header, always.
 *
 * The environment gets switched during migrations and backup checks, and every earlier
 * incident in this project came from acting on the wrong one while every screen looked
 * identical. A destructive click costs nothing to make and everything to undo, so the
 * answer to "which database am I on?" should never require opening a file.
 *
 * Server component on purpose: DATABASE_URL is server-only and must never reach the client
 * bundle. Only the parsed name is rendered — no host, no credentials.
 */
export function DbBadge() {
  const uri = process.env.DATABASE_URL ?? "";
  const name = uri.match(/\/([^/?]+)\?/)?.[1] ?? "unknown";

  // Anything that is not the test database is treated as live: red, and never quiet.
  const isTest = name === "modonty_dev";

  const tone = isTest
    ? "bg-slate-500/10 text-slate-600 dark:text-slate-300 ring-slate-500/30"
    : "bg-red-500/15 text-red-600 dark:text-red-400 ring-red-500/40 font-bold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] ring-1 ${tone}`}
      title={
        isTest
          ? "Connected to the test database (modonty_dev)"
          : `⚠️ Connected to ${name} — this is LIVE data`
      }
    >
      <Database className="h-3 w-3 shrink-0" />
      <code className="font-mono leading-none">{name}</code>
      {!isTest && <span className="leading-none">LIVE</span>}
    </span>
  );
}
