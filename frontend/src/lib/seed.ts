import { encodeAbiParameters, isAddressEqual, isHex, keccak256, toHex, type Address, type Hex } from 'viem'

/**
 * Commit-reveal seeds for Game.startGame / Game.endMinting.
 *
 * The record shape matches what backend/scripts/start-round.ts writes to
 * backend/.seeds/chain-<id>/<game>/round-<n>.json, so files are interchangeable
 * between the admin UI and the CLI scripts.
 */
export interface SeedRecord {
  chainId: number
  game: Address
  round: string
  seed: Hex
  commitment: Hex
}

/** Same as Game.computeCommitment: keccak256(abi.encode(seed)). */
export function computeCommitment(seed: Hex): Hex {
  return keccak256(encodeAbiParameters([{ type: 'bytes32' }], [seed]))
}

export function generateSeed(): Hex {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return toHex(bytes)
}

export function isSeedHex(value: unknown): value is Hex {
  return typeof value === 'string' && isHex(value, { strict: true }) && value.length === 66
}

export function createSeedRecord(chainId: number, game: Address, round: bigint): SeedRecord {
  const seed = generateSeed()
  return { chainId, game, round: round.toString(), seed, commitment: computeCommitment(seed) }
}

export function seedStorageKey(chainId: number, game: Address, round: bigint | string): string {
  return `hotpotato:seed:${chainId}:${game.toLowerCase()}:${round.toString()}`
}

export function seedFileName(round: bigint | string): string {
  return `round-${round.toString()}.json`
}

/** Persists the record in localStorage. Returns false if storage is unavailable. */
export function storeSeed(record: SeedRecord): boolean {
  try {
    window.localStorage.setItem(
      seedStorageKey(record.chainId, record.game, record.round),
      JSON.stringify(record, null, 2),
    )
    return true
  } catch {
    return false
  }
}

export function loadStoredSeed(chainId: number, game: Address, round: bigint): SeedRecord | null {
  try {
    const raw = window.localStorage.getItem(seedStorageKey(chainId, game, round))
    return raw ? parseSeedRecord(raw) : null
  } catch {
    return null
  }
}

/** Parses and validates a seed JSON file. Throws with a readable message when malformed. */
export function parseSeedRecord(text: string): SeedRecord {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('The file is not valid JSON.')
  }
  if (!data || typeof data !== 'object') throw new Error('The file does not contain a seed record.')
  const record = data as Record<string, unknown>
  if (!isSeedHex(record.seed)) throw new Error('The file has no valid 32-byte "seed".')
  const commitment = computeCommitment(record.seed)
  if (
    record.commitment !== undefined &&
    String(record.commitment).toLowerCase() !== commitment.toLowerCase()
  ) {
    throw new Error('The file is corrupted: its "commitment" does not match its "seed".')
  }
  return {
    chainId: Number(record.chainId),
    game: String(record.game) as Address,
    round: String(record.round),
    seed: record.seed,
    commitment,
  }
}

/** Explains why a record cannot be used for this chain / game / round, or null if it fits. */
export function seedRecordMismatch(
  record: SeedRecord,
  chainId: number,
  game: Address,
  round: bigint,
): string | null {
  const problems: string[] = []
  if (record.chainId !== chainId) problems.push(`chain ${record.chainId} (expected ${chainId})`)
  let sameGame = false
  try {
    sameGame = isAddressEqual(record.game, game)
  } catch {
    sameGame = false
  }
  if (!sameGame) problems.push(`game ${record.game} (expected ${game})`)
  if (record.round !== round.toString()) problems.push(`round ${record.round} (expected ${round})`)
  return problems.length ? `This seed is for ${problems.join(', ')}.` : null
}

/** Triggers a browser download of the record as round-<n>.json. */
export function downloadSeedFile(record: SeedRecord): void {
  const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = seedFileName(record.round)
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1_000)
}
