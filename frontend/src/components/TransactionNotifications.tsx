import React, { useEffect } from 'react'
import { Badge, Card } from './ui'
import { explorerTxUrl } from '../config/chain'
import type { TxState } from '../hooks/useTransaction'

const SUCCESS_HIDE_MS = 6_000
const ERROR_HIDE_MS = 10_000

type Tone = 'neutral' | 'accent' | 'success' | 'danger' | 'warning'

interface ToastView {
  tone: Tone
  badge: string
  live: boolean
  glyph?: string
  title: string
  message: string
  suggestion?: string
  txUrl?: string
  closable: boolean
}

function describe(tx: TxState): ToastView | null {
  switch (tx.status) {
    case 'pending':
      return {
        tone: 'accent',
        badge: 'Confirm in wallet',
        live: true,
        title: tx.label,
        message: `Confirm ${tx.label} in your wallet. This may take a few moments.`,
        closable: false,
      }
    case 'confirming':
      return {
        tone: 'accent',
        badge: 'Confirming',
        live: true,
        title: tx.label,
        message: `Waiting for ${tx.label} to confirm on chain.`,
        txUrl: explorerTxUrl(tx.hash),
        closable: false,
      }
    case 'success':
      return {
        tone: 'success',
        badge: 'Confirmed',
        live: false,
        title: `${tx.label} confirmed`,
        message: 'Your transaction went through.',
        txUrl: explorerTxUrl(tx.hash),
        closable: true,
      }
    case 'error':
      return {
        tone: 'danger',
        badge: 'Failed',
        live: false,
        glyph: tx.error.emoji,
        title: tx.error.title,
        message: tx.error.message,
        suggestion: tx.error.suggestion,
        closable: true,
      }
    default:
      return null
  }
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

interface TransactionNotificationsProps {
  tx: TxState
  onClose: () => void
  /** Lift the toast above the fixed mobile action bar. */
  raised?: boolean
}

/** One toast for the current transaction: progress, success (with explorer link) or a friendly error. */
export default function TransactionNotifications({ tx, onClose, raised = false }: TransactionNotificationsProps) {
  useEffect(() => {
    if (tx.status !== 'success' && tx.status !== 'error') return
    const id = setTimeout(onClose, tx.status === 'success' ? SUCCESS_HIDE_MS : ERROR_HIDE_MS)
    return () => clearTimeout(id)
  }, [tx, onClose])

  const view = describe(tx)
  if (!view) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-x-4 z-50 animate-fade-up lg:inset-x-auto lg:right-6 lg:bottom-6 lg:w-[380px] ${
        raised ? 'bottom-32' : 'bottom-4'
      }`}
    >
      <Card variant="plain" className="p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <Badge tone={view.tone} dot={view.live} pulse={view.live}>
              {view.badge}
            </Badge>
            <p className="mt-2 flex items-start gap-1.5 text-[15px] leading-6 font-semibold">
              {view.glyph && (
                <span aria-hidden="true" className="shrink-0">
                  {view.glyph}
                </span>
              )}
              <span className="min-w-0 break-words">{view.title}</span>
            </p>
            <p className="mt-0.5 break-words text-[13px] leading-5 text-fg-secondary">{view.message}</p>
            {view.suggestion && <p className="mt-1 text-[13px] leading-5 text-fg-tertiary">{view.suggestion}</p>}
            {view.txUrl && (
              <a
                href={view.txUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-[13px] leading-5 font-medium text-accent hover:underline"
              >
                View on explorer
              </a>
            )}
          </div>
          {view.closable && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Dismiss notification"
              className="-mr-1 -mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-fg-secondary transition-colors duration-200 ease-apple hover:bg-surface-muted hover:text-fg"
            >
              <CloseIcon />
            </button>
          )}
        </div>
      </Card>
    </div>
  )
}
