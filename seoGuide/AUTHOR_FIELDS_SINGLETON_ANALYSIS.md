# Author Fields Analysis for Singleton Model

## Overview
Analysis of all author form fields to determine which are relevant for Modonty as a platform-level singleton author vs. individual person author.

## Field Analysis

### ✅ **KEEP - Relevant for Platform Author**

| Field | Current Label | Reason | Notes |
|-------|--------------|--------|-------|
| `name` | Full Name | ✅ Essential | "Modonty" - platform name |
| `slug` | (Hidden) | ✅ Essential | Fixed to "modonty" |
| `bio` | Bio | ✅ Essential | Platform description/mission |
| `image` | Image URL | ✅ Essential | Platform logo |
| `imageAlt` | Image Alt Text | ✅ Essential | Logo alt text for accessibility |
| `url` | URL | ✅ Essential | https://modonty.com |
| `email` | Email | ✅ Useful | Platform contact email |
| `linkedIn` | LinkedIn | ✅ Essential | Platform LinkedIn page |
| `twitter` | Twitter URL | ✅ Essential | Platform Twitter profile |
| `facebook` | Facebook | ✅ Essential | Platform Facebook page |
| `expertiseAreas` | Expertise Areas | ✅ Useful | Platform content topics |
| `memberOf` | Member Of | ✅ Useful | Industry associations |
| `verificationStatus` | Verification Status | ✅ Essential | Platform verification |
| `seoTitle` | SEO Title | ✅ Essential | Author page SEO |
| `seoDescription` | SEO Description | ✅ Essential | Author page SEO |
| `canonicalUrl` | Canonical URL | ✅ Essential | Author page canonical |

### ⚠️ **QUESTIONABLE - May Need Adjustment**

| Field | Current Label | Issue | Recommendation |
|-------|--------------|-------|----------------|
| `jobTitle` | Job Title | Not a person, doesn't have a "job" | **Remove or rename** to "Platform Type" (e.g., "Content Platform", "Digital Publisher") |
| `credentials` | Credentials | Person-focused (degrees, certs) | **Remove** - platforms don't have credentials like people |
| `qualifications` | Qualifications | Person-focused | **Remove** - platforms don't have qualifications |
| `experienceYears` | Experience Years | Could work as "Years in Operation" | **Keep but rename** to "Years in Operation" |
| `education` | Education | Person-focused (schools, degrees) | **Remove** - platforms don't have education |

### ❌ **REMOVE - Not Relevant for Platform**

| Field | Current Label | Reason |
|-------|--------------|--------|
| `firstName` | First Name | Platform is not a person - no first/last name |
| `lastName` | Last Name | Platform is not a person - no first/last name |
| `worksFor` | Works For (Client) | ✅ Already removed - platform doesn't work for clients |

## Recommendations

### Fields to Remove:
1. **firstName** - Not applicable to platform
2. **lastName** - Not applicable to platform  
3. **credentials** - Person-specific, not platform-specific
4. **qualifications** - Person-specific, not platform-specific
5. **education** - Person-specific, not platform-specific

### Fields to Adjust:
1. **jobTitle** - Remove or rename to "Platform Type" / "Platform Category"
2. **experienceYears** - Rename to "Years in Operation" or "Founded Year"

### Fields to Keep:
All other fields are relevant for a platform-level author profile.

## Structured Data Impact

- `firstName`/`lastName` → Used for `givenName`/`familyName` in Schema.org Person
  - **Impact**: For platform, we should use Organization schema instead of Person schema
  - **Action**: Consider switching to Organization schema for Modonty author

- `jobTitle` → Used in Person schema
  - **Impact**: Not relevant for Organization
  - **Action**: Remove or repurpose

- `worksFor` → Already removed ✅

## Summary

**Remove**: firstName, lastName, credentials, qualifications, education  
**Adjust**: jobTitle (remove or rename), experienceYears (rename)  
**Keep**: All other fields are appropriate for platform author
