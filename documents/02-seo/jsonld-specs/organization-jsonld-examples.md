# Organization JSON-LD Examples - Enhanced Schema

This document provides examples of the enhanced Organization structured data after the implementation of Saudi Arabia/Gulf-specific fields and Schema.org best practices.

## Table of Contents
1. [Complete Example - Full Organization Schema](#complete-example)
2. [Minimal Example - Basic Required Fields](#minimal-example)
3. [Saudi Arabia Business Example](#saudi-arabia-example)
4. [Parent-Child Organization Example](#parent-child-example)
5. [Local Business Example](#local-business-example)
6. [Field Reference Guide](#field-reference)

---

## Complete Example - Full Organization Schema {#complete-example}

This example shows a complete Organization with all available fields:

```json
{
  "@context": "https://schema.org",
  "@type": "Corporation",
  "@id": "https://modonty.com/clients/example-company#organization",
  "name": "Example Company Ltd.",
  "legalName": "Example Company Limited Liability Company",
  "alternateName": "شركة المثال المحدودة",
  "url": "https://example.com",
  "slogan": "Innovation for Tomorrow",
  "description": "A leading technology company specializing in software solutions for businesses across Saudi Arabia and the Gulf region.",
  "keywords": ["technology", "software", "SaaS", "enterprise solutions"],
  "foundingDate": "2015-03-15",
  
  "logo": {
    "@type": "ImageObject",
    "url": "https://example.com/logo.png",
    "width": 400,
    "height": 400
  },
  
  "identifier": [
    {
      "@type": "PropertyValue",
      "name": "Commercial Registration Number",
      "value": "1234567890"
    },
    {
      "@type": "PropertyValue",
      "name": "VAT ID",
      "value": "310123456789003"
    },
    {
      "@type": "PropertyValue",
      "name": "Tax ID",
      "value": "123456789012345"
    }
  ],
  
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "telephone": "+966-11-123-4567",
      "email": "support@example.com",
      "availableLanguage": ["Arabic", "English"],
      "areaServed": ["SA", "AE", "KW", "QA", "BH", "OM"]
    },
    {
      "@type": "ContactPoint",
      "contactType": "sales",
      "telephone": "+966-11-123-4568",
      "email": "sales@example.com",
      "availableLanguage": ["Arabic", "English"],
      "areaServed": "Saudi Arabia"
    },
    {
      "@type": "ContactPoint",
      "contactType": "technical support",
      "telephone": "+966-11-123-4569",
      "email": "tech@example.com",
      "availableLanguage": ["English"],
      "areaServed": "Global"
    }
  ],
  
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "King Fahd Road, Al Olaya",
    "addressLocality": "Al Olaya District",
    "addressRegion": "Riyadh",
    "postalCode": "12211-1234",
    "addressCountry": "SA",
    "postOfficeBoxNumber": "1234",
    "productSupported": "5678"
  },
  
  "sameAs": [
    "https://www.linkedin.com/company/example",
    "https://twitter.com/example",
    "https://www.facebook.com/example",
    "https://www.instagram.com/example"
  ],
  
  "legalForm": "LLC",
  "isicV4": "6201",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "6201"
  },
  "numberOfEmployees": {
    "@type": "QuantitativeValue",
    "value": "50-100"
  },
  "license": "HC-2023-12345",
  "provider": {
    "@type": "Organization",
    "name": "Ministry of Health"
  },
  "knowsLanguage": ["Arabic", "English"],
  "parentOrganization": {
    "@type": "Organization",
    "@id": "https://modonty.com/clients/parent-company#organization"
  }
}
```

---

## Minimal Example - Basic Required Fields {#minimal-example}

Minimum viable Organization schema:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Simple Company",
  "url": "https://simple.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://simple.com/logo.png"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+966-11-123-4567",
    "email": "info@simple.com"
  }
}
```

---

## Saudi Arabia Business Example {#saudi-arabia-example}

Example focused on Saudi Arabia compliance:

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Al-Riyadh Trading Company",
  "legalName": "شركة الرياض التجارية",
  "alternateName": "Riyadh Trading Co.",
  "url": "https://riyadhtrading.com",
  "description": "Leading trading company in Saudi Arabia specializing in consumer goods and electronics.",
  
  "logo": {
    "@type": "ImageObject",
    "url": "https://riyadhtrading.com/logo.png",
    "width": 300,
    "height": 300
  },
  
  "identifier": [
    {
      "@type": "PropertyValue",
      "name": "Commercial Registration Number",
      "value": "1010123456"
    },
    {
      "@type": "PropertyValue",
      "name": "VAT ID",
      "value": "310101234567890"
    }
  ],
  
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "telephone": "+966-11-234-5678",
    "email": "info@riyadhtrading.com",
    "availableLanguage": ["Arabic", "English"],
    "areaServed": "Saudi Arabia"
  },
  
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "King Abdulaziz Road",
    "addressLocality": "Al Malaz",
    "addressRegion": "Riyadh",
    "postalCode": "11564-1234",
    "addressCountry": "SA",
    "postOfficeBoxNumber": "5678",
    "productSupported": "9012"
  },
  
  "legalForm": "LLC",
  "businessActivityCode": "4641",
  "numberOfEmployees": {
    "@type": "QuantitativeValue",
    "value": "25"
  },
  "knowsLanguage": ["Arabic", "English"]
}
```

---

## Parent-Child Organization Example {#parent-child-example}

Example showing parent organization relationship:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Corporation",
      "@id": "https://modonty.com/clients/parent-corp#organization",
      "name": "Parent Corporation",
      "legalName": "Parent Corporation LLC",
      "url": "https://parentcorp.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://parentcorp.com/logo.png"
      },
      "identifier": [
        {
          "@type": "PropertyValue",
          "name": "Commercial Registration Number",
          "value": "1000000001"
        }
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+966-11-111-1111",
        "email": "info@parentcorp.com"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://modonty.com/clients/subsidiary#organization",
      "name": "Subsidiary Company",
      "legalName": "Subsidiary Company LLC",
      "url": "https://subsidiary.com",
      "parentOrganization": {
        "@type": "Organization",
        "@id": "https://modonty.com/clients/parent-corp#organization"
      },
      "logo": {
        "@type": "ImageObject",
        "url": "https://subsidiary.com/logo.png"
      },
      "identifier": [
        {
          "@type": "PropertyValue",
          "name": "Commercial Registration Number",
          "value": "2000000002"
        }
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+966-11-222-2222",
        "email": "info@subsidiary.com"
      }
    }
  ]
}
```

---

## Local Business Example {#local-business-example}

Example for a local business with complete National Address:

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Al-Noor Restaurant",
  "legalName": "مطعم النور",
  "alternateName": "Noor Restaurant",
  "url": "https://alnoorrestaurant.com",
  "description": "Authentic Saudi cuisine restaurant in the heart of Riyadh.",
  "slogan": "Taste of Tradition",
  
  "logo": {
    "@type": "ImageObject",
    "url": "https://alnoorrestaurant.com/logo.jpg",
    "width": 500,
    "height": 500
  },
  
  "identifier": [
    {
      "@type": "PropertyValue",
      "name": "Commercial Registration Number",
      "value": "4030123456"
    },
    {
      "@type": "PropertyValue",
      "name": "VAT ID",
      "value": "310403012345678"
    }
  ],
  
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "contactType": "reservations",
      "telephone": "+966-11-345-6789",
      "email": "reservations@alnoorrestaurant.com",
      "availableLanguage": ["Arabic", "English"],
      "areaServed": "Riyadh"
    },
    {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "telephone": "+966-11-345-6790",
      "email": "info@alnoorrestaurant.com",
      "availableLanguage": ["Arabic", "English"],
      "areaServed": "Saudi Arabia"
    }
  ],
  
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Tahlia Street, Al Olaya",
    "addressLocality": "Al Olaya District",
    "addressRegion": "Riyadh",
    "postalCode": "12211-5678",
    "addressCountry": "SA",
    "postOfficeBoxNumber": "9012",
    "productSupported": "3456"
  },
  
  "legalForm": "Sole Proprietorship",
  "businessActivityCode": "5610",
  "isicV4": "5610",
  "numberOfEmployees": {
    "@type": "QuantitativeValue",
    "value": "10-25"
  },
  "license": "F&B-2024-78901",
  "provider": {
    "@type": "Organization",
    "name": "Riyadh Municipality"
  },
  "knowsLanguage": ["Arabic", "English"],
  "keywords": ["restaurant", "Saudi cuisine", "traditional food", "Riyadh dining"]
}
```

---

## Field Reference Guide {#field-reference}

### Core Organization Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `@context` | string | Yes | Always "https://schema.org" |
| `@type` | string | Yes | Organization type (Organization, Corporation, LocalBusiness, etc.) |
| `name` | string | Yes | Organization name |
| `legalName` | string | No | Official registered business name |
| `alternateName` | string | No | Alternative names (Arabic name, trade name) |
| `url` | string | No | Organization website URL |
| `slogan` | string | No | Company slogan/motto |
| `description` | string | No | Organization description |
| `keywords` | string[] | No | Keywords for classification |

### Logo

```json
"logo": {
  "@type": "ImageObject",
  "url": "https://example.com/logo.png",
  "width": 400,
  "height": 400
}
```

### Identifiers (Saudi Arabia/Gulf)

```json
"identifier": [
  {
    "@type": "PropertyValue",
    "name": "Commercial Registration Number",
    "value": "1234567890"
  },
  {
    "@type": "PropertyValue",
    "name": "VAT ID",
    "value": "310123456789003"
  },
  {
    "@type": "PropertyValue",
    "name": "Tax ID",
    "value": "123456789012345"
  }
]
```

### Contact Points (Multiple)

```json
"contactPoint": [
  {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "telephone": "+966-11-123-4567",
    "email": "support@example.com",
    "availableLanguage": ["Arabic", "English"],
    "areaServed": "Saudi Arabia"
  }
]
```

**Contact Types:**
- `customer service`
- `technical support`
- `sales`
- `reservations`
- `billing support`
- `emergency`

### Address (National Address Format)

```json
"address": {
  "@type": "PostalAddress",
  "streetAddress": "King Fahd Road",
  "addressLocality": "Al Olaya District",  // Neighborhood
  "addressRegion": "Riyadh",              // City/Province
  "postalCode": "12211-1234",              // 9-digit postal code
  "addressCountry": "SA",
  "postOfficeBoxNumber": "1234",           // Building number
  "productSupported": "5678"                // Additional number
}
```

**Saudi Arabia Regions:**
- Riyadh
- Makkah
- Al Madinah
- Eastern Province
- Al Qassim
- Asir
- Tabuk
- Hail
- Northern Borders
- Jazan
- Najran
- Al Bahah
- Al Jawf

### Business Classification

| Field | Type | Description |
|-------|------|-------------|
| `legalForm` | string | Entity type: LLC, JSC, Sole Proprietorship, Partnership, etc. |
| `businessActivityCode` | string | Local business activity classification code |
| `isicV4` | string | International Standard Industrial Classification (V4) |
| `numberOfEmployees` | string or QuantitativeValue | Employee count (e.g., "50" or "10-50") |

```json
"numberOfEmployees": {
  "@type": "QuantitativeValue",
  "value": "50-100"
}
```

### License Information

```json
"license": "HC-2023-12345",
"provider": {
  "@type": "Organization",
  "name": "Ministry of Health"
}
```

### Organization Relationships

```json
"parentOrganization": {
  "@type": "Organization",
  "@id": "https://modonty.com/clients/parent-company#organization"
}
```

### Additional Properties

| Field | Type | Description |
|-------|------|-------------|
| `knowsLanguage` | string[] | Languages supported (e.g., ["Arabic", "English"]) |
| `foundingDate` | string | Founding date in ISO format (YYYY-MM-DD) |
| `sameAs` | string[] | Social media profiles URLs |

---

## Best Practices

### 1. Always Include Core Fields
- `@context`, `@type`, `name` are required
- `logo` should be an ImageObject with dimensions
- At least one `contactPoint` is recommended

### 2. Saudi Arabia Compliance
- **Commercial Registration Number** is critical for Saudi businesses
- Use **National Address format** with 9-digit postal code
- Include **VAT ID** if registered with ZATCA
- Specify **legalForm** for clarity

### 3. Multiple Contact Points
- Use array format for multiple contact points
- Specify `contactType` for each point
- Include `availableLanguage` for multilingual support
- Use `areaServed` to specify service areas

### 4. Address Format
- Use `addressLocality` for neighborhood/district
- Use `addressRegion` for city/province
- Include `postOfficeBoxNumber` for building number
- Use `productSupported` for additional number (custom mapping)

### 5. Organization Type
- Use specific types: `Corporation`, `LocalBusiness`, `NonProfit`, etc.
- Avoid generic "Organization" when a more specific type applies

### 6. Identifiers
- Always use `PropertyValue` format for identifiers
- Include descriptive `name` for each identifier
- CR Number, VAT ID, and Tax ID are most important for Saudi businesses

---

## Validation

Use these tools to validate your JSON-LD:

1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema.org Validator**: https://validator.schema.org/
3. **JSON-LD Playground**: https://json-ld.org/playground/

---

## Notes

- All new fields are **optional** for backward compatibility
- Fields are validated through SEO Doctor in the admin panel
- Schema generation functions handle missing fields gracefully
- Multiple contact points are supported and recommended
- National Address format is optimized for Saudi Arabia local SEO

---

**Last Updated**: After Organization schema enhancement implementation
**Version**: 2.0
**Status**: Production Ready
