"use client";
import type { ClientForList } from "../actions/clients-actions/types";

type ListValidationError = { message?: string } | string;

interface ListValidationSection {
  valid?: boolean;
  errors?: ListValidationError[];
  warnings?: ListValidationError[];
}

interface ListValidationReport {
  adobe?: ListValidationSection;
  ajv?: {
    errors?: string[];
    warnings?: string[];
  };
  custom?: {
    errors?: string[];
    warnings?: string[];
  };
}

/** True while the client still depends on someone else's hosted video. */
export function hasExternalIntroVideo(client: {
  introVideoUrl: string | null;
  introVideoMediaId: string | null;
}): boolean {
  return !client.introVideoMediaId && !!client.introVideoUrl?.trim();
}

