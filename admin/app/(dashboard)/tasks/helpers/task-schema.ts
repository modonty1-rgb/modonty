import { z } from "zod";

import { TASK_PRIORITIES, TASK_STATUSES } from "./task-config";

// Server-side validation is the real gate; the form's copy of these rules is UX.
// Every message names the field and what is wrong with it, because "بيانات غير
// صالحة" tells the person nothing they can act on.

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "المعرّف غير صالح");

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "العنوان قصير — اكتب ٣ حروف على الأقل")
    .max(160, "العنوان طويل — الحدّ ١٦٠ حرفاً"),
  description: z.string().trim().max(4000, "الوصف طويل — الحدّ ٤٠٠٠ حرف").optional().or(z.literal("")),
  status: z.enum(TASK_STATUSES).default("TODO"),
  priority: z.enum(TASK_PRIORITIES).default("NORMAL"),
  // Empty string is what an untouched date input submits — treated as "no due
  // date", not as an invalid date.
  dueDate: z.string().trim().optional().or(z.literal("")),
  assigneeId: objectId.optional().or(z.literal("")),
});

export const updateTaskSchema = createTaskSchema.extend({ id: objectId });

export const moveTaskSchema = z.object({
  id: objectId,
  status: z.enum(TASK_STATUSES),
  // Index the card lands on inside the destination column. The server turns it
  // into a position; the client never sends a raw position, so two people
  // dragging at once cannot write conflicting float maths.
  toIndex: z.number().int().min(0).max(500),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
