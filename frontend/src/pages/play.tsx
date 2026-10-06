import React, { useCallback, useState } from 'react'
import Head from 'next/head'
import { isAddressEqual } from 'viem'
import Navigation from '../components/Navigation'
import StatusBanners from '../components/StatusBanners'
import RoundSummary from '../components/RoundSummary'
import GameStatusCard from '../components/GameStatusCard'
import TokenGrid from '../components/TokenGrid'
import AdminControls from '../components/AdminControls'
import PassPotatoForm from '../components/PassPotatoForm'
import Timer from '../components/Timer'
import PlayerStats from '../components/PlayerStats'
import EventFeed from '../components/EventFeed'
import UserTokens from '../components/UserTokens'
import Rewards from '../components/Rewards'
import MobileSwipeNavigation from '../components/MobileSwipeNavigation'
import TransactionNotifications from '../components/TransactionNotifications'
import { useDarkMode } from '../hooks/useDarkMode'
import { useMediaQuery } from '../hooks/useMediaQuery'
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
  const [darkMode, setDarkMode] = useDarkMode()
  const [menuOpen, setMenuOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const address = useWalletAddress()

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
  const showPassForm = isLiveState(info?.state) && !!address

  // --- Sections, shared by the desktop and mobile layouts (only one is mounted) ---
  const timer = (
    <Timer
      darkMode={darkMode}
      state={info?.state}
      countdown={countdown}
      explosion={explosion}
      onCheckExplosion={actions.checkExplosion}
      busy={tx.busy}
    />
  )

  const rewards = (
    <Rewards
      darkMode={darkMode}
      rewards={player.rewards}
      isWinner={isWinner}
      onClaimRewards={actions.withdraw}
      busy={tx.busy}
      claimHistory={claimHistory}
    />
  )

  const status = (
    <GameStatusCard
      darkMode={darkMode}
      info={info}
      address={address}
      player={player}
      winner={winner}
      isWinner={isWinner}
      busy={tx.busy}
      onMint={actions.mint}
    />
  )

  const grid = (
    <TokenGrid
      darkMode={darkMode}
      title={inPlay ? 'Hands in Play' : 'All Hands'}
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
  )

  const adminControls = <AdminControls darkMode={darkMode} admin={admin} info={info} busy={tx.busy} />

  const stats = (
    <PlayerStats
      darkMode={darkMode}
      wins={player.wins}
      passes={player.passes}
      fails={player.fails}
      activeHands={player.activeTokenIds.length}
      rewards={player.rewards}
    />
  )

  const userTokens = (
    <UserTokens
      darkMode={darkMode}
      ownedTokenIds={player.ownedTokenIds}
      activeTokenIds={player.activeTokenIds}
      inPlay={inPlay}
      info={info}
      metadataHandler={metadataHandler}
    />
  )

  const passForm = (mobile: boolean) => (
    <PassPotatoForm
      darkMode={darkMode}
      hasPotato={player.holdsPotato}
      countdown={countdown}
      busy={tx.busy}
      onPassPotato={actions.pass}
      isMobileFixed={mobile}
    />
  )

  return (
    <>
      <Head>
        <title>HOT POTATO</title>
        <meta name="description" content="Hold, Pass, Survive..." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        className={`${darkMode ? 'darkmode text-white' : 'normal'} bg-fixed min-h-screen font-darumadrop`}
      >
        <Navigation darkMode={darkMode} setDarkMode={setDarkMode} isOpen={menuOpen} setIsOpen={setMenuOpen} />

        <div className="w-full max-w-7xl mx-auto">
          {isDesktop ? (
            <>
              <RoundSummary darkMode={darkMode} info={info} />
              <div className="px-8">
                <StatusBanners readError={readError} />
              </div>
              <div className="flex gap-6 items-start px-8 pb-8">
                <div className="w-80 flex-shrink-0">
                  <div className="sticky top-6 space-y-6">
                    {timer}
                    {rewards}
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-6">
                  {showPassForm && passForm(false)}
                  {status}
                  <EventFeed darkMode={darkMode} feed={feed} />
                  {grid}
                  {adminControls}
                </div>

                <div className="w-80 flex-shrink-0">
                  <div className="sticky top-6 space-y-6">
                    {stats}
                    {userTokens}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col h-screen pt-24 w-full">
              <div className="fixed top-[60px] left-0 right-0 z-30 text-center py-2 px-4 bg-gradient-to-r from-amber-500/10 to-red-500/10 backdrop-blur-sm border-b border-amber-500/20 pointer-events-none">
                <RoundSummary darkMode={darkMode} info={info} compact />
              </div>

              <div className="flex-1 overflow-hidden w-full" style={{ marginBottom: showPassForm ? 160 : 0 }}>
                <MobileSwipeNavigation darkMode={darkMode} sectionNames={['Game', 'Your Hands', 'Rewards', 'Stats']}>
                  <MobileSection>
                    <StatusBanners readError={readError} />
                    {status}
                    {timer}
                    <EventFeed darkMode={darkMode} feed={feed} />
                    {grid}
                    {adminControls}
                  </MobileSection>
                  <MobileSection>{userTokens}</MobileSection>
                  <MobileSection>{rewards}</MobileSection>
                  <MobileSection>{stats}</MobileSection>
                </MobileSwipeNavigation>
              </div>

              {showPassForm && (
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-white via-white to-white/95 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-2xl">
                  <div className="p-4 pb-safe">{passForm(true)}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <TransactionNotifications tx={tx.tx} onClose={tx.reset} darkMode={darkMode} />
      </div>
    </>
  )
}

function MobileSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-y-auto flex flex-col items-center justify-start w-full px-4 py-6 gap-6">
        {children}
      </div>
    </div>
  )
}
