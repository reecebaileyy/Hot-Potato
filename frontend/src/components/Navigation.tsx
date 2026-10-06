import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import ConnectWalletButton from './ConnectWalletButton'
import { useTheme } from '../hooks/useTheme'

const LINKS = [
  { href: '/play', label: 'Play' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: 'https://0xhotpotato.gitbook.io/onchain-hot-potato/', label: 'Docs', external: true },
] as const

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  )
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { darkMode, toggle } = useTheme()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`h-9 w-9 inline-flex items-center justify-center rounded-full text-fg-secondary hover:text-fg hover:bg-surface-muted transition-colors ${className}`}
    >
      {darkMode ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}

/** Wordmark: a small potato mark and the name. */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 font-semibold tracking-tight text-fg ${className}`}>
      <span aria-hidden="true" className="h-6 w-6 rounded-full bg-accent inline-flex items-center justify-center">
        <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
      </span>
      <span className="text-[17px]">Hot Potato</span>
    </Link>
  )
}

/**
 * Translucent top bar, 56px tall. Links collapse into a sheet below `md`.
 * Pages reserve space for it with `pt-14` (AppShell does this).
 */
export default function Navigation() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const close = () => setOpen(false)
    router.events.on('routeChangeStart', close)
    return () => router.events.off('routeChangeStart', close)
  }, [router.events])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  const isActive = (href: string) => router.pathname === href

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 bg-nav backdrop-blur-xl backdrop-saturate-150 border-b border-line">
        <nav className="mx-auto max-w-page h-14 px-4 sm:px-6 flex items-center justify-between gap-4">
          <Wordmark />

          <ul className="hidden md:flex items-center gap-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                {'external' in link && link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-[14px] font-medium text-fg-secondary hover:text-fg hover:bg-surface-muted transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-[14px] font-medium transition-colors ${
                      isActive(link.href) ? 'text-fg bg-surface-muted' : 'text-fg-secondary hover:text-fg hover:bg-surface-muted'
                    }`}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <div className="hidden md:block">
              <ConnectWalletButton />
            </div>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-full text-fg hover:bg-surface-muted transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile sheet */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <div
          className={`absolute inset-x-3 top-16 rounded-3xl bg-elevated shadow-lg border border-line p-2 transition-transform duration-200 ease-apple ${
            open ? 'translate-y-0' : '-translate-y-2'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <ul className="flex flex-col">
            {LINKS.map((link) => (
              <li key={link.href}>
                {'external' in link && link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-3 rounded-2xl text-[17px] font-medium text-fg hover:bg-surface-muted"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className={`block px-4 py-3 rounded-2xl text-[17px] font-medium ${
                      isActive(link.href) ? 'bg-surface-muted text-fg' : 'text-fg hover:bg-surface-muted'
                    }`}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <div className="p-2 pt-3 border-t border-line mt-1">
            <ConnectWalletButton block size="md" />
          </div>
        </div>
      </div>
    </>
  )
}
