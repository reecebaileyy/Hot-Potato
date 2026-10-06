import React, { useCallback, useState } from 'react'
import { isAddressEqual } from 'viem'
import AppShell from '../components/AppShell'
import StatusBanners from '../components/StatusBanners'
import RoundSummary from '../components/RoundSummary'
import GameStatusCard from '../components/GameStatusCard'
import TokenGrid from '../components/TokenGrid'
import AdminControls from '../components/AdminControls'
import PassPotatoForm from '../components/PassPotatoForm'
import PlayerStats from '../components/PlayerStats'
import EventFeed from '../components/EventFeed'
import UserTokens from '../components/UserTokens'
import Rewards from '../components/Rewards'
import TransactionNotifications from '../components/TransactionNotifications'
import { useWalletAddress } from '../hooks/useWalletAddress'
import { useGameInfo, useGameMeta, useRoundTokenIds, useRoundWinner } from '../hooks/useGame'
import { usePlayer } from '../hooks/usePlayer'
import { useCountdown } from '../hooks/useCountdown'
import { useClaimHistory } from '../hooks/useClaimHistory'
import { useGameEvents } from '../hooks/useGameEvents'
import { useTransaction } from '../hooks/useTransaction'
import { usePlayerActions } from '../hooks/usePlayerActions'
import { useAdminActions } from '../hooks/useAdminActions'
import { formatEth, isLiveState } from '../lib/game'

export default function Play() {
  const address = useWalletAddress()
  const [passTarget, setPassTarget] = useState('')

  // --- Reads ---
  const { info, error: readError, refetch: refetchInfo, updatedAt } = useGameInfo()
  const { owner, metadataHandler } = useGameMeta()
  const { tokenIds, inPlay, isLoading: tokenIdsLoading, refetch: refetchTokenIds } = useRoundTokenIds(info)
  const player = usePlayer(address, info)
  const { winner, refetch: refetchWinner } = useRoundWinner(info)
  const countdown = useCountdown(info, updatedAt)
  const { history: claimHistory, addClaim } = useClaimHistory(address)

  const refetchPlayer = player.refetch
  const refreshAll = useCallback(() => {
    void refetchInfo()
    void refetchTokenIds()
    void refetchWinner()
    refetchPlayer()
  }, [refetchInfo, refetchTokenIds, refetchWinner, refetchPlayer])

  const { feed, explosion } = useGameEvents(refreshAll)

  // --- Writes ---
  const tx = useTransaction(refreshAll)
  const round = info ? Number(info.round) : undefined
  const onClaimed = useCallback(
    (amount: bigint, txHash: string) => addClaim({ amount: formatEth(amount), txHash, timestamp: Date.now(), round }),
    [addClaim, round],
  )
  const actions = usePlayerActions({ tx, info, player, roundTokenIds: tokenIds, onClaimed })
  const admin = useAdminActions({ tx, info, owner, address })

  const isWinner = !!address && !!winner && isAddressEqual(winner, address)
  const live = isLiveState(info?.state)
  // The pass form doubles as a fixed bottom bar on phones while the player holds the potato.
  const showBottomBar = live && player.holdsPotato
  const showAdmin = admin.isOwner && !!info

  return (
    <AppShell title="Play · Hot Potato" width="wide" bottomBar={showBottomBar}>
      <div className="space-y-6 py-8 sm:py-10">
        <RoundSummary info={info} />
        <StatusBanners readError={readError} />

        {/*
          One grid for both layouts. On phones it is a single column in reading order
          (hero, your hands, rewards, stats, activity, hands, admin). From lg the side column
          spans every main row so it can stick while the main column scrolls.
        */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 lg:self-start">
            <GameStatusCard
              info={info}
              address={address}
              player={player}
              winner={winner}
              isWinner={isWinner}
              busy={tx.busy}
              countdown={countdown}
              explosion={explosion}
              passTarget={passTarget}
              onPassTargetChange={setPassTarget}
              onMint={actions.mint}
              onPass={actions.pass}
              onCheckExplosion={actions.checkExplosion}
            />
          </div>

          <aside className={`lg:col-span-4 ${showAdmin ? 'lg:row-span-4' : 'lg:row-span-3'}`}>
            <div className="flex flex-col gap-6 lg:sticky lg:top-20">
              <UserTokens
                ownedTokenIds={player.ownedTokenIds}
                activeTokenIds={player.activeTokenIds}
                inPlay={inPlay}
                info={info}
                metadataHandler={metadataHandler}
              />
              <div className="lg:order-3">
                <Rewards
                  rewards={player.rewards}
                  isWinner={isWinner}
                  onClaimRewards={actions.withdraw}
                  busy={tx.busy}
                  claimHistory={claimHistory}
                />
              </div>
              <div className="lg:order-2">
                <PlayerStats
                  wins={player.wins}
                  passes={player.passes}
                  fails={player.fails}
                  activeHands={player.activeTokenIds.length}
                />
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8 lg:self-start">
            <EventFeed feed={feed} />
          </div>

          <div className="lg:col-span-8 lg:self-start">
            <TokenGrid
              title={inPlay ? 'Hands in play' : 'All hands'}
              subtitle={
                inPlay
                  ? 'Every hand still in the round. Pass the potato to one of them.'
                  : 'Every hand minted so far. All of them join the next round.'
              }
              tokenIds={tokenIds}
              isLoading={tokenIdsLoading}
              info={info}
              metadataHandler={metadataHandler}
            />
          </div>

          {showAdmin && (
            <div className="lg:col-span-8 lg:self-start">
              <AdminControls admin={admin} info={info} busy={tx.busy} />
            </div>
          )}
        </div>
      </div>

      {showBottomBar && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-nav backdrop-blur-xl lg:hidden">
          <div className="px-4 pt-3 pb-safe">
            <PassPotatoForm
              compact
              hasPotato={player.holdsPotato}
              countdown={countdown}
              busy={tx.busy}
              onPassPotato={actions.pass}
              value={passTarget}
              onChange={setPassTarget}
            />
          </div>
        </div>
      )}

      <TransactionNotifications tx={tx.tx} onClose={tx.reset} raised={showBottomBar} />
    </AppShell>
  )
}
