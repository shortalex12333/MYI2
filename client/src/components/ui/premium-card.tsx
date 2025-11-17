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
  glassmorphism = true
}: PremiumCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      className={cn(
        'rounded-xl border transition-all duration-300',
        glassmorphism && 'bg-white/5 backdrop-blur-sm border-white/10',
        hover && 'hover:border-maritime-gold/50 hover:shadow-lg hover:shadow-maritime-gold/10',
        className
      )}
    >
      {children}
    </motion.div>
  )
}
