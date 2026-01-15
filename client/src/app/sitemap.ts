import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.myyachtsinsurance.com'
  const lastModified = new Date()

  // Static core pages (only indexable pages)
  const corePages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/editorial-policy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Learning hub - high priority SEO content
  const learningPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/yacht-insurance`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/learn/named-storm-deductible`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/learn/agreed-value-vs-acv`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/learn/navigation-limits-and-layup-warranty`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
  ]

  // Glossary pages (only pages that exist)
  const glossaryPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/glossary`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/glossary/agreed-value`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/glossary/actual-cash-value`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // Tools - linkable assets
  const toolsAndResources: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/tools/named-storm-deductible-calculator`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.8,
    },
  ]

  // Combine only indexable pages (excludes noindex community pages)
  return [
    ...corePages,
    ...learningPages,
    ...glossaryPages,
    ...toolsAndResources,
  ]
}
