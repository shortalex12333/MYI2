'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import React from 'react'

interface PremiumCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glassmorphism?: boolean
}

export const PremiumCard = ({
  children,
  className,
  hover = true,
  glassmorphism = false
}: PremiumCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'rounded-lg border border-gray-200 bg-white transition-all duration-200',
        hover && 'hover:border-brand-blue',
        className
      )}
    >
      {children}
    </motion.div>
  )
}
