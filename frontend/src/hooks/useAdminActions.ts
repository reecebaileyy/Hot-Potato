import { useCallback, useMemo, useState } from 'react'
import { useConfig, useReadContracts } from 'wagmi'
import { readContract, simulateContract, writeContract } from 'wagmi/actions'
import { isAddress, isAddressEqual, type Address, type Hex } from 'viem'
import { GAME_ADDRESS, chain, isGameConfigured } from '../config/chain'
import { contractErrorCopy, type FriendlyError } from '../lib/errors'
import { GameState, gameContract } from '../lib/game'
import {
  computeCommitment,
  createSeedRecord,
  downloadSeedFile,
  isSeedHex,
  loadStoredSeed,
  parseSeedRecord,
  seedRecordMismatch,
  storeSeed,
  type SeedRecord,
} from '../lib/seed'
import type { GameInfo } from './useGame'
import type { TransactionRunner } from './useTransaction'

export interface MintConfigInput {
  price: bigint
  maxPerWallet: number
  maxPerRound: number
}

export interface FuseConfigInput {
  initial: number
  decreaseEvery: number
  decreaseBy: number
  minimum: number
}

export interface PayeesInput {
  project: string
  team1: string
  team2: string
  charity: string
}

/** Where the seed used to end minting came from. */
export type SeedSource = 'browser' | 'file' | 'paste'

/** Whether the seed we have for the current round matches its on-chain commitment. */
export type SeedStatus = 'missing' | 'match' | 'mismatch'

interface ManualSeed {
  record: SeedRecord
  source: Exclude<SeedSource, 'browser'>
  forRound: string
  notice: string | null
}

const copy = (name: string, args?: readonly unknown[]) => contractErrorCopy(name, args) as FriendlyError

const seedProblem = (message: string): FriendlyError => ({
  emoji: '🔑',
  title: 'Seed Problem',
  message,
})

/**
 * Owner controls, shared by the desktop and mobile layouts.
 *
 * Starting a round uses commit-reveal: the browser generates a random 32-byte seed, stores it in
 * localStorage under hotpotato:seed:<chainId>:<game>:<round> and downloads round-<n>.json
 * (same shape as backend/.seeds) before the commitment is sent with startGame. endMinting
 * reveals that seed, loaded from this browser, an uploaded file or pasted hex, after checking
 * it against the commitment stored on chain.
 */
export function useAdminActions({
  tx,
  info,
  owner,
  address,
}: {
  tx: TransactionRunner
  info: GameInfo | undefined
  owner: Address | undefined
  address: Address | undefined
}) {
  const config = useConfig()
  const { run, fail } = tx
  const isOwner = !!owner && !!address && isAddressEqual(owner, address)

  const round = info?.round ?? 0n
  const nextRound = round + 1n

  // Bumped after writing seeds to localStorage so the memoised reads below pick them up.
  const [storageVersion, setStorageVersion] = useState(0)
  const [storageFailed, setStorageFailed] = useState(false)
  // Kept in memory too, in case localStorage is unavailable.
  const [preparedSeed, setPreparedSeed] = useState<SeedRecord | null>(null)
  const [manualSeed, setManualSeed] = useState<ManualSeed | null>(null)
  const [seedInputError, setSeedInputError] = useState<string | null>(null)

  /* eslint-disable react-hooks/exhaustive-deps -- storageVersion forces a fresh localStorage read */
  const storedNextRoundSeed = useMemo(
    () => (isOwner ? loadStoredSeed(chain.id, GAME_ADDRESS, nextRound) : null),
    [isOwner, nextRound, storageVersion],
  )
  const browserSeed = useMemo(
    () => (isOwner && round > 0n ? loadStoredSeed(chain.id, GAME_ADDRESS, round) : null),
    [isOwner, round, storageVersion],
  )
  /* eslint-enable react-hooks/exhaustive-deps */

  const nextRoundSeed: SeedRecord | null =
    storedNextRoundSeed ??
    (preparedSeed && preparedSeed.round === nextRound.toString() ? preparedSeed : null)

  const activeManual = manualSeed && manualSeed.forRound === round.toString() ? manualSeed : null
  const revealSeed: SeedRecord | null = activeManual?.record ?? browserSeed
  const seedSource: SeedSource | null = activeManual?.source ?? (browserSeed ? 'browser' : null)
  const seedStatus: SeedStatus = !revealSeed
    ? 'missing'
    : info && computeCommitment(revealSeed.seed) === info.seedCommitment
      ? 'match'
      : 'mismatch'

  const { data: configData, refetch: refetchConfig } = useReadContracts({
    contracts: [
      { ...gameContract, functionName: 'mintConfig' },
      { ...gameContract, functionName: 'fuseConfig' },
      { ...gameContract, functionName: 'projectWallet' },
      { ...gameContract, functionName: 'teamWallet1' },
      { ...gameContract, functionName: 'teamWallet2' },
      { ...gameContract, functionName: 'charityWallet' },
    ],
    query: { enabled: isGameConfigured && isOwner },
  })

  const currentConfig = useMemo(() => {
    const mint = configData?.[0]?.result
    const fuse = configData?.[1]?.result
    return {
      mint: mint ? { price: mint[0], maxPerWallet: mint[1], maxPerRound: mint[2] } : undefined,
      fuse: fuse
        ? { initial: fuse[0], decreaseEvery: fuse[1], decreaseBy: fuse[2], minimum: fuse[3] }
        : undefined,
      payees:
        configData?.[2]?.result && configData[3]?.result && configData[4]?.result && configData[5]?.result
          ? {
              project: configData[2].result,
              team1: configData[3].result,
              team2: configData[4].result,
              charity: configData[5].result,
            }
          : undefined,
    }
  }, [configData])

  /** Step 1 of starting a round: create (or reuse) the seed, keep it in this browser, download it. */
  const prepareRound = useCallback(() => {
    const record = nextRoundSeed ?? createSeedRecord(chain.id, GAME_ADDRESS, nextRound)
    setStorageFailed(!storeSeed(record))
    setPreparedSeed(record)
    downloadSeedFile(record)
    setStorageVersion((v) => v + 1)
  }, [nextRound, nextRoundSeed])

  const downloadSeed = useCallback((record: SeedRecord) => downloadSeedFile(record), [])

  /** Step 2: send startGame with the prepared seed's commitment. */
  const startRound = useCallback(async () => {
    const label = `Start Round ${nextRound}`
    if (info && info.state !== GameState.Queued && info.state !== GameState.Ended) {
      return fail(label, copy('WrongState', [info.state]))
    }
    const record = nextRoundSeed
    if (!record) {
      return fail(label, seedProblem('Generate and download the seed for this round first.'))
    }
    if (computeCommitment(record.seed) !== record.commitment) {
      return fail(label, seedProblem('The stored seed is corrupted. Generate a new one.'))
    }
    await run(label, async (account) => {
      const { request } = await simulateContract(config, {
        ...gameContract,
        functionName: 'startGame',
        args: [record.commitment],
        account,
        chainId: chain.id,
      })
      return writeContract(config, request)
    })
  }, [config, fail, info, nextRound, nextRoundSeed, run])

  const acceptManualSeed = useCallback(
    (record: SeedRecord, source: Exclude<SeedSource, 'browser'>, notice: string | null) => {
      setSeedInputError(null)
      setManualSeed({ record, source, forRound: round.toString(), notice })
      // Remember a seed that matches the commitment so a reload doesn't need the file again.
      if (info && computeCommitment(record.seed) === info.seedCommitment) {
        storeSeed({ ...record, chainId: chain.id, game: GAME_ADDRESS, round: round.toString() })
        setStorageVersion((v) => v + 1)
      }
    },
    [info, round],
  )

  const loadSeedFile = useCallback(
    async (file: File) => {
      try {
        const record = parseSeedRecord(await file.text())
        acceptManualSeed(record, 'file', seedRecordMismatch(record, chain.id, GAME_ADDRESS, round))
      } catch (error) {
        setSeedInputError(error instanceof Error ? error.message : 'Could not read the seed file.')
      }
    },
    [acceptManualSeed, round],
  )

  const pasteSeed = useCallback(
    (value: string) => {
      const seed = value.trim()
      if (!isSeedHex(seed)) {
        setSeedInputError('A seed is 0x followed by 64 hex characters.')
        return
      }
      const hex = seed as Hex
      acceptManualSeed(
        { chainId: chain.id, game: GAME_ADDRESS, round: round.toString(), seed: hex, commitment: computeCommitment(hex) },
        'paste',
        null,
      )
    },
    [acceptManualSeed, round],
  )

  /** Reveals the seed, which closes minting and starts play. */
  const endMinting = useCallback(async () => {
    const label = 'End Minting'
    if (info && info.state !== GameState.Minting) return fail(label, copy('WrongState', [info.state]))
    if (!revealSeed) {
      return fail(label, seedProblem(`No seed for round ${round} in this browser. Upload round-${round}.json or paste the seed.`))
    }
    try {
      const [onChain, computed] = await Promise.all([
        readContract(config, { ...gameContract, functionName: 'seedCommitment', args: [round], chainId: chain.id }),
        readContract(config, { ...gameContract, functionName: 'computeCommitment', args: [revealSeed.seed], chainId: chain.id }),
      ])
      if (computed !== onChain) return fail(label, copy('SeedMismatch'))
    } catch {
      return fail(label, seedProblem('Could not verify the seed against the chain. Check your connection.'))
    }
    await run(label, async (account) => {
      const { request } = await simulateContract(config, {
        ...gameContract,
        functionName: 'endMinting',
        args: [revealSeed.seed],
        account,
        chainId: chain.id,
      })
      return writeContract(config, request)
    })
  }, [config, fail, info, revealSeed, round, run])

  const simpleAction = useCallback(
    (label: string, functionName: 'pauseGame' | 'resumeGame' | 'cancelRound') =>
      run(label, async (account) => {
        const { request } = await simulateContract(config, {
          ...gameContract,
          functionName,
          account,
          chainId: chain.id,
        })
        return writeContract(config, request)
      }),
    [config, run],
  )

  const pauseGame = useCallback(() => simpleAction('Pause Game', 'pauseGame'), [simpleAction])
  const resumeGame = useCallback(() => simpleAction('Resume Game', 'resumeGame'), [simpleAction])
  const cancelRound = useCallback(() => simpleAction(`Cancel Round ${round}`, 'cancelRound'), [round, simpleAction])

  const setMintConfig = useCallback(
    async (input: MintConfigInput) => {
      const receipt = await run('Update Mint Config', async (account) => {
        const { request } = await simulateContract(config, {
          ...gameContract,
          functionName: 'setMintConfig',
          args: [input],
          account,
          chainId: chain.id,
        })
        return writeContract(config, request)
      })
      if (receipt) void refetchConfig()
    },
    [config, refetchConfig, run],
  )

  const setFuseConfig = useCallback(
    async (input: FuseConfigInput) => {
      const label = 'Update Fuse Config'
      if (input.minimum <= 0 || input.initial < input.minimum) return fail(label, copy('InvalidFuseConfig'))
      const receipt = await run(label, async (account) => {
        const { request } = await simulateContract(config, {
          ...gameContract,
          functionName: 'setFuseConfig',
          args: [input],
          account,
          chainId: chain.id,
        })
        return writeContract(config, request)
      })
      if (receipt) void refetchConfig()
    },
    [config, fail, refetchConfig, run],
  )

  const setPayees = useCallback(
    async (input: PayeesInput) => {
      const label = 'Update Payees'
      const values = [input.project, input.team1, input.team2, input.charity]
      if (!values.every((value) => isAddress(value))) {
        return fail(label, {
          emoji: '📭',
          title: 'Invalid Address',
          message: 'Every payee must be a valid 0x address.',
        })
      }
      const [project, team1, team2, charity] = values as Address[]
      const receipt = await run(label, async (account) => {
        const { request } = await simulateContract(config, {
          ...gameContract,
          functionName: 'setPayees',
          args: [project, team1, team2, charity],
          account,
          chainId: chain.id,
        })
        return writeContract(config, request)
      })
      if (receipt) void refetchConfig()
    },
    [config, fail, refetchConfig, run],
  )

  return {
    isOwner,
    round,
    nextRound,
    currentConfig,
    // start round
    nextRoundSeed,
    storageFailed,
    prepareRound,
    downloadSeed,
    startRound,
    // end minting
    revealSeed,
    seedSource,
    seedStatus,
    seedNotice: activeManual?.notice ?? null,
    seedInputError,
    loadSeedFile,
    pasteSeed,
    endMinting,
    // other controls
    pauseGame,
    resumeGame,
    cancelRound,
    setMintConfig,
    setFuseConfig,
    setPayees,
  }
}

export type AdminActions = ReturnType<typeof useAdminActions>
