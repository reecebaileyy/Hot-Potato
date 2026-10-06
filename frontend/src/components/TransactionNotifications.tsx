import React, { useEffect } from 'react'
import { explorerTxUrl } from '../config/chain'
import type { FriendlyError } from '../lib/errors'
import type { TxState } from '../hooks/useTransaction'

interface ErrorDisplayProps {
  error: FriendlyError | null
  onClose?: () => void
  darkMode?: boolean
}

export function ErrorDisplay({ error, onClose, darkMode = false }: ErrorDisplayProps) {
  if (!error) return null

  const { emoji, title, message, suggestion } = error

  return (
    <div className={`fixed top-20 sm:top-4 left-4 right-4 sm:right-4 sm:left-auto z-50 max-w-md ${darkMode ? 'bg-gradient-to-br from-red-900/95 to-red-800/95 border-red-600' : 'bg-gradient-to-br from-red-50 to-red-100 border-red-400'} border-2 rounded-2xl p-5 shadow-2xl backdrop-blur-md animate-slide-in-right`}>
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 text-3xl sm:text-4xl ${darkMode ? 'drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]' : 'drop-shadow-[0_2px_4px_rgba(220,38,38,0.3)]'}`}>
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-bold ${darkMode ? 'text-red-50' : 'text-red-900'} mb-1`}>
            {title}
          </h3>
          <p className={`text-sm ${darkMode ? 'text-red-100' : 'text-red-800'} leading-relaxed`}>
            {message}
          </p>
          {suggestion && (
            <div className={`mt-3 pt-2 border-t ${darkMode ? 'border-red-700/50' : 'border-red-300/50'}`}>
              <p className={`text-xs ${darkMode ? 'text-red-200' : 'text-red-700'} flex items-start gap-1.5`}>
                <span className="text-base">💡</span>
                <span className="flex-1">{suggestion}</span>
              </p>
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${darkMode ? 'text-red-200 hover:text-red-50 hover:bg-red-800/50' : 'text-red-600 hover:text-red-900 hover:bg-red-200/50'} transition-all duration-200 p-1.5 rounded-lg`}
            aria-label="Close notification"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

interface SuccessDisplayProps {
  message: string
  txUrl?: string
  onClose?: () => void
  darkMode?: boolean
}

export function SuccessDisplay({ message, txUrl, onClose, darkMode = false }: SuccessDisplayProps) {
  // Don't show if there's no message
  if (!message) return null

  return (
    <div className={`fixed top-20 sm:top-4 left-4 right-4 sm:right-4 sm:left-auto z-50 max-w-md ${darkMode ? 'bg-gradient-to-br from-green-900/95 to-green-800/95 border-green-600' : 'bg-gradient-to-br from-green-50 to-green-100 border-green-400'} border-2 rounded-2xl p-5 shadow-2xl backdrop-blur-md animate-slide-in-right`}>
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 text-3xl sm:text-4xl ${darkMode ? 'drop-shadow-[0_0_8px_rgba(134,239,172,0.5)]' : 'drop-shadow-[0_2px_4px_rgba(22,163,74,0.3)]'}`}>
          ✅
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-bold ${darkMode ? 'text-green-50' : 'text-green-900'} mb-1`}>
            Success!
          </h3>
          <p className={`text-sm ${darkMode ? 'text-green-100' : 'text-green-800'} leading-relaxed`}>
            {message}
          </p>
          {txUrl && (
            <a
              href={txUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xs underline ${darkMode ? 'text-green-200' : 'text-green-700'}`}
            >
              View on explorer
            </a>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${darkMode ? 'text-green-200 hover:text-green-50 hover:bg-green-800/50' : 'text-green-600 hover:text-green-900 hover:bg-green-200/50'} transition-all duration-200 p-1.5 rounded-lg`}
            aria-label="Close notification"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

interface LoadingDisplayProps {
  message: string
  darkMode?: boolean
  onClose?: () => void
}

export function LoadingDisplay({ message, darkMode = false, onClose }: LoadingDisplayProps) {
  // Don't show if there's no message
  if (!message) return null

  return (
    <div className={`fixed top-20 sm:top-4 left-4 right-4 sm:right-4 sm:left-auto z-50 max-w-md ${darkMode ? 'bg-gradient-to-br from-blue-900/95 to-blue-800/95 border-blue-600' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-400'} border-2 rounded-2xl p-5 shadow-2xl backdrop-blur-md animate-slide-in-right`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 pt-1">
          <div className={`animate-spin rounded-full h-8 w-8 border-3 border-transparent ${darkMode ? 'border-t-blue-300 border-r-blue-300' : 'border-t-blue-600 border-r-blue-600'} drop-shadow-lg`}></div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-bold ${darkMode ? 'text-blue-50' : 'text-blue-900'} mb-1`}>
            Processing...
          </h3>
          <p className={`text-sm ${darkMode ? 'text-blue-100' : 'text-blue-800'} leading-relaxed`}>
            {message}
          </p>
          <div className={`mt-3 pt-2 border-t ${darkMode ? 'border-blue-700/50' : 'border-blue-300/50'}`}>
            <p className={`text-xs ${darkMode ? 'text-blue-200' : 'text-blue-700'} flex items-center gap-1.5`}>
              <span className="text-base">⏳</span>
              <span>This may take a few moments</span>
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${darkMode ? 'text-blue-200 hover:text-blue-50 hover:bg-blue-800/50' : 'text-blue-600 hover:text-blue-900 hover:bg-blue-200/50'} transition-all duration-200 p-1.5 rounded-lg`}
            aria-label="Close notification"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

const SUCCESS_HIDE_MS = 6_000
const ERROR_HIDE_MS = 10_000

/** Toasts for the current transaction: progress, success (with explorer link) or a friendly error. */
export default function TransactionNotifications({
  tx,
  onClose,
  darkMode = false,
}: {
  tx: TxState
  onClose: () => void
  darkMode?: boolean
}) {
  useEffect(() => {
    if (tx.status !== 'success' && tx.status !== 'error') return
    const id = setTimeout(onClose, tx.status === 'success' ? SUCCESS_HIDE_MS : ERROR_HIDE_MS)
    return () => clearTimeout(id)
  }, [tx, onClose])

  switch (tx.status) {
    case 'pending':
      return <LoadingDisplay message={`Confirm ${tx.label} in your wallet...`} darkMode={darkMode} />
    case 'confirming':
      return <LoadingDisplay message={`Waiting for ${tx.label} to confirm...`} darkMode={darkMode} />
    case 'success':
      return (
        <SuccessDisplay
          message={`${tx.label} confirmed!`}
          txUrl={explorerTxUrl(tx.hash)}
          onClose={onClose}
          darkMode={darkMode}
        />
      )
    case 'error':
      return <ErrorDisplay error={tx.error} onClose={onClose} darkMode={darkMode} />
    default:
      return null
  }
}
