'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { HelpCircle, MessageSquare } from 'lucide-react'

export function CompaniesCTA() {
  return (
    <section className="py-20 md:py-28 bg-white-light relative overflow-hidden">
      {/* Decorative Gradient Orbs */}

      {/* Subtle Wave Pattern */}
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-brand-blue/10 border border-brand-blue/30">
              <HelpCircle className="h-8 w-8 text-brand-blue" />
            </div>
          </motion.div>

          {/* Heading */}
          <h2 className="text-3xl md:text-5xl font-display font-semibold mb-6">
            Need help choosing{' '}
            <span className="text-brand-blue">the right insurer?</span>
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-900/70 mb-4 leading-relaxed">
            Ask the community or get expert recommendations from experienced yacht owners,
            captains, and insurance professionals.
          </p>

          <p className="text-sm text-gray-900/50 mb-10">
            Our community has helped thousands of yacht owners find the perfect coverage
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              asChild
              className="bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold h-14 px-10 text-lg  shadow-brand-blue/30 transition-all duration-200 "
            >
              <Link href="/posts/new?category=claims">
                <MessageSquare className="mr-2 h-5 w-5" />
                Ask Your Question
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-14 px-10 text-lg border-brand-blue/50 text-brand-blue hover:bg-brand-blue/10 transition-all"
            >
              <Link href="/posts">
                Browse Questions
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2, delay: 0.3 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs text-gray-900/50"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-blue/50" />
              <span>24h avg response time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-blue/50" />
              <span>89 verified experts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-blue/50" />
              <span>10,000+ questions answered</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
