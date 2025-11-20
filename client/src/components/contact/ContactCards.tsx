'use client'

import { motion } from 'framer-motion'
import { Mail, MessageSquare, Users, Clock } from 'lucide-react'

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Reach out to our team directly',
    value: 'support@myyachtsinsurance.com',
    link: 'mailto:support@myyachtsinsurance.com',
    color: 'text-brand-blue',
  },
  {
    icon: MessageSquare,
    title: 'Community Forum',
    description: 'Join the discussion',
    value: 'Browse Forum',
    link: '/posts',
    color: 'text-gray-600',
  },
  {
    icon: Users,
    title: 'Partner With Us',
    description: 'For insurers and brokers',
    value: 'partners@myyachtsinsurance.com',
    link: 'mailto:partners@myyachtsinsurance.com',
    color: 'text-brand-blue',
  },
  {
    icon: Clock,
    title: 'Response Time',
    description: 'Average response time',
    value: '< 24 hours',
    color: 'text-gray-600',
  },
]

export function ContactCards() {
  return (
    <section className="py-16 md:py-20 bg-white relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(212, 175, 55, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(212, 175, 55, 0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactMethods.map((method, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: idx * 0.1 }}
              className="group"
            >
              <div className="h-full rounded-lg bg-gray-100  border border-gray-200 hover:border-brand-blue/50 transition-all p-6">
                <method.icon className={`h-10 w-10 ${method.color} mb-4 group-hover:scale-110 transition-transform`} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {method.title}
                </h3>
                <p className="text-sm text-gray-900/60 mb-4">
                  {method.description}
                </p>
                {method.link ? (
                  <a
                    href={method.link}
                    className={`${method.color} hover:text-brand-blue-light transition-colors text-sm font-medium`}
                  >
                    {method.value}
                  </a>
                ) : (
                  <div className={`${method.color} text-sm font-medium`}>
                    {method.value}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
