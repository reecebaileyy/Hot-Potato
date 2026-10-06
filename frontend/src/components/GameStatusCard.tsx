import React from 'react'
import type { Address } from 'viem'
import ConnectWalletButton from './ConnectWalletButton'
import MintPanel from './MintPanel'
import PassPotatoForm from './PassPotatoForm'
import Timer from './Timer'
import { Badge, Button, Card, SectionHeader, Skeleton } from './ui'
import { GameState, formatEth, gameStateLabel, isLiveState, winnerPrize } from '../lib/game'
import { formatAddress } from '../utils/formatAddress'
import type { GameInfo } from '../hooks/useGame'
import type { PlayerData } from '../hooks/usePlayer'

interface GameStatusCardProps {
  info: GameInfo | undefined
  address: Address | undefined
  player: PlayerData
  winner: Address | undefined
  isWinner: boolean
  busy: boolean
  countdown: number | null
  explosion: boolean
  passTarget: string
  onPassTargetChange: (value: string) => void
  onMint: (quantity: number) => void
  onPass: (toTokenId: number) => void
  onCheckExplosion: () => void
}

/** The hero surface: a plain card with slightly larger padding than the rest. */
function Hero({ children }: { children: React.ReactNode }) {
  return (
    <Card variant="plain" className="p-6 sm:p-8 animate-fade-up">
      <div className="space-y-6">{children}</div>
    </Card>
  )
}

function Heading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: React.ReactNode }) {
  return (
    <div>
      {eyebrow && (
        <p className="mb-1 text-[12px] leading-4 font-medium uppercase tracking-wide text-fg-secondary">{eyebrow}</p>
      )}
      <h2 className="text-[28px] leading-8 font-semibold tracking-tight sm:text-[34px] sm:leading-10">{title}</h2>
      {description && <p className="mt-2 text-[15px] leading-6 text-fg-secondary">{description}</p>}
    </div>
  )
}

/** Empty state for visitors without a wallet. */
function ConnectPrompt({ sentence }: { sentence: string }) {
  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center">
      <SectionHeader size="md" align="center" title="Connect your wallet" description={sentence} />
      <ConnectWalletButton size="lg" />
    </div>
  )
}

/** Who holds the potato right now. */
function Holder({ info, holdsPotato }: { info: GameInfo; holdsPotato: boolean }) {
  if (info.potatoTokenId === 0n) return null
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[15px] leading-6">
      <span className="text-fg-secondary">Potato on</span>
      <span className="font-semibold tnum">#{info.potatoTokenId.toString()}</span>
      {holdsPotato ? (
        <Badge tone="accent" dot pulse>
          You hold the potato
        </Badge>
      ) : (
        <span className="text-fg-secondary" title={info.potatoHolder}>
          held by <span className="font-medium text-fg tnum">{formatAddress(info.potatoHolder)}</span>
        </span>
      )}
    </div>
  )
}

function HeroSkeleton() {
  return (
    <Hero>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-16 w-48" />
      <Skeleton className="h-1 w-full" />
      <Skeleton className="h-12 w-full rounded-2xl" />
    </Hero>
  )
}

/**
 * State-aware game card: the countdown plus the one action that matters right now
 * (mint, pass, check explosion, claim) or the winner once the round is over.
 */
export default function GameStatusCard({
  info,
  address,
  player,
  winner,
  isWinner,
  busy,
  countdown,
  explosion,
  passTarget,
  onPassTargetChange,
  onMint,
  onPass,
  onCheckExplosion,
}: GameStatusCardProps) {
  if (!info) return <HeroSkeleton />

  const round = info.round.toString()
  const timer = <Timer state={info.state} countdown={countdown} explosionTime={info.explosionTime} explosion={explosion} />

  switch (info.state) {
    case GameState.Minting:
      return (
        <Hero>
          <Heading
            eyebrow={`Round ${round}`}
            title="Mint your hands"
            description={
              <>
                Pot <span className="font-medium text-fg tnum">{formatEth(info.pot)} ETH</span>. Every hand you own
                plays in every round, and the last player standing takes 40%.
              </>
            }
          />
          {timer}
          {address ? (
            <MintPanel info={info} player={player} busy={busy} onMint={onMint} />
          ) : (
            <ConnectPrompt sentence={`Connect your wallet to mint hands for round ${round}.`} />
          )}
        </Hero>
      )

    case GameState.Playing:
    case GameState.FinalRound: {
      const fuseOut = countdown === 0
      return (
        <Hero>
          {info.state === GameState.FinalRound && (
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="danger" dot pulse>
                Final round
              </Badge>
              <span className="text-[13px] leading-5 text-fg-secondary">Two players left. The next explosion decides the winner.</span>
            </div>
          )}
          {countdown === null && !explosion ? <Heading eyebrow={`Round ${round}`} title="Potato in play" /> : timer}
          <Holder info={info} holdsPotato={player.holdsPotato} />

          {!address ? (
            <ConnectPrompt sentence="Connect your wallet to pass the potato when it lands on one of your hands." />
          ) : player.holdsPotato ? (
            <PassPotatoForm
              hasPotato={player.holdsPotato}
              countdown={countdown}
              busy={busy}
              onPassPotato={onPass}
              value={passTarget}
              onChange={onPassTargetChange}
            />
          ) : (
            <p className="text-[15px] leading-6 text-fg-secondary">
              You don&apos;t hold the potato right now. When it lands on one of your hands, pass it on before the fuse
              runs out.
            </p>
          )}

          {fuseOut && (
            <Card variant="inset" className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <p className="flex-1 text-[15px] leading-6 text-fg-secondary">
                The fuse has run out. Anyone can set off the explosion.
              </p>
              <Button variant="secondary" onClick={onCheckExplosion} disabled={busy} className="shrink-0">
                Check explosion
              </Button>
            </Card>
          )}
        </Hero>
      )
    }

    case GameState.Paused:
      return (
        <Hero>
          <Heading eyebrow={`Round ${round}`} title="Game paused" description="The game is paused. Hang tight until it resumes." />
          {timer}
          <Holder info={info} holdsPotato={player.holdsPotato} />
        </Hero>
      )

    case GameState.Queued:
      return (
        <Hero>
          <Heading
            eyebrow={info.round > 0n ? `After round ${round}` : 'Hot Potato'}
            title="Next round soon"
            description={`Waiting for round ${(info.round + 1n).toString()} to open for minting. Every hand you own plays in every round.`}
          />
          {timer}
          {!address && <ConnectPrompt sentence="Connect your wallet so you are ready when minting opens." />}
        </Hero>
      )

    case GameState.Ended:
      return (
        <Hero>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <Heading
              eyebrow={`Round ${round} is over`}
              title={winner ? (isWinner ? 'You won' : 'We have a winner') : 'No winner this round'}
            />
            {isWinner && (
              <Badge tone="success" dot>
                Winner
              </Badge>
            )}
          </div>
          {timer}
          {winner && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Card variant="inset">
                <div className="text-[12px] leading-4 font-medium uppercase tracking-wide text-fg-secondary">Winner</div>
                <div className="mt-1 text-[22px] leading-7 font-semibold tracking-tight tnum">{formatAddress(winner)}</div>
                <div className="mt-1 break-all text-[13px] leading-5 text-fg-secondary">{winner}</div>
              </Card>
              <Card variant="inset">
                <div className="text-[12px] leading-4 font-medium uppercase tracking-wide text-fg-secondary">Prize</div>
                <div className={`mt-1 text-[22px] leading-7 font-semibold tracking-tight tnum ${isWinner ? 'text-success' : ''}`}>
                  {formatEth(winnerPrize(info.pot))} ETH
                </div>
                <div className="mt-1 text-[13px] leading-5 text-fg-secondary">of a {formatEth(info.pot)} ETH pot</div>
              </Card>
            </div>
          )}
          <p className="text-[15px] leading-6 text-fg-secondary">
            {isWinner ? 'Claim your prize from the Rewards panel.' : 'Your hands are back in for the next round.'}
          </p>
        </Hero>
      )

    default:
      return (
        <Hero>
          <Heading eyebrow={`Round ${round}`} title={gameStateLabel(info.state)} />
          {timer}
          {isLiveState(info.state) && <Holder info={info} holdsPotato={player.holdsPotato} />}
        </Hero>
      )
  }
}
