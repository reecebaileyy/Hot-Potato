import React from 'react'

interface SectionHeaderProps {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  align?: 'left' | 'center'
  size?: 'md' | 'lg' | 'xl'
  className?: string
}

const titleSizes = {
  md: 'text-[22px] leading-7 sm:text-[28px] sm:leading-8',
  lg: 'text-[28px] leading-8 sm:text-[40px] sm:leading-[1.1]',
  xl: 'text-[40px] leading-[1.05] sm:text-[56px] lg:text-[64px]',
}

/** Page and section titles with an optional eyebrow and description. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  size = 'md',
  className = '',
}: SectionHeaderProps) {
  const centered = align === 'center'
  return (
    <div className={`${centered ? 'text-center mx-auto' : ''} max-w-2xl ${className}`}>
      {eyebrow && (
        <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-accent">{eyebrow}</p>
      )}
      <h2 className={`${titleSizes[size]} font-semibold tracking-tight`}>{title}</h2>
      {description && (
        <p className="mt-3 text-[17px] leading-7 text-fg-secondary">{description}</p>
      )}
    </div>
  )
}
