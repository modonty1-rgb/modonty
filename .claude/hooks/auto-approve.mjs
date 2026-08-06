#!/usr/bin/env node
/**
 * PreToolUse gate — "full permissions EXCEPT deletion" (Khalid's rule, 2026-07-31).
 *
 * Auto-approves every tool call so long sessions never stall on a prompt, and falls
 * back to the normal permission prompt ONLY for commands that destroy something:
 * file/dir deletion, history-rewriting git, destructive DB ops, and `git push`
 * (which has its own standing rule requiring fresh confirmation every time).
 *
 * Emitting no decision (exit 0, no stdout) leaves the default flow untouched.
 */

/** Anything matching these keeps asking. Ordered roughly by how often they appear. */
const NEEDS_CONFIRMATION = [
  // ── deletion ────────────────────────────────────────────────────────────
  { re: /(^|[;&|(\s])rm(\s|$)/i, why: "حذف ملفات (rm)" },
  { re: /(^|[;&|(\s])rmdir(\s|$)/i, why: "حذف مجلد (rmdir)" },
  { re: /(^|[;&|(\s])del(\s|$)/i, why: "حذف ملفات (del)" },
  { re: /(^|[;&|(\s])erase(\s|$)/i, why: "حذف ملفات (erase)" },
  { re: /Remove-Item/i, why: "حذف عبر PowerShell (Remove-Item)" },
  { re: /Clear-Content/i, why: "تفريغ محتوى ملف" },
  { re: /\brimraf\b/i, why: "حذف شجرة مجلدات (rimraf)" },
  { re: /\bunlinkSync\b|\bunlink\b/i, why: "حذف ملف (unlink)" },
  { re: /\btruncate\b/i, why: "اقتطاع ملف (truncate)" },
  { re: /\bshred\b/i, why: "محو ملف نهائياً (shred)" },

  // ── git: history rewrite / remote publish ───────────────────────────────
  { re: /\bgit\s+push\b/i, why: "دفع إلى remote — يحتاج تأكيدك في كل مرة" },
  { re: /\bgit\s+clean\b/i, why: "حذف ملفات غير متتبَّعة (git clean)" },
  { re: /\bgit\s+reset\s+--hard\b/i, why: "إسقاط التعديلات (reset --hard)" },
  { re: /\bgit\s+filter-(branch|repo)\b/i, why: "إعادة كتابة التاريخ" },
  { re: /\bgit\s+branch\s+-[Dd]\b/i, why: "حذف فرع" },
  { re: /\bgit\s+worktree\s+remove\b/i, why: "حذف worktree" },
  { re: /\bgit\s+update-ref\s+-d\b/i, why: "حذف مرجع git" },

  // ── database ───────────────────────────────────────────────────────────
  { re: /prisma\s+(db\s+(push|reset|drop|execute)|migrate\s+(deploy|reset))/i, why: "عملية سكيما على قاعدة البيانات" },
  { re: /\bdeleteMany\b|\bdeleteOne\b|\bdropDatabase\b|\bdropCollection\b/i, why: "حذف من قاعدة البيانات" },
  { re: /\bmongosh?\b|\bmongorestore\b/i, why: "وصول مباشر لمونجو" },
  { re: /\bDROP\s+(TABLE|DATABASE|COLLECTION)\b/i, why: "إسقاط جدول/قاعدة" },

  // ── remote mutations / disk ────────────────────────────────────────────
  { re: /curl[^\n]*(-X|--request)\s+(DELETE|PUT)\b/i, why: "طلب حذف/استبدال على خدمة خارجية" },
  { re: /\bvercel\s+(rm|remove|rollback|env\s+rm)\b/i, why: "تغيير على Vercel" },
  { re: /\bgh\s+(repo\s+delete|release\s+delete|secret\s+delete|issue\s+delete)\b/i, why: "حذف على GitHub" },
  { re: /\bmkfs\b|\bdd\s+if=/i, why: "عملية على مستوى القرص" },
];

let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.exit(0); // unreadable input → let the normal flow decide
  }

  const tool = payload.tool_name ?? "";
  const input = payload.tool_input ?? {};

  // Only Bash can destroy things silently; every other tool is safe to auto-approve.
  if (tool === "Bash") {
    const cmd = String(input.command ?? "");
    const hit = NEEDS_CONFIRMATION.find((p) => p.re.test(cmd));
    if (hit) {
      emit("ask", hit.why);
      return;
    }
  }

  emit("allow", "صلاحيات كاملة عدا الحذف — قاعدة خالد");
});

function emit(permissionDecision, permissionDecisionReason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision,
        permissionDecisionReason,
      },
    })
  );
  process.exit(0);
}
