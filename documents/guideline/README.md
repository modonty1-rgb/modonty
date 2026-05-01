# Modonty Guideline — Source of Truth

This folder is the **single home** for everything that defines Modonty:
brand, marketing studies, product strategy, sales playbooks, competitor
analyses, founder philosophy, anything else relevant.

## How it works

```
documents/guideline/
├── sources/                  ← raw materials (drop everything here)
│   └── *.html / *.md / *.pdf / *.txt — flat for now, will be categorized later
│
├── SYNTHESIS.md              ← (will be generated) cream-of-cream extract
├── GOLDEN-RULES.md           ← (will be generated) canonical rules to memorize
└── CHANGELOG.md              ← (will be generated) which source contributed what
```

## Workflow

1. **Phase 1 — Dump (current):** Khalid drops every relevant file into
   `sources/` — flat, no need to organize.
2. **Phase 2 — Categorize:** Once Khalid says "تم", the agent categorizes the
   files into themed sub-folders inside `sources/` (branding, research,
   competitors, etc.).
3. **Phase 3 — Synthesize:** The agent reads everything end-to-end and
   produces `SYNTHESIS.md` + `GOLDEN-RULES.md`.
4. **Phase 4 — Wire to admin:** The actual `/guidelines/*` pages on
   admin.modonty.com read their content from this folder's synthesis.

## Rules

- **Sources are immutable.** They get added, never modified or deleted.
- **Every claim in the synthesis cites its source file.** Traceability is
  non-negotiable.
- **Synthesis is the single source the admin pages read from.** Pages do
  not reach into individual source files directly.
- **CHANGELOG tracks every source addition** and what it changed in the
  synthesis.
