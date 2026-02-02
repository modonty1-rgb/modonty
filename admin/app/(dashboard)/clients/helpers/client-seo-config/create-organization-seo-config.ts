import { SEODoctorConfig, type SEOFieldValidator } from "@/components/shared/seo-doctor";
import {
  validateSlug,
  createValidateSEODescription,
  createValidateTwitterTitle,
  createValidateTwitterDescription,
  validateTwitterCards,
  validateTwitterImageAlt,
  validateCanonicalUrl,
} from "@/components/shared/seo-doctor/validators";
import type { SEOSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
// Consolidated validators
import {
  validateName,
  validateLegalName,
  validateUrl,
  validateDescription,
  validateSlogan,
  validateContactInfo,
  validateSocialProfiles,
  validateFoundingDate,
  validateBusinessBrief,
  validateGTMId,
  createValidateSEOTitleAndOG,
} from './validators-basic';

import {
  validateLogo,
  validateLogoAlt,
  validateOGImageForClient,
  validateOGImageAltForClient,
  validateOGImageDimensionsForClient,
  validateTwitterCardsForClient,
  validateTwitterImageAltForClient,
  validateAddress,
  validateAddressRegion,
  validateNationalAddress,
  validateContactPoint,
  validateMultipleContactPoints,
  validateSaudiIdentifiers,
  validateLegalForm,
  validateClassification,
  validateOrganizationType,
  validateNumberOfEmployees,
  validateLicenseInfo,
} from './validators-advanced';
import { generateOrganizationStructuredData } from "./generate-organization-structured-data";
import { 
  getFieldMapping, 
  CLIENT_FIELD_MAPPINGS,
  getMetaTagsFields,
  getJsonLdFields 
} from "../client-field-mapping";

/**
 * Get label for a validator field based on mapping + validator name
 * Ensures we don't show confusing duplicates like two "Organization logo image" items.
 */
function getLabelFromMapping(mappingFieldName: string, validatorFieldName: string): string {
  const mapping = getFieldMapping(mappingFieldName);

  // Special cases where one mapping field produces multiple validator fields
  if (mappingFieldName === "logoMedia") {
    if (validatorFieldName === "logoAlt") {
      return "Organization logo alt text";
    }
    if (validatorFieldName === "logo") {
      return "Organization logo image";
    }
  }

  if (mappingFieldName === "ogImageMedia") {
    if (validatorFieldName === "ogImageAlt") {
      return "Open Graph image alt text";
    }
    if (validatorFieldName === "ogImage" || validatorFieldName === "ogImageWidth") {
      return "Open Graph image";
    }
  }

  if (mapping?.description) {
    return mapping.description;
  }

  return validatorFieldName;
}

/**
 * Map database field names to validator field names
 * Some validators check nested properties (e.g., logoMedia -> logo, logoAlt)
 */
const FIELD_TO_VALIDATOR_MAP: Record<string, string[]> = {
  'logoMedia': ['logo', 'logoAlt'],
  'ogImageMedia': ['ogImage', 'ogImageAlt', 'ogImageWidth'],
  'twitterImageMedia': ['twitterImageAlt'],
  // Direct mappings (field name = validator name)
  'name': ['name'],
  'slug': ['slug'],
  'legalName': ['legalName'],
  'url': ['url'],
  'seoTitle': ['seoTitle'],
  'seoDescription': ['seoDescription'],
  'description': ['description'],
  'canonicalUrl': ['canonicalUrl'],
  'metaRobots': ['metaRobots'],
  'sameAs': ['sameAs'],
  'email': ['email'],
  'phone': ['phone'],
  'contactType': ['contactType'],
  'addressStreet': ['addressStreet'],
  'addressCity': ['addressCity'],
  'addressRegion': ['addressRegion'],
  'addressCountry': ['addressCountry'],
  'addressPostalCode': ['addressPostalCode'],
  'addressBuildingNumber': ['addressStreet'], // Combined with addressStreet
  'addressAdditionalNumber': ['addressStreet'], // Combined with addressStreet
  'addressNeighborhood': ['addressStreet'], // Part of address validation
  'commercialRegistrationNumber': ['commercialRegistrationNumber'],
  'vatID': ['vatID'],
  'taxID': ['taxID'],
  'legalForm': ['legalForm'],
  'businessActivityCode': ['businessActivityCode'],
  'isicV4': ['isicV4'],
  'numberOfEmployees': ['numberOfEmployees'],
  'licenseNumber': ['licenseNumber'],
  'organizationType': ['organizationType'],
  'alternateName': ['alternateName'],
  'slogan': ['slogan'],
  'foundingDate': ['foundingDate'],
  'keywords': ['keywords'],
  'knowsLanguage': ['knowsLanguage'],
  'twitterCard': ['twitterCard'],
  'twitterTitle': ['twitterTitle'],
  'twitterDescription': ['twitterDescription'],
  'twitterSite': ['twitterSite'],
  'contentPriorities': ['contentPriorities'],
  'parentOrganization': ['parentOrganization'],
};

/**
 * Get validator field names for a database field
 */
function getValidatorFieldsForMappingField(fieldName: string): string[] {
  return FIELD_TO_VALIDATOR_MAP[fieldName] || [fieldName];
}

/**
 * Get validator for a field name
 */
function getValidatorForField(fieldName: string, settings?: SEOSettings): SEOFieldValidator | null {
  const validatorMap: Record<string, SEOFieldValidator> = {
    'name': validateName,
    'slug': validateSlug,
    'legalName': validateLegalName,
    'url': validateUrl,
    'logo': validateLogo,
    'logoAlt': validateLogoAlt,
    'ogImage': validateOGImageForClient,
    'ogImageAlt': validateOGImageAltForClient,
    'ogImageWidth': validateOGImageDimensionsForClient,
    'seoTitle': createValidateSEOTitleAndOG(settings),
    'seoDescription': createValidateSEODescription(settings),
    'sameAs': validateSocialProfiles,
    'email': validateContactInfo,
    'foundingDate': validateFoundingDate,
    'description': validateDescription,
    'contactType': validateContactPoint,
    'twitterCard': validateTwitterCardsForClient,
    'twitterTitle': createValidateTwitterTitle(settings),
    'twitterDescription': createValidateTwitterDescription(settings),
    'twitterImageAlt': validateTwitterImageAltForClient,
    'canonicalUrl': validateCanonicalUrl,
    'addressStreet': validateAddress,
    'commercialRegistrationNumber': validateSaudiIdentifiers,
    'legalForm': validateLegalForm,
    'vatID': validateSaudiIdentifiers,
    'taxID': validateSaudiIdentifiers,
    'addressRegion': validateAddressRegion,
    'addressPostalCode': validateNationalAddress,
    'businessActivityCode': validateClassification,
    'isicV4': validateClassification,
    'numberOfEmployees': validateNumberOfEmployees,
    'licenseNumber': validateLicenseInfo,
    'organizationType': validateOrganizationType,
    'alternateName': validateName,
    'slogan': validateSlogan,
  };
  
  return validatorMap[fieldName] || null;
}

function buildOrganizationSEOConfig(
  settings: SEOSettings | undefined,
  importantOnly: boolean,
): SEODoctorConfig {
  // Core fields that should drive the main SEO score (most critical signals)
  const IMPORTANT_SCORE_FIELDS = new Set<string>([
    "name",
    "seoTitle",
    "seoDescription",
    "description",
    "canonicalUrl",
    "url",
    "logoMedia",
    "addressStreet",
    "addressCity",
    "addressCountry",
    "email",
    "phone",
  ]);

  // Get all fields that affect MetaTags or JSON-LD
  const metaTagsFields = getMetaTagsFields();
  const jsonLdFields = getJsonLdFields();
  
  // Combine and deduplicate by field name
  const allSeoFields = new Map<string, typeof CLIENT_FIELD_MAPPINGS[0]>();
  metaTagsFields.forEach((f) => allSeoFields.set(f.field, f));
  jsonLdFields.forEach((f) => allSeoFields.set(f.field, f));
  
  // Build field configs from mapping
  const fieldConfigs: Array<{
    name: string;
    label: string;
    validator: SEOFieldValidator;
  }> = [];
  const processedValidatorFields = new Set<string>();
  
  for (const mapping of allSeoFields.values()) {
    // Skip integration fields for all configs
    if (mapping.category === "Integration") {
      continue;
    }

    // For core config, only include important fields
    if (importantOnly && !IMPORTANT_SCORE_FIELDS.has(mapping.field)) {
      continue;
    }
    
    const validatorFields = getValidatorFieldsForMappingField(mapping.field);
    
    for (const validatorField of validatorFields) {
      // Avoid duplicates (e.g., addressStreet appears multiple times)
      if (processedValidatorFields.has(validatorField)) {
        continue;
      }
      
      const validator = getValidatorForField(validatorField, settings);
      if (validator) {
        processedValidatorFields.add(validatorField);
        fieldConfigs.push({
          name: validatorField,
          label: getLabelFromMapping(mapping.field, validatorField),
          validator,
        });
      }
    }
  }
  
  // Calculate maxScore by summing optimal scores from mapping file
  // This ensures maxScore is derived from the single source of truth
  let calculatedMaxScore = 0;
  const processedFields = new Set<string>();
  
  for (const mapping of allSeoFields.values()) {
    // Skip Integration category for all configs
    if (mapping.category === "Integration") {
      continue;
    }

    // For core config, only include important fields in maxScore
    if (importantOnly && !IMPORTANT_SCORE_FIELDS.has(mapping.field)) {
      continue;
    }
    
    // Avoid counting the same field multiple times (e.g., addressStreet appears in multiple validators)
    if (processedFields.has(mapping.field)) {
      continue;
    }
    
    // Add optimal score from mapping if available
    if (mapping.score?.optimal) {
      calculatedMaxScore += mapping.score.optimal;
      processedFields.add(mapping.field);
    }
  }

  return {
    entityType: "Organization",
    maxScore: calculatedMaxScore || 200, // Fallback to 200 if calculation fails
    generateStructuredData: generateOrganizationStructuredData,
    fields: fieldConfigs,
  };
}

// Core-only config: used by the main SEO Doctor header bar
export const createOrganizationSEOConfig = (
  settings?: SEOSettings,
): SEODoctorConfig => {
  return buildOrganizationSEOConfig(settings, true);
};

// Full config: used by Meta / JSON-LD side bars to measure advanced fields
export const createOrganizationSEOConfigFull = (
  settings?: SEOSettings,
): SEODoctorConfig => {
  return buildOrganizationSEOConfig(settings, false);
};

