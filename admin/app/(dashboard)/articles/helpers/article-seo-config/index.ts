import { SEODoctorConfig } from "@/components/shared/seo-doctor";
import { createArticleSEOConfig as createArticleSEOConfigInternal } from "./create-article-seo-config";

export const createArticleSEOConfig = createArticleSEOConfigInternal;

export const articleSEOConfig: SEODoctorConfig = createArticleSEOConfigInternal();

