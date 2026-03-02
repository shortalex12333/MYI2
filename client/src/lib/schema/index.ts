/**
 * Schema.org structured data generators
 *
 * This module provides functions to generate Schema.org JSON-LD
 * for various content types across the site.
 */

export {
  generateFAQSchema,
  generateMultiFAQSchema,
  type FAQItem,
  type FAQPageSchema,
} from './faq-schema'

export {
  generateBreadcrumbSchema,
  COMMON_BREADCRUMBS,
  type BreadcrumbItem,
  type BreadcrumbListSchema,
} from './breadcrumb-schema'
