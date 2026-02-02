# Social Media SEO Reference Guide

## Field Names and Source of Truth

### Open Graph Fields

| Field                | Source of Truth                                            |
| -------------------- | ---------------------------------------------------------- |
| **ogTitle**          | `seoTitle`                                                 |
| **ogDescription**    | `seoDescription`                                           |
| **ogUrl**            | `canonicalUrl`                                             |
| **ogSiteName**       | Global site/client setting (e.g. client name or "مودونتي") |
| **ogLocale**         | Article language / client locale (e.g. "ar_SA")            |
| **ogArticleSection** | `category.name`                                            |
| **ogArticleTag**     | Current article tags (names, not IDs)                      |
| **ogImage**          | **Featured Image** (article featured image)                |

### Twitter Card Fields

| Field                            | Source of Truth                                        |
| -------------------------------- | ------------------------------------------------------ |
| **twitterCard**                  | Default "summary_large_image"                          |
| **twitterTitle**                 | `ogTitle`, then `seoTitle`, then `title`               |
| **twitterDescription**           | `ogDescription`, then `seoDescription`, then `excerpt` |
| **twitterSite**                  | Global site handle (e.g. from client or settings)      |
| **twitterCreator**               | `author.twitter` from Author model                     |
| **twitterLabel1 / twitterData1** | Manual entry only                                      |
| **twitterImage**                 | **Featured Image** (article featured image)            |

---
