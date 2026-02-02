import { FIELD_LABELS } from "./field-labels";

export function getFieldLabel(field: string): string {
  return FIELD_LABELS[field] || field;
}
