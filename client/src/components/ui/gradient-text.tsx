'use client'

import { cn } from '@/lib/utils'
import React from 'react'

interface GradientTextProps {
  children: React.ReactNode
  className?: string
  from?: string
  to?: string
}

export const GradientText = ({
  children,
  className,
  from = 'from-gray-900',
  to = 'to-brand-blue'
}: GradientTextProps) => {
  return (
    <span className={cn(
      `bg-gradient-to-r ${from} ${to} bg-clip-text text-transparent`,
      className
    )}>
      {children}
    </span>
  )
}
