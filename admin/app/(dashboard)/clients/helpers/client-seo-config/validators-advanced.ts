// ============================================================================
// IMPORTS
// ============================================================================
import type { SEOFieldValidator } from "@/components/shared/seo-doctor";

// ============================================================================
// ADDRESS VALIDATORS
// ============================================================================

// Saudi Arabia regions/provinces.
// Origin: MODONTY POLICY (data quality), not Google. schema.org places no constraint on
// PostalAddress.addressRegion, and Google's Local Business structured data lists it as a
// plain recommended property with no allowed-value list — so this is our own check that a
// Saudi partner's address names one of the Kingdom's 13 official regions. It only ever
// scores; it never blocks a save.
// Arabic spellings are accepted: the console is Arabic-first, so a partner who typed
// «الرياض» used to be scored down as an invalid region — a false negative, not a defect.
const SAUDI_REGIONS: ReadonlyArray<{ en: string; names: readonly string[] }> = [
  { en: "Riyadh", names: ["Riyadh", "Ar Riyadh", "الرياض", "منطقة الرياض"] },
  { en: "Makkah", names: ["Makkah", "Mecca", "Makkah Al Mukarramah", "مكة المكرمة", "مكة", "منطقة مكة المكرمة"] },
  { en: "Al Madinah", names: ["Al Madinah", "Madinah", "Medina", "المدينة المنورة", "المدينة", "منطقة المدينة المنورة"] },
  { en: "Eastern Province", names: ["Eastern Province", "Ash Sharqiyah", "المنطقة الشرقية", "الشرقية"] },
  { en: "Al Qassim", names: ["Al Qassim", "Qassim", "القصيم", "منطقة القصيم"] },
  { en: "Asir", names: ["Asir", "Aseer", "عسير", "منطقة عسير"] },
  { en: "Tabuk", names: ["Tabuk", "تبوك", "منطقة تبوك"] },
  { en: "Hail", names: ["Hail", "Ha'il", "حائل", "منطقة حائل"] },
  { en: "Northern Borders", names: ["Northern Borders", "Al Hudud Ash Shamaliyah", "الحدود الشمالية", "منطقة الحدود الشمالية"] },
  { en: "Jazan", names: ["Jazan", "Jizan", "جازان", "جيزان", "منطقة جازان"] },
  { en: "Najran", names: ["Najran", "نجران", "منطقة نجران"] },
  { en: "Al Bahah", names: ["Al Bahah", "Al Baha", "الباحة", "منطقة الباحة"] },
  { en: "Al Jawf", names: ["Al Jawf", "Aljouf", "الجوف", "منطقة الجوف"] },
];

/** Fold case, Arabic diacritics and alef/ya/ta-marbuta variants so «الْمَدِينَة» matches «المدينه». */
function normalizeRegionName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[ً-ْٰ]/g, "")
    .replace(/[آأإٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[‌-‏]/g, "")
    .replace(/\s+/g, " ");
}

export const validateAddressRegion: SEOFieldValidator = (value, data) => {
  const addressRegion = data.addressRegion;
  const hasCountry = data.addressCountry && typeof data.addressCountry === "string" && data.addressCountry.trim().length > 0;
  const isSaudi = hasCountry && (data.addressCountry as string).toUpperCase() === "SA";

  if (!addressRegion || typeof addressRegion !== "string" || addressRegion.trim().length === 0) {
    if (isSaudi) {
      return {
        status: "warning",
        message: "Address Region is important for Saudi Arabia - add province/region for complete address",
        score: 0,
      };
    }
    return {
      status: "info",
      message: "Address Region optional - add for complete address information",
      score: 0,
    };
  }

  const region = addressRegion.trim();

  if (isSaudi) {
    const normalizedRegion = normalizeRegionName(region);
    const isValidRegion = SAUDI_REGIONS.some((r) =>
      r.names.some((name) => normalizeRegionName(name) === normalizedRegion)
    );

    if (isValidRegion) {
      return {
        status: "good",
        message: "Address Region is valid Saudi province",
        score: 5,
      };
    }
    return {
      status: "warning",
      message: `Address Region should be one of Saudi Arabia's 13 regions (Arabic spelling accepted): ${SAUDI_REGIONS.map((r) => r.en).join(", ")}`,
      score: 2,
    };
  }

  return {
    status: "good",
    message: "Address Region provided",
    score: 3,
  };
};

export const validateNationalAddress: SEOFieldValidator = (value, data) => {
  const hasPostalCode =
    data.addressPostalCode &&
    typeof data.addressPostalCode === "string" &&
    data.addressPostalCode.trim().length > 0;
  const hasBuildingNumber =
    data.addressBuildingNumber &&
    typeof data.addressBuildingNumber === "string" &&
    data.addressBuildingNumber.trim().length > 0;
  const hasNeighborhood =
    data.addressNeighborhood &&
    typeof data.addressNeighborhood === "string" &&
    data.addressNeighborhood.trim().length > 0;
  const isSaudi =
    data.addressCountry &&
    typeof data.addressCountry === "string" &&
    (data.addressCountry as string).toUpperCase() === "SA";

  if (!isSaudi) {
    return {
      status: "info",
      message: "National Address format is specific to Saudi Arabia",
      score: 0,
    };
  }

  // Origin: SAUDI POST (SPL) National Address — NOT Google, and NOT an SEO requirement.
  // The National Address pairs a 5-digit postal code with a 4-digit additional number, which
  // written together read as 9 digits. Google asks for no such thing: `postalCode` is a plain
  // recommended PostalAddress property in the Local Business structured data docs, with no
  // format rule. We score it because a complete Saudi address is better business data.
  // The former "(mandatory from 2026)" note is REMOVED: the 2026 deadline that exists is the
  // Transport General Authority's PARCEL/COURIER mandate — shipments must carry a National or
  // Short Address — which says nothing about this field or about search. No official source
  // was found making a 9-digit postal code mandatory here, so the claim does not stand.
  if (hasPostalCode) {
    const postalCode = (data.addressPostalCode as string).replace(/\D/g, "");
    const is9Digit = postalCode.length === 9;
    const is5Digit = postalCode.length === 5;

    if (is9Digit && hasBuildingNumber && hasNeighborhood) {
      return {
        status: "good",
        message:
          "Complete National Address format (9-digit postal code, building number, neighborhood) - optimal for Saudi Arabia",
        score: 10,
      };
    }
    if (is9Digit && hasBuildingNumber) {
      return {
        status: "good",
        message:
          "National Address format with 9-digit postal code and building number - add neighborhood for complete format",
        score: 8,
      };
    }
    if (is9Digit) {
      return {
        status: "good",
        message:
          "9-digit postal code provided - add building number and neighborhood for complete National Address format",
        score: 6,
      };
    }
    if (is5Digit) {
      return {
        status: "warning",
        message:
          "5-digit postal code provided - add the 4-digit additional number for the full Saudi Post National Address (9 digits). Data-quality suggestion, not a Google or SEO requirement",
        score: 3,
      };
    }
    return {
      status: "warning",
      message:
        "Postal code is neither 5 digits nor 9 - the Saudi Post National Address uses a 5-digit postal code plus a 4-digit additional number. Data-quality suggestion, not a Google or SEO requirement",
      score: 1,
    };
  }

  if (hasBuildingNumber) {
    return {
      status: "warning",
      message:
        "Building number provided - add 9-digit postal code for National Address format",
      score: 2,
    };
  }

  return {
    status: "info",
    message:
      "National Address format (9-digit postal code, building number) is mandatory in Saudi Arabia from 2026 - recommended to include now",
    score: 0,
  };
};

// (validateLicenseInfo removed 2026-05-24 — license fields moved to Client.ymylData JSON owned by YMYL system)
