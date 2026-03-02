/**
 * FAQPage Schema.org generator
 * Generates FAQPage structured data for Q&A content
 * Spec: https://schema.org/FAQPage
 */

export interface FAQItem {
  question: string
  answer: string
}

export interface FAQPageSchema {
  '@context': string
  '@type': string
  mainEntity: Array<{
    '@type': string
    name: string
    acceptedAnswer: {
      '@type': string
      text: string
    }
  }>
}

/**
 * Generate FAQPage schema for a single Q&A pair
 */
export function generateFAQSchema(question: string, answer: string): FAQPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer,
        },
      },
    ],
  }
}

/**
 * Generate FAQPage schema for multiple Q&A pairs
 */
export function generateMultiFAQSchema(items: FAQItem[]): FAQPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
