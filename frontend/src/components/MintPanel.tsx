import React, { useState } from 'react'
import { formatEth } from '../lib/game'
import type { GameInfo } from '../hooks/useGame'
import type { PlayerData } from '../hooks/usePlayer'

interface MintPanelProps {
  darkMode: boolean
  info: GameInfo
  player: PlayerData
  busy: boolean
  onMint: (quantity: number) => void
}

export default function MintPanel({ darkMode, info, player, busy, onMint }: MintPanelProps) {
  const [amount, setAmount] = useState('1')
  const quantity = Number(amount)
  const validQuantity = Number.isInteger(quantity) && quantity > 0
  const total = validQuantity ? info.mintPrice * BigInt(quantity) : 0n

  const walletLeft = info.maxPerWallet > 0n ? info.maxPerWallet - player.mintedThisRound : null
  const roundLeft = info.maxPerRound > 0n ? info.maxPerRound - info.mintedThisRound : null
  const tile = `${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-lg`

  return (
    <div className={`w-full max-w-2xl mx-auto ${darkMode ? 'card-dark' : 'card'} p-4 sm:p-6 lg:p-8 mb-8 animate-fade-in-up`}>
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold gradient-text mb-2">Mint Hands</h1>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Round {info.round.toString()} pot: {formatEth(info.pot)} ETH. The last player standing takes 40%.
        </p>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            onMint(quantity)
          }}
        >
          <input
            type="number"
            min={1}
            step={1}
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`w-full px-6 py-4 rounded-xl border-2 text-lg focus-ring ${
              darkMode
                ? 'bg-gray-800 text-white border-gray-600 focus:border-amber-500'
                : 'bg-white text-gray-900 border-gray-300 focus:border-amber-500'
            }`}
          />
          <button
            type="submit"
            className={`btn-primary text-lg px-8 py-4 w-full ${busy || !validQuantity ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={busy || !validQuantity}
          >
            {busy ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Working...</span>
              </div>
            ) : (
              `Mint ${validQuantity ? quantity : 0} Hand${quantity === 1 ? '' : 's'}`
            )}
          </button>
        </form>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <div className={tile}>
            <p className="font-semibold text-amber-500">Price per Hand</p>
            <p className="text-lg">{formatEth(info.mintPrice, 6)} ETH</p>
          </div>
          <div className={tile}>
            <p className="font-semibold text-red-500">Total Cost</p>
            <p className="text-lg">{formatEth(total, 6)} ETH</p>
          </div>
          <div className={tile}>
            <p className="font-semibold text-green-500">Your Balance</p>
            <p className="text-lg">{formatEth(player.balance)} ETH</p>
          </div>
        </div>

        {(walletLeft !== null || roundLeft !== null) && (
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {walletLeft !== null && `You can mint ${walletLeft > 0n ? walletLeft.toString() : 'no'} more this round. `}
            {roundLeft !== null && `${roundLeft.toString()} hands left in this round.`}
          </p>
        )}
      </div>
    </div>
  )
}
