import React from 'react'

interface PassPotatoFormProps {
  darkMode: boolean
  tokenId: string
  setTokenId: (tokenId: string) => void
  passPending: boolean
  onPassPotato: () => void
}

export default function PassPotatoForm({ 
  darkMode, 
  tokenId, 
  setTokenId, 
  passPending, 
  onPassPotato 
}: PassPotatoFormProps) {
  return (
    <div className={`w-full col-start-1 col-end-9 md:w-2/3 lg:w-1/2 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} shadow rounded-xl p-4`}>
      <h2 className={`text-2xl font-bold text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>Pass Potato</h2>
      <div className="flex flex-col items-center space-y-4">
        <input
          type="number"
          placeholder="Token ID to pass to"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
        />
        <button
          className={`px-6 py-3 rounded-lg font-bold ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800 hover:from-amber-700 hover:to-red-700' : 'bg-gradient-to-b from-yellow-400 to-red-500 hover:from-yellow-300 hover:to-red-400'} text-white`}
          onClick={onPassPotato}
          disabled={passPending}
        >
          {passPending ? 'Passing...' : 'Pass Potato'}
        </button>
      </div>
    </div>
  )
}
