'use client'

import { cn } from '@/lib/utils'
import React, { useEffect, useRef, useState } from 'react'

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = 'fast',
  waveOpacity = 0.5,
  ...props
}: {
  children?: React.ReactNode
  className?: string
  containerClassName?: string
  waveWidth?: number
  backgroundFill?: string
  blur?: number
  speed?: 'slow' | 'fast'
  waveOpacity?: number
  [key: string]: any
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isSafari, setIsSafari] = useState(false)

  useEffect(() => {
    setIsSafari(
      typeof window !== 'undefined' &&
        navigator.userAgent.includes('Safari') &&
        !navigator.userAgent.includes('Chrome')
    )
  }, [])

  const getWaveSpeed = () => {
    switch (speed) {
      case 'slow':
        return 0.001
      case 'fast':
        return 0.002
      default:
        return 0.001
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center relative',
        containerClassName
      )}
    >
      <canvas
        className="absolute inset-0 z-0"
        ref={canvasRef}
        id="canvas"
        style={{
          filter: `blur(${blur}px)`,
        }}
      ></canvas>
      <div className={cn('relative z-10', className)} {...props}>
        {children}
      </div>
    </div>
  )
}
