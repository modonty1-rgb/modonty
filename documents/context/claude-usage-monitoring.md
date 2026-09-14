# Claude usage monitoring

## Confirmed findings — 2026-09-06

- The five-hour usage counter reset successfully to 0% before testing.
- The old auto-resume hook at `.claude/hooks/session-brief.mjs` was injecting a long block from `documents/context/SESSION-LOG.md` whenever a Claude session started.
- Evidence from Claude's local session log: a single "مرحبا" request created a 58,015-token cache after that hook injected the old session report. The long campaign reply came from this injected report, not from the greeting itself.
- The `SessionStart` hook was removed from `.claude/settings.json` on 2026-09-06. The file remains on disk but no longer runs automatically.
- The manual `hh>` resume skill remains available and was changed earlier to use the compact current-session handoff rather than full historical logs.
- Browser Playwright is disabled in the Claude project MCP configuration. The usage panel's 35% Playwright figure is a rolling last-24-hours attribution, not current-session use.

## Context measurements

| Stage | Total context | Memory files | Notes |
| --- | ---: | ---: | --- |
| Before memory cleanup | 69.6k | 30.3k | Old automatic memory files loaded. |
| After memory cleanup | 43.1k | 3.8k | Memory reduced; old session hook still ran. |
| Fresh session after hook removal | 54.7k | 3.8k | No old campaign report was injected. Messages rose during the diagnostic conversation. |
| Manual `hh>` after compact handoff | 56.6k | 3.8k | The resume test read `CURRENT-SESSION.md` plus Git facts. Compared with the prior clean diagnostic context (54.7k), the observed increase was about 1.9k—not the former 58k automatic injection. |

## Usage measurements

| Time | Session (5hr) | Weekly | What happened |
| --- | ---: | ---: | --- |
| Immediately after reset | 0% | 78% | Clean starting point. |
| After diagnostic session (greeting, `/context`, `/usage`) | 4% | 78% | Measurement activity itself consumed the session budget. |
| Later affected session | 73% | 87% | The five-hour meter rose sharply while the weekly meter rose by 9 points. |
| Same affected session | 92% | 89% | A later check showed a second sharp five-hour increase. |

## Local session audit — affected session

- The affected local session record contains **37 distinct model responses** in roughly 32 minutes (13:42–14:14 local), using `claude-opus-5`.
- This session did **not** invoke a Playwright tool. Its recorded tool calls were limited to Skill, Read, Grep, Edit, and Bash.
- The record shows an 85,849-token cache write followed by repeated cache reads that grew from about 90k to 115k. That is substantial normal consumption, independent of the earlier disabled Playwright connector.
- This audit does **not** prove Anthropic's server-side five-hour meter is correct. Only Anthropic can inspect the account-wide rate-limit ledger, including activity across Claude Code, claude.ai, Claude Desktop, and other signed-in devices.

## Evidence package for a Claude support report

Saved screenshots: `documents/context/claude-usage-evidence/2026-09-06/`.

| Evidence | What it proves |
| --- | --- |
| `codex-clipboard-866c55a9-2b3a-4152-bbb0-af288a8be447.png` | Immediately after the reset: 0% session usage, 78% weekly. |
| `codex-clipboard-eb1ef414-02eb-4192-a20f-b4902fd69a97.png` | Before cleanup: 69.6k context and 30.3k memory files. |
| `codex-clipboard-2e7482c1-b92b-4a46-92fa-7c686cf795af.png` | After memory cleanup: 43.1k context and 3.8k memory files. |
| `codex-clipboard-e9272805-52d0-466c-abb9-a5c2b7d5c2ce.png` | Diagnostic session reached 3% session usage. |
| `codex-clipboard-d709191e-a21b-4c4b-b390-17f4ba1d2c30.png` | Historical Day panel: >150k context and Playwright attribution. |
| `codex-clipboard-d8f6085f-04da-4a7b-88a4-ac13ea7d1d54.png` | Fresh session after disabling the hook: normal greeting with no historical campaign report. |
| `codex-clipboard-a87b1c41-232a-4995-8253-bafd7513f43d.png` | Fresh-session `/context` after the hook change. |
| `codex-clipboard-14b19386-be18-4a0a-9015-21ec868e04e4.png` | End of diagnostic run: 4% session usage and 78% weekly. |
| `codex-clipboard-4164aab5-8244-4024-9ad1-d9ffdbd1105e.png` | Later check: 73% session usage and 87% weekly. |
| `codex-clipboard-3cf10fd2-451a-4704-9d80-259edee21f8d.png` | Later check: 92% session usage and 89% weekly. |
| `codex-clipboard-0559ab74-b0b5-42bc-9a6b-318236119942.png` | Affected session context: 105.0k/1.0M, including 66.7k messages. |

### Technical proof retained locally

- Claude's local session record identified the injected auto-resume payload and its cache creation: `C:\\Users\\w2nad\\.claude\\projects\\C--Users-w2nad-Desktop-dreamToApp-MODONTY\\48b055f8-e2b9-42e6-850e-32945bd2345e.jsonl`.
- It recorded `cache_creation_input_tokens: 58015` for the greeting request. Do not send this raw file to support without reviewing it first; it may contain project details.
- The disabled configuration was the `SessionStart` entry formerly pointing to `.claude/hooks/session-brief.mjs` in `.claude/settings.json`.
- A second local record used for the usage audit is `C:\\Users\\w2nad\\.claude\\projects\\C--Users-w2nad-Desktop-dreamToApp-MODONTY\\2d2e2ab0-6ff0-4ed0-b76e-9aae64105e34.jsonl`. Review and sanitize it before sharing externally.

## Check-in procedure

1. Use the current working session; do not create a new test session unless needed.
2. Open `/usage` and record Session (5hr), Weekly (7 day), and reset time.
3. If the five-hour number rises unexpectedly, open `/context` and compare these categories: Memory files, Skills, Messages, and System tools.
4. Do not use `hh>`, Playwright, or a broad tool call during a measurement check unless the check is specifically testing that action.
5. Treat the Day attribution panel as historical for the last 24 hours; it does not reset instantly and is not a breakdown of the current five-hour meter.
