'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { MessageSquare, HelpCircle } from 'lucide-react'

interface CompanyDetailCTAProps {
  companyName: string
}

export function CompanyDetailCTA({ companyName }: CompanyDetailCTAProps) {
  return (
    <section className="py-20 md:py-28 bg-white-light relative overflow-hidden">
      {/* Decorative Gradient Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-maritime-teal/20 rounded-full blur-3xl opacity-30" />

      {/* Wave Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              rgba(212, 175, 55, 0.1) 35px,
              rgba(212, 175, 55, 0.1) 70px
            )`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2 }}
            className="mb-6"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-blue/10 border border-brand-blue/30">
              <HelpCircle className="h-8 w-8 text-brand-blue" />
            </div>
          </motion.div>

          {/* Heading */}
          <h2 className="text-3xl md:text-5xl font-display font-semibold mb-6">
            Questions about{' '}
            <span className="text-brand-blue">{companyName}?</span>
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-900/70 mb-4 leading-relaxed">
            Get insights from yacht owners who have worked with this provider.
            Ask questions or share your experience.
          </p>

          <p className="text-sm text-gray-900/50 mb-10">
            Our community has firsthand experience with insurance providers worldwide
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              asChild
              className="bg-brand-blue hover:bg-brand-blue-light text-maritime-navy font-semibold h-14 px-10 text-lg shadow-2xl shadow-brand-blue/30 transition-all duration-200 hover:scale-105"
            >
              <Link href="/posts/new?category=claims">
                <MessageSquare className="mr-2 h-5 w-5" />
                Ask a Question
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-14 px-10 text-lg border-brand-blue/50 text-brand-blue hover:bg-brand-blue/10 transition-all"
            >
              <Link href="/companies">
                Browse All Providers
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
