import React from 'react'
import Link from 'next/link'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface BaseProps {
  variant?: Variant
  size?: Size
  loading?: boolean
  block?: boolean
  leading?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

type ButtonProps = BaseProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>
type LinkProps = BaseProps & { href: string; external?: boolean }

const variantClasses: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover active:opacity-90 shadow-sm',
  secondary: 'bg-surface-muted text-fg hover:bg-surface-strong',
  ghost: 'bg-transparent text-fg hover:bg-surface-muted',
  danger: 'bg-danger-soft text-danger hover:bg-danger hover:text-white',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] rounded-lg gap-1.5',
  md: 'h-10 px-4 text-[15px] rounded-xl gap-2',
  lg: 'h-12 px-6 text-[17px] rounded-2xl gap-2',
}

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  block = false,
  className = '',
}: Pick<BaseProps, 'variant' | 'size' | 'block' | 'className'>) {
  return [
    'inline-flex items-center justify-center font-medium whitespace-nowrap select-none',
    'transition-[background-color,color,opacity,transform] duration-200 ease-apple',
    'disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]',
    variantClasses[variant],
    sizeClasses[size],
    block ? 'w-full' : '',
    className,
  ].join(' ')
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"
    />
  )
}

/** Standard button. `loading` shows a spinner and disables it. */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  block = false,
  leading,
  className = '',
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={buttonClasses({ variant, size, block, className })}
      {...rest}
    >
      {loading ? <Spinner /> : leading}
      {children}
    </button>
  )
}

/** A link styled as a button (internal routes or external URLs). */
export function ButtonLink({
  href,
  external = false,
  variant = 'primary',
  size = 'md',
  block = false,
  leading,
  className = '',
  children,
}: LinkProps) {
  const classes = buttonClasses({ variant, size, block, className })
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {leading}
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={classes}>
      {leading}
      {children}
    </Link>
  )
}
