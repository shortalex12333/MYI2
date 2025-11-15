'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { MessageSquare, TrendingUp, Shield, Users, Anchor, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Premium Hero Section with Aurora Background */}
      <AuroraBackground className="min-h-[85vh]">
        <div className="relative z-10 container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Anchor Icon - Maritime Touch */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <div className="p-4 rounded-full bg-maritime-gold/10 backdrop-blur-sm border border-maritime-gold/20">
                <Anchor className="h-12 w-12 text-maritime-gold" />
              </div>
            </motion.div>

            {/* Main Heading - Premium Typography */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-maritime-cream via-white to-maritime-cream bg-clip-text text-transparent">
                Trusted Knowledge for
              </span>
              <br />
              <span className="bg-gradient-to-r from-maritime-gold via-maritime-gold-light to-maritime-gold bg-clip-text text-transparent">
                Yacht Owners
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-maritime-cream/80 mb-10 max-w-3xl mx-auto leading-relaxed">
              The world's premier community for yacht insurance knowledge.
              Connect with experts, share experiences, and navigate coverage with confidence.
            </p>

            {/* CTA Buttons - Premium Gold Accent */}
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                size="lg"
                asChild
                className="bg-maritime-gold hover:bg-maritime-gold-light text-maritime-navy font-semibold text-lg px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <Link href="/signup" className="flex items-center gap-2">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-2 border-maritime-cream/30 text-maritime-cream hover:bg-maritime-cream/10 hover:border-maritime-cream/50 backdrop-blur-sm text-lg px-8 py-6 rounded-lg transition-all duration-300"
              >
                <Link href="/posts">Browse Community</Link>
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="mt-16 flex flex-wrap justify-center gap-8 text-maritime-cream/60 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-maritime-gold"></div>
                <span>1,200+ Active Members</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-maritime-gold"></div>
                <span>Verified Insurers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-maritime-gold"></div>
                <span>Expert Captains</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </AuroraBackground>

      {/* Features Section - Glassmorphism Cards */}
      <section className="container mx-auto px-4 py-20 -mt-20 relative z-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: MessageSquare,
              title: 'Community Forum',
              description: 'Share experiences and get answers from fellow yacht owners',
              gradient: 'from-maritime-ocean/20 to-maritime-teal/20',
            },
            {
              icon: TrendingUp,
              title: 'Insurance Insights',
              description: 'Access real-world claims data and premium trends',
              gradient: 'from-maritime-teal/20 to-maritime-gold/20',
            },
            {
              icon: Shield,
              title: 'Verified Providers',
              description: 'Connect with verified insurers and brokers',
              gradient: 'from-maritime-gold/20 to-maritime-ocean/20',
            },
            {
              icon: Users,
              title: 'Expert Network',
              description: 'Learn from experienced captains and yacht owners',
              gradient: 'from-maritime-navy/40 to-maritime-ocean/20',
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="backdrop-blur-lg bg-white/5 border-white/10 hover:border-maritime-gold/30 transition-all duration-500 hover:shadow-xl hover:shadow-maritime-gold/10 group hover:-translate-y-2">
                <CardHeader>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-7 w-7 text-maritime-gold" />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-muted-foreground/80">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Popular Categories - Premium Layout */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-b from-transparent to-maritime-navy/20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Popular Topics
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore the most discussed areas in yacht insurance
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Claims', slug: 'claims', count: '1,234', description: 'Insurance claims discussions and experiences', icon: '⚓' },
            { name: 'Policies', slug: 'policies', count: '892', description: 'Policy coverage and recommendations', icon: '📋' },
            { name: 'Regulations', slug: 'regulations', count: '567', description: 'Maritime regulations and compliance', icon: '⚖️' },
            { name: 'Maintenance', slug: 'maintenance', count: '445', description: 'Yacht maintenance best practices', icon: '🔧' },
            { name: 'Safety', slug: 'safety', count: '389', description: 'Safety equipment and procedures', icon: '🛡️' },
            { name: 'General', slug: 'general', count: '678', description: 'General yacht insurance discussions', icon: '💬' },
          ].map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <Link href={`/category/${category.slug}`}>
                <Card className="group hover:border-maritime-gold/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-maritime-gold/20 h-full backdrop-blur-sm bg-card/50">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                        {category.icon}
                      </div>
                      <Badge variant="secondary" className="bg-maritime-gold/20 text-maritime-gold border-maritime-gold/30">
                        {category.count} posts
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-maritime-gold transition-colors">
                      {category.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground/80">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-maritime-navy via-maritime-ocean to-maritime-navy-light p-12 md:p-16 text-center border border-maritime-gold/20"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-maritime-gold/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-maritime-teal/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-maritime-cream">
              Ready to join the community?
            </h2>
            <p className="text-lg md:text-xl text-maritime-cream/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Create your profile, share your yacht details, and start engaging with the world's premier yacht insurance community.
            </p>
            <Button
              size="lg"
              asChild
              className="bg-maritime-gold hover:bg-maritime-gold-light text-maritime-navy font-semibold text-lg px-10 py-6 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <Link href="/signup">Create Your Account</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
