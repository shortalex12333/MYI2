'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Anchor,
  MessageSquare,
  Shield,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowRight,
  Eye,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* SECTION 1: Hero - Technical Precision */}
      <section className="min-h-[90vh] relative bg-white">
        <div className="container mx-auto px-4 py-32 text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 mb-8">
              <Anchor className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600 font-medium">
                Trusted by 1,200+ Yacht Owners
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="text-5xl md:text-7xl font-display font-semibold mb-6 leading-tight text-gray-900"
          >
            Trusted Knowledge for{' '}
            <span className="text-brand-blue">Yacht Owners</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            The first dedicated community for yacht insurance. Share experiences,
            get expert answers, and connect with verified insurers and captains.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.15 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button
              size="lg"
              asChild
              className="bg-brand-blue hover:bg-brand-blue/90 text-white font-medium h-14 px-8 text-lg transition-colors duration-200"
            >
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-gray-300 text-gray-900 hover:bg-gray-50 h-14 px-8 text-lg transition-colors duration-200"
            >
              <Link href="/posts">Browse Questions</Link>
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-8 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-gray-400" />
              <span>1,200+ Members</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-gray-400" />
              <span>Verified Insurers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-gray-400" />
              <span>Expert Captains</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: Trust Bar (Stats) */}
      <section className="border-y border-gray-200 bg-gray-50">
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
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="group"
              >
                <stat.icon className="h-6 w-6 text-gray-400 mx-auto mb-3 transition-colors" />
                <div className="text-3xl md:text-4xl font-display font-semibold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: Feature Cards */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-semibold mb-4 text-gray-900">
              Everything You Need for{' '}
              <span className="text-brand-blue">Yacht Insurance</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className="p-8 h-full group border border-gray-200 rounded-lg hover:border-brand-blue transition-all duration-200 bg-white"
                >
                  <div className="mb-4 p-3 rounded-lg bg-gray-100 inline-block group-hover:bg-brand-blue/10 transition-colors duration-200">
                    <feature.icon className="h-8 w-8 text-gray-600 group-hover:text-brand-blue transition-colors duration-200" />
                  </div>
                  <h3 className="text-2xl font-display font-semibold mb-3 text-gray-900 group-hover:text-brand-blue transition-colors duration-200">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Category Grid */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-semibold mb-4 text-gray-900">
              Popular <span className="text-brand-blue">Topics</span>
            </h2>
            <p className="text-xl text-gray-600">
              Browse discussions by category
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Claims', slug: 'claims', count: '1,234' },
              { name: 'Policies', slug: 'policies', count: '892' },
              { name: 'Regulations', slug: 'regulations', count: '567' },
              { name: 'Maintenance', slug: 'maintenance', count: '445' },
              { name: 'Safety', slug: 'safety', count: '389' },
              { name: 'General', slug: 'general', count: '678' },
            ].map((category, idx) => (
              <Link href={`/category/${category.slug}`} key={idx}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className="group p-6 rounded-lg border border-gray-200 hover:border-brand-blue transition-all duration-200 bg-white"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-medium text-gray-900 group-hover:text-brand-blue transition-colors duration-200">
                      {category.name}
                    </h3>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-brand-blue group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
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
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-semibold text-gray-900">
              Latest <span className="text-brand-blue">Questions</span>
            </h2>
            <Link href="/posts">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-900 hover:bg-gray-50 transition-colors duration-200"
              >
                View All
                <ArrowRight className="h-4 w-4" />
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
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className="p-6 rounded-lg border border-gray-200 hover:border-brand-blue transition-all duration-200 group bg-white"
                >
                  <h3 className="text-xl font-medium text-gray-900 group-hover:text-brand-blue mb-3 transition-colors duration-200">
                    {question.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
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
                          className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs"
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

      {/* SECTION 6: Final CTA */}
      <section className="py-32 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-6xl font-display font-semibold mb-6 text-gray-900">
              Ready to Join the{' '}
              <span className="text-brand-blue">Community?</span>
            </h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Create your profile, share your yacht details, and start engaging
              with the world's first dedicated yacht insurance community.
            </p>
            <Button
              size="lg"
              asChild
              className="bg-brand-blue hover:bg-brand-blue/90 text-white font-medium h-14 px-10 text-lg transition-colors duration-200"
            >
              <Link href="/signup">
                Create Your Account
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
