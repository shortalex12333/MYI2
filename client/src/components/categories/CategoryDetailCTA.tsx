'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { GradientText } from '@/components/ui/gradient-text'
import { Plus, MessageSquare } from 'lucide-react'

interface CategoryDetailCTAProps {
  categoryName: string
  categorySlug: string
}

export function CategoryDetailCTA({ categoryName, categorySlug }: CategoryDetailCTAProps) {
  return (
    <section className="py-20 md:py-28 bg-maritime-navy-light relative overflow-hidden">
      {/* Decorative Gradient Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-maritime-gold/20 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-maritime-teal/20 rounded-full blur-3xl opacity-30" />

      {/* Soft Wave Pattern */}
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
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-maritime-gold/10 border border-maritime-gold/30">
              <MessageSquare className="h-8 w-8 text-maritime-gold" />
            </div>
          </motion.div>

          {/* Heading */}
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Have a question about{' '}
            <GradientText>{categoryName}?</GradientText>
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-maritime-cream/70 mb-8 leading-relaxed">
            Get expert answers from our community of yacht owners, captains, and insurance professionals.
          </p>

          {/* CTA Button */}
          <Button
            size="lg"
            asChild
            className="bg-maritime-gold hover:bg-maritime-gold-light text-maritime-navy font-semibold h-14 px-10 text-lg shadow-2xl shadow-maritime-gold/30 transition-all duration-300 hover:scale-105"
          >
            <Link href={`/posts/new?category=${categorySlug}`}>
              <Plus className="mr-2 h-5 w-5" />
              Ask Your Question
            </Link>
          </Button>

          {/* Subtext */}
          <p className="text-xs text-maritime-cream/50 mt-6">
            Questions are typically answered within 24 hours
          </p>
        </motion.div>
      </div>
    </section>
  )
}
