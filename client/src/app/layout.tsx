import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'

// NEW BRAND: Technical precision typography
const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

// Note: Eloquia Display would be added here when available from Google Fonts
// For now, we'll use Poppins as the primary font and can add display font later
// import { Manrope } from 'next/font/google' // Backup display font

export const metadata: Metadata = {
  title: 'MyYachtsInsurance - Yacht Insurance Intelligence',
  description: 'Technical precision meets yacht insurance. Where knowledge meets urgency.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
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
