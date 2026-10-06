import React, { useState } from 'react'

interface PassPotatoFormProps {
  darkMode: boolean
  hasPotato: boolean
  /** Seconds left on the fuse, or null if unknown. */
  countdown: number | null
  busy: boolean
  onPassPotato: (toTokenId: number) => void
  isMobileFixed?: boolean
}

export default function PassPotatoForm({
  darkMode,
  hasPotato,
  countdown,
  busy,
  onPassPotato,
  isMobileFixed = false,
}: PassPotatoFormProps) {
  const [tokenId, setTokenId] = useState('')
  const fuseOut = hasPotato && countdown === 0

  return (
    <div className={`w-full ${isMobileFixed ? 'max-w-full p-0' : `max-w-2xl ${darkMode ? 'card-dark' : 'card'} p-4 sm:p-6 lg:p-8 mb-4 sm:mb-8 animate-fade-in-up`} mx-auto`}>
      <h2 className={`${isMobileFixed ? 'text-lg mb-2' : 'text-xl sm:text-2xl lg:text-3xl mb-3 sm:mb-4 lg:mb-6'} font-bold text-center gradient-text glow`}>
        Pass the Potato
      </h2>

      <div
        className={`text-center ${isMobileFixed ? 'mb-2 p-2' : 'mb-3 sm:mb-4 lg:mb-6 p-2 sm:p-3 lg:p-4'} rounded-xl ${
          hasPotato
            ? `${darkMode ? 'bg-gradient-to-r from-amber-900/30 to-red-900/30 border-2 border-amber-500/50' : 'bg-gradient-to-r from-amber-100 to-red-100 border-2 border-amber-400'} animate-pulse`
            : `${darkMode ? 'bg-gray-800 border-2 border-gray-600' : 'bg-gray-100 border-2 border-gray-300'}`
        }`}
      >
        <div className="flex items-center justify-center space-x-2">
          <span className={isMobileFixed ? 'text-base' : 'text-lg sm:text-xl lg:text-2xl'}>🥔</span>
          <span
            className={`${isMobileFixed ? 'text-xs' : 'text-sm sm:text-base lg:text-lg'} font-bold ${
              hasPotato ? (darkMode ? 'text-amber-300' : 'text-amber-700') : darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {hasPotato ? '🔥 YOU HAVE THE HOT POTATO! 🔥' : "You don't have the potato"}
          </span>
          <span className={isMobileFixed ? 'text-base' : 'text-lg sm:text-xl lg:text-2xl'}>🥔</span>
        </div>
        {hasPotato && !isMobileFixed && (
          <p className={`text-xs sm:text-sm mt-1 sm:mt-2 ${darkMode ? 'text-amber-200' : 'text-amber-600'}`}>
            {fuseOut
              ? 'The fuse has run out: passing now explodes the potato in your hands.'
              : 'Pass it to someone else before it explodes!'}
          </p>
        )}
      </div>

      <form
        className={isMobileFixed ? 'flex gap-2' : 'space-y-2 sm:space-y-3 lg:space-y-4'}
        onSubmit={(e) => {
          e.preventDefault()
          onPassPotato(Number(tokenId))
        }}
      >
        <input
          type="number"
          min={1}
          placeholder="Hand # to pass to"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          disabled={!hasPotato}
          className={`${isMobileFixed ? 'flex-1 px-3 py-2 text-sm' : 'w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg'} rounded-xl border-2 focus-ring ${
            darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
          } ${hasPotato ? 'focus:border-amber-500' : 'opacity-50 cursor-not-allowed'}`}
        />
        <button
          type="submit"
          className={`btn-primary ${isMobileFixed ? 'px-4 py-2 text-sm flex-shrink-0' : 'text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 w-full'} ${!hasPotato || busy ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!hasPotato || busy}
        >
          {busy ? (
            <div className="flex items-center justify-center space-x-2">
              <div className={`animate-spin rounded-full ${isMobileFixed ? 'h-4 w-4' : 'h-5 w-5'} border-2 border-white border-t-transparent`} />
              <span className={isMobileFixed ? 'hidden sm:inline' : ''}>Working...</span>
            </div>
          ) : hasPotato ? (
            isMobileFixed ? 'Pass 🥔' : 'Pass Potato 🥔'
          ) : isMobileFixed ? (
            'Need Potato'
          ) : (
            'Need Potato to Pass'
          )}
        </button>
      </form>
    </div>
  )
}
