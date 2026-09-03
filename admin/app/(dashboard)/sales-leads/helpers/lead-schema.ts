import { z } from "zod";

/**
 * One schema, used on the server. The form mirrors it for the sake of instant feedback,
 * but the browser copy is a convenience — this is the one that decides what gets written.
 *
 * Almost everything is optional on purpose. A prospect is captured mid-phone-call, and a
 * form that refuses to save until eleven boxes are filled means the row is never created
 * at all. Measured on the rows imported from the old system: 6 of 17 have no email, and
 * ten fields are empty across every single row. Only a name is genuinely required — a
 * record with no name is not a record of anyone.
 */

/** Turns "" into undefined so an empty input clears the field instead of storing "". */
const blankToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

const optionalText = (max: number) =>
  z.preprocess(blankToUndefined, z.string().trim().max(max).optional());

export const LEAD_STATUSES = ["PROSPECT", "ACTIVE", "ARCHIVED"] as const;
export const LEAD_SOURCES = ["REFERRAL", "AD", "SOCIAL", "SEARCH", "PERSONAL", "OTHER"] as const;

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(160),
  company: optionalText(160),

  // Deliberately loose: numbers arrive as +2010…, 0100…, and with spaces or dashes. A strict
  // pattern here would reject a real Egyptian number and the row would simply not be saved.
  phone: optionalText(40),
  email: z.preprocess(blankToUndefined, z.string().trim().email("Not a valid email").optional()),

  contactName: optionalText(120),
  contactRole: optionalText(120),

  city: optionalText(120),
  // Accepts a bare domain too — people paste "clinic.com" more often than a full URL.
  website: optionalText(300),
  googleLocation: optionalText(600),

  industryId: z.preprocess(blankToUndefined, z.string().trim().optional()),
  countryCode: z.preprocess(blankToUndefined, z.enum(["SA", "EG"]).optional()),
  source: z.preprocess(blankToUndefined, z.enum(LEAD_SOURCES).optional()),
  status: z.enum(LEAD_STATUSES).default("PROSPECT"),

  instagram: optionalText(300),
  facebook: optionalText(300),
  tiktok: optionalText(300),
  snapchat: optionalText(300),
  twitter: optionalText(300),
  linkedin: optionalText(300),

  notes: optionalText(4000),
});

export type LeadInput = z.input<typeof leadSchema>;
export type LeadParsed = z.output<typeof leadSchema>;
