import React from 'react'

interface StatProps {
  label: React.ReactNode
  value: React.ReactNode
  /** Small text under the value (unit, delta, hint). */
  hint?: React.ReactNode
  tone?: 'default' | 'accent' | 'success' | 'danger'
  align?: 'left' | 'center'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const toneClasses = {
  default: 'text-fg',
  accent: 'text-accent',
  success: 'text-success',
  danger: 'text-danger',
}

const sizeClasses = {
  sm: 'text-[17px] leading-6',
  md: 'text-[22px] leading-7',
  lg: 'text-[34px] leading-10',
}

/** Label-over-number block used in stat rows and summaries. */
export function Stat({ label, value, hint, tone = 'default', align = 'left', size = 'md', className = '' }: StatProps) {
  return (
    <div className={`${align === 'center' ? 'text-center' : ''} ${className}`}>
      <div className="text-[12px] leading-4 font-medium uppercase tracking-wide text-fg-secondary">{label}</div>
      <div className={`mt-1 font-semibold tracking-tight tnum ${sizeClasses[size]} ${toneClasses[tone]}`}>{value}</div>
      {hint && <div className="mt-0.5 text-[13px] leading-5 text-fg-secondary">{hint}</div>}
    </div>
  )
}

/** A row of stats separated by hairlines, wrapping on small screens. */
export function StatRow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-4 gap-y-4 [&>*]:px-4 [&>*:first-child]:pl-0 [&>*]:border-l [&>*]:border-line [&>*:first-child]:border-l-0 sm:[&>*:nth-child(3)]:border-l [&>*:nth-child(3)]:border-l-0 ${className}`}
    >
      {children}
    </div>
  )
}
