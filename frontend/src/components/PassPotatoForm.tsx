import React from 'react'

interface PassPotatoFormProps {
  darkMode: boolean
  tokenId: string
  setTokenId: (tokenId: string) => void
  passPending: boolean
  onPassPotato: () => void
  hasPotato: boolean
  isMobileFixed?: boolean
}

export default function PassPotatoForm({ 
  darkMode, 
  tokenId, 
  setTokenId, 
  passPending, 
  onPassPotato,
  hasPotato,
  isMobileFixed = false
}: PassPotatoFormProps) {
  return (
    <div className={`w-full ${isMobileFixed ? 'max-w-full' : 'max-w-2xl'} mx-auto ${isMobileFixed ? '' : darkMode ? 'card-dark' : 'card'} ${isMobileFixed ? 'p-0' : 'p-4 sm:p-6 lg:p-8'} ${isMobileFixed ? '' : 'mb-4 sm:mb-8 lg:mb-8'} ${isMobileFixed ? '' : 'animate-fade-in-up'}`}>
      <h2 className={`${isMobileFixed ? 'text-lg' : 'text-xl sm:text-2xl lg:text-3xl'} font-bold text-center ${isMobileFixed ? 'mb-2' : 'mb-3 sm:mb-4 lg:mb-6'} gradient-text glow`}>Pass the Potato</h2>
      
      {/* Potato Status Indicator */}
      <div className={`text-center ${isMobileFixed ? 'mb-2' : 'mb-3 sm:mb-4 lg:mb-6'} ${isMobileFixed ? 'p-2' : 'p-2 sm:p-3 lg:p-4'} rounded-xl ${hasPotato 
        ? `${darkMode ? 'bg-gradient-to-r from-amber-900/30 to-red-900/30 border-2 border-amber-500/50' : 'bg-gradient-to-r from-amber-100 to-red-100 border-2 border-amber-400'} animate-pulse` 
        : `${darkMode ? 'bg-gray-800 border-2 border-gray-600' : 'bg-gray-100 border-2 border-gray-300'}`}`}>
        <div className="flex items-center justify-center space-x-2">
          <span className={`${isMobileFixed ? 'text-base' : 'text-lg sm:text-xl lg:text-2xl'}`}>🥔</span>
          <span className={`${isMobileFixed ? 'text-xs' : 'text-sm sm:text-base lg:text-lg'} font-bold ${hasPotato 
            ? `${darkMode ? 'text-amber-300' : 'text-amber-700'}` 
            : `${darkMode ? 'text-gray-400' : 'text-gray-600'}`}`}>
            {hasPotato ? '🔥 YOU HAVE THE HOT POTATO! 🔥' : 'You don\'t have the potato'}
          </span>
          <span className={`${isMobileFixed ? 'text-base' : 'text-lg sm:text-xl lg:text-2xl'}`}>🥔</span>
        </div>
        {hasPotato && !isMobileFixed && (
          <p className={`text-xs sm:text-sm mt-1 sm:mt-2 ${darkMode ? 'text-amber-200' : 'text-amber-600'}`}>
            Pass it quickly before it explodes!
          </p>
        )}
      </div>
      
      <div className={`${isMobileFixed ? 'space-y-2' : 'space-y-3 sm:space-y-4 lg:space-y-6'}`}>
        {!isMobileFixed && (
          <p className={`text-center text-sm sm:text-base lg:text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {hasPotato 
              ? 'Enter the Token ID you want to pass the potato to' 
              : 'You need to have the potato to pass it'}
          </p>
        )}
        
        <div className={`${isMobileFixed ? 'flex gap-2' : 'space-y-2 sm:space-y-3 lg:space-y-4'}`}>
          <input
            type="number"
            placeholder="Token ID to pass to"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            disabled={!hasPotato}
            className={`${isMobileFixed ? 'flex-1' : 'w-full'} ${isMobileFixed ? 'px-3 py-2 text-sm' : 'px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg'} rounded-xl border-2 focus-ring ${
              darkMode 
                ? `bg-gray-800 text-white border-gray-600 ${hasPotato ? 'focus:border-amber-500' : 'opacity-50 cursor-not-allowed'}` 
                : `bg-white text-gray-900 border-gray-300 ${hasPotato ? 'focus:border-amber-500' : 'opacity-50 cursor-not-allowed'}`
            }`}
          />
          
          <button
            className={`btn-primary ${isMobileFixed ? 'px-4 py-2 text-sm flex-shrink-0' : 'text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 w-full'} ${!hasPotato || passPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={onPassPotato}
            disabled={!hasPotato || passPending}
          >
            {passPending ? (
              <div className="flex items-center justify-center space-x-2">
                <div className={`animate-spin rounded-full ${isMobileFixed ? 'h-4 w-4' : 'h-5 w-5'} border-2 border-white border-t-transparent`}></div>
                <span className={isMobileFixed ? 'hidden sm:inline' : ''}>Passing...</span>
              </div>
            ) : hasPotato ? (
              isMobileFixed ? 'Pass 🥔' : 'Pass Potato 🥔'
            ) : (
              isMobileFixed ? 'Need Potato' : 'Need Potato to Pass'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
