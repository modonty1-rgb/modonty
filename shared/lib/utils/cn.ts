/**
 * Tailwind class merger for the shared UI primitives.
 *
 * Separate from `cx.ts` on purpose: `cx` stays dependency-free for anything that must not
 * pull packages in, while the shadcn primitives in `components/ui` genuinely need
 * tailwind-merge to resolve conflicting utility classes ("p-2" vs "p-4") the way their
 * upstream source expects.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
