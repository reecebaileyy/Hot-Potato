import React from 'react'

interface SegmentedProps<T extends string> {
  options: { value: T; label: React.ReactNode }[]
  value: T
  onChange: (value: T) => void
  size?: 'sm' | 'md'
  className?: string
  'aria-label'?: string
}

/** iOS-style segmented control. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className = '',
  ...rest
}: SegmentedProps<T>) {
  const height = size === 'sm' ? 'h-8 text-[13px]' : 'h-10 text-[15px]'
  return (
    <div
      role="tablist"
      aria-label={rest['aria-label']}
      className={`inline-flex p-1 rounded-xl bg-surface-muted ${height} ${className}`}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={`flex-1 px-3 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ease-apple ${
              active ? 'bg-surface text-fg shadow-sm' : 'text-fg-secondary hover:text-fg'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
