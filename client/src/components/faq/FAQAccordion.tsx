'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface FAQItem {
  id: string
  question: string
  answer: string
}

interface FAQAccordionProps {
  faqs: FAQItem[]
  index?: number
}

export function FAQAccordion({ faqs, index = 0 }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx
        return (
          <motion.div
            key={faq.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: (index * 0.1) + (idx * 0.05) }}
            className="group"
          >
            <button
              onClick={() => toggleFAQ(idx)}
              className="w-full text-left rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-maritime-gold/50 transition-all p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg md:text-xl font-semibold text-maritime-cream group-hover:text-maritime-gold transition-colors flex-1">
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="h-5 w-5 text-maritime-gold" />
                </motion.div>
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 mt-4 border-t border-white/10">
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="text-maritime-cream/80 leading-relaxed mb-4">
                                {children}
                              </p>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside text-maritime-cream/80 space-y-2 mb-4">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside text-maritime-cream/80 space-y-2 mb-4">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="text-maritime-cream/80">{children}</li>
                            ),
                            strong: ({ children }) => (
                              <strong className="text-maritime-gold font-semibold">
                                {children}
                              </strong>
                            ),
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                className="text-maritime-gold hover:text-maritime-gold-light underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {faq.answer}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        )
      })}
    </div>
  )
}
