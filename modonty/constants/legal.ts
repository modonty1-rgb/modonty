/**
 * What is left after the legal entity moved to the database.
 *
 * Every fact about the company — name, registration number, address, capital, dates —
 * now lives on the Settings row and is read by `getLegalEntity()`. A constant for any of
 * those went stale the day someone edited it in admin, and worse: it made /trust show the
 * visitor one number while the JSON-LD handed Google another.
 *
 * These two survive because neither is entity data:
 * the verification portal is the same URL for every commercial registration in the
 * kingdom, and the fallback image is a file in /public, used only until the team uploads
 * the certificate from admin.
 */

// Saudi Business Center — public authentication inquiry. Same URL for every CR.
export const SAUDI_BUSINESS_VERIFY_URL = "https://eauthenticate.saudibusiness.gov.sa/inquiry";

// Shipped copy of the certificate, served from /public. `getBrandMedia()` overrides it.
export const CR_CERTIFICATE_FALLBACK_IMAGE = "/trust/jabr-cr-certificate.png";
