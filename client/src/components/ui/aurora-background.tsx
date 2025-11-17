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
            [--maritime-gold:rgba(212,175,55,0.3)]
            [--maritime-teal:rgba(119,166,182,0.2)]
            [--maritime-ocean:rgba(46,82,102,0.25)]

            [background-repeat:no-repeat]
            [background-size:300%_300%]
            [background-position:50%_50%]

            after:absolute after:inset-0 after:bg-maritime-navy after:opacity-80

            dark:[background-image:repeating-linear-gradient(100deg,var(--maritime-gold)_0%,var(--maritime-teal)_10%,var(--maritime-ocean)_20%,var(--maritime-gold)_30%,var(--maritime-teal)_40%,var(--maritime-ocean)_50%)]
            `,
            'absolute -inset-[10px] opacity-50 will-change-transform animate-aurora',
            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]`
          )}
        ></div>
      </div>
      {children}
    </div>
  )
}
