export const SESSION_KEY = "admin-inspect-payload";

export interface InspectPayload {
  source: string;
  content: string;
  sourceType?: "preview" | "saved";
  field?: string;
  description?: string;
  returnUrl?: string;
}
