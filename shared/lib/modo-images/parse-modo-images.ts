import { MODO_POSES, type ModoImages, type ModoPose } from "./modo-poses";

const POSE_KEYS = new Set<string>(MODO_POSES.map((p) => p.key));

/** `Settings.modoImages` (Json) → only known poses with a non-empty https url. Anything else is dropped. */
export function parseModoImages(value: unknown): ModoImages {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: ModoImages = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (POSE_KEYS.has(k) && typeof v === "string" && /^https:\/\/\S+$/.test(v.trim())) out[k as ModoPose] = v.trim();
  }
  return out;
}
