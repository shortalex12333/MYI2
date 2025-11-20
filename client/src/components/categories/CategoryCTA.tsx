'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { GradientText } from '@/components/ui/gradient-text'
import { Plus } from 'lucide-react'

export function CategoryCTA() {
  return (
    <section className="py-24 md:py-32 bg-white-light relative overflow-hidden">
      {/* Decorative Gradient Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl opacity-30" />
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
          transition={{ duration: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Not sure where your <GradientText>issue belongs?</GradientText>
          </h2>
          <p className="text-lg md:text-xl text-gray-900/70 mb-8 leading-relaxed">
            Ask your question and our community of yacht owners, captains, and insurance experts will help you find the right answer.
          </p>
          <Button
            size="lg"
            asChild
            className="bg-brand-blue hover:bg-brand-blue-light text-maritime-navy font-semibold h-14 px-10 text-lg shadow-2xl shadow-brand-blue/30 transition-all duration-200 hover:scale-105"
          >
            <Link href="/posts/new">
              <Plus className="mr-2 h-5 w-5" />
              Ask a Question
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
