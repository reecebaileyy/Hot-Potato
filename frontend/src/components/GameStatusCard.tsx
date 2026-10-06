import React from 'react'
import Image from 'next/image'
import type { Address } from 'viem'
import hot from '../../public/assets/images/hot.png'
import ConnectWalletButton from './ConnectWalletButton'
import MintPanel from './MintPanel'
import { GameState, formatEth, gameStateLabel, winnerPrize } from '../lib/game'
import { formatAddress } from '../utils/formatAddress'
import type { GameInfo } from '../hooks/useGame'
import type { PlayerData } from '../hooks/usePlayer'

interface GameStatusCardProps {
  darkMode: boolean
  info: GameInfo | undefined
  address: Address | undefined
  player: PlayerData
  winner: Address | undefined
  isWinner: boolean
  busy: boolean
  onMint: (quantity: number) => void
}

function Card({ darkMode, children }: { darkMode: boolean; children: React.ReactNode }) {
  return (
    <div className={`w-full max-w-2xl mx-auto ${darkMode ? 'card-dark' : 'card'} p-4 sm:p-6 lg:p-8 mb-8 animate-fade-in-up`}>
      <div className="text-center space-y-6">{children}</div>
    </div>
  )
}

/** What's happening in the round right now, with the mint form while minting is open. */
export default function GameStatusCard({
  darkMode,
  info,
  address,
  player,
  winner,
  isWinner,
  busy,
  onMint,
}: GameStatusCardProps) {
  const muted = darkMode ? 'text-gray-300' : 'text-gray-600'

  if (!info) {
    return (
      <Card darkMode={darkMode}>
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-amber-500" />
        </div>
      </Card>
    )
  }

  switch (info.state) {
    case GameState.Minting:
      if (!address) {
        return (
          <Card darkMode={darkMode}>
            <h1 className="text-5xl font-bold gradient-text">Minting Is Open</h1>
            <p className={`text-xl ${muted}`}>Connect your wallet to mint hands for round {info.round.toString()}.</p>
            <div className="animate-float">
              <Image alt="Hot Potato" src={hot} width={160} height={160} className="mx-auto drop-shadow-lg" />
            </div>
            <ConnectWalletButton className="justify-center" />
          </Card>
        )
      }
      return <MintPanel darkMode={darkMode} info={info} player={player} busy={busy} onMint={onMint} />

    case GameState.Paused:
      return (
        <Card darkMode={darkMode}>
          <h1 className="text-5xl font-bold gradient-text">⏸️ Game Paused</h1>
          <p className={`text-xl ${muted}`}>The game is paused. Hang tight until it resumes.</p>
        </Card>
      )

    case GameState.Queued:
      return (
        <Card darkMode={darkMode}>
          <h1 className="text-5xl font-bold gradient-text">⏳ Next Round Soon</h1>
          <p className={`text-xl ${muted}`}>
            Waiting for round {(info.round + 1n).toString()} to open for minting. Every hand you own plays in every round.
          </p>
          <div className="animate-bounce-slow">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-amber-500 to-red-500" />
          </div>
        </Card>
      )

    case GameState.Ended:
      return (
        <Card darkMode={darkMode}>
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <h1 className={`text-4xl font-bold ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
            Round {info.round.toString()} Is Over!
          </h1>
          <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`} title={winner}>
            {winner ? `Winner: ${formatAddress(winner)}` : 'No winner this round'}
          </div>
          {winner && (
            <p className={`text-lg ${muted}`}>
              Prize: {formatEth(winnerPrize(info.pot))} ETH of a {formatEth(info.pot)} ETH pot
            </p>
          )}
          {isWinner && (
            <div className={`inline-block px-6 py-3 rounded-lg ${darkMode ? 'bg-green-700' : 'bg-green-500'} text-white font-bold text-xl shadow-lg`}>
              🎉 Congratulations! You Won! 🎉
            </div>
          )}
          <p className={`text-lg ${darkMode ? 'text-amber-200' : 'text-amber-700'}`}>
            {isWinner ? 'Claim your prize from the Rewards panel.' : 'Your hands are back in for the next round.'}
          </p>
        </Card>
      )

    case GameState.Playing:
    case GameState.FinalRound:
      // The pass form and timer cover live play.
      return null

    default:
      return (
        <Card darkMode={darkMode}>
          <h1 className="text-5xl font-bold gradient-text">{gameStateLabel(info.state)}</h1>
        </Card>
      )
  }
}
