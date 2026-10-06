import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `plain` has no padding (for tables and lists), `inset` is a muted sub-surface. */
  variant?: 'default' | 'plain' | 'inset'
  as?: 'div' | 'section' | 'article' | 'aside'
}

/** The one surface: white (or near-black) with a hairline border and a soft shadow. */
export function Card({ variant = 'default', as: Tag = 'div', className = '', children, ...rest }: CardProps) {
  const base =
    variant === 'inset'
      ? 'bg-surface-muted rounded-2xl'
      : 'bg-surface rounded-3xl border border-line shadow-sm'
  const padding = variant === 'plain' ? '' : variant === 'inset' ? 'p-4' : 'p-5 sm:p-6'
  return (
    <Tag className={`${base} ${padding} ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

interface CardHeaderProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function CardHeader({ title, subtitle, action, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div className="min-w-0">
        <h3 className="text-[17px] leading-6 font-semibold">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[13px] leading-5 text-fg-secondary">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
