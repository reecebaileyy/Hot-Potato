import React from 'react'

interface ErrorDisplayProps {
  error: string | Error | null
  onClose?: () => void
  darkMode?: boolean
}

export default function ErrorDisplay({ error, onClose, darkMode = false }: ErrorDisplayProps) {
  if (!error) return null

  const errorMessage = typeof error === 'string' ? error : error.message || 'An unknown error occurred'

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md ${darkMode ? 'bg-red-900/90 border-red-700' : 'bg-red-50 border-red-200'} border-2 rounded-xl p-4 shadow-lg backdrop-blur-sm animate-slide-in-right`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className={`w-6 h-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-red-200' : 'text-red-800'}`}>
            Transaction Error
          </h3>
          <p className={`text-sm mt-1 ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
            {errorMessage}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'} transition-colors`}
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
  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md ${darkMode ? 'bg-green-900/90 border-green-700' : 'bg-green-50 border-green-200'} border-2 rounded-xl p-4 shadow-lg backdrop-blur-sm animate-slide-in-right`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-green-200' : 'text-green-800'}`}>
            Success!
          </h3>
          <p className={`text-sm mt-1 ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
            {message}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'} transition-colors`}
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
}

export function LoadingDisplay({ message, darkMode = false }: LoadingDisplayProps) {
  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md ${darkMode ? 'bg-blue-900/90 border-blue-700' : 'bg-blue-50 border-blue-200'} border-2 rounded-xl p-4 shadow-lg backdrop-blur-sm animate-slide-in-right`}>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className={`animate-spin rounded-full h-6 w-6 border-2 border-transparent ${darkMode ? 'border-t-blue-400' : 'border-t-blue-600'}`}></div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
            Processing...
          </h3>
          <p className={`text-sm mt-1 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  )
}
