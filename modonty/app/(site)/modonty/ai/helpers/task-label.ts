import { messages } from "@/lib/i18n/messages";

const tasks: Record<string, string> = messages.modonty.ai.tasks;

/** A Hub `pipeline_tag` in Arabic; one the list does not know reads as «نموذج», never as English. */
export function taskLabel(tag: string | null): string {
  return (tag && tasks[tag]) || tasks.other;
}
