import React from 'react'

/** Loading placeholder. Pass width/height classes via className. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`rounded-lg bg-surface-strong animate-pulse-soft ${className}`} />
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block h-5 w-5 rounded-full border-2 border-line-strong border-t-fg animate-spin ${className}`}
    />
  )
}
