import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.myyachtsinsurance.com'
  const lastModified = new Date()

  // Static core pages
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
      url: `${baseUrl}/contact`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/editorial-policy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.5,
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

  // Pillar pages - high priority SEO content
  const pillarPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/yacht-insurance`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/agreed-value-vs-actual-cash-value`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hull-and-machinery-insurance`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/protection-and-indemnity-pi`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/navigation-limits-and-lay-up-warranty`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/named-storm-deductible-florida`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/yacht-crew-insurance-crew-medical-jones-act`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/charter-yacht-insurance-commercial`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
  ]

  // Glossary pages - important for internal linking
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
    {
      url: `${baseUrl}/glossary/hull-and-machinery`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/glossary/protection-and-indemnity`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/glossary/named-storm-deductible`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/glossary/navigation-limits`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/glossary/lay-up-warranty`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/glossary/sue-and-labour`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/glossary/general-average`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/glossary/salvage`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/glossary/jones-act`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/glossary/maintenance-and-cure`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // Tools and resources - linkable assets
  const toolsAndResources: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/tools/named-storm-deductible-calculator`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/resources/hurricane-readiness-checklist`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.8,
    },
  ]

  // Community pages (lower priority)
  const communityPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/posts`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/knowledge`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/companies`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ]

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = [
    'claims',
    'policies',
    'regulations',
    'maintenance',
    'safety',
    'general',
  ].map((slug) => ({
    url: `${baseUrl}/category/${slug}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Combine all pages
  return [
    ...corePages,
    ...pillarPages,
    ...glossaryPages,
    ...toolsAndResources,
    ...communityPages,
    ...categoryPages,
  ]
}
