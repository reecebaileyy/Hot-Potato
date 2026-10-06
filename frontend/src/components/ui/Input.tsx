import React, { forwardRef } from 'react'

interface FieldProps {
  label?: React.ReactNode
  hint?: React.ReactNode
  error?: React.ReactNode
  className?: string
  children: React.ReactNode
}

/** Label + control + hint/error, stacked. */
export function Field({ label, hint, error, className = '', children }: FieldProps) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="block mb-1.5 text-[13px] font-medium text-fg-secondary">{label}</span>}
      {children}
      {error ? (
        <span className="block mt-1.5 text-[13px] text-danger">{error}</span>
      ) : hint ? (
        <span className="block mt-1.5 text-[13px] text-fg-tertiary">{hint}</span>
      ) : null}
    </label>
  )
}

const inputClasses =
  'w-full h-10 px-3.5 rounded-xl bg-surface-muted text-fg text-[15px] placeholder:text-fg-tertiary ' +
  'border border-transparent focus:border-line-strong focus:bg-surface focus:outline-none ' +
  'transition-colors duration-200 disabled:opacity-50 tnum'

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = '', ...rest }, ref) {
    return <input ref={ref} className={`${inputClasses} ${className}`} {...rest} />
  },
)

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className = '', children, ...rest }, ref) {
    return (
      <select ref={ref} className={`${inputClasses} appearance-none pr-9 ${className}`} {...rest}>
        {children}
      </select>
    )
  },
)

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className = '', ...rest }, ref) {
    return <textarea ref={ref} className={`${inputClasses} h-auto py-2.5 font-mono text-[13px] ${className}`} {...rest} />
  },
)
