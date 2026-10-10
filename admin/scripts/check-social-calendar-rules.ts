/**
 * فحص قواعد تقويم السوشيال بلا قاعدة بيانات — آلة الحالات، الصلاحيات، والتواريخ (PRD §٨ المرحلة ٠:
 * «كل الانتقالات المسموحة تمرّ وكل الممنوعة تُرفض»).
 *
 *   pnpm --filter ./admin exec tsx scripts/check-social-calendar-rules.ts
 */
import assert from "node:assert/strict";

import type { SocialPostStatus, StaffRole } from "@prisma/client";

import { nextSocialStatus, SOCIAL_TRANSITIONS, type SocialPostEvent } from "../app/(dashboard)/social-calendar/helpers/post-transitions";
import { canSocial, type SocialPermission } from "../app/(dashboard)/social-calendar/helpers/post-permissions";
import {
  dateToRiyadhInputs,
  daysInMonth,
  parseDayInput,
  parseMonthParam,
  riyadhInputsToDate,
} from "../app/(dashboard)/social-calendar/helpers/dates";

const STATUSES: SocialPostStatus[] = ["IN_PRODUCTION", "READY_FOR_REVIEW", "READY_TO_PUBLISH", "PUBLISHED"];
const EVENTS = Object.keys(SOCIAL_TRANSITIONS) as SocialPostEvent[];

// ── آلة الحالات: الجدول الكامل (حالة × حدث) ─────────────────────────────────────
const ALLOWED: Record<string, SocialPostStatus> = {
  "IN_PRODUCTION:markReady": "READY_FOR_REVIEW",
  "READY_FOR_REVIEW:approve": "READY_TO_PUBLISH",
  "READY_FOR_REVIEW:reject": "IN_PRODUCTION",
  "READY_FOR_REVIEW:assetsEmptied": "IN_PRODUCTION",
  "READY_TO_PUBLISH:publish": "PUBLISHED",
  "READY_TO_PUBLISH:reject": "IN_PRODUCTION",
};
let checked = 0;
for (const s of STATUSES) {
  for (const e of EVENTS) {
    const expected = ALLOWED[`${s}:${e}`] ?? null;
    assert.equal(nextSocialStatus(s, e), expected, `${s} --${e}--> expected ${expected}`);
    checked++;
  }
}

// ── الصلاحيات ─────────────────────────────────────────────────────────────────
const MATRIX: Record<SocialPermission, StaffRole[]> = {
  view: ["ADMIN", "EDITOR", "CREATIVE", "SOCIAL", "QC", "SALES"],
  editBrief: ["ADMIN", "EDITOR"],
  produce: ["ADMIN", "EDITOR", "CREATIVE"],
  review: ["ADMIN", "EDITOR"],
  publish: ["ADMIN", "SOCIAL"],
  archive: ["ADMIN", "EDITOR"],
};
const ROLES: StaffRole[] = ["ADMIN", "EDITOR", "CREATIVE", "SOCIAL", "QC", "SALES"];
for (const [perm, allowed] of Object.entries(MATRIX) as [SocialPermission, StaffRole[]][]) {
  for (const r of ROLES) {
    assert.equal(canSocial(r, perm), allowed.includes(r), `${r} ${perm}`);
    checked++;
  }
}
assert.equal(canSocial(null, "view"), false);

// ── التواريخ ───────────────────────────────────────────────────────────────────
assert.equal(daysInMonth(2028, 1), 29, "فبراير ٢٠٢٨ كبيس");
assert.equal(daysInMonth(2026, 1), 28);
assert.equal(daysInMonth(2026, 9), 31);
assert.deepEqual(parseMonthParam("2026-10"), { year: 2026, month: 9 });
assert.equal(parseMonthParam("2026-13"), null);
assert.equal(parseMonthParam("oct"), null);
assert.equal(parseDayInput("2026-02-30"), null, "يوم غير موجود يُرفض");
assert.equal(parseDayInput("2026-10-05")?.toISOString(), "2026-10-05T00:00:00.000Z");
const at = riyadhInputsToDate("2026-10-08", "21:30");
assert.equal(at?.toISOString(), "2026-10-08T18:30:00.000Z", "الرياض UTC+3");
assert.deepEqual(dateToRiyadhInputs(at), { date: "2026-10-08", time: "21:30" });
assert.deepEqual(dateToRiyadhInputs(riyadhInputsToDate("2026-10-08", "")), { date: "2026-10-08", time: "" });
checked += 11;

console.log(`social-calendar rules: ${checked} checks passed`);
