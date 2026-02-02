import { SEODoctorConfig } from "@/components/shared/seo-doctor";
import {
  createOrganizationSEOConfig as createOrganizationSEOConfigInternal,
  createOrganizationSEOConfigFull as createOrganizationSEOConfigFullInternal,
} from "./create-organization-seo-config";

// Core-only config for header SEO Doctor
export const createOrganizationSEOConfig = createOrganizationSEOConfigInternal;

// Full config for advanced Meta / JSON-LD scoring
export const createOrganizationSEOConfigFull = createOrganizationSEOConfigFullInternal;

export const organizationSEOConfig: SEODoctorConfig =
  createOrganizationSEOConfigInternal();

