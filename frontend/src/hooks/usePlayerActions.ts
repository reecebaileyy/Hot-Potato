import { useCallback } from 'react'
import { useConfig } from 'wagmi'
import { simulateContract, writeContract } from 'wagmi/actions'
import { chain } from '../config/chain'
import { contractErrorCopy, type FriendlyError } from '../lib/errors'
import { formatEth, gameContract, isLiveState } from '../lib/game'
import type { GameInfo } from './useGame'
import type { PlayerData } from './usePlayer'
import type { TransactionRunner } from './useTransaction'

interface PlayerActionsOptions {
  tx: TransactionRunner
  info: GameInfo | undefined
  player: PlayerData
  /** Token ids taking part in the round, to reject passes to eliminated hands up front. */
  roundTokenIds: number[]
  onClaimed?: (amount: bigint, txHash: string) => void
}

const copy = (name: string, args?: readonly unknown[]) => contractErrorCopy(name, args) as FriendlyError

/** Mint, pass, detonate and claim, with client-side checks that mirror the contract's reverts. */
export function usePlayerActions({ tx, info, player, roundTokenIds, onClaimed }: PlayerActionsOptions) {
  const config = useConfig()
  const { run, fail } = tx

  const mint = useCallback(
    async (quantity: number) => {
      const label = 'Mint'
      if (!info) return
      if (!Number.isInteger(quantity) || quantity <= 0) return fail(label, copy('ZeroQuantity'))
      const amount = BigInt(quantity)
      if (info.maxPerWallet > 0n && player.mintedThisRound + amount > info.maxPerWallet) {
        return fail(label, copy('WalletMintLimit', [info.maxPerWallet]))
      }
      if (info.maxPerRound > 0n && info.mintedThisRound + amount > info.maxPerRound) {
        return fail(label, copy('RoundMintLimit', [info.maxPerRound]))
      }
      const value = info.mintPrice * amount
      if (player.balance !== undefined && player.balance < value) {
        return fail(label, {
          emoji: '💰',
          title: 'Insufficient Funds',
          message: `Minting ${quantity} costs ${formatEth(value, 6)} ETH plus gas.`,
          suggestion: 'Add ETH on Robinhood Chain and try again.',
        })
      }
      await run(`Mint ${quantity} hand${quantity === 1 ? '' : 's'}`, async (account) => {
        const { request } = await simulateContract(config, {
          ...gameContract,
          functionName: 'mintHand',
          args: [amount],
          value,
          account,
          chainId: chain.id,
        })
        return writeContract(config, request)
      })
    },
    [config, fail, info, player.balance, player.mintedThisRound, run],
  )

  const pass = useCallback(
    async (toTokenId: number) => {
      const label = 'Pass Potato'
      if (!isLiveState(info?.state)) return fail(label, copy('WrongState', [info?.state ?? 0]))
      if (!player.holdsPotato) return fail(label, copy('NotPotatoHolder'))
      if (!Number.isInteger(toTokenId) || toTokenId <= 0) {
        return fail(label, { emoji: '🔢', title: 'Pick a Hand', message: 'Enter the id of the hand to pass to.' })
      }
      if (!roundTokenIds.includes(toTokenId)) return fail(label, copy('TargetNotActive', [toTokenId]))
      if (player.ownedTokenIds.includes(toTokenId)) return fail(label, copy('CannotPassToSelf'))
      await run(label, async (account) => {
        const { request } = await simulateContract(config, {
          ...gameContract,
          functionName: 'passPotato',
          args: [BigInt(toTokenId)],
          account,
          chainId: chain.id,
        })
        return writeContract(config, request)
      })
    },
    [config, fail, info?.state, player.holdsPotato, player.ownedTokenIds, roundTokenIds, run],
  )

  const checkExplosion = useCallback(async () => {
    await run('Check Explosion', async (account) => {
      const { request } = await simulateContract(config, {
        ...gameContract,
        functionName: 'checkExplosion',
        account,
        chainId: chain.id,
      })
      return writeContract(config, request)
    })
  }, [config, run])

  const withdraw = useCallback(async () => {
    const label = 'Claim Rewards'
    const amount = player.rewards
    if (amount === 0n) return fail(label, copy('NothingToWithdraw'))
    const receipt = await run(label, async (account) => {
      const { request } = await simulateContract(config, {
        ...gameContract,
        functionName: 'withdraw',
        account,
        chainId: chain.id,
      })
      return writeContract(config, request)
    })
    if (receipt) onClaimed?.(amount, receipt.transactionHash)
  }, [config, fail, onClaimed, player.rewards, run])

  return { mint, pass, checkExplosion, withdraw }
}

export type PlayerActions = ReturnType<typeof usePlayerActions>
