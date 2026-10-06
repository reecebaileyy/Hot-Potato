import React from 'react'

type Tone = 'neutral' | 'accent' | 'success' | 'danger' | 'warning'

interface BadgeProps {
  tone?: Tone
  /** Shows a small dot before the label (use for live states). */
  dot?: boolean
  pulse?: boolean
  className?: string
  children: React.ReactNode
}

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-surface-muted text-fg-secondary',
  accent: 'bg-accent-soft text-accent',
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
  warning: 'bg-warning-soft text-warning',
}

/** Small rounded status label. */
export function Badge({ tone = 'neutral', dot = false, pulse = false, className = '', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[12px] font-medium tracking-tight ${toneClasses[tone]} ${className}`}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full bg-current ${pulse ? 'animate-pulse-soft' : ''}`}
        />
      )}
      {children}
    </span>
  )
}
