import React, { useState } from 'react'
import { Button, Input } from './ui'
import { formatEth } from '../lib/game'
import type { GameInfo } from '../hooks/useGame'
import type { PlayerData } from '../hooks/usePlayer'

interface MintPanelProps {
  info: GameInfo
  player: PlayerData
  busy: boolean
  onMint: (quantity: number) => void
}

const stepperButton =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-[17px] font-medium text-fg ' +
  'transition-colors duration-200 ease-apple hover:bg-surface-strong disabled:opacity-40 disabled:pointer-events-none'

/** Quantity picker, price breakdown and the mint button, shown in the hero while minting is open. */
export default function MintPanel({ info, player, busy, onMint }: MintPanelProps) {
  const [amount, setAmount] = useState('1')
  const quantity = Number(amount)
  const validQuantity = Number.isInteger(quantity) && quantity > 0
  const total = validQuantity ? info.mintPrice * BigInt(quantity) : 0n

  const walletLeft = info.maxPerWallet > 0n ? info.maxPerWallet - player.mintedThisRound : null
  const roundLeft = info.maxPerRound > 0n ? info.maxPerRound - info.mintedThisRound : null

  const step = (delta: number) => setAmount(String(Math.max(1, (validQuantity ? quantity : 1) + delta)))

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault()
        onMint(quantity)
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="block mb-1.5 text-[13px] font-medium text-fg-secondary">Hands to mint</span>
          <div className="flex items-center gap-2">
            <button type="button" className={stepperButton} onClick={() => step(-1)} disabled={busy || quantity <= 1} aria-label="Fewer hands">
              &minus;
            </button>
            <div className="w-20">
              <Input
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                aria-label="Number of hands"
                className="text-center"
              />
            </div>
            <button type="button" className={stepperButton} onClick={() => step(1)} disabled={busy} aria-label="More hands">
              +
            </button>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[12px] leading-4 font-medium uppercase tracking-wide text-fg-secondary">Total</div>
          <div className="mt-1 text-[22px] leading-7 font-semibold tracking-tight tnum">{formatEth(total, 6)} ETH</div>
        </div>
      </div>

      <Button type="submit" size="lg" block disabled={busy || !validQuantity}>
        Mint {validQuantity ? quantity : 0} hand{quantity === 1 ? '' : 's'}
      </Button>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px] leading-5 sm:grid-cols-3">
        <div>
          <dt className="text-fg-secondary">Price per hand</dt>
          <dd className="font-medium tnum">{formatEth(info.mintPrice, 6)} ETH</dd>
        </div>
        <div>
          <dt className="text-fg-secondary">Your balance</dt>
          <dd className="font-medium tnum">{formatEth(player.balance)} ETH</dd>
        </div>
        <div>
          <dt className="text-fg-secondary">Minted this round</dt>
          <dd className="font-medium tnum">
            {info.mintedThisRound.toString()}
            {roundLeft !== null && <span className="text-fg-secondary"> of {info.maxPerRound.toString()}</span>}
          </dd>
        </div>
      </dl>

      {(walletLeft !== null || roundLeft !== null) && (
        <p className="text-[13px] leading-5 text-fg-secondary">
          {walletLeft !== null && `You can mint ${walletLeft > 0n ? walletLeft.toString() : 'no'} more this round. `}
          {roundLeft !== null && `${roundLeft.toString()} hands left in this round.`}
        </p>
      )}
    </form>
  )
}
