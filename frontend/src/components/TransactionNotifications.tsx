import React from 'react'

interface ErrorDisplayProps {
  error: string | Error | null
  onClose?: () => void
  darkMode?: boolean
}

// Parse and humanize error messages
function parseErrorMessage(error: string | Error): { title: string; message: string; suggestion?: string; emoji: string } {
  const errorText = typeof error === 'string' ? error : error.message || 'An unknown error occurred'
  const lowerError = errorText.toLowerCase()

  // User rejected transaction
  if (lowerError.includes('user rejected') || lowerError.includes('user denied')) {
    return {
      emoji: '✋',
      title: 'Transaction Cancelled',
      message: 'You cancelled the transaction.',
      suggestion: 'No worries! Try again when you\'re ready.'
    }
  }

  // Insufficient funds
  if (lowerError.includes('insufficient funds') || lowerError.includes('insufficient balance')) {
    return {
      emoji: '💰',
      title: 'Insufficient Funds',
      message: 'You don\'t have enough ETH to complete this transaction.',
      suggestion: 'Add more ETH to your wallet and try again.'
    }
  }

  // Gas estimation failed
  if (lowerError.includes('gas') && (lowerError.includes('estimate') || lowerError.includes('failed'))) {
    return {
      emoji: '⛽',
      title: 'Transaction Would Fail',
      message: 'This transaction cannot be completed right now.',
      suggestion: 'The contract conditions may not be met. Check game state or token ownership.'
    }
  }

  // Network errors
  if (lowerError.includes('network') || lowerError.includes('connection')) {
    return {
      emoji: '🌐',
      title: 'Network Issue',
      message: 'Unable to connect to the blockchain.',
      suggestion: 'Check your internet connection and try again.'
    }
  }

  // Contract reverted
  if (lowerError.includes('revert') || lowerError.includes('reverted')) {
    return {
      emoji: '⚠️',
      title: 'Transaction Rejected',
      message: 'The contract rejected this transaction.',
      suggestion: 'You may not meet the requirements. Check if you own the token or have the potato.'
    }
  }

  // Wallet not connected
  if (lowerError.includes('wallet') || lowerError.includes('connect')) {
    return {
      emoji: '👛',
      title: 'Wallet Not Connected',
      message: 'Please connect your wallet to continue.',
      suggestion: 'Click the "Connect Wallet" button to get started.'
    }
  }

  // Transaction timeout
  if (lowerError.includes('timeout') || lowerError.includes('timed out')) {
    return {
      emoji: '⏱️',
      title: 'Transaction Timeout',
      message: 'The transaction took too long to process.',
      suggestion: 'Please try again. The network may be congested.'
    }
  }

  // Nonce too high/low
  if (lowerError.includes('nonce')) {
    return {
      emoji: '🔢',
      title: 'Transaction Order Issue',
      message: 'There was an issue with the transaction sequence.',
      suggestion: 'Try refreshing the page and submitting again.'
    }
  }

  // Slippage/price changed
  if (lowerError.includes('slippage') || lowerError.includes('price')) {
    return {
      emoji: '💱',
      title: 'Price Changed',
      message: 'The transaction price changed before it could be processed.',
      suggestion: 'Try the transaction again with updated values.'
    }
  }

  // Already minted/claimed
  if (lowerError.includes('already') && (lowerError.includes('mint') || lowerError.includes('claim'))) {
    return {
      emoji: '✨',
      title: 'Already Completed',
      message: 'This action has already been completed.',
      suggestion: 'Check your wallet to see your tokens or rewards.'
    }
  }

  // Token doesn't exist or not active
  if (lowerError.includes('does not exist') || lowerError.includes('invalid token')) {
    return {
      emoji: '🔍',
      title: 'Token Not Found',
      message: 'The token ID you entered doesn\'t exist.',
      suggestion: 'Double-check the token ID and try again.'
    }
  }

  // Token not active
  if (lowerError.includes('not active') || lowerError.includes('token inactive')) {
    return {
      emoji: '💤',
      title: 'Token Not Active',
      message: 'This token is not currently active in the game.',
      suggestion: 'The token may have been eliminated. Try passing to a different token.'
    }
  }

  // Not token owner
  if (lowerError.includes('not owner') || lowerError.includes('not the owner')) {
    return {
      emoji: '🚫',
      title: 'Not Token Owner',
      message: 'You don\'t own this token.',
      suggestion: 'You can only perform actions on tokens you own.'
    }
  }

  // Game state errors
  if (lowerError.includes('game') && (lowerError.includes('not started') || lowerError.includes('ended'))) {
    return {
      emoji: '🎮',
      title: 'Game State Issue',
      message: 'This action cannot be performed in the current game state.',
      suggestion: 'Wait for the game to start or check if minting has ended.'
    }
  }

  // Default friendly error
  return {
    emoji: '❌',
    title: 'Something Went Wrong',
    message: 'We encountered an unexpected issue.',
    suggestion: 'Please try again in a moment.'
  }
}

export default function ErrorDisplay({ error, onClose, darkMode = false }: ErrorDisplayProps) {
  if (!error) return null

  const { emoji, title, message, suggestion } = parseErrorMessage(error)

  return (
    <div className={`fixed top-20 sm:top-4 left-4 right-4 sm:right-4 sm:left-auto z-50 max-w-md ${darkMode ? 'bg-red-900/95 border-red-700' : 'bg-red-50 border-red-300'} border-2 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-slide-in-right`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 text-2xl">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-bold ${darkMode ? 'text-red-100' : 'text-red-900'}`}>
            {title}
          </h3>
          <p className={`text-sm mt-1 ${darkMode ? 'text-red-200' : 'text-red-800'}`}>
            {message}
          </p>
          {suggestion && (
            <p className={`text-xs mt-2 ${darkMode ? 'text-red-300' : 'text-red-600'} italic`}>
              💡 {suggestion}
            </p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${darkMode ? 'text-red-300 hover:text-red-100' : 'text-red-700 hover:text-red-900'} transition-colors p-1 rounded-lg hover:bg-red-200/20`}
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
  onClose?: () => void
  darkMode?: boolean
}

export function SuccessDisplay({ message, onClose, darkMode = false }: SuccessDisplayProps) {
  // Don't show if there's no message
  if (!message) return null

  return (
    <div className={`fixed top-20 sm:top-4 left-4 right-4 sm:right-4 sm:left-auto z-50 max-w-md ${darkMode ? 'bg-green-900/95 border-green-700' : 'bg-green-50 border-green-300'} border-2 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-slide-in-right`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 text-2xl">
          ✅
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-bold ${darkMode ? 'text-green-100' : 'text-green-900'}`}>
            Success!
          </h3>
          <p className={`text-sm mt-1 ${darkMode ? 'text-green-200' : 'text-green-800'}`}>
            {message}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${darkMode ? 'text-green-300 hover:text-green-100' : 'text-green-700 hover:text-green-900'} transition-colors p-1 rounded-lg hover:bg-green-200/20`}
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
    <div className={`fixed top-20 sm:top-4 left-4 right-4 sm:right-4 sm:left-auto z-50 max-w-md ${darkMode ? 'bg-blue-900/95 border-blue-700' : 'bg-blue-50 border-blue-300'} border-2 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-slide-in-right`}>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className={`animate-spin rounded-full h-6 w-6 border-2 border-transparent ${darkMode ? 'border-t-blue-400 border-r-blue-400' : 'border-t-blue-600 border-r-blue-600'}`}></div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-bold ${darkMode ? 'text-blue-100' : 'text-blue-900'}`}>
            Processing...
          </h3>
          <p className={`text-sm mt-1 ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
            {message}
          </p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-blue-300' : 'text-blue-600'} italic`}>
            ⏳ This may take a few moments
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${darkMode ? 'text-blue-300 hover:text-blue-100' : 'text-blue-700 hover:text-blue-900'} transition-colors p-1 rounded-lg hover:bg-blue-200/20`}
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
