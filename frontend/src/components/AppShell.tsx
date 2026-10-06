import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Navigation, { Wordmark } from './Navigation'
import { chain } from '../config/chain'

interface AppShellProps {
  title: string
  description?: string
  /** `narrow` for reading pages, `wide` for the play dashboard. */
  width?: 'narrow' | 'wide' | 'full'
  /** Extra bottom padding when a fixed action bar is shown on mobile. */
  bottomBar?: boolean
  footer?: boolean
  children: React.ReactNode
}

const widths = {
  narrow: 'max-w-3xl',
  wide: 'max-w-page',
  full: 'max-w-none',
}

/** Page frame: head tags, the fixed nav, a centered main column and the footer. */
export default function AppShell({
  title,
  description = 'Hot Potato, the onchain game of pass-or-explode on Robinhood Chain.',
  width = 'wide',
  bottomBar = false,
  footer = true,
  children,
}: AppShellProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navigation />
      <main className={`mx-auto w-full ${widths[width]} px-4 sm:px-6 pt-14 ${bottomBar ? 'pb-40' : 'pb-16'}`}>
        {children}
      </main>
      {footer && <Footer />}
    </>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-page px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <Wordmark />
          <p className="text-[13px] text-fg-tertiary">Onchain on {chain.name}. Every move, every payout, on chain.</p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-fg-secondary">
          <li><Link href="/play" className="hover:text-fg transition-colors">Play</Link></li>
          <li><Link href="/leaderboard" className="hover:text-fg transition-colors">Leaderboard</Link></li>
          <li>
            <a href="https://0xhotpotato.gitbook.io/onchain-hot-potato/" target="_blank" rel="noopener noreferrer" className="hover:text-fg transition-colors">
              Docs
            </a>
          </li>
          <li>
            <a href="https://docs.robinhood.com/chain/" target="_blank" rel="noopener noreferrer" className="hover:text-fg transition-colors">
              Robinhood Chain
            </a>
          </li>
        </ul>
      </div>
    </footer>
  )
}
