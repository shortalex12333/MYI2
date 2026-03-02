/**
 * BreadcrumbList Schema.org generator
 * Generates BreadcrumbList structured data for navigation context
 * Spec: https://schema.org/BreadcrumbList
 */

const BASE_URL = 'https://www.myyachtsinsurance.com'

export interface BreadcrumbItem {
  name: string
  url: string
}

export interface BreadcrumbListSchema {
  '@context': string
  '@type': string
  itemListElement: Array<{
    '@type': string
    position: number
    name: string
    item: string
  }>
}

/**
 * Generate BreadcrumbList schema from breadcrumb items
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): BreadcrumbListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  }
}

/**
 * Common breadcrumb patterns for reuse across pages
 */
export const COMMON_BREADCRUMBS = {
  home: { name: 'Home', url: '/' },
  papers: { name: 'Papers', url: '/papers' },
  knowledge: { name: 'Knowledge Base', url: '/knowledge' },
  topics: { name: 'Topics', url: '/topics' },
  qa: { name: 'Q&A', url: '/knowledge' },
}
