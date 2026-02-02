import type { SEODoctorConfig, SEOFieldConfig } from "@/components/shared/seo-doctor";
import { getMetaTagsFields, getJsonLdFields, getFieldMapping, type FieldMapping } from "./client-field-mapping";

export interface SEOGroupScore {
  score: number;
  maxScore: number;
  percentage: number;
}

export interface ClientSEOGroupScores {
  meta: SEOGroupScore;
  jsonLd: SEOGroupScore;
}

export interface SEOGroupItem {
  field: string;
  status: "good" | "warning" | "error" | "info";
  message: string;
  score: number;
  maxScore: number;
}

export interface SEOGroupAnalysis extends SEOGroupScore {
  items: SEOGroupItem[];
}

export interface ClientSEOGroupAnalysis {
  meta: SEOGroupAnalysis;
  jsonLd: SEOGroupAnalysis;
}

function createEmptyScore(): SEOGroupScore {
  return { score: 0, maxScore: 0, percentage: 0 };
}

function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return Math.round(value);
}

function getScoreForField(
  mapping: FieldMapping | undefined,
  fieldConfig: SEOFieldConfig,
  data: Record<string, unknown>
): {
  cappedScore: number;
  rawScore: number;
  maxFieldScore: number;
  status: "good" | "warning" | "error" | "info";
  message: string;
} {
  const result = fieldConfig.validator(data[fieldConfig.name], data);
  const rawScore = Math.max(0, result.score);
  const maxFieldScore = mapping?.score?.optimal ?? rawScore;
  const cappedScore = Math.max(0, Math.min(rawScore, maxFieldScore));

  return {
    cappedScore,
    rawScore,
    maxFieldScore,
    status: result.status,
    message: result.message,
  };
}

function aggregateGroupAnalysis(
  config: SEODoctorConfig,
  groupFieldMappings: FieldMapping[]
): (data: Record<string, unknown>) => SEOGroupAnalysis {
  const relevantFieldNames = new Set(
    groupFieldMappings.map((m) => m.field)
  );

  const fieldConfigs = config.fields.filter((field) =>
    relevantFieldNames.has(field.name)
  );

  if (fieldConfigs.length === 0) {
    return () => ({ ...createEmptyScore(), items: [] });
  }

  const maxScore = groupFieldMappings.reduce((sum, mapping) => {
    const optimal = mapping.score?.optimal ?? 0;
    return sum + Math.max(0, optimal);
  }, 0);

  return (data: Record<string, unknown>): SEOGroupAnalysis => {
    let total = 0;
    const items: SEOGroupItem[] = [];

    for (const fieldConfig of fieldConfigs) {
      const mapping = getFieldMapping(fieldConfig.name);
      const { cappedScore, maxFieldScore, status, message } = getScoreForField(
        mapping,
        fieldConfig,
        data
      );

      total += cappedScore;

      items.push({
        field: mapping?.description ?? fieldConfig.name,
        status,
        message,
        score: cappedScore,
        maxScore: maxFieldScore,
      });
    }

    if (maxScore <= 0) {
      return { ...createEmptyScore(), items: [] };
    }

    const percentage = clampPercentage((total / maxScore) * 100);

    // Cap at 99% if any warnings or errors exist
    const hasWarningsOrErrors = items.some(item => 
      item.status === "warning" || item.status === "error"
    );

    return {
      score: total,
      maxScore,
      percentage: hasWarningsOrErrors ? Math.min(99, percentage) : percentage,
      items,
    };
  };
}

export function createClientSEOGroupScores(
  config: SEODoctorConfig
): (data: Record<string, unknown>) => ClientSEOGroupScores {
  const metaFields = getMetaTagsFields();
  const jsonLdFields = getJsonLdFields();

  const computeMeta = aggregateGroupAnalysis(config, metaFields);
  const computeJsonLd = aggregateGroupAnalysis(config, jsonLdFields);

  return (data: Record<string, unknown>): ClientSEOGroupScores => {
    const meta = computeMeta(data);
    const jsonLd = computeJsonLd(data);

    return {
      meta: {
        score: meta.score,
        maxScore: meta.maxScore,
        percentage: meta.percentage,
      },
      jsonLd: {
        score: jsonLd.score,
        maxScore: jsonLd.maxScore,
        percentage: jsonLd.percentage,
      },
    };
  };
}

export function createClientSEOGroupAnalysis(
  config: SEODoctorConfig
): (data: Record<string, unknown>) => ClientSEOGroupAnalysis {
  const metaFields = getMetaTagsFields();
  const jsonLdFields = getJsonLdFields();

  const analyzeMeta = aggregateGroupAnalysis(config, metaFields);
  const analyzeJsonLd = aggregateGroupAnalysis(config, jsonLdFields);

  return (data: Record<string, unknown>): ClientSEOGroupAnalysis => ({
    meta: analyzeMeta(data),
    jsonLd: analyzeJsonLd(data),
  });
}

