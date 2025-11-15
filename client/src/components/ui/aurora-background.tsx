'use client'

import { cn } from '@/lib/utils'
import React, { ReactNode } from 'react'

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode
  showRadialGradient?: boolean
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center bg-maritime-navy transition-bg overflow-hidden',
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            `
            [--maritime-navy:#071C2F]
            [--maritime-ocean:#2E5266]
            [--maritime-teal:#77A6B6]
            [--gold:#D4AF37]

            [mask-image:radial-gradient(ellipse_at_100%_0%,white_10%,var(--transparent)_70%)]

            pointer-events-none
            absolute -inset-[10px] opacity-50 blur-[10px] invert dark:invert-0

            after:content-[""] after:absolute after:inset-0
            after:[background-image:repeating-linear-gradient(100deg,var(--maritime-navy)_0%,var(--maritime-ocean)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--maritime-ocean)_16%),repeating-linear-gradient(100deg,var(--maritime-teal)_10%,var(--maritime-ocean)_15%,var(--transparent)_20%,var(--transparent)_25%,var(--maritime-teal)_30%)]
            after:bg-[length:300%,_200%]
            after:bg-[position:50%_50%,50%_50%]
            after:[background-attachment:fixed,fixed]
            after:animate-aurora

            dark:after:[background-image:repeating-linear-gradient(100deg,var(--maritime-navy)_10%,var(--maritime-ocean)_15%,var(--transparent)_20%,var(--transparent)_25%,var(--maritime-ocean)_30%),repeating-linear-gradient(100deg,var(--gold)_0%,var(--maritime-teal)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--maritime-teal)_16%)]

            will-change-transform`,

            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
          )}
        ></div>
      </div>
      {children}
    </div>
  )
}
