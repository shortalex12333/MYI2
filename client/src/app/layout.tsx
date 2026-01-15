import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MyYachtsInsurance - Yacht Insurance Community',
  description: 'The first dedicated community and intelligence hub for yacht insurance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MyYachtsInsurance",
    "url": "https://www.myyachtsinsurance.com",
    "logo": "https://www.myyachtsinsurance.com/logo.png",
    "description": "The first dedicated community and intelligence hub for yacht insurance, providing educational resources, expert insights, and tools for yacht owners and insurance professionals.",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "url": "https://www.myyachtsinsurance.com/contact"
    },
    "sameAs": []
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "MyYachtsInsurance",
    "url": "https://www.myyachtsinsurance.com",
    "description": "Expert yacht insurance guides, tools, and community for yacht owners navigating hull coverage, P&I liability, agreed value policies, and marine insurance complexities.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.myyachtsinsurance.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema)
          }}
        />

        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="border-t py-6 md:py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © 2024 MyYachtsInsurance. All rights reserved.
              </p>
              <nav className="flex gap-4 text-sm">
                <a href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms
                </a>
                <a href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy
                </a>
                <a href="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact
                </a>
              </nav>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
