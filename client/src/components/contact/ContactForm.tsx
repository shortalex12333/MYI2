'use client'

import { motion } from 'framer-motion'
import { GradientText } from '@/components/ui/gradient-text'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

export function ContactForm() {
  return (
    <section className="py-16 md:py-24 bg-white-light relative">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <GradientText>Send Us a Message</GradientText>
            </h2>
            <p className="text-gray-900/70">
              Fill out the form below and we'll get back to you as soon as possible
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-8"
          >
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-900">
                    Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    required
                    className="bg-white border-white/10 text-gray-900 placeholder:text-gray-900/40 focus:border-brand-blue/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    className="bg-white border-white/10 text-gray-900 placeholder:text-gray-900/40 focus:border-brand-blue/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-gray-900">
                  Subject
                </Label>
                <Input
                  id="subject"
                  placeholder="What is this about?"
                  required
                  className="bg-white border-white/10 text-gray-900 placeholder:text-gray-900/40 focus:border-brand-blue/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-gray-900">
                  Message
                </Label>
                <Textarea
                  id="message"
                  placeholder="Tell us more..."
                  rows={8}
                  required
                  className="bg-white border-white/10 text-gray-900 placeholder:text-gray-900/40 focus:border-brand-blue/50 resize-none"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-brand-blue hover:bg-brand-blue-light text-maritime-navy font-semibold shadow-xl shadow-brand-blue/20 transition-all hover:scale-105"
              >
                <Send className="mr-2 h-5 w-5" />
                Send Message
              </Button>

              <p className="text-xs text-gray-900/50 text-center">
                We typically respond within 24 hours
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
