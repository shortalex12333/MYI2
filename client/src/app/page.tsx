'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { PremiumCard } from '@/components/ui/premium-card'
import { GradientText } from '@/components/ui/gradient-text'
import {
  Anchor,
  MessageSquare,
  Shield,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowRight,
  Eye,
  ThumbsUp
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-maritime-navy text-maritime-cream">
      {/* SECTION 1: Premium Hero with Aurora Background */}
      <AuroraBackground className="min-h-[90vh] relative">
        <div className="relative z-10 container mx-auto px-4 py-32 text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-maritime-gold/10 border border-maritime-gold/20 backdrop-blur-sm mb-8">
              <Anchor className="h-4 w-4 text-maritime-gold" />
              <span className="text-sm text-maritime-gold font-medium">
                Trusted by 1,200+ Yacht Owners
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            Trusted Knowledge for{' '}
            <GradientText>Yacht Owners</GradientText>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-maritime-cream/70 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            The first dedicated community for yacht insurance. Share experiences,
            get expert answers, and connect with verified insurers and captains.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button
              size="lg"
              asChild
              className="bg-maritime-gold hover:bg-maritime-gold-light text-maritime-navy font-semibold h-14 px-8 text-lg shadow-lg shadow-maritime-gold/20 transition-all duration-300 hover:scale-105"
            >
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-maritime-gold/30 text-maritime-cream hover:bg-maritime-gold/10 hover:border-maritime-gold h-14 px-8 text-lg transition-all duration-300"
            >
              <Link href="/posts">Browse Questions</Link>
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-8 text-sm text-maritime-cream/60"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-maritime-gold" />
              <span>1,200+ Members</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-maritime-gold" />
              <span>Verified Insurers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-maritime-gold" />
              <span>Expert Captains</span>
            </div>
          </motion.div>
        </div>
      </AuroraBackground>

      {/* SECTION 2: Trust Bar (Stats) */}
      <section className="border-y border-maritime-gold/10 bg-maritime-navy-light/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '1.2K+', label: 'Active Members', icon: Users },
              { value: '4.5K+', label: 'Questions Answered', icon: MessageSquare },
              { value: '95%', label: 'Resolution Rate', icon: CheckCircle2 },
              { value: '24h', label: 'Avg Response Time', icon: TrendingUp },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group"
              >
                <stat.icon className="h-6 w-6 text-maritime-gold mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-3xl md:text-4xl font-bold text-maritime-gold mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-maritime-cream/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: Feature Cards (Glassmorphism) */}
      <section className="py-24 bg-maritime-navy">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need for{' '}
              <GradientText>Yacht Insurance</GradientText>
            </h2>
            <p className="text-xl text-maritime-cream/60 max-w-2xl mx-auto">
              A complete platform designed for yacht owners, captains, and insurance professionals.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: MessageSquare,
                title: 'Community Forum',
                description: 'Ask questions, share experiences, and get answers from fellow yacht owners and experts.',
                href: '/posts'
              },
              {
                icon: Shield,
                title: 'Verified Insurers',
                description: 'Connect with verified insurance companies and brokers specializing in yacht coverage.',
                href: '/companies'
              },
              {
                icon: TrendingUp,
                title: 'Claims Insights',
                description: 'Access real-world claims data, premium trends, and industry best practices.',
                href: '/insights'
              },
              {
                icon: Users,
                title: 'Expert Network',
                description: 'Learn from experienced captains, marine engineers, and insurance professionals.',
                href: '/experts'
              },
              {
                icon: CheckCircle2,
                title: 'Knowledge Base',
                description: 'Browse our comprehensive FAQ and guides covering all aspects of yacht insurance.',
                href: '/faq'
              },
              {
                icon: Eye,
                title: 'Transparent Reviews',
                description: 'Read honest reviews and ratings from yacht owners about their insurance experiences.',
                href: '/reviews'
              },
            ].map((feature, idx) => (
              <Link href={feature.href} key={idx}>
                <PremiumCard className="p-8 h-full group">
                  <div className="mb-4 p-3 rounded-lg bg-maritime-gold/10 inline-block group-hover:bg-maritime-gold/20 transition-colors">
                    <feature.icon className="h-8 w-8 text-maritime-gold" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-maritime-cream group-hover:text-maritime-gold transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-maritime-cream/60 leading-relaxed">
                    {feature.description}
                  </p>
                </PremiumCard>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Category Grid */}
      <section className="py-24 bg-maritime-navy-light/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Popular <GradientText>Topics</GradientText>
            </h2>
            <p className="text-xl text-maritime-cream/60">
              Browse discussions by category
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: '⚓ Claims', slug: 'claims', count: '1,234', emoji: '⚓' },
              { name: '📋 Policies', slug: 'policies', count: '892', emoji: '📋' },
              { name: '⚖️ Regulations', slug: 'regulations', count: '567', emoji: '⚖️' },
              { name: '🔧 Maintenance', slug: 'maintenance', count: '445', emoji: '🔧' },
              { name: '🦺 Safety', slug: 'safety', count: '389', emoji: '🦺' },
              { name: '💬 General', slug: 'general', count: '678', emoji: '💬' },
            ].map((category, idx) => (
              <Link href={`/category/${category.slug}`} key={idx}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="group p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-maritime-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-maritime-gold/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-maritime-cream group-hover:text-maritime-gold transition-colors">
                      {category.name}
                    </h3>
                    <ArrowRight className="h-5 w-5 text-maritime-gold/50 group-hover:text-maritime-gold group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-maritime-cream/50">
                    <MessageSquare className="h-4 w-4" />
                    <span>{category.count} discussions</span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: Latest Questions Preview */}
      <section className="py-24 bg-maritime-navy">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold">
              Latest <GradientText>Questions</GradientText>
            </h2>
            <Link href="/posts">
              <Button
                variant="outline"
                className="border-maritime-gold/30 text-maritime-gold hover:bg-maritime-gold/10"
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {[
              {
                title: 'What\'s the best insurance for a 45ft sailing yacht in the Mediterranean?',
                author: 'John D.',
                replies: 12,
                views: 234,
                tags: ['Policies', 'Mediterranean'],
              },
              {
                title: 'How to handle a hull damage claim with my insurer?',
                author: 'Sarah M.',
                replies: 8,
                views: 156,
                tags: ['Claims', 'Hull Damage'],
              },
              {
                title: 'Required safety equipment for Caribbean cruising insurance?',
                author: 'Mike R.',
                replies: 15,
                views: 312,
                tags: ['Safety', 'Caribbean'],
              },
            ].map((question, idx) => (
              <Link href="/posts" key={idx}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-maritime-gold/50 transition-all duration-300 group"
                >
                  <h3 className="text-xl font-semibold text-maritime-cream group-hover:text-maritime-gold mb-3 transition-colors">
                    {question.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-maritime-cream/60">
                    <span>by {question.author}</span>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{question.replies} replies</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{question.views} views</span>
                    </div>
                    <div className="flex gap-2 ml-auto">
                      {question.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full bg-maritime-gold/10 text-maritime-gold text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: Final CTA with Gradient Orbs */}
      <section className="py-32 bg-maritime-navy-light relative overflow-hidden">
        {/* Decorative Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-maritime-gold/20 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-maritime-teal/20 rounded-full blur-3xl opacity-30" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to Join the{' '}
              <GradientText>Community?</GradientText>
            </h2>
            <p className="text-xl text-maritime-cream/70 mb-10 leading-relaxed">
              Create your profile, share your yacht details, and start engaging
              with the world's first dedicated yacht insurance community.
            </p>
            <Button
              size="lg"
              asChild
              className="bg-maritime-gold hover:bg-maritime-gold-light text-maritime-navy font-semibold h-14 px-10 text-lg shadow-2xl shadow-maritime-gold/30 transition-all duration-300 hover:scale-105"
            >
              <Link href="/signup">
                Create Your Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
